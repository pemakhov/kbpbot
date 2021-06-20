import { inMemoryDb, fillIn } from '../../../data-manager/in-memory-database';
import redisDb from '../../../data-manager/redis-db';
import { TBDay } from '../../../types/TBDay';

function findAll(): TBDay[] {
  return inMemoryDb.birthday.all();
}

async function update(birthday: TBDay): Promise<{ error: Error | null; result: boolean }> {
  try {
    const result: boolean = await redisDb
      .saveBirthday(birthday)
      .then(() => inMemoryDb.birthday.clear())
      .then(() => redisDb.getBirthdays())
      .then((birthdays) => fillIn(undefined, undefined, birthdays))
      .then(() => true);

    return { error: null, result };
  } catch (error) {
    console.error(error.message);
    return { error, result: false };
  }
}

async function deleteById(id: string): Promise<{ error: Error | null; deleted: number }> {
  try {
    console.log({ id });
    const result: number = await redisDb.deleteBirthdayById(id);
    inMemoryDb.birthday.clear();
    const birthdays = await redisDb.getBirthdays();
    fillIn(undefined, undefined, birthdays);

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
