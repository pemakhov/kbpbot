import redis from 'redis';
import { TBDay } from '../types/TBDay';
import { TPhone } from '../types/TPhone';
import { TUser } from '../types/TUser';
import { promisify } from 'util';

const USERS = 'users';
const PHONES = 'phones';
const BIRTHDAYS = 'birthdays';

const client = redis.createClient();

const hsetAsync = promisify(client.HSET).bind(client);
const hgetAsync = promisify(client.HGET).bind(client);
const hgetallAsync = promisify(client.HGETALL).bind(client);

client.on('error', (error) => {
  console.error(error);
});

/* User manipulating methods */

const saveUser = (user: TUser): Promise<number> => hsetAsync([USERS, user.id.toString(), JSON.stringify(user)]);

const getUserById = async (id: number): Promise<TUser | null> => {
  const result = await hgetAsync(USERS, id + '');

  return result ? JSON.parse(result) : null;
};

const makeUserAdmin = async (id: number): Promise<boolean> => {
  const user = await getUserById(id);

  if (!user) {
    console.error('User not found');
    return false;
  }
  user.isAdmin = true;
  const userSaved = await saveUser(user);

  if (userSaved === 1 || userSaved === 0) {
    return true;
  }

  console.error('User is not saved');
  return false;
};

const getUsers = async (): Promise<TUser[]> => {
  const result = await hgetallAsync(USERS);

  return result ? Object.values(result).map((user) => JSON.parse(user as string)) : [];
};

const deleteUserById = async (id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL(USERS, id + '', (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

const deleteUsersCollection = (): boolean => {
  return client.del(USERS);
};

/* Phone manipulating methods */

const savePhone = async (phone: TPhone): Promise<number> => hsetAsync([PHONES, phone.id, JSON.stringify(phone)]);

const getPhoneById = async (id: string): Promise<TPhone | null> => {
  const result = await hgetAsync(PHONES, id);

  return result ? JSON.parse(result) : null;
};

const getPhones = async (): Promise<TPhone[]> => {
  const result = await hgetallAsync(PHONES);

  return result ? Object.values(result).map((phone) => JSON.parse(phone as string)) : [];
};

const deletePhoneById = async (id: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL(PHONES, id, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

const deletePhonesCollection = (): boolean => {
  return client.del(PHONES);
};

/* Birthday manipulating methods */

const saveBirthday = async (bDay: TBDay): Promise<number> => hsetAsync([BIRTHDAYS, bDay.id, JSON.stringify(bDay)]);

const getBirthdayById = async (id: string): Promise<TBDay | null> => {
  const result = await hgetAsync(BIRTHDAYS, id);

  return result ? JSON.parse(result) : null;
};

const getBirthdays = async (): Promise<TBDay[]> => {
  const result = await hgetallAsync(BIRTHDAYS);

  return result
    ? Object.values(result)
        .map((bDay) => JSON.parse(bDay as string))
        .sort((a: TBDay, b: TBDay): number => {
          if (a.month < b.month) return -1;
          if (a.month > b.month) return 1;
          if (a.day < b.day) return -1;
          if (a.day > b.day) return 1;
          if (a.year < b.year) return -1;
          if (a.year > b.year) return 1;
          return 0;
        })
    : [];
};

const deleteBirthdayById = async (id: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL(BIRTHDAYS, id, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

const deleteBirthdaysCollection = (): boolean => {
  return client.del(BIRTHDAYS);
};

export default {
  saveUser,
  getUserById,
  getUsers,
  makeUserAdmin,
  deleteUserById,
  deleteUsersCollection,
  savePhone,
  getPhoneById,
  getPhones,
  deletePhonesCollection,
  deletePhoneById,
  saveBirthday,
  getBirthdayById,
  getBirthdays,
  deleteBirthdayById,
  deleteBirthdaysCollection,
};
