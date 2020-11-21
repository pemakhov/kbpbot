const containsBrackets = (input: string): { error: Error | null } => {
  if (input.split('(').map((x) => x).length !== 2) {
    return { error: new Error('The input should include "(" symbol and only one') };
  }

  if (input.trim().slice(-1) !== ')') {
    return { error: new Error('The input should end with ")" symbol') };
  }

  return { error: null };
};

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
  const result = input.length > 3 && input.length < 128;

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
