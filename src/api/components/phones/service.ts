import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TPhone } from '../../../types/TPhone';

function findAll(): TPhone[] {
  return inMemoryDb.phone.all();
}

function update(oldPhone: TPhone, newPhone: TPhone): TPhone | null {
  return inMemoryDb.phone.update(oldPhone, newPhone);
}

export default {
  findAll,
  update,
};
