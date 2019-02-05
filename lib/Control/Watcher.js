'use strict';

class Watcher {

    constructor(mqtt, firmata, config) {
        this.mqtt = mqtt;
        this.firmata = firmata;

        config.bindings.forEach((binding) => this.bind(binding));
    }

    bind(binding) {
        this.firmata.pinMode(binding.gpio, this.firmata.MODES.PULLUP);

        let publishTimeout = null;
        let lastMs = new Date().getTime();
        let lastValue = null;

        const debounceMs = binding.debounceMs || 0;
        const options = {
            retain: binding.retain || false,
            qos: binding.qos || 0
        };

        this.firmata.digitalRead(binding.gpio, (value) => {
            const currentValue = value;
            const currentMs = new Date().getTime();

            if (lastValue === currentValue) {
                return;
            }

            lastValue = currentValue;
            
            // If there was another value under debounceMs, discard publishing value
            if (currentMs - lastMs < debounceMs) {
                lastMs = currentMs;
                return clearTimeout(publishTimeout);
            }

            publishTimeout = setTimeout(() => {
                if (currentValue === this.firmata.HIGH) {
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
