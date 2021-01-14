const inputNameForm = <HTMLFormElement>document.getElementById('login-stage-1');
const inputCodeForm = <HTMLFormElement>document.getElementById('login-stage-2');

function handleInputNameForm(event: Event) {
  event.preventDefault();
  inputCodeForm?.classList.remove('hide');
  inputNameForm?.classList.add('hide');

  const nameInput = <HTMLInputElement>document.getElementById('#login-stage-1__name-input');
  const username = nameInput.value;
  const url = 'code-request';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}

function handleInputCodeForm(event: Event) {
  event.preventDefault();
  inputNameForm?.classList.remove('hide');
  inputCodeForm?.classList.add('hide');
}

if (inputNameForm) {
  inputNameForm.onsubmit = handleInputNameForm;
}

if (inputCodeForm) {
  inputCodeForm.onsubmit = handleInputCodeForm;
}
