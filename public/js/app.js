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
    localStorage.setItem('uid', userSelect.value);
};

loadUsers(function (error, users) {
    users.forEach(function (user) {
        var option = document.createElement('option');
        option.value = user;
        option.innerHTML = user;

        userSelect.appendChild(option);
    });

    var uid = localStorage.getItem('uid');
    if (uid) {
       userSelect.value = uid;
    }
});