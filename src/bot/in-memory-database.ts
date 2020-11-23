import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';

const create = (
  storedUsers: Map<number, TUser> = new Map<number, TUser>(),
  storedPhones: Map<string, TPhone> = new Map<string, TPhone>(),
  storedBDays: Map<number, TBDay[]> = new Map<number, TBDay[]>()
): TInMemoryDatabase => {
  const users = storedUsers;
  const phones = storedPhones;
  const bDays = storedBDays;

  return {
    users: {
      all: users,
      add: (user) => users.set(user.id, user),
      getById: (id) => users.get(id),
      getByTelegramName: (name) => [...users.values()].find((user) => user.userName === name),
      exists: (id) => users.has(id),
    },
    phone: {
      all: [...phones.values()],
      add: (phone) => {
        const key = [...Object.values(phone)].reduce((acc, x) => `${acc} ${x}`, '').toLowerCase();
        phones.set(key, phone);
        return phone;
      },
      find: (searchKey) => {
        console.log('...finding');
        const summaries = [...phones.keys()].filter((record) => record.includes(searchKey));
        return summaries.map((key: string) => phones.get(key));
      },
    },
    birthday: {
      all: [...bDays.values()].reduce((acc, arr) => acc.concat(arr), []),
      add: (bDay) => {
        const bDayRecords = bDays.get(bDay.date) || [];
        bDayRecords.push(bDay);
        bDays.set(bDay.date, bDayRecords);
        return bDayRecords;
      },
      find: (name) =>
        [...bDays.values()].reduce((acc, arr) => acc.concat(arr), []).filter((bDay) => bDay.name.includes(name)),
      inMonth: (month) => [...bDays.values()].flat().filter((bDay) => new Date(bDay.date).getMonth() === month),
    },
  };
};

export default {
  create,
};
