//const Firmata = require('firmata');
const config = require('./lib/config').getConfig('/home/schinken/projects/backspace/node-door/config/production.js');
const Ldap = require('./lib/Auth/Ldap');
const ldap = new Ldap(config.ldap);

const express = require('express');
const bodyParser = require('body-parser');

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

/*
const board = new Firmata(config.firmata.port);

board.on('ready', () => {
    console.log('Foobar');
});
    */

app.post('/operate', (request, result) => {
    const username = request.body.uid;
    const password = request.body.password;

    ldap.login(username, password, (error, success) => {

        if (success) {
            return result.redirect('/success.html');
        }

        return result.redirect('/unauthorized.html');
    });
});


app.use('/', express.static('public'));
app.listen(config.http.port);