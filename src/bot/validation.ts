const containsBrackets = (input: string): boolean =>
  input.split('(').map((x) => x).length === 2 && input.trim().slice(-1) === ')';

const isPhone = (input: string): boolean => {
  const result = input.split('-').every((n) => /^\d+$/.test(n));

  if (!result) {
    console.log(`"${input}" is in wrong phone format`);
  }

  return result;
};

const isAlphaNumericString = (input: string): boolean => {
  const result = /^[0-9a-zA-Z.\u0400-\u04FF'\s]+$/.test(input);

  if (!result) {
    console.log(`Input "${input}" is not alphanumeric`);
  }

  return result;
};

const hasNormalLength = (input: string): boolean => {
  const result = input.length > 2 && input.length < 128;

  if (!result) {
    console.log(`Input "${input}" is too short or too long`);
  }

  return result;
};

export default {
  containsBrackets,
  isPhone,
  isAlphaNumericString,
  hasNormalLength,
};
