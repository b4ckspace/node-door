'use strict';

const Output = require('./Output');

class Door {

    constructor(firmata, config) {
        this.firmata = firmata;
        this.config = config;

        this.outputOpen = null;
        this.outputClose = null;
        this.outputBuzzer = null;

        if (config.open) {
            this.outputOpen = new Output(firmata, config.open.gpio);
            this.outputOpen.off();
        }

        if (config.close) {
            this.outputClose = new Output(firmata, config.close.gpio);
            this.outputClose.off();
        }

        if (config.buzzer) {
            this.outputBuzzer = new Output(firmata, config.buzzer.gpio);
            this.outputBuzzer.off();
        }
    }

    buzzer(callback) {
        this.outputBuzzer.hold(this.config.buzzer.holdMs, callback);
    }

    open(callback) {
        this.outputOpen.hold(this.config.open.holdMs, callback);
    }

    close(callback) {
        this.outputClose.hold(this.config.close.holdMs, callback);
    }
}

module.exports = Door;