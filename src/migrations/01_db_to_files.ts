import fileDatabase from './file-database';
import path from 'path';
import redisDb from '../data-manager/redis-db';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';
import { TUser } from '../types/TUser';
import { exit } from 'node:process';

const PHONES_PATH = path.join(__dirname, '../../assets/phones1.json');
const BIRTHDAYS_PATH = path.join(__dirname, '../../assets/birthdays1.json');
const USERS_DATA_FILE = `${__dirname}/../../assets/users1.json`;

const writeData = async () => {
  const phones: TPhone[] = await redisDb.getPhones();
  const birthdays: TBDay[] = await redisDb.getBirthdays();
  const users: TUser[] = await redisDb.getUsers();

  phones.forEach((phone: TPhone) => {
    fileDatabase.write(JSON.stringify(phone), PHONES_PATH);
  });
  birthdays.forEach((birthday: TBDay) => {
    fileDatabase.write(JSON.stringify(birthday), BIRTHDAYS_PATH);
  });
  users.forEach((user: TUser) => {
    fileDatabase.write(JSON.stringify(user), USERS_DATA_FILE);
  });
};

writeData();
exit(0);
