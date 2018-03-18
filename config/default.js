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
        hostname: 'mqtt.core.bckspc.de'
    },

    watcher: {
        bindings: [
            {
                gpio: 14,
                debounceMs: 100,
                high: 'OPEN',
                low: 'CLOSED',
                topic: 'test/foo/bar',
                retain: true,
                qos: 1
            },
            {
                gpio: 15,
                debounceMs: 42,
                high: 'RELEASED',
                low: 'PRESSED',
                topic: 'test/foo42',
                retain: true,
                qos: 1
            },
        ]
    },

    door: {

        open: {
            gpio: 10,
            holdMs: 200
        },

        close: {
            gpio: 11,
            holdMs: 200
        },

        buzzer: {
            gpio: 12,
            holdMs: (10 * 1000)
        }
    }
};