'use strict';

class Watcher {

    constructor(mqtt, firmata, config) {
        this.mqtt = mqtt;
        this.firmata = firmata;

        config.bindings.forEach((binding) => this.bind(binding));
    }

    bind(binding) {
        this.firmata.pinMode(binding.gpio, this.firmata.MODES.PULLUP);

        let lastValue;
        let publishTimeout = null;
        let lastMs = new Date().getTime();

        const debounceMs = binding.debounceMs || 0;
        const options = {
            retain: binding.retain || false,
            qos: binding.qos || 0
        };

        this.firmata.digitalRead(binding.gpio, (value) => {
            const currentMs = new Date().getTime();

            // Ignore same value
            if (value === lastValue) {
                return;
            }

            lastValue = value;

            // If there was another value under debounceMs, discard publishing value
            if (currentMs - lastMs < debounceMs) {
                clearTimeout(publishTimeout);
                return
            }

            publishTimeout = setTimeout(() => {
                if (value === this.firmata.HIGH) {
                    this.mqtt.publish(binding.topic, binding.high, options);
                } else {
                    this.mqtt.publish(binding.topic, binding.low, options);
                }
            }, debounceMs);

            lastMs = currentMs;
        });
    }
}

module.exports = Watcher;