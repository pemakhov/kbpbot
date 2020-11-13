import TelegramBot from 'node-telegram-bot-api';
import { Logger } from 'tslog';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { TooManyRequestsError } from '../errors/TooManyRequestsError';
import rateLimiter from './rate-limiter';
import { TCustomBot } from '../types/TCustomBot';
import { TUser } from '../types/TUser';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import fileDb from './file-database';
import inMemoryDatabase from './in-memory-database';
import validator from './validation';
import { TPhone } from '../types/TPhone';
import constants from '../constants';

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

  bot.onText(/\/додати/, (msg: TelegramBot.Message) => {
    if (!msg.text) {
      log.error('No text');
      return;
    }

    const { error } = validator.containsBrackets(msg.text);

    if (error) {
      log.error(error.message);
      return;
    }

    const chatId = msg.chat.id;
    const args = msg.text
      ?.trim()
      .split(' ')
      .map((x) => x)
      .map((x) => x.trim());
    if (!args || args.length < 4 || !['телефон', 'дн'].includes(args[1])) {
      bot.sendMessage(
        chatId,
        'Додати телефон:\n"/додати телефон 7-11 Лілія Михайлівна (цех 8)"\n\n' +
          'Додати дату народження:\n"/додати дн 05-11-1982 Сергій Пемахов"'
      );
      return;
    }
    if (args[1] === 'телефон') {
      const phone = args[2];
      const [name, department] = args.slice(3).join(' ').slice(0, -1).split('(');

      if (
        ![
          validator.isPhone(phone),
          validator.isAlphaNumericString(name),
          validator.isAlphaNumericString(department),
          validator.hasNormalLength(name),
          validator.hasNormalLength(department),
        ].every((x) => x)
      ) {
        log.error("Validation error");
        bot.sendMessage(chatId, "Помилка валідації");
        return;
      }

      const data: TPhone = { number: phone, name, department };
      inMemoryDb.phone.add(data);

      fileDb.write(JSON.stringify(data), constants.PHONES_DATA_FILE);
      bot.sendMessage(chatId, "it's telephone");
      return;
    }

    if (args[1] === 'дн') {
      bot.sendMessage(chatId, "it's bd");
      return;
    }
  });

  bot.onText(/\/test/, (msg: TelegramBot.Message) => {
    console.log(msg);
  });

  return bot;
};

const createCustomBot = (bot: TelegramBot): TCustomBot => {
  inMemoryDb = inMemoryDatabase.create(fileDb.readUsers());

  return {
    /**
     * Sends a message to a user by their telegram name
     * @param chatId Telegram name of a user
     * @param text A massage text
     */
    sendTextMessage: async (
      chatId: string,
      text: string,
      options: TelegramBot.SendMessageOptions
    ): Promise<TelegramBot.Message> => {
      try {
        const result = await bot.sendMessage(chatId, text, options);

        return result;
      } catch (error) {
        log.error(error);
        return error;
      }
    },

    /**
     * Sends a photo to a user
     * @param telegramName Telegram name of a user
     * @param photo A web-link for a photo or a telegram file_id
     * @param caption A caption for the photo
     */
    sendPhoto: async (
      chatId: string,
      photo: string,
      options: TelegramBot.SendPhotoOptions
    ): Promise<TelegramBot.Message> => {
      try {
        const result = await bot.sendPhoto(chatId, photo, options);

        return result;
      } catch (error) {
        log.error(error);
        return error;
      }
    },
  };
};

export default {
  joinListeners,
  createCustomBot,
};
