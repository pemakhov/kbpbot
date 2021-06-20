import { TBDay } from '../types/TBDay';
import { TPhone } from '../types/TPhone';
import validator from './validation';

const parsePhoneInput = (input: string): TPhone | never => {
  validator.check(
    validator.containsBracketsInTheEnd(input),
    'Input should contain text in brackets in the end',
    'Команда повинна містити назву відділу у дужках в кінці'
  );

  const phone = input.trim().slice(0, 4);

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
    "Department name can contain only numbers, letters of Latin and Ukrainian alphabet and ' symbol. Spaces are forbidden.",
    'Назва відділу може містити лише цифри, букви латинської та української абетки та апостроф.'
  );

  validator.check(
    validator.hasNormalLength(department),
    'Department name is too short or too long',
    'Назва відділу задовга або закоротка'
  );

  return { id: `${phone}${name.split(' ').join('')}`, phone, name, department };
};

const parseBdInput = (input: string): TBDay | never => {
  validator.check(
    validator.containsMoreThanTwoSpaceSeparatedArgs(input),
    'Input should contain date and name separated by space',
    "Команда має містити дату і ім'я, розділені пробілом"
  );

  const indexOfFirstSpace = input.indexOf(' ');
  const dateInput = input.slice(0, indexOfFirstSpace);
  const name = input.slice(indexOfFirstSpace + 1);

  validator.check(
    validator.isDotSeparatedDayMonthYearDate(dateInput),
    'Date must be in format "dd.MM.YYYY"',
    'Дата має бути у форматі "дд.ММ.РРРР"'
  );

  validator.check(
    validator.isAlphaNumericString(name),
    "Name can contain only numbers, letters of Latin and Ukrainian alphabet and ' symbol",
    "Ім'я може містити лише цифри, букви латинської та української абетки та апостроф"
  );

  validator.check(
    validator.hasNormalLength(name),
    'Department name is too short or too long',
    'Назва відділу задовга або закоротка'
  );

  const [day, month, year] = dateInput.split('.').map((x) => parseInt(x));
  const date = `${year}-${month}-${day}`;
  return { id: `${date}${name.split(' ').join('')}`, date, day, month, year, name };
};

export default {
  parsePhoneInput,
  parseBdInput,
};
