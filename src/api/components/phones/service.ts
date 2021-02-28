import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { fillIn } from '../../../data-manager/in-memory-database';
import redisDb from '../../../data-manager/redis-db';
import { TPhone } from '../../../types/TPhone';

function findAll(): TPhone[] {
  return inMemoryDb.phone.all();
}

async function update(phone: TPhone): Promise<{ error: Error | null; result: boolean }> {
  try {
    const result: boolean = await redisDb
      .savePhone(phone)
      .then(() => inMemoryDb.phone.clear())
      .then(() => redisDb.getPhones())
      .then((phones) => fillIn(undefined, phones, undefined))
      .then(() => true);

    return { error: null, result };
  } catch (error) {
    console.error(error.message);
    return { error, result: false };
  }
}

export default {
  findAll,
  update,
};
