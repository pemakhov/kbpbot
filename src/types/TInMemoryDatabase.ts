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
    update: (user: TUser) => Map<number, TUser> | null;
  };
  phone: {
    all: () => TPhone[];
    add: (phone: TPhone) => TPhone;
    find: (searchKey: string) => (TPhone | undefined)[];
    update: (oldPhone: TPhone, newPhone: TPhone) => boolean;
  };
  birthday: {
    all: () => TBDay[];
    add: (bDay: TBDay) => TBDay;
    find: (name: string) => (TBDay | undefined)[];
    inMonth: (month: number) => (TBDay | undefined)[];
    update: (oldBirthday: TBDay, newBirthday: TBDay) => boolean;
  };
};
