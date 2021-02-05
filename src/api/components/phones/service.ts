import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TPhone } from '../../../types/TPhone';

function findAll(): TPhone[] {
  return inMemoryDb.phone.all();
}

export default {
  findAll,
};
