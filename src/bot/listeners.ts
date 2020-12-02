import TelegramBot from 'node-telegram-bot-api';
import { Logger } from 'tslog';
import constants from '../constants';
import rateLimiter from './rate-limiter';
import { TooManyRequestsError } from '../errors/TooManyRequestsError';
import { TCommands } from '../types/TCommands';
import { TUser } from '../types/TUser';
import { TPhone } from '../types/TPhone';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import { getRandomResponse } from './text-messages';
import fileDb from './file-database';
import inputParser from './input-parser';

const log = new Logger();

const start = (bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot => {
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

  bot.onText(new RegExp(`^${command}`), (msg: TelegramBot.Message) => {
    if (inMemoryDb.users.exists(msg.chat.id)) {
      return;
    }

    const user = collectUserData(msg);

    inMemoryDb.users.add(user);
    fileDb.writeUser(user);
    bot.sendMessage(msg.chat.id, 'Відправте команду "/help", щоб побачити список інших доступних команд.');
  });

  return bot;
};

const onMessage = (bot: TelegramBot, commands: TCommands): TelegramBot => {
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

    if (Object.values(commands).some((name) => messageText?.toLowerCase().startsWith(name))) {
      return;
    }
    bot.sendMessage(msg.chat.id, getRandomResponse());
  });
  return bot;
};

const addPhone = (bot: TelegramBot, command: string, inMemoryDb: TInMemoryDatabase): TelegramBot => {
  bot.onText(new RegExp(`^${command} `), (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;

    if (!msg.text) {
      log.error('No text');
      return;
    }

    try {
      const data: TPhone = inputParser.parsePhoneInput(msg.text.replace(command, '').trim());

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
  return bot;
};

const smth = (bot: TelegramBot, command: string): TelegramBot => {
  return bot;
};

export default {
  start,
  onMessage,
  addPhone,
};
