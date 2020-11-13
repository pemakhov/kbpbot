import constants from '../constants';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { Logger } from 'tslog';
import { TCustomBot } from '../types/TCustomBot';
import { QueryRuntype } from './validation';
import { getTelegramUserId } from '../bot';

const log = new Logger();

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: constants.USER_REQUESTS_PER_MINUTE_LIMIT,
});

/**
 * Creates, and sets a server
 */
async function main(bot: TCustomBot) {
  const app = express();
  app.use(express.json());
  app.use(rateLimiter);

  app.post('/api/send', async (req, res) => {
    try {
      const query = QueryRuntype.check(req.body);

      const { telegramId, telegramName, message, photo, options = { caption: message } } = query;

      if (!telegramId && !telegramName) {
        throw new Error('Can\'t identify user.');
      }

      const chatId = telegramId || getTelegramUserId(telegramName || '');

      if (photo) {
        if (!options.caption) {
          options.caption = message;
        }

        const result = await bot.sendPhoto(chatId, photo, options);

        if (result.message_id) {
          return res.status(200).send('Photo has been sent');
        }

        return res.status(400).send(result);
      }

      if (message) {
        const result = await bot.sendTextMessage(chatId, message, options);

        if (result.message_id) {
          return res.status(200).send('Message has been sent');
        }

        return res.status(400).send(result);
      }
    } catch (error) {
      log.error(error.message);
      return res.status(400).send('Bad request');
    }
  });

  app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that");
  });

  app.listen(constants.PORT);
  log.info(`Running on the port ${constants.PORT}`);
}

export default {
  main,
};
