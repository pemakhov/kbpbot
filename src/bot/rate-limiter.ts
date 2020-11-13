const USER_REQUESTS_PER_MINUTE_LIMIT: number = +(process.env.REQUESTS_PER_MINUTE_LIMIT || '') || 30;

/**
 * The storage of message timestamps by user id
 */
const messageTimestamps: number[][] = [];

/**
 * Checks if the request rate is exceeded by the new message
 * @param userId
 * @param currentTimestamp
 * @returns true if the rate is exceeded, otherwise returns false
 */
const rateIsExceeded = (userId: number, currentTimestamp: number): boolean => {
  const userTimestamps = messageTimestamps[userId]
    ? [...messageTimestamps[userId], currentTimestamp]
    : [currentTimestamp];
  const inLimitUserTimestamps = userTimestamps.filter(
    (timestampFromStorage) => currentTimestamp - timestampFromStorage <= 60
  ); // 60 - seconds in a minute

  messageTimestamps[userId] = inLimitUserTimestamps;

  return inLimitUserTimestamps.length > USER_REQUESTS_PER_MINUTE_LIMIT;
};

export default {
  limit: USER_REQUESTS_PER_MINUTE_LIMIT,
  rateIsExceeded,
};
