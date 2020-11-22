import dotenv from 'dotenv';
dotenv.config();

import constants from './constants';
import telegramBot from './bot';
import TelegramBot from 'node-telegram-bot-api';
import { Logger } from 'tslog';

const log = new Logger();

if (!constants.TELEGRAM_TOKEN) {
  log.fatal('Please, provide a telegram bot token in the environment');
  process.exit(1);
}

telegramBot.connectDatabases(telegramBot.joinListeners(new TelegramBot(constants.TELEGRAM_TOKEN, { polling: true })));
log.info('Telegram bot has started');
