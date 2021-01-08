import TelegramBot from 'node-telegram-bot-api';
import { Logger } from 'tslog';
import constants from '../constants';
import rateLimiter from './rate-limiter';
import { TooManyRequestsError } from '../errors/TooManyRequestsError';
import { TCommands } from '../types/TCommands';
import { TUser } from '../types/TUser';
import { TPhone } from '../types/TPhone';
import { TBDay } from '../types/TBDay';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { getRandomResponse } from '../utils/random-responder';
import { monthsUkrAccusative } from '../utils/text-sets';
import inputParser from './input-parser';
import redisDb from '../data-manager/redis-db';

const log = new Logger();

/**
 * Collects user data from a message
 * @param msg
 */
const collectUserData = (msg: TelegramBot.Message): TUser => {
  if (!msg.from) {
    throw new Error('Anonymous input');
  }

  const { id, first_name, last_name = '', username = '', language_code = '' } = msg.from;

  return {
    id,
    isAdmin: false,
    firstName: first_name,
    lastName: last_name,
    userName: username.toLowerCase(),
    date: msg.date,
    languageCode: language_code,
  };
};

function start(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command}`), async (msg: TelegramBot.Message) => {
    if (inMemoryDb.users.exists(msg.chat.id)) {
      return;
    }

    const user = collectUserData(msg);

    redisDb.saveUser(user);
    inMemoryDb.users.add(user);
    bot.sendMessage(constants.ADMIN_TELEGRAM_ID, `A new user has joined:\n${JSON.stringify(user)}`);
    bot.sendMessage(msg.chat.id, 'Відправте команду "/help", щоб побачити список інших доступних команд.');
  });

  return bot;
}

function help(bot: TelegramBot, command: string): TelegramBot {
  bot.onText(new RegExp(`^${command}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    bot.sendMessage(
      chatId,
      '/телефон пошуковий запит - знайти [пошуковий запит] в телефонній книзі\n\n' +
        '/телефонна книга - список всіх телефонів\n\n' +
        '/додати телефон 6-31 Сергій Пемахов (КБП) - додати новий телефон\n\n' +
        '/дн пошуковий запит - знайти дні народження для [пошуковий запит]\n\n' +
        '/всі дн - список всіх днів народження\n\n' +
        '/решта дн - список днів народження, що залишилися до кінця року\n\n' +
        '/додати дн 11.05.1982 Сергій Пемахов - додати новий день народження\n\n' +
        '/побажання Ваше побажання - відправити "Ваше побажання" розробнику бота'
    );
  });
  return bot;
}

function onMessage(bot: TelegramBot, commands: TCommands): TelegramBot {
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

    const messageText = msg.text?.toLowerCase();

    if (Object.values(commands).some((name) => messageText?.startsWith(name))) {
      return;
    }
    bot.sendMessage(msg.chat.id, getRandomResponse());
  });
  return bot;
}

function onClaim(bot: TelegramBot, command: string): TelegramBot {
  bot.onText(new RegExp(`^${command} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }
    const claimFrom = `${msg.from?.first_name} ${msg.from?.last_name ? msg.from.last_name + ' ' : ''}(${
      msg.from?.username
    }) пише:\n`;
    const claim = msg.text.toLowerCase().replace(command, '').trim();

    bot.sendMessage(constants.ADMIN_TELEGRAM_ID, `${claimFrom}${claim}`);
    bot.sendMessage(chatId, 'Відправлено');
  });
  return bot;
}

function addPhone(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command} `), async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TPhone = inputParser.parsePhoneInput(msg.text.replace(command, '').trim());

      await redisDb.savePhone(data);
      inMemoryDb.phone.add(data);
      bot.sendMessage(constants.ADMIN_TELEGRAM_ID, `A new phone has been added:\n${JSON.stringify(data)}`);
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
  return bot;
}

function findPhone(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.phone
        .find(msg.text.toLowerCase().replace(command, '').trim())
        .reduce((acc, row) => `${acc}${row?.phone} · ${row?.department} · ${row?.name}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });
  return bot;
}

function getAllPhones(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.phone
        .all()
        .reduce((acc, row) => `${acc}${row?.phone} · ${row?.department} · ${row?.name}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });
  return bot;
}

function addBd(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command} `), async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TBDay = inputParser.parseBdInput(msg.text.replace(command, '').trim());

      await redisDb.saveBirthday(data);
      inMemoryDb.birthday.add(data);
      bot.sendDocument(constants.ADMIN_TELEGRAM_ID, constants.BIRTHS_DATA_FILE);
      bot.sendMessage(constants.ADMIN_TELEGRAM_ID, `A new birth date has been added:\n${JSON.stringify(data)}`);
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
  return bot;
}

function findBd(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const result = inMemoryDb.birthday
        .find(msg.text.toLowerCase().replace(command, '').trim())
        .reduce((acc, row) => `${acc}${row?.day} ${monthsUkrAccusative[(row?.month || 12) - 1]}, ${row?.name}\n`, '');

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });
  return bot;
}

function getAllBd(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command}`), (msg: TelegramBot.Message) => {
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

      bot.sendMessage(chatId, result || 'Нічого не знайдено');
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });
  return bot;
}

function restBd(bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot {
  bot.onText(new RegExp(`^${command}`), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const today = new Date();
      const result = inMemoryDb.birthday
        .all()
        .filter((a) => {
          const currentMonth = today.getMonth();
          return a.month > currentMonth || (a.month === currentMonth && a.day >= today.getDay());
        })
        .sort((a, b) => a.month - b.month || a.day - b.day)
        .reduce((acc, row) => `${acc}${row?.day} ${monthsUkrAccusative[(row?.month || 12) - 1]}, ${row?.name}\n`, '');

      bot.sendMessage(chatId, result);
    } catch (error) {
      bot.sendMessage(chatId, 'Щось пішло не так...');
      log.error(error.message);
    }
  });
  return bot;
}

export default {
  start,
  help,
  onMessage,
  onClaim,
  addPhone,
  findPhone,
  getAllPhones,
  addBd,
  findBd,
  getAllBd,
  restBd,
};
