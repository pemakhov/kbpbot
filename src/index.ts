import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import constants from './constants';
import myTelegramBot from './bot';
import telegramBotAPI from 'node-telegram-bot-api';
import inMemoryDatabase from './data-manager/in-memory-database';
import api from './api/server';

if (!constants.TELEGRAM_TOKEN) {
  console.error('Please, provide a telegram bot token in the environment');
  process.exit(1);
}

const bot = new telegramBotAPI(constants.TELEGRAM_TOKEN, { polling: true });

inMemoryDatabase.init().then((db) => myTelegramBot.init(bot, db));

// api
const app = express();
api.init(app);
