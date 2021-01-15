import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TUser } from '../../../types/TUser';
import { TConfirmCode } from './types';

function getUserByUsername(username: string): TUser | undefined {
  return inMemoryDb.users.getByTelegramName(username);
}

function getConfirmCode(digits: number): string {
  return Math.random()
    .toString()
    .slice(2, 2 + digits);
}

function saveConfirmCode(userId: number, code: string, storage: Map<number, TConfirmCode>): void {
  const deleteTimeoutId = setTimeout(() => storage.delete(userId));
  storage.set(userId, { code, deleteTimeoutId });
}

function deleteOldConfirmCode(userId: number, storage: Map<number, TConfirmCode>): void {
  const confirmCode = storage.get(userId);

  if (!confirmCode) {
    return;
  }

  clearTimeout(confirmCode?.deleteTimeoutId);
  storage.delete(userId);
}

export default {
  getUserByUsername,
  getConfirmCode,
  saveConfirmCode,
  deleteOldConfirmCode,
};
