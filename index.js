'use strict';

const mqtt = require('mqtt');
const async = require('async');
const express = require('express');
const Firmata = require('firmata');
const bodyParser = require('body-parser');

const argv = require('yargs')
    .usage('Usage: $0 --config config')
    .argv;

const config = require('./lib/config').getConfig(argv.config);
const logger = require('./lib/logger');
const Ldap = require('./lib/Auth/Ldap');
const Door = require('./lib/Control/Door');
const Watcher = require('./lib/Control/Watcher');
const Output = require('./lib/Control/Output.js');

const ldap = new Ldap(config.ldap);

async
    .waterfall([
        (callback) => {
            const board = new Firmata(config.firmata.port);
            board.on('ready', () => {
                logger.info({
                    evt: 'setup',
                    module: 'firmata',
                    port: config.firmata.port
                });

                // Initialize other gpios
                (config.gpio || []).forEach((entry) => {
                    const output = new Output(board, entry.gpio, entry.activeHigh);
                    output.off();
                });

                return callback(null, board);
            });

            board.on('error' , (error) => {
                logger.error({
                    evt: 'setup',
                    module: 'firmata',
                    port: config.firmata.port,
                    message: '' + error
                });

                return callback(error);
            });
        },

        (board, callback) => {
            const mqttClient = mqtt.connect(config.mqtt.hostname);
            const watcher = new Watcher(mqttClient, board, config.watcher);

            logger.info({
                evt: 'setup',
                module: 'watcher',
                host: config.mqtt.hostname
            });

            return callback(null, board);
        },

        (board, callback) => {
            const door = new Door(board, config.door);

            logger.info({
                evt: 'setup',
                module: 'door'
            });

            return callback(null, door);
        },

        (door, callback) => {
            const app = express();
            app.use(bodyParser.urlencoded({ extended: false }));

            app.get('/users', (request, result) => {

                ldap.getUsers((error, users) => {
                    if (error) {
                        logger.error({ route: '/users', error: error });
                        return result.status(500).send('LDAP connection failed');
                    }

                    result.json({
                        users: users.sort((a, b) => {
                            return a.toLowerCase().localeCompare(b.toLowerCase());
                        })
                    })
                });
            });

            app.post('/operate', (request, result) => {
                const type = request.body.type;
                const username = request.body.uid;
                const password = request.body.password;

                logger.info({
                    route: '/operate',
                    method: 'post',
                    module: 'http',
                    type: type,
                    username: username
                });

                ldap.login(username, password, (error, success) => {

                    if (error) {
                        logger.error({ route: '/operate', error: error });
                        return result.status(500).send('LDAP connection failed');
                    }

                    if (success) {
                        logger.info({
                            route: '/operate',
                            method: 'post',
                            module: 'http',
                            type: type,
                            result: 'success',
                            username: username
                        });

                        switch(type) {
                            case 'Open':
                                door.buzzer();
                                door.open();

                                return result.redirect('/opened.html');

                            case 'Close':
                                door.close();

                                return result.redirect('/closed.html');
                        }
                    }

                    logger.error({
                        route: '/operate',
                        method: 'post',
                        module: 'http',
                        result: 'unauthorized',
                        type: type,
                        username: username
                    });

                    return result.redirect('/unauthorized.html');
                });
            });


            app.use('/', express.static('public'));
            app.listen(config.http.port, config.http.bind);

            logger.info({
                evt: 'setup',
                module: 'http',
                listen: config.http.bind,
                port: config.http.port
            });
        }
    ]);