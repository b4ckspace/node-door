module.exports = {

    http: {
        bind: '127.0.0.1',
        port: 8282
    },

    firmata: {
        port: '/dev/ttyUSB0'
    },

    ldap: {
        uri: 'ldaps://127.0.0.1',
        port: 636,
        dn: '',
        password: '',
        ca: ''
    },

    mqtt: {
        hostname: 'mqtt://mqtt.core.bckspc.de'
    },

    watcher: {
        bindings: [
            {
                gpio: 8,
                debounceMs: 120,
                high: 'open',
                low: 'closed',
                topic: 'sensor/door/lock',
                retain: true,
                qos: 1
            },
            {
                gpio: 9,
                debounceMs: 120,
                high: 'released',
                low: 'pressed',
                topic: 'sensor/door/button',
                retain: true,
                qos: 1
            },
            {
                gpio: 10,
                debounceMs: 120,
                high: 'open',
                low: 'closed',
                topic: 'sensor/door/frame',
                retain: true,
                qos: 1
            },
            {
                gpio: 11,
                debounceMs: 500,
                high: 'released',
                low: 'pressed',
                topic: 'sensor/door/bell',
                retain: true,
                qos: 1
            },
        ]
    },

    door: {

        open: {
            gpio: 4,
            activeHigh: false,
            holdMs: 200
        },

        close: {
            gpio: 5,
            activeHigh: false,
            holdMs: 200
        },

        buzzer: {
            gpio: 3,
            activeHigh: false,
            holdMs: (10 * 1000)
        }
    }

};
