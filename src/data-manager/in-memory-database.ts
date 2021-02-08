import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';
import redisDb from './redis-db';
import { localMonths } from '../utils/text-sets';

const getPhoneKey = (obj: TPhone): string => {
  const parts: string[] = [obj.phone, obj.name, obj.department.replace(/\s/g, '')];
  return parts.map((x) => x.toLowerCase()).reduce((acc, x) => acc + x, '');
};

const getBirthdayKey = (obj: TBDay): string => `${obj.name} ${obj.year} ${localMonths[obj.month + 1]}`.toLowerCase();

function createInMemoryDb(): TInMemoryDatabase {
  const users: Map<number, TUser> = new Map();
  const phones: Map<string, TPhone> = new Map();
  const bDays: Map<string, TBDay> = new Map();

  return {
    users: {
      all: users,

      add: (user) => users.set(user.id, user),

      getById: (id) => users.get(id),

      getByTelegramName: (name) => [...users.values()].find((user) => user.userName === name),

      exists: (id) => users.has(id),

      update: (user) => {
        if (!users.get(user.id)) {
          return null;
        }
        users.set(user.id, user);
        return user;
      },
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
      update(oldPhone, newPhone) {
        try {
          phones.delete(getPhoneKey(oldPhone));
          phones.set(getPhoneKey(newPhone), newPhone);
          return newPhone;
        } catch (error) {
          console.error(error.message);
          return null;
        }
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

      update(oldBirthday, newBirthday) {
        try {
          bDays.delete(getBirthdayKey(oldBirthday));
          bDays.set(getBirthdayKey(newBirthday), newBirthday);
          return newBirthday;
        } catch (error) {
          console.error(error.message);
          return null;
        }
      },
    },
  };
}

export const inMemoryDb = createInMemoryDb();

function fillIn(storedUsers: TUser[] = [], storedPhones: TPhone[] = [], storedBDays: TBDay[] = []): void {
  storedUsers.map((user) => inMemoryDb.users.add(user));
  storedPhones.map((phone) => inMemoryDb.phone.add(phone));
  storedBDays.map((bDay) => inMemoryDb.birthday.add(bDay));
}

async function getStoredDataFromRedis(): Promise<[TUser[], TPhone[], TBDay[]]> {
  const users = await redisDb.getUsers();
  const phones = await redisDb.getPhones();
  const bDays = await redisDb.getBirthdays();

  return [users, phones, bDays];
}

export default {
  getStoredDataFromRedis,
  fillIn,
};
