import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TUser } from '../../../types/TUser';
import { ForbiddenError } from '../../errors/ForbiddenError';
import { NotFoundError } from '../../errors/NotFoundError';

function getUserByUsername(username: string): TUser | undefined {
  return inMemoryDb.users.getByTelegramName(username);
}

function isUserFoundAndAdmin(user: TUser | undefined): void {
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isAdmin) {
    throw new ForbiddenError('Forbidden. User is not admin');
  }
}

export default {
  getUserByUsername,
  isUserFoundAndAdmin,
};
