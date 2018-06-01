'use strict';

class Watcher {

    constructor(mqtt, firmata, config) {
        this.mqtt = mqtt;
        this.firmata = firmata;

        config.bindings.forEach((binding) => this.bind(binding));
    }

    bind(binding) {
        this.firmata.pinMode(binding.gpio, this.firmata.MODES.PULLUP);

        let ignore = false;
        const debounceMs = binding.debounceMs || 0;
        const options = {
            retain: binding.retain || false,
            qos: binding.qos || 0
        };

        this.firmata.digitalRead(binding.gpio, (value) => {

            if (ignore) {
                return;
            }

            if (value === this.firmata.HIGH) {
                this.mqtt.publish(binding.topic, binding.high, options);
            } else {
                this.mqtt.publish(binding.topic, binding.low, options);
            }

            ignore = true;
            setTimeout(_ => ignore = false, debounceMs);
        });
    }
}

module.exports = Watcher;