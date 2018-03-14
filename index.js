const Firmata = require('firmata');
const config = require('./lib/config').getConfig();
/*
const board = new Firmata(config.firmata.port);

board.on('ready', () => {
    console.log('Foobar');
});
    */