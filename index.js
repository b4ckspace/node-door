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

                    if (success) {
                        door.buzzer();

                        switch(type) {
                            case 'Open': door.open(); break;
                            case 'Close': door.close(); break;
                        }

                        logger.error({
                            route: '/operate',
                            method: 'post',
                            module: 'http',
                            result: 'success',
                            type: type,
                            username: username
                        });

                        return result.redirect('/success.html');
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
                host: config.mqtt.hostname
            });
        }
    ]);