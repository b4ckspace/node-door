'use strict';

class Output {

    constructor(firmata, gpio, activeHigh = true) {
        this.firmata = firmata;
        this.gpio = gpio;

        this.active = (activeHigh) ? firmata.HIGH : firmata.LOW;
        this.inactive = (activeHigh) ? firmata.LOW : firmata.HIGH;

        firmata.pinMode(gpio, firmata.MODES.OUTPUT);
    }

    hold(holdMs, callback = () => {}) {
        this.off();

        setTimeout(() => {
            this.on();
            callback(null);
        }, holdMs);
    }

    on() {
        this.firmata.digitalWrite(this.gpio, this.active);
    }

    off() {
        this.firmata.digitalWrite(this.gpio, this.inactive);
    }
}

module.exports = Output;