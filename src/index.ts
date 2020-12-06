import dotenv from 'dotenv';
import http from 'http';
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

telegramBot.joinListeners(telegramBot.connectDatabases(new TelegramBot(constants.TELEGRAM_TOKEN, { polling: true })));
log.info('Telegram bot has started');

// This server does nothing but is needed for heroku hosting
http.createServer((req, res) => res.writeHead(200).end('OK')).listen(process.env.PORT || 5000);
