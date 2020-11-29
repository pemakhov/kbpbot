const constants = {
  /**
   * Telegram bot token
   */
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,

  /**
   * The secret for user JWT
   */
  USER_TOKEN_SECRET: process.env.USER_TOKEN_SECRET,

  /**
   * The port, api will be running on
   */
  PORT: process.env.PORT || 3000,

  /**
   * Allowed number of requests to API per minute
   */
  USER_REQUESTS_PER_MINUTE_LIMIT: +(process.env.REQUESTS_PER_MINUTE_LIMIT || '') || 30,

  /**
   * Path to the user database file
   */
  USERS_DATA_FILE: `${__dirname}/../assets/users.json`,

  PHONES_DATA_FILE: `${__dirname}/../assets/phones.json`,

  BIRTHS_DATA_FILE: `${__dirname}/../assets/birthdays.json`,
};

export default constants;
