import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TBDay } from '../../../types/TBDay';

function findAll(): TBDay[] {
  return inMemoryDb.birthday.all();
}

export default {
  findAll,
};
