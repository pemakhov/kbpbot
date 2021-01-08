import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';
import redisDb from './redis-db';

const getPhoneKey = (obj: TPhone): string => {
  const parts: string[] = [obj.phone, obj.name, obj.department.replace(/\s/g, '')];
  return parts.map((x) => x.toLowerCase()).reduce((acc, x) => acc + x, '');
};

const getBirthdayKey = (obj: TBDay): string => {
  const localMonths = [
    'січень',
    'лютий',
    'березень',
    'квітень',
    'травень',
    'червень',
    'липень',
    'серпень',
    'вересень',
    'жовтень',
    'листопад',
    'грудень',
  ];

  return `${obj.name} ${obj.year} ${localMonths[obj.month + 1]}`.toLowerCase();
};

function create(storedUsers: TUser[] = [], storedPhones: TPhone[] = [], storedBDays: TBDay[] = []): TInMemoryDatabase {
  const users: Map<number, TUser> = new Map();
  const phones: Map<string, TPhone> = new Map();
  const bDays: Map<string, TBDay> = new Map();

  storedUsers.map((user) => users.set(user.id, user));
  storedPhones.map((phone) => phones.set(getPhoneKey(phone), phone));
  storedBDays.map((bDay) => bDays.set(getBirthdayKey(bDay), bDay));

  return {
    users: {
      all: users,

      add: (user) => users.set(user.id, user),

      getById: (id) => users.get(id),

      getByTelegramName: (name) => [...users.values()].find((user) => user.userName === name),

      exists: (id) => users.has(id),
    },
    phone: {
      all: () =>
        [...phones.values()].sort(
          (a, b) => a?.department.localeCompare(b?.department || '') || a?.name.localeCompare(b?.name || '') || 0
        ),

      add: (phone) => {
        phones.set(getPhoneKey(phone), phone);
        return phone;
      },

      find: (searchKey) => {
        const searchFragments = searchKey
          .toLowerCase()
          .split(' ')
          .map((x) => x);
        const summaries = [...phones.keys()].filter((record) =>
          searchFragments.every((fragment) => record.includes(fragment))
        );
        return summaries
          .map((key: string) => phones.get(key))
          .sort(
            (a, b) => a?.department.localeCompare(b?.department || '') || a?.name.localeCompare(b?.name || '') || 0
          );
      },
    },
    birthday: {
      all: () => [...bDays.values()],

      add: (bDay) => {
        bDays.set(getBirthdayKey(bDay), bDay);
        return bDay;
      },

      find: (searchKey) => {
        const searchFragments = searchKey
          .toLowerCase()
          .split(' ')
          .map((x) => x);
        const summaries = [...bDays.keys()]
          .map((key) => {
            return key;
          })
          .filter((record) => searchFragments.every((fragment) => record.includes(fragment)));
        return summaries.map((key: string) => bDays.get(key));
      },

      inMonth: (month) => [...bDays.values()].flat().filter((bDay) => new Date(bDay.date).getMonth() === month),
    },
  };
}

async function init(): Promise<TInMemoryDatabase> {
  const users = await redisDb.getUsers();
  const phones = await redisDb.getPhones();
  const bDays = await redisDb.getBirthdays();

  return create(users, phones, bDays);
}

export default {
  init,
};
