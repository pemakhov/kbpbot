type TUser = {
  id: number;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  userName: string;
  date: number;
  languageCode: string;
};

type TPhone = {
  id: string;
  phone: string;
  name: string;
  department: string;
};

type TBDay = {
  id: string;
  date: string;
  day: number;
  month: number;
  year: number;
  name: string;
};

const mainBlock = <HTMLElement>document.getElementById('body');

const fetchUsers = async (): Promise<TUser[]> => {
  const users = await fetch('/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'text/json',
    },
  });
  return users.json();
};

const getUsersTable = (users: TUser[]): string => {
  console.log(users);
  return `
  <table>
    <thead>
      <tr>
        <td>Ім'я</td>
        <td>Прізвище</td>
        <td>Юзернейм</td>
        <td>Адміністратор</td>
        <td>Дата створення</td>
      </tr>
    </thead>
    <tbody>
      ${users.reduce((acc: string, user: TUser) => {
        return (acc += `
      <tr>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.userName}</td>
        <td>${user.isAdmin}</td>
        <td>${user.date}</td>
      </tr>
      `);
      }, '')}
    </tbody>
  </table>
  `;
};

const getPhonesTable = (phones: TPhone): string => {
  // TODO: phones and bdays modules with routers. fetch phones and bdays and format corresponding tables
  return '';
};

const emptyBlock = (block: HTMLElement) => (block.innerHTML = '');

const createDataSelector = (
  usersButton: HTMLInputElement,
  phonesButton: HTMLInputElement,
  birthdaysButton: HTMLInputElement
) => {
  const dataBlock = <HTMLElement>document.getElementById('data');

  return {
    value: '',

    setCurrentOption(value: string) {
      if (this.value === value) {
        return;
      }
      this.value = value;
      switch (value) {
        case 'phones':
          usersButton.checked = false;
          phonesButton.checked = true;
          birthdaysButton.checked = false;
          emptyBlock(dataBlock);
          break;
        case 'birthdays':
          usersButton.checked = false;
          phonesButton.checked = false;
          birthdaysButton.checked = true;
          emptyBlock(dataBlock);
          break;
        default:
          usersButton.checked = true;
          phonesButton.checked = false;
          birthdaysButton.checked = false;
          emptyBlock(dataBlock);
          fetchUsers()
            .then((users) => {
              return getUsersTable(users);
            })
            .then((table) => (dataBlock.innerHTML = table));
          break;
      }
    },
  };
};

const refreshTokens = () => {
  fetch('/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: localStorage.refreshToken }),
  })
    .then((res) => res.json())
    .then((res) => {
      const { accessToken, refreshToken } = res;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      getContent();
    })
    .catch((error) => {
      console.error('something went wrong');
      console.error(error.message);
    });
};

const addDataSelectorListeners = () => {
  const usersButton = <HTMLInputElement>document.getElementById('data-selector__users');
  const phonesButton = <HTMLInputElement>document.getElementById('data-selector__phones');
  const birthdaysButton = <HTMLInputElement>document.getElementById('data-selector__birthdays');

  const dataManager = createDataSelector(usersButton, phonesButton, birthdaysButton);

  usersButton.addEventListener('change', () => dataManager.setCurrentOption('users'));
  phonesButton.addEventListener('change', () => dataManager.setCurrentOption('phones'));
  birthdaysButton.addEventListener('change', () => dataManager.setCurrentOption('birthdays'));

  dataManager.setCurrentOption('users');
};

function getContent() {
  fetch('/', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${localStorage.accessToken}`,
    },
  })
    .then((res) => {
      if (res.status === 401) {
        window.location.replace('/auth/login');
        throw 401;
      } else if (res.status === 403) {
        refreshTokens();
        throw 403;
      }
      return res;
    })
    .then((res) => res.text())
    .then((res) => {
      mainBlock.innerHTML = res;
      addDataSelectorListeners();
    })
    .catch((e) => {
      console.error({ e });
    });
}

getContent();
