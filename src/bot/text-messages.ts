const funnyResponses: string[] = [
  'Шо за діч?',
  'Мені за цю розробку премію не дадуть',
  'Я вам оставляю желать лучшего',
  'Ви до цирку часто ходите?',
  '^-.-^J',
  'Ой всьо',
  'В НИИ снова конфуз...',
  'Настроєние упало...',
  'Все, я пошел в легкий отпуск',
  'На етом мої полномочія всьо',
  'С етім ми разбєрьомся',
  'А можно нє нужно?',
  'Прозвучало нє очєнь...',
  'Ми подумаєм...',
  'Ми вам пєрєзвонім',
  'На проблємку напали...',
];

const getRandomNumberInRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomString = (strings: string[]): string => strings[getRandomNumberInRange(0, strings.length - 1)];

export const getRandomResponse = (): string => getRandomString(funnyResponses);
