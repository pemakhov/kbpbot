import TelegramBot from 'node-telegram-bot-api';
import { Logger } from 'tslog';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { TooManyRequestsError } from '../errors/TooManyRequestsError';
import rateLimiter from './rate-limiter';
import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import fileDb from './file-database';
import inMemoryDatabase from './in-memory-database';
import inputParser from './input-parser';
import { TPhone } from '../types/TPhone';
import constants from '../constants';
import { TBDay } from '../types/TBDay';

const log = new Logger();

let inMemoryDb: TInMemoryDatabase;

/**
 * Collects user data that will be stored
 * @param msg
 */
const collectUserData = (msg: TelegramBot.Message): TUser => {
  if (!msg.from) {
    throw new Error('Anonymous input');
  }

  const { id, first_name, last_name = '', username = '', language_code = '' } = msg.from;
  const token = msg.text?.split(' ')[1];

  if (!token) {
    throw new Error('No user token');
  }

  // TODO: provide user token authorization

  return {
    id,
    firstName: first_name,
    lastName: last_name,
    userName: username.toLowerCase(),
    date: msg.date,
    languageCode: language_code,
    token,
  };
};

/**
 * Reads the file and gets the telegram user ID associated with a passed telegram name
 * @param telegramName
 */
export const getTelegramUserId = (telegramName: string): number => {
  const user = inMemoryDb.users.getByTelegramName(telegramName);

  if (!user || !user.id) {
    throw new UserNotFoundError();
  }

  return user.id;
};

/**
 * Load bot listeners
 */
const joinListeners = (bot: TelegramBot): TelegramBot => {
  bot.on('message', (msg: TelegramBot.Message) => {
    log.info(msg);
    const userId: number = msg.chat.id;
    const messageTimestamp: number = msg.date;

    try {
      if (rateLimiter.rateIsExceeded(userId, messageTimestamp)) {
        throw new TooManyRequestsError(rateLimiter.limit);
      }
    } catch (error) {
      log.error(error.message);
    }
  });

  // Listens '/start'
  bot.onText(/\/start/, (msg: TelegramBot.Message) => {
    if (inMemoryDb.users.exists(msg.chat.id)) {
      return;
    }

    const user = collectUserData(msg);

    inMemoryDb.users.add(user);
    fileDb.writeUser(user);
  });

  const addPhoneText = '/додати телефон';
  const addBDay = '--додати дн';

  bot.onText(new RegExp(`^${addPhoneText}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TPhone = inputParser.parsePhoneInput(msg.text.replace(addPhoneText, ''));
      inMemoryDb.phone.add(data);
      log.info(data);

      fileDb.write(JSON.stringify(data), constants.PHONES_DATA_FILE);
      bot.sendMessage(chatId, "it's telephone");
    } catch (error) {
      if (error.name === 'EValidationError') {
        console.log(error.nativeLanguageMessage);
        bot.sendMessage(chatId, error.nativeLanguageMessage);
      } else {
        bot.sendMessage(chatId, 'Щось пішло не так...');
      }
      log.error(error.message);
    }
  });

  bot.onText(/\/test/, (msg: TelegramBot.Message) => {
    console.log(msg);
  });

  return bot;
};

const connectDatabases = async (bot: TelegramBot): Promise<TelegramBot> => {
  const users = await fileDb.readUsers();
  const phones = await fileDb.read(constants.PHONES_DATA_FILE, new Map<string, TPhone[]>());
  const bdays = await fileDb.read(constants.BIRTHS_DATA_FILE, new Map<string, TBDay[]>());
  inMemoryDb = inMemoryDatabase.create(users, phones, bdays);
  return bot;
};

export default {
  joinListeners,
  connectDatabases,
};
