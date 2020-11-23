import { TBDay } from './TBDay';
import { TPhone } from './TPhone';
import { TUser } from './TUser';

export type TInMemoryDatabase = {
  users: {
    all: Map<number, TUser>;
    add: (user: TUser) => Map<number, TUser>;
    getById: (id: number) => TUser | undefined;
    getByTelegramName: (name: string) => TUser | undefined;
    exists: (id: number) => boolean;
  };
  phone: {
    all: TPhone[];
    add: (phone: TPhone) => TPhone;
    find: (name: string) => (TPhone | undefined)[];
  };
  birthday: {
    all: TBDay[];
    add: (bDay: TBDay) => TBDay[];
    find: (name: string) => TBDay[] | undefined;
    inMonth: (month: number) => TBDay[] | undefined;
  };
};
