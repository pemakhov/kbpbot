import redis from 'redis';
import { TBDay } from '../types/TBDay';
import { TPhone } from '../types/TPhone';
import { TUser } from '../types/TUser';

const client = redis.createClient();

client.on('error', (error) => {
  console.error(error);
});

/* Common methods */

/**
 * Parses data objects an array of stringified objects
 * @param data array of stringified objects
 * @returns the array of objects
 */
const parseData = (data: string[]): unknown[] => {
  const users: unknown[] = [];
  data
    .map((row) => row)
    .map((row) => JSON.parse(row))
    .map((x) => x)
    .forEach((user) => users.push(user));
  return users as TUser[];
};

/**
 * Gets object from redis hash by hash name and id
 * @param hashName hash key name, for example 'users'
 * @param id data id
 */
const getOneById = async (hashName: string, id: number): Promise<unknown | null> => {
  return new Promise((resolve, reject) => {
    client.HGET(hashName, id.toString(), async function (error, result) {
      if (error) {
        reject(error);
        return;
      }
      resolve(JSON.parse(result));
    });
  });
};

/**
 * Gets all objects from redis hash by hash name
 * @param hashName hash key name, for example 'users'
 * @param dataTypeParser a function parsing array of strings into an array of needed type objects
 */
const getAll = async (hashName: string, dataTypeParser: (data: string[]) => unknown[]): Promise<unknown[]> => {
  return new Promise((resolve, reject) => {
    client.HGETALL(hashName, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(dataTypeParser(Object.values(result)));
    });
  });
};

/**
 * Deletes object from redis hash by hash name and id
 * @param hashName hash key name, for example 'users'
 * @param id data id
 */
const deleteOneById = async (hashName: string, id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL(hashName, id.toString(), (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
};

/* User manipulating methods */

const saveUser = async (user: TUser): Promise<boolean> =>
  client.HSET('users', user.id.toString(), JSON.stringify(user));

const getUserById = async (id: number): Promise<TUser | null> => getOneById('users', id) as Promise<TUser | null>;

const makeUserAdmin = async (id: number): Promise<boolean> => {
  try {
    const user = await getUserById(id);

    if (!user) {
      throw new Error(`User not found`);
    }
    user.isAdmin = true;
    return saveUser(user);
  } catch (error) {
    return false;
  }
};

const parseUsers = (data: string[]): TUser[] => parseData(data) as TUser[];

const getUsers = async (): Promise<TUser[]> => getAll('users', parseUsers) as Promise<TUser[]>;

const deleteUserById = async (id: number): Promise<number> => deleteOneById('users', id);

/* Phone manipulating methods */

const parsePhones = (data: string[]): TPhone[] => parseData(data) as TPhone[];

const savePhone = async (phone: TPhone): Promise<boolean> =>
  client.HSET('phones', phone.id.toString(), JSON.stringify(phone));

const getPhoneById = (id: number): Promise<TPhone | null> => getOneById('phones', id) as Promise<TPhone | null>;

const getPhones = (): Promise<TPhone[]> => getAll('phones', parsePhones) as Promise<TPhone[]>;

const deletePhoneById = async (id: number): Promise<number> => deleteOneById('phones', id);

/* Birthday manipulating methods */

const parseBirthdays = (data: string[]): TPhone[] => parseData(data) as TPhone[];

const saveBirthday = async (bDay: TBDay): Promise<boolean> =>
  client.HSET('birthdays', bDay.id.toString(), JSON.stringify(bDay));

const getBirthdayById = (id: number): Promise<TBDay | null> => getOneById('birthdays', id) as Promise<TBDay | null>;

const getBirthdays = (): Promise<TBDay[]> => getAll('birthdays', parseBirthdays) as Promise<TBDay[]>;

const deleteBirthdayById = async (id: number): Promise<number> => deleteOneById('birthdays', id);

export default {
  saveUser,
  getUserById,
  getUsers,
  makeUserAdmin,
  deleteUserById,
  savePhone,
  getPhoneById,
  getPhones,
  deletePhoneById,
  saveBirthday,
  getBirthdayById,
  getBirthdays,
  deleteBirthdayById,
};
