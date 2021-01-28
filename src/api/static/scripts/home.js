var mainBlock = document.getElementById('body');
var refreshTokens = function () {
    fetch('/auth/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: localStorage.refreshToken })
    })
        .then(function (res) { return res.json(); })
        .then(function (res) {
        var accessToken = res.accessToken, refreshToken = res.refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        getContent();
    })["catch"](function (error) {
        console.error('something went wrong');
    });
};
var getContent = function () {
    fetch('/', {
        method: 'POST',
        headers: {
            authorization: "Bearer " + localStorage.accessToken
        }
    })
        .then(function (res) {
        if (res.status === 401) {
            window.location.replace('/auth/login');
            throw 401;
        }
        else if (res.status === 403) {
            refreshTokens();
            throw 403;
        }
        return res;
    })
        .then(function (res) { return res.text(); })
        .then(function (res) {
        mainBlock.innerHTML = res;
    })["catch"](function (e) {
        console.error({ e: e });
    });
};
getContent();
