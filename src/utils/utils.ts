export const convertCelsiusToFahrenheit = (celsius: number): number => {
  const fahrenheit = celsius * (9 / 5) + 32;
  return Math.floor(fahrenheit);
};

export const convertEpochToHumanReadableTime = (timestamp: number): Date => {
  return new Date(timestamp * 1000);
};

export const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
};
