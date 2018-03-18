function getCookie(key) {
    var parts = ('; ' + document.cookie).split('; ' + key + '=');

    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

function setCookie(key, value, days) {
    var expiration = new Date();
    expiration.setTime(expiration.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = key + '=' + value + '; expires=' + expiration.toGMTString() + '; path=/';
}

function loadUsers(callback) {
    var usersRequest = new XMLHttpRequest();

    usersRequest.onload = function (result) {
        return callback(null, result.target.response.users);
    };

    usersRequest.open('GET', '/users', true);
    usersRequest.responseType = 'json';
    usersRequest.send();
}


var userSelect = document.getElementById('users');

userSelect.onchange = function() {
    setCookie('uid', userSelect.value, 1337);
};

loadUsers(function (error, users) {
    users.forEach(function (user) {
        var option = document.createElement('option');
        option.value = user;
        option.innerHTML = user;

        userSelect.appendChild(option);
    });

    var uid = getCookie('uid');
    if (uid) {
       userSelect.value = uid;
    }
});