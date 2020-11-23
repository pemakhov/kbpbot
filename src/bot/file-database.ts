import constants from '../constants';
import fs from 'fs';
import { TUser } from '../types/TUser';
import { Logger } from 'tslog';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';

const log = new Logger();

const write = (data: string, path: string): void => {
  try {
    fs.writeFile(path, data.concat('\n'), { flag: 'a+' }, (error) => {
      if (error) {
        throw new Error('Failed to data into the file');
      }
    });
  } catch (error) {
    log.error(error);
  }
};

const readPhones = (path: string, data: Map<string, TPhone>): Map<string, TPhone> => {
  if (fs.existsSync(path)) {
    fs.readFileSync(path)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          log.error(error.message);
        }
      })
      .filter((x) => x)
      .forEach((part: TPhone) => {
        const key: string = [...Object.values(part)].reduce((acc, x) => `${acc} ${x}`, '').toLowerCase();
        data.set(key, part);
      });
  }
  return data;
};

const readBDays = (path: string, data: Map<number, TBDay[]>): Map<number, TBDay[]> => {
  if (fs.existsSync(path)) {
    fs.readFileSync(path)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          log.error(error.message);
        }
      })
      .filter((x) => x)
      .forEach((part) => {
        const record = data.get(part.date);
        record?.push(part);
      });
  }
  return data;
};

const writeUser = (userData: TUser): void => {
  try {
    fs.writeFile(constants.USERS_DATA_FILE, JSON.stringify(userData).concat('\n'), { flag: 'a+' }, (error) => {
      if (error) {
        throw new Error('Failed to write user data');
      }
    });
  } catch (error) {
    log.error(error);
  }
};

const readUsers = (): Map<number, TUser> => {
  const users: Map<number, TUser> = new Map();

  if (fs.existsSync(constants.USERS_DATA_FILE)) {
    fs.readFileSync(constants.USERS_DATA_FILE)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          log.info(error.message);
        }
      })
      .filter((x) => x)
      .forEach((user) => users.set(user.id, user));
  }
  return users;
};

export default {
  readPhones,
  readBDays,
  write,
  writeUser,
  readUsers,
};
