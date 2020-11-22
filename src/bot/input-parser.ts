import { TPhone } from '../types/TPhone';
import validator from './validation';

const parsePhoneInput = (input: string): TPhone | never => {
  validator.check(
    validator.containsBracketsInTheEnd(input),
    'Input should contain text in brackets in the end',
    'Команда повинна містити текст у дужках в кінці'
  );

  const args = input
    ?.trim()
    .split(' ')
    .map((x) => x)
    .map((x) => x.trim());

  const phone = args[0];

  validator.check(validator.isPhone(phone), 'Wrong phone format', 'Неправильний формат номера телефону');

  const [name, department] = input
    .replace(phone, '')
    .trim()
    .slice(0, -1) // remove closing ")"
    .split('(')
    .map((x) => x.trim());

  validator.check(
    validator.isAlphaNumericString(name),
    "Name can contain only numbers, letters of Latin and Ukrainian alphabet and ' symbol",
    "Ім'я може містити лише цифри, букви латинської та української абетки та апостроф"
  );

  validator.check(validator.hasNormalLength(name), 'Name is too short or too long', "Ім'я задовге або закоротке");

  validator.check(
    validator.isAlphaNumericString(department),
    "Department name can contain only numbers, letters of Latin and Ukrainian alphabet and ' symbol",
    'Назва відділу може містити лише цифри, букви латинської та української абетки та апостроф'
  );

  validator.check(
    validator.hasNormalLength(department),
    'Department name is too short or too long',
    'Назва відділу задовга або закоротка'
  );

  return { phone, name, department };
};

export default {
  parsePhoneInput,
};
