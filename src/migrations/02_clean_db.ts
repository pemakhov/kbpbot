import redisDb from '../data-manager/redis-db';

redisDb.deleteUsersCollection();
redisDb.deletePhonesCollection();
redisDb.deleteBirthdaysCollection();

console.log('deleted');

process.exit(0);
