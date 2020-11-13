import constants from '../constants';
import fs from 'fs';
import { TUser } from '../types/TUser';
import { Logger } from 'tslog';

const log = new Logger();

const write = (data: string, path: string) => {
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

const read = (path: string): Map<string, string> => {
  let data: Map<string, string> = new Map();

  if (fs.existsSync(path)) {
    fs.readFileSync(path)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch {}
      })
      .filter((x) => x)
      .forEach((piece) => data.set(piece[0], piece));
  }
  return data;
};

const writeUser = (userData: TUser) => {
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
  let users: Map<number, TUser> = new Map();

  if (fs.existsSync(constants.USERS_DATA_FILE)) {
    fs.readFileSync(constants.USERS_DATA_FILE)
      .toString()
      .split('\n')
      .filter((x) => x)
      .map((string) => {
        try {
          return JSON.parse(string);
        } catch {}
      })
      .filter((x) => x)
      .forEach((user) => users.set(user.id, user));
  }
  return users;
};

export default {
  read,
  write,
  writeUser,
  readUsers,
};
