const firstForm = <HTMLFormElement>document.getElementById('login-stage-1');
const nameInput = <HTMLInputElement>document.getElementById('login-stage-1__name-input');
const nameInputHelper = <HTMLInputElement>document.getElementById('login-stage-1__name-input__helper');
const defaultHelperText: string = nameInputHelper.innerHTML;

const secondForm = <HTMLFormElement>document.getElementById('login-stage-2');

// Types
type TError = {
  name: string;
  message: string;
  nativeMessage: string;
};

type TResponse = {
  error: TError | null;
  message: string;
};

// First form service functions
const showSecondForm = (): void => {
  secondForm?.classList.remove('hide');
  firstForm?.classList.add('hide');
};

const checkFirstResponseError = (res: TResponse): void => {
  const { error } = res;

  if (error) throw error;
};

const removeNameInputError = () => {
  nameInputHelper.innerHTML = defaultHelperText;
  nameInputHelper.classList.remove('red-text');
};

const handleFirstResponseError = (error: TError) => {
  console.log(nameInputHelper.innerHTML);
  nameInputHelper.innerHTML = `${error.nativeMessage} (${error.message})`;
  nameInputHelper.classList.add('red-text');
  nameInput.addEventListener('input', removeNameInputError);
};

// Main functions
function handleInputNameForm(event: Event) {
  event.preventDefault();

  const username = nameInput.value;
  const url = 'code-request';
  nameInput.value = '';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .then((data) => checkFirstResponseError(data))
    .then(() => showSecondForm())
    .catch((error) => handleFirstResponseError(error));
}

function handleInputCodeForm(event: Event) {
  event.preventDefault();
  firstForm?.classList.remove('hide');
  secondForm?.classList.add('hide');
}

if (firstForm) {
  firstForm.onsubmit = handleInputNameForm;
}

if (secondForm) {
  secondForm.onsubmit = handleInputCodeForm;
}
