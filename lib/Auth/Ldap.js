const ldap = require('ldapjs');
const crypto = require('crypto');

class Ldap {

    constructor(config) {
        this.config = config;
    }

    getUsers(callback) {
        const client = this.__getClient((error) => {
            if (error) {
                return callback(error);
            }

            let users = [];

            client.search('ou=member,dc=backspace', {
                filter: '(&(objectClass=backspaceMember)(serviceEnabled=door))',
                scope: 'sub',
                attributes: ['uid']
            }, (error, result) => {

                if (error) {
                    return callback(error);
                }

                result.on('searchEntry', (entry) => users.push(entry.object.uid));
                result.on('end', () => callback(null, users));
            })
        });
    }

    login(username, password, callback) {

        const client = this.__getClient((error) => {
            if (error) {
                return callback(error);
            }

            let found = [];
            client.search('ou=member,dc=backspace', {
                // TODO: Escape uid to prevent LDAP filter injection
                filter: `(&(objectClass=backspaceMember)(serviceEnabled=door)(uid=${username}))`,
                scope: 'sub',
                attributes: ['doorPassword']
            }, (error, result) => {

                if (error) {
                    return callback(error);
                }

                result.on('searchEntry', (entry) => found.push(entry.object.doorPassword));
                result.on('end', () => {

                    if (found.length > 1) {
                        return callback(new Error(`Found more than one entry for user ${username}`))
                    }

                    if (found.length === 0) {
                        return callback(new Error(`${username} not found.`))
                    }

                    return callback(null, this.__verifyPassword(found[0], password));
                });
            })
        });
    }

    __getClient(callback) {
        const client = ldap.createClient({
            url: this.config.uri
        });

        client.bind(this.config.dn, this.config.password, callback);
        return client;
    }

    __verifyPassword(hash, password) {
        const matched = hash.match(/^{SSHA512}(.*)$/);

        if (!matched) {
            return false;
        }

        const decoded = new Buffer(matched[1], 'base64');
        const sha512 = decoded.slice(0, 64); // hash is 64 byte (512 bit) long
        const salt = decoded.slice(64); // everything else is salt

        const newhash = crypto.createHash('sha512');
        newhash.update(password);
        newhash.update(salt);

        return sha512.equals(newhash.digest());
    }
}

module.exports = Ldap;