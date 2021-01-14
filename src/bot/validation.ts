import { ValidationError } from './errors/ValidationError';

const containsBracketsInTheEnd = (input: string): boolean =>
  input.split('(').map((x) => x).length === 2 && input.trim().slice(-1) === ')';

const isPhone = (input: string): boolean => input.split('-').every((n) => /^\d+$/.test(n));

const isAlphaNumericString = (input: string): boolean => /^[0-9a-zA-Z.,\u0400-\u04FF'\s]+$/.test(input);

const hasNormalLength = (input: string): boolean => input.length > 2 && input.length < 128;

const containsMoreThanTwoSpaceSeparatedArgs = (input: string): boolean => input.split(' ').length > 1;

const isDotSeparatedDayMonthYearDate = (input: string): boolean => /^\d{1,2}.\d{1,2}.\d{4}$/.test(input);

const check = (testResult: boolean, errorMessage: string, nativeLanguageErrorMessage: string): boolean | never => {
  if (testResult) {
    return true;
  }

  throw new ValidationError(errorMessage, nativeLanguageErrorMessage);
};

export default {
  containsBracketsInTheEnd,
  isPhone,
  isAlphaNumericString,
  hasNormalLength,
  containsMoreThanTwoSpaceSeparatedArgs,
  isDotSeparatedDayMonthYearDate,
  check,
};
