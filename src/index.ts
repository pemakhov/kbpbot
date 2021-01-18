import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import myTelegramBot from './bot';
import telegramBotAPI from 'node-telegram-bot-api';
import inMemoryDatabase from './data-manager/in-memory-database';
import api from './api';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || null;

if (TELEGRAM_TOKEN === null) {
  console.error('Please, provide a telegram bot token in the environment');
  process.exit(1);
}

export const bot = new telegramBotAPI(TELEGRAM_TOKEN, { polling: true });
const app = express();

inMemoryDatabase.getStoredDataFromRedis().then((data) => inMemoryDatabase.fillIn(...data));
myTelegramBot.init(bot);
api.init(app);
