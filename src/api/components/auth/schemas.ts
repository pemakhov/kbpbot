import Joi from 'joi';

const telegramUsername = Joi.object({
  username: Joi.string().required().alphanum().min(3).max(50).required(),
});

export default {
  telegramUsername,
};
