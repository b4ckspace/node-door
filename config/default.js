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
        host: 'mqtt.core.bckspc.de',

        options: {
            qos: 1,
            retain: true
        }
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