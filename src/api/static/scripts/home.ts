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
  name: string;
  date: string;
  day: number;
  month: number;
  year: number;
};

const state: {
  editing: boolean;
  currentRow: HTMLElement | null;
  currentRowReservedCopy: string;
  currentRowOldData: TPhone | TBDay | TUser | null;
} = {
  editing: false,
  currentRow: null,
  currentRowReservedCopy: '',
  currentRowOldData: null,
};

const resetState = () => {
  state.editing = false;
  state.currentRow = null;
  state.currentRowReservedCopy = '';
  state.currentRowOldData = null;
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

function handleCancelEditRow() {
  console.log(state);
  if (state.currentRow !== null) {
    state.currentRow.innerHTML = state.currentRowReservedCopy;
  }

  resetState();
}

function handleSubmitEditRow(event: Event) {
  event.preventDefault();
  console.log('submitting');
}

function handleEditRow(rowId: string) {
  if (state.editing) {
    return;
  }
  state.editing = true;

  const row = <HTMLElement>document.getElementById(rowId);

  state.currentRow = row;
  state.currentRowReservedCopy = row.innerHTML;
  console.log('first child: ');
  console.log(row.firstChild);
  // state.currentRowOldData = JSON.parse(row.firstChild) as TPhone;
  console.log(row);

  const phoneData: TPhone = JSON.parse(row.childNodes[1].textContent || '');
  const form = `
    <form id="phone-edit" onsubmit="handleSubmitEditRow()">
      <div class="col s2">
        <input type="text" name="phone" value="${phoneData.phone}" />
      </div>
      <div class="col s2">
        <input type="text" name="department" value="${phoneData.department}">
      </div>
      <div class="col s4">
        <input type="text" name="name" value="${phoneData.name}" />
      </div>
      <div class="col s1">
        <span>
          <button class="waves-light btn-small" onclick="handleCancelEditRow()">
              <i class="material-icons">close</i>
          </button>
      </div>
      <div class="col s1">
          <button form="phone-edit" value="submit" class="waves-light btn-small"><i class="material-icons">check</i></button>
        </span>
      </div>
    </form>
  `;
  row.innerHTML = form;
}

const getPhonesTable = (phones: TPhone[]): string => {
  return `
    <div class="row">
      <div hidden>Summary</div>
      <div class="col s2"><h6>Телефон</h6></div>
      <div class="col s2"><h6>Відділ</h6></div>
      <div class="col s4"><h6>Ім'я</h6></div>
      <div class="col s1"><h6></h6></div>
      <div class="col s1"><h6></h6></div>
    </div>
    ${phones.reduce((acc: string, phone: TPhone) => {
      return (acc += `
    <div class="row" id="${phone.id}">
      <div hidden id="${phone.id}_">${JSON.stringify(phone)}</div>
      <div class="col s2">${phone.phone}</div>
      <div class="col s2">${phone.department}</div>
      <div class="col s4">${phone.name}</div>
      <div class="col s1">
        <button class="waves-light btn-small" onclick="handleEditRow('${phone.id}')">
           <i class="material-icons">edit</i> 
        </button>
      </div>
      <div class="col s1">
        <button class="waves-light btn-small"><i class="material-icons">delete</i></button>
       </div>
    </div>
    `);
    }, '')}
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

      resetState();

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
