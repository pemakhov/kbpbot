import { inMemoryDb, fillIn } from '../../../data-manager/in-memory-database';
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

async function deleteById(id: string): Promise<{ error: Error | null; deleted: number }> {
  try {
    const result: number = await redisDb.deletePhoneById(id);
    inMemoryDb.phone.clear();
    const phones = await redisDb.getPhones();
    fillIn(undefined, phones, undefined);

    return { error: null, deleted: result };
  } catch (error) {
    console.error(error.message);
    return { error, deleted: 0 };
  }
}

export default {
  findAll,
  update,
  deleteById,
};
