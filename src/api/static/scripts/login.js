var inputNameForm = document.getElementById('login-stage-1');
var inputCodeForm = document.getElementById('login-stage-2');
function handleInputNameForm(event) {
    event.preventDefault();
    inputCodeForm === null || inputCodeForm === void 0 ? void 0 : inputCodeForm.classList.remove('hide');
    inputNameForm === null || inputNameForm === void 0 ? void 0 : inputNameForm.classList.add('hide');
    var nameInput = document.getElementById('#login-stage-1__name-input');
    var username = nameInput.value;
    var url = 'code-request';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })
        .then(function (response) { return response.json(); })
        .then(function (data) { return console.log(data); });
}
function handleInputCodeForm(event) {
    event.preventDefault();
    inputNameForm === null || inputNameForm === void 0 ? void 0 : inputNameForm.classList.remove('hide');
    inputCodeForm === null || inputCodeForm === void 0 ? void 0 : inputCodeForm.classList.add('hide');
}
if (inputNameForm) {
    inputNameForm.onsubmit = handleInputNameForm;
}
if (inputCodeForm) {
    inputCodeForm.onsubmit = handleInputCodeForm;
}
