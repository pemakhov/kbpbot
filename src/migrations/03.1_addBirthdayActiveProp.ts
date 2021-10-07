/**
 * Adds an 'active' property to the birthdays
 */

import fs from 'fs';
import path from 'path';
import { TUser } from '../types/TUser';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';
import redisDb from '../data-manager/redis-db';

const PHONES_PATH = path.join(__dirname, '../../assets/phones.json');
const BIRTHDAYS_PATH = path.join(__dirname, '../../assets/birthdays.json');
const USERS_PATH = path.join('../../assets/users.json');

type TOldUser = {
  id: number;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  userName: string;
  date: number;
  languageCode: string;
};

type TOldPhone = {
  id: string;
  phone: string;
  name: string;
  department: string;
};

export type TOldBDay = {
  date: string;
  day: number;
  month: number;
  year: number;
  name: string;
};

const readData = (dataPath: string): (TOldUser | TOldPhone | TOldBDay)[] => {
  if (!fs.existsSync(dataPath)) {
    throw new Error("File with users data doesn't exist");
  }

  return fs
    .readFileSync(dataPath)
    .toString()
    .split('\n')
    .filter((x) => x)
    .map((string) => {
      try {
        return JSON.parse(string);
      } catch (error) {
        let errorMessage = 'Failed to do something exceptional';
        if (error instanceof Error) errorMessage = error.message;
        console.error(errorMessage);
      }
    })
    .filter((x) => x);
};

const oldUsers: TOldUser[] = readData(USERS_PATH) as TOldUser[];
const oldPhones: TOldPhone[] = readData(PHONES_PATH) as TOldPhone[];
const oldBirthdays: TOldBDay[] = readData(BIRTHDAYS_PATH) as TOldBDay[];

const users: TUser[] = [...oldUsers];
const phones: TPhone[] = [...oldPhones];
const birthdays: TBDay[] = oldBirthdays.map((birthday) => ({ ...birthday, active: true })); // TODO: add 'active' in TBDay

const saveUsersPromise = new Promise((resolve) => {
  let counter = 0;
  users.forEach(async (user, i) => {
    const saved = await redisDb.saveUser(user);

    saved && (counter += 1);

    if (i === users.length - 1) {
      resolve(counter);
      return;
    }
  });
});

const savePhonesPromise = new Promise((resolve) => {
  let counter = 0;
  phones.forEach(async (phone, i) => {
    const saved = await redisDb.savePhone(phone);

    saved && (counter += 1);

    if (i === phones.length - 1) {
      resolve(counter);
      return;
    }
  });
});

const saveBirthdaysPromise = new Promise((resolve) => {
  let counter = 0;
  birthdays.forEach(async (bDay, i) => {
    const saved = await redisDb.saveBirthday(bDay);

    saved && (counter += 1);

    if (i === birthdays.length - 1) {
      resolve(counter);
      return;
    }
  });
});

saveUsersPromise
  .then((result) => console.log(`Saved ${result} users of ${users.length}`))
  .catch((error) => console.log(error.message));

savePhonesPromise
  .then((result) => console.log(`Saved ${result} phones of ${phones.length}`))
  .catch((error) => console.log(error.message));

saveBirthdaysPromise
  .then((result) => console.log(`Saved ${result} birthdays of ${birthdays.length}`))
  .catch((error) => console.log(error.message));

Promise.all([saveUsersPromise, savePhonesPromise, saveBirthdaysPromise]).then(() => process.exit());
