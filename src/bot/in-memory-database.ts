import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';

const create = (
  storedUsers: Map<number, TUser> = new Map<number, TUser>(),
  storedPhones: Map<string, TPhone> = new Map<string, TPhone>(),
  storedBDays: Map<string, TBDay> = new Map<string, TBDay>()
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
        const summaries = [...phones.keys()].filter((record) => record.includes(searchKey.toLowerCase()));
        return summaries.map((key: string) => phones.get(key));
      },
    },
    birthday: {
      all: [...bDays.values()],

      add: (bDay) => {
        const key = [...Object.values(bDay)]
          .map((x) => x + '')
          .reduce((acc, x) => `${acc} ${x}`, '')
          .toLowerCase();
        bDays.set(key, bDay);
        return bDay;
      },

      find: (name) => {
        const summaries = [...bDays.keys()].filter((record) => record.includes(name.toLowerCase()));
        return summaries.map((key: string) => bDays.get(key));
      },

      inMonth: (month) => [...bDays.values()].flat().filter((bDay) => new Date(bDay.date).getMonth() === month),
    },
  };
};

export default {
  create,
};
