import TelegramBot from 'node-telegram-bot-api';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { TInMemoryDatabase } from '../types/TInMemoryDatabase';
import fileDb from './file-database';
import inMemoryDatabase from './in-memory-database';
import { TPhone } from '../types/TPhone';
import constants from '../constants';
import { TBDay } from '../types/TBDay';
import { TCommands } from '../types/TCommands';
import listeners from './listeners';

let inMemoryDb: TInMemoryDatabase;

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
  const commands: TCommands = {
    start: '/start',
    addPhone: '/додати телефон',
    findPhone: '/телефон',
    allPhones: '/телефонна книга',
    addBd: '/додати дн',
    findBd: '/дн',
    allBd: '/всі дн',
    restBd: '/решта дн',
    claim: '/побажання',
    help: '/help',
    test: '/test',
  };

  // general listeners
  listeners.start(bot, commands.start, inMemoryDb);

  listeners.help(bot, commands.help);

  listeners.onMessage(bot, commands);

  listeners.onClaim(bot, commands.claim);

  // phone listeners
  listeners.addPhone(bot, commands.addPhone, inMemoryDb);

  listeners.findPhone(bot, commands.findPhone, inMemoryDb);

  listeners.getAllPhones(bot, commands.allPhones, inMemoryDb);

  // birthday listeners
  listeners.addBd(bot, commands.addBd, inMemoryDb);

  listeners.findBd(bot, commands.findBd, inMemoryDb);

  listeners.getAllBd(bot, commands.allBd, inMemoryDb);

  listeners.restBd(bot, commands.restBd, inMemoryDb);

  bot.onText(new RegExp(`^${commands.test}`), (msg: TelegramBot.Message) => {
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
