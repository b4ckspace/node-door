'use strict';

const mqtt = require('mqtt');
const async = require('async');
const express = require('express');
const Firmata = require('firmata');
const bodyParser = require('body-parser');

const config = require('./lib/config').getConfig('/home/schinken/projects/backspace/node-door/config/production.js');
const Ldap = require('./lib/Auth/Ldap');
const Door = require('./lib/Control/Door');


const ldap = new Ldap(config.ldap);

async
    .waterfall([
        (callback) => {
            const board = new Firmata(config.firmata.port);
            board.on('ready', () => {
                console.log("Board connected!");
                return callback(null, board);
            })
        },

        (board, callback) => {
            const door = new Door(board, config.door);

            console.log("Door setup!");
            return callback(null, door);
        },

        (door, callback) => {
            const mqttClient = mqtt.connect('mqtt://' + config.mqtt.hostname);
            console.log("Setup mqtt");

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

                ldap.login(username, password, (error, success) => {

                    if (success) {
                        door.buzzer();

                        switch(type) {
                            case 'Open': door.open(); break;
                            case 'Close': door.close(); break;
                        }

                        return result.redirect('/success.html');
                    }

                    return result.redirect('/unauthorized.html');
                });
            });


            app.use('/', express.static('public'));
            app.listen(config.http.port, config.http.bind);

            console.log("HTTP Server is listening!");
        }
    ]);