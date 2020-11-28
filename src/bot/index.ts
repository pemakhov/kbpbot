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
import { getRandomResponse } from './text-messages';

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

  return {
    id,
    firstName: first_name,
    lastName: last_name,
    userName: username.toLowerCase(),
    date: msg.date,
    languageCode: language_code,
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
  const onTextCommands = {
    start: '/start',
    addPhone: '/додати телефон',
    findPhone: '/телефон',
    addBD: '/додати дн',
    help: '/help',
    test: '/test',
  };

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

    const messageText = msg.text;

    if (Object.values(onTextCommands).some((name) => messageText?.toLowerCase().startsWith(name))) {
      return;
    }
    bot.sendMessage(msg.chat.id, getRandomResponse());
  });

  // Listens '/start'
  bot.onText(new RegExp(`^${onTextCommands.start}`), (msg: TelegramBot.Message) => {
    bot.sendMessage(
      msg.chat.id,
      'Наразі ви можете шукати телефони в базі даних за допомогою команди: "/телефон пошуковий запит"'
    );

    if (inMemoryDb.users.exists(msg.chat.id)) {
      return;
    }

    const user = collectUserData(msg);

    inMemoryDb.users.add(user);
    fileDb.writeUser(user);
  });

  bot.onText(new RegExp(`^${onTextCommands.addPhone} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TPhone = inputParser.parsePhoneInput(msg.text.replace(onTextCommands.addPhone, '').trim());

      inMemoryDb.phone.add(data);
      fileDb.write(JSON.stringify(data), constants.PHONES_DATA_FILE);
      bot.sendMessage(chatId, 'Додано');
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

  bot.onText(new RegExp(`^${onTextCommands.findPhone} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.phone
        .find(msg.text.toLowerCase().replace(onTextCommands.findPhone, '').trim())
        .reduce((acc, row) => `${acc}${row?.phone} ${row?.name} ${row?.department}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  bot.onText(new RegExp(`^${onTextCommands.addBD} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TBDay = inputParser.parseBdInput(msg.text.replace(onTextCommands.addBD, '').trim());

      inMemoryDb.birthday.add(data);
      fileDb.write(JSON.stringify(data), constants.BIRTHS_DATA_FILE);
      bot.sendMessage(chatId, 'День народження збережено');
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

  bot.onText(new RegExp(`^${onTextCommands.help}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    bot.sendMessage(chatId, 'Для пошуку телефону введіть команду "/телефон пошуковий запит"');
  });

  bot.onText(new RegExp(`^${onTextCommands.test}`), (msg: TelegramBot.Message) => {
    console.log(msg);
  });

  return bot;
};

const connectDatabases = (bot: TelegramBot): TelegramBot => {
  const users = fileDb.readUsers();
  const phones = fileDb.readPhones(constants.PHONES_DATA_FILE, new Map<string, TPhone>());
  const bdays = fileDb.readBDays(constants.BIRTHS_DATA_FILE, new Map<string, TBDay>());

  inMemoryDb = inMemoryDatabase.create(users, phones, bdays);
  return bot;
};

export default {
  joinListeners,
  connectDatabases,
};
