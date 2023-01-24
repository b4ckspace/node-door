# node-door

---
**⚠️ This project is deprecated! ⚠️**

Superseeded by: https://github.com/b4ckspace/pydoor

---

This is the ~~new~~ old door system used in the backspace between 2018 until 2023 and replaced the even older [bckspc-dooropen][1] and [py-webrelais][2].

## install

It's just as simple as that:

```bash
npm install
node index.js --config <path to config>
```

## config

The default configuration resides in config/default.js. You should make your own copy of that and provide the path through the `--config` parameter.
This application needs an LDAP and MQTT-Server to function. 

It's recommended to run this application behind an reverse proxy which terminates SSL. You should never ever run this application without SSL!

## hardware

In our setup the hardware is just a raspberry pi with an arduino nano connected. The arduino needs the library/example StandardFirmata flashed.
Connected peripherals like relais are optional and can be provided if needed.


[1]: https://github.com/schinken/bckspc-dooropen
[2]: https://github.com/schinken/py-webrelais
