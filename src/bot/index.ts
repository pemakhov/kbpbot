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
    allPhones: '/телефонна книга',
    addBd: '/додати дн',
    findBd: '/дн',
    allBd: '/всі дн',
    restBd: '/решта дн',
    help: '/help',
    test: '/test',
  };

  // On every message
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

  // On '/start'
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

  // Add phone
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

  // Find phone
  bot.onText(new RegExp(`^${onTextCommands.findPhone} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.phone
        .find(msg.text.toLowerCase().replace(onTextCommands.findPhone, '').trim())
        .reduce((acc, row) => `${acc}${row?.phone} · ${row?.department} · ${row?.name}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  // Find all phones
  bot.onText(new RegExp(`^${onTextCommands.allPhones}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.phone
        .all()
        .reduce((acc, row) => `${acc}${row?.phone} · ${row?.department} · ${row?.name}\n`, '');

      bot.sendMessage(chatId, result);
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  // Add birthday date
  bot.onText(new RegExp(`^${onTextCommands.addBd} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TBDay = inputParser.parseBdInput(msg.text.replace(onTextCommands.addBd, '').trim());

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

  const monthsUkrAccusative = [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ];

  // Find birthday
  bot.onText(new RegExp(`^${onTextCommands.findBd} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.birthday
        .find(msg.text.toLowerCase().replace(onTextCommands.findBd, '').trim())
        .reduce((acc, row) => `${acc}${row?.day} ${monthsUkrAccusative[(row?.month || 12) - 1]}, ${row?.name}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  // All birthdays
  bot.onText(new RegExp(`^${onTextCommands.allBd}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.birthday
        .all()
        .sort((a, b) => a.month - b.month || a.day - b.day)
        .reduce((acc, row) => `${acc}${row?.day} ${monthsUkrAccusative[(row?.month || 12) - 1]}, ${row?.name}\n`, '');

      bot.sendMessage(chatId, result);
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  // Rest birthdays
  bot.onText(new RegExp(`^${onTextCommands.restBd}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const today = new Date();
      const result = inMemoryDb.birthday
        .all()
        .filter((a) => a.month > today.getMonth() + 1 && a.day >= today.getDay())
        .sort((a, b) => a.month - b.month || a.day - b.day)
        .reduce((acc, row) => `${acc}${row?.day} ${monthsUkrAccusative[(row?.month || 12) - 1]}, ${row?.name}\n`, '');

      bot.sendMessage(chatId, result);
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });

  // Help
  bot.onText(new RegExp(`^${onTextCommands.help}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    bot.sendMessage(
      chatId,
      '/телефон пошуковий запит - знайти [пошуковий запит] в телефонній книзі\n\n' +
        '/телефонна книга - список всіх телефонів\n\n' +
        '/дн пошуковий запит - знайти дні народження для [пошуковий запит]\n\n' +
        '/всі дн - список всіх днів народження\n\n' +
        '/решта дн - список днів народження, що залишилися до кінця року'
    );
  });

  bot.onText(new RegExp(`^${onTextCommands.test}`), (msg: TelegramBot.Message) => {
    console.log(msg);
  });

  return bot;
};

const connectDatabases = (bot: TelegramBot): TelegramBot => {
  const users = fileDb.readUsers();
  const phones = fileDb.readPhones(constants.PHONES_DATA_FILE, new Map<string, TPhone>());
  const bDays = fileDb.readBDays(constants.BIRTHS_DATA_FILE, new Map<string, TBDay>());

  inMemoryDb = inMemoryDatabase.create(users, phones, bDays);
  return bot;
};

export default {
  joinListeners,
  connectDatabases,
};
