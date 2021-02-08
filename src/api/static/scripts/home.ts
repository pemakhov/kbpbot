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

const fetchData = async (type: string): Promise<unknown[]> => {
  const data = await fetch(`/${type}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/json',
    },
  });
  return data.json();
};

function handleEditRow(rowId: string) {
  const row = <HTMLElement>document.getElementById(rowId);
  const oldUser: TPhone = JSON.parse(row.childNodes[1].textContent || '');
  const form = `
    <form>
      <td><input type="text" name="phone" value="${oldUser.phone}"></td>
      <td><input type="text" name="department" value="${oldUser.department}"></td>
      <td><input type="text" name="name" value="${oldUser.name}"></td>
      <td>
        <button class="waves-effect waves-light btn-small"><i class="material-icons">close</i></button>
        <button class="waves-effect waves-light btn-small"><i class="material-icons">check</i></button>
      </td>
    </form>
  `;
  console.log(JSON.parse(row.childNodes[1].textContent || ''));
  row.innerHTML = form;
}

const getPhonesTable = (phones: TPhone[]): string => {
  return `
  <table>
    <thead>
      <tr>
        <th hidden>Summary</td>
        <th>Телефон</td>
        <th>Відділ</td>
        <th>Ім'я</td>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${phones.reduce((acc: string, phone: TPhone) => {
        return (acc += `
      <tr id="${phone.id}">
        <td hidden id="${phone.id}_">${JSON.stringify(phone)}</td>
        <td>${phone.phone}</td>
        <td>${phone.department}</td>
        <td>${phone.name}</td>
        <td>
          <button
            class="waves-effect
            waves-light
            btn-small"
            onclick="handleEditRow('${phone.id}')"
            >
              Редагувати
          </button></td>
      </tr>
      `);
      }, '')}
    </tbody>
  </table>
  `;
};

const getBirthdaysTable = (birthdays: TBDay[]): string => {
  return `
  <table>
    <thead>
      <tr>
        <th hidden>Id</td>
        <th>Ім'я</td>
        <th>День</td>
        <th>Місяць</td>
        <th>Рік</td>
      </tr>
    </thead>
    <tbody>
      ${birthdays.reduce((acc: string, birthday: TBDay) => {
        return (acc += `
      <tr>
        <td hidden>${birthday.id}</td>
        <td>${birthday.name}</td>
        <td>${birthday.day}</td>
        <td>${birthday.month}</td>
        <td>${birthday.year}</td>
      </tr>
      `);
      }, '')}
    </tbody>
  </table>
  `;
};

const getUsersTable = (users: TUser[]): string => {
  return `
  <table>
    <thead>
      <tr>
        <th hidden>Id</td>
        <th>Ім'я</td>
        <th>Прізвище</td>
        <th>Юзернейм</td>
        <th>Адміністратор</td>
        <th>Дата створення</td>
      </tr>
    </thead>
    <tbody>
      ${users.reduce((acc: string, user: TUser) => {
        return (acc += `
      <tr>
        <td hidden>${user.id}</td>
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
          fetchData('phones')
            .then((data) => {
              const phones: TPhone[] = data as TPhone[];
              return getPhonesTable(phones);
            })
            .then((table) => (dataBlock.innerHTML = table));
          break;
        case 'birthdays':
          usersButton.checked = false;
          phonesButton.checked = false;
          birthdaysButton.checked = true;
          emptyBlock(dataBlock);
          fetchData('birthdays')
            .then((data) => {
              const birthdays: TBDay[] = data as TBDay[];
              return getBirthdaysTable(birthdays);
            })
            .then((table) => (dataBlock.innerHTML = table));
          break;
        default:
          usersButton.checked = true;
          phonesButton.checked = false;
          birthdaysButton.checked = false;
          emptyBlock(dataBlock);
          fetchData('users')
            .then((data) => {
              const users: TUser[] = data as TUser[];
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

  dataManager.setCurrentOption('phones');
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
