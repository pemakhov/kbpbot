import redis from 'redis';
import { TUser } from '../types/TUser';

const client = redis.createClient();

client.on('error', (error) => {
  console.error(error);
});

const addUser = async (user: TUser): Promise<boolean> => await client.rpush('users', JSON.stringify(user));

const getUsers = async (): Promise<TUser[]> => {
  const users: TUser[] = [];

  client.lrange('users', 0, -1, (error, rows) => {
    if (error) {
      console.error(error);
      return;
    }
    rows.map((row) => row).map((row) => users.push(JSON.parse(row)));
  });

  return users;
};

export default {
  addUser,
  getUsers,
};
