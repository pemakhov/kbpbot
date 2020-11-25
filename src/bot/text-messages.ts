const funnyResponses: string[] = [
  'Шо за діч?',
  'Мені за цю розробку премію не дадуть',
  'Це шо, команда така? Я такої не знаю.',
  'Ви до цирку часто ходите?',
  '^-.-^J',
  'Ой всьо',
  'В НИИ снова конфуз...',
];

const getRandomNumberInRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomString = (strings: string[]): string => strings[getRandomNumberInRange(0, strings.length - 1)];

export const getRandomResponse = (): string => getRandomString(funnyResponses);
