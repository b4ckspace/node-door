'use strict';

const config = require('./lib/config').getConfig('/home/schinken/projects/backspace/node-door/config/production.js');
const async = require('async');

const Firmata = require('firmata');
const Ldap = require('./lib/Auth/Ldap');
const Door = require('./lib/Control/Door');

const express = require('express');
const bodyParser = require('body-parser');

const ldap = new Ldap(config.ldap);

let door = null;

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
            app.listen(config.http.port);

            console.log("HTTP Server is listening!");
        }
    ]);