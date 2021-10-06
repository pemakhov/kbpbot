import fs from 'fs';
import { Logger } from 'tslog';

/**
 * Path to the user database file
 */
const USERS_DATA_FILE = `${__dirname}/../../assets/users.json`;

type TOldUser = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  date: number;
  languageCode: string;
};

type TOldPhone = {
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

const log = new Logger();

const write = async (data: string, path: string): Promise<void> => {
  try {
    await fs.writeFile(path, data.concat('\n'), { flag: 'a+' }, (error) => {
      if (error) {
        throw new Error('Failed to data into the file');
      }
    });
  } catch (error) {
    log.error(error);
  }
};

const readPhones = (path: string, data: Map<string, TOldPhone>): Map<string, TOldPhone> => {
  if (fs.existsSync(path)) {
    fs.readFileSync(path)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          let errorMessage = 'Failed to do something exceptional';
          if (error instanceof Error) errorMessage = error.message;
          log.error(errorMessage);
        }
      })
      .filter((x) => x)
      .forEach((part: TOldPhone) => {
        const key: string = [...Object.values(part)]
          .map((x) => x + '')
          .reduce((acc, x) => `${acc} ${x}`, '')
          .toLowerCase();
        data.set(key, part);
      });
  }
  return data;
};

const readBDays = (path: string, data: Map<string, TOldBDay>): Map<string, TOldBDay> => {
  if (fs.existsSync(path)) {
    fs.readFileSync(path)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          let errorMessage = 'Failed to do something exceptional';
          if (error instanceof Error) errorMessage = error.message;
          log.error(errorMessage);
        }
      })
      .filter((x) => x)
      .forEach((part: TOldBDay) => {
        data.set(part.name.toLowerCase(), part);
      });
  }
  return data;
};

const writeUser = async (userData: TOldUser): Promise<void> => {
  try {
    await fs.writeFile(USERS_DATA_FILE, JSON.stringify(userData).concat('\n'), { flag: 'a+' }, (error) => {
      if (error) {
        throw new Error('Failed to write user data');
      }
    });
  } catch (error) {
    log.error(error);
  }
};

const readUsers = (): Map<number, TOldUser> => {
  const users = new Map();

  if (fs.existsSync(USERS_DATA_FILE)) {
    fs.readFileSync(USERS_DATA_FILE)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch (error) {
          let errorMessage = 'Failed to do something exceptional';
          if (error instanceof Error) errorMessage = error.message;
          log.info(errorMessage);
        }
      })
      .filter((x) => x)
      .forEach((user) => users.set(user.id, user));
  }
  return users;
};

export default {
  write,
  writeUser,
  readPhones,
  readBDays,
  readUsers,
};
