var firstForm = document.getElementById('login-stage-1');
var nameInput = document.getElementById('login-stage-1__name-input');
var nameInputHelper = document.getElementById('login-stage-1__name-input__helper');
var defaultHelperText = nameInputHelper.innerHTML;
var secondForm = document.getElementById('login-stage-2');
var codeInput = document.getElementById('login-stage-2__code-input');
var tryLoginAgain = document.getElementById('try-login-again');
// First form service functions
var showSecondForm = function () {
    secondForm === null || secondForm === void 0 ? void 0 : secondForm.classList.remove('hide');
    firstForm === null || firstForm === void 0 ? void 0 : firstForm.classList.add('hide');
};
var checkResponseError = function (res) {
    var error = res.error;
    if (error)
        throw error;
};
var removeNameInputError = function () {
    nameInputHelper.innerHTML = defaultHelperText;
    nameInputHelper.classList.remove('red-text');
};
var handleFirstResponseError = function (error) {
    nameInputHelper.innerHTML = error.nativeMessage + " (" + error.message + ")";
    nameInputHelper.classList.add('red-text');
    nameInput.addEventListener('input', removeNameInputError);
};
var showTryLoginAgainPage = function () {
    tryLoginAgain === null || tryLoginAgain === void 0 ? void 0 : tryLoginAgain.classList.remove('hide');
    secondForm === null || secondForm === void 0 ? void 0 : secondForm.classList.add('hide');
};
var fetchMainPage = function () {
    var refreshToken = localStorage.getItem('refreshToken');
    console.log(refreshToken);
    fetch('/', {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html',
            authentication: "Bearer " + refreshToken
        }
    }).then(function (res) { return res.text(); });
};
// Main functions
function handleInputNameForm(event) {
    event.preventDefault();
    var username = nameInput.value.trim();
    var url = 'code-request';
    nameInput.value = '';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        return data;
    })
        .then(function (data) { return checkResponseError(data); })
        .then(function () { return showSecondForm(); })["catch"](function (error) { return handleFirstResponseError(error); });
}
function handleInputCodeForm(event) {
    event.preventDefault();
    var code = codeInput.value.trim();
    var url = 'login-with-code';
    codeInput.value = '';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
    })
        .then(function (res) { return res.json(); })
        .then(function (res) {
        checkResponseError(res);
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        window.location.replace('/');
    })["catch"](function (error) {
        console.error(error);
        showTryLoginAgainPage();
    });
}
function handleTryAgain() {
    tryLoginAgain.classList.add('hide');
    firstForm.classList.remove('hide');
}
firstForm.onsubmit = handleInputNameForm;
secondForm.onsubmit = handleInputCodeForm;
tryLoginAgain.onclick = handleTryAgain;