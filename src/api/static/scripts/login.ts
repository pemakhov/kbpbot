const firstForm = <HTMLFormElement>document.getElementById('login-stage-1');
const nameInput = <HTMLInputElement>document.getElementById('login-stage-1__name-input');
const nameInputHelper = <HTMLInputElement>document.getElementById('login-stage-1__name-input__helper');
const defaultHelperText: string = nameInputHelper.innerHTML;

const secondForm = <HTMLFormElement>document.getElementById('login-stage-2');
const codeInput = <HTMLInputElement>document.getElementById('login-stage-2__code-input');

const tryLoginAgain = <HTMLElement>document.getElementById('try-login-again');

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

const checkResponseError = (res: TResponse): void => {
  const { error } = res;

  if (error) throw error;
};

const removeNameInputError = () => {
  nameInputHelper.innerHTML = defaultHelperText;
  nameInputHelper.classList.remove('red-text');
};

const handleFirstResponseError = (error: TError) => {
  nameInputHelper.innerHTML = `${error.nativeMessage} (${error.message})`;
  nameInputHelper.classList.add('red-text');
  nameInput.addEventListener('input', removeNameInputError);
};

const showTryLoginAgainPage = (): void => {
  tryLoginAgain?.classList.remove('hide');
  secondForm?.classList.add('hide');
};

const fetchMainPage = (): void => {
  const refreshToken = localStorage.getItem('refreshToken');
  console.log(refreshToken);

  fetch('/', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
      authentication: `Bearer ${refreshToken}`,
    },
  }).then((res) => res.text());
};

// Main functions
function handleInputNameForm(event: Event): void {
  event.preventDefault();

  const username = nameInput.value.trim();
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
      return data;
    })
    .then((data) => checkResponseError(data))
    .then(() => showSecondForm())
    .catch((error) => handleFirstResponseError(error));
}

function handleInputCodeForm(event: Event): void {
  event.preventDefault();

  const code = codeInput.value.trim();
  const url = 'login-with-code';
  codeInput.value = '';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })
    .then((res) => res.json())
    .then((res) => {
      checkResponseError(res);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      window.location.replace('/');
    })
    .catch((error) => {
      console.error(error);
      showTryLoginAgainPage();
    });
}

function handleTryAgain(): void {
  tryLoginAgain.classList.add('hide');
  firstForm.classList.remove('hide');
}

firstForm.onsubmit = handleInputNameForm;
secondForm.onsubmit = handleInputCodeForm;
tryLoginAgain.onclick = handleTryAgain;
