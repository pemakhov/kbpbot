var firstForm = document.getElementById('login-stage-1');
var nameInput = document.getElementById('login-stage-1__name-input');
var nameInputHelper = document.getElementById('login-stage-1__name-input__helper');
var defaultHelperText = nameInputHelper.innerHTML;
var secondForm = document.getElementById('login-stage-2');
// First form service functions
var showSecondForm = function () {
    secondForm === null || secondForm === void 0 ? void 0 : secondForm.classList.remove('hide');
    firstForm === null || firstForm === void 0 ? void 0 : firstForm.classList.add('hide');
};
var checkFirstResponseError = function (res) {
    var error = res.error;
    if (error)
        throw error;
};
var removeNameInputError = function () {
    nameInputHelper.innerHTML = defaultHelperText;
    nameInputHelper.classList.remove('red-text');
};
var handleFirstResponseError = function (error) {
    console.log(nameInputHelper.innerHTML);
    nameInputHelper.innerHTML = error.nativeMessage + " (" + error.message + ")";
    nameInputHelper.classList.add('red-text');
    nameInput.addEventListener('input', removeNameInputError);
};
// Main functions
function handleInputNameForm(event) {
    event.preventDefault();
    var username = nameInput.value;
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
        console.log(data);
        return data;
    })
        .then(function (data) { return checkFirstResponseError(data); })
        .then(function () { return showSecondForm(); })["catch"](function (error) { return handleFirstResponseError(error); });
}
function handleInputCodeForm(event) {
    event.preventDefault();
    firstForm === null || firstForm === void 0 ? void 0 : firstForm.classList.remove('hide');
    secondForm === null || secondForm === void 0 ? void 0 : secondForm.classList.add('hide');
}
if (firstForm) {
    firstForm.onsubmit = handleInputNameForm;
}
if (secondForm) {
    secondForm.onsubmit = handleInputCodeForm;
}
