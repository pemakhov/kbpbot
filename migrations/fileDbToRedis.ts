import fileDb from './file-database';
import path from 'path';
import { TUser } from '../src/types/TUser';
import { TPhone } from '../src/types/TPhone';
import { TBDay } from '../src/types/TBDay';
import redisDb from '../src/bot/redis-db';

const PHONES_PATH = path.join(__dirname, '../assets/phones.json');
const BIRTHDAYS_PATH = path.join(__dirname, '../assets/birthdays.json');

const users: TUser[] = [...fileDb.readUsers().values()].map((user) => ({
  id: user.id,
  isAdmin: false,
  firstName: user.firstName,
  lastName: user.lastName,
  userName: user.userName,
  date: user.date,
  languageCode: user.languageCode,
}));

const phones: TPhone[] = [...fileDb.readPhones(PHONES_PATH, new Map()).values()].map((phone) => ({
  id: `${phone.phone}${phone.name}`,
  phone: phone.phone,
  name: phone.name,
  department: phone.department,
}));

const bDays: TBDay[] = [...fileDb.readBDays(BIRTHDAYS_PATH, new Map()).values()].map((bDay) => ({
  id: `${bDay.date}${bDay.name}`,
  date: bDay.date,
  day: bDay.day,
  month: bDay.month,
  year: bDay.year,
  name: bDay.name,
}));

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
  bDays.forEach(async (bDay, i) => {
    const saved = await redisDb.saveBirthday(bDay);

    saved && (counter += 1);

    if (i === bDays.length - 1) {
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
  .then((result) => console.log(`Saved ${result} birthdays of ${bDays.length}`))
  .catch((error) => console.log(error.message));
