export const convertCelsiusToFahrenheit = (celsius: number): number => {
  const fahrenheit = celsius * (9 / 5) + 32;
  return Math.floor(fahrenheit);
};

export const convertEpochToHumanReadableDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000).toLocaleString();
  return date;
};

export const convertEpochToHumanReadableTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours > 12 ? hours - 12 : hours}:${minutes}`;
};

export const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
};
