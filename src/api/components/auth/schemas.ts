import Joi from 'joi';

const telegramUsernameBody = Joi.object({
  username: Joi.string().required().alphanum().min(3).max(50).required(),
});

const confirmCodeBody = Joi.object({
  code: Joi.string().required().regex(/^\d+$/),
});

export default {
  telegramUsernameBody,
  confirmCodeBody,
};
