import redis from 'redis';
import { TBDay } from '../types/TBDay';
import { TPhone } from '../types/TPhone';
import { TUser } from '../types/TUser';
import { promisify } from 'util';

const client = redis.createClient();

const hsetAsync = promisify(client.HSET).bind(client);
const hgetAsync = promisify(client.HGET).bind(client);
const hgetallAsync = promisify(client.HGETALL).bind(client);

client.on('error', (error) => {
  console.error(error);
});

/* User manipulating methods */

const saveUser = (user: TUser): Promise<number> => hsetAsync(['users', user.id.toString(), JSON.stringify(user)]);

const getUserById = async (id: number): Promise<TUser | null> => {
  const result = await hgetAsync('users', id + '');

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
  const result = await hgetallAsync('users');

  return result ? Object.values(result).map((user) => JSON.parse(user as string)) : [];
};

const deleteUserById = async (id: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL('users', id + '', (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

/* Phone manipulating methods */

const savePhone = async (phone: TPhone): Promise<number> => hsetAsync(['phones', phone.id, JSON.stringify(phone)]);

const getPhoneById = async (id: string): Promise<TPhone | null> => {
  const result = await hgetAsync('phones', id);

  return result ? JSON.parse(result) : null;
};

const getPhones = async (): Promise<TPhone[]> => {
  const result = await hgetallAsync('phones');

  return result ? Object.values(result).map((phone) => JSON.parse(phone as string)) : [];
};

const deletePhoneById = async (id: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL('phones', id, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

/* Birthday manipulating methods */

const saveBirthday = async (bDay: TBDay): Promise<number> => hsetAsync(['birthdays', bDay.id, JSON.stringify(bDay)]);

const getBirthdayById = async (id: string): Promise<TBDay | null> => {
  const result = await hgetAsync('birthdays', id);

  return result ? JSON.parse(result) : null;
};

const getBirthdays = async (): Promise<TBDay[]> => {
  const result = await hgetallAsync('birthdays');

  return result ? Object.values(result).map((bDay) => JSON.parse(bDay as string)) : [];
};

const deleteBirthdayById = async (id: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    client.HDEL('birthdays', id, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
      return;
    });
  });
};

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
