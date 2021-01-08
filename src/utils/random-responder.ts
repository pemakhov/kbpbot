import { funnyResponses } from './text-sets';

const getRandomNumberInRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomStringOfArray = (strings: string[]): string => strings[getRandomNumberInRange(0, strings.length - 1)];

export const getRandomResponse = (): string => getRandomStringOfArray(funnyResponses);
