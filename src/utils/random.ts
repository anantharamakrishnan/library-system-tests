// Random Functions

export function getRandomPrice(min = 10, max = 100): string {
  // Random float with 2 decimal points
  return (Math.random() * (max - min) + min).toFixed(2);
}

export function getRandomDate(startYear = 2000, endYear = 2024): string {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'); // avoid invalid dates
  return `${year}-${month}-${day}`;
}

export function getRandomText(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (result.length < length) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function getRandomAuthor(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  return `Tester ${randomLetter}`;
}

export function getRandomTitle(): string {
  const maxRandomLength = 21 - 4; // 4 chars for "dwp" and a space
  return `dwp${getRandomText(maxRandomLength)}`;
}

export function getRandomGenre(): string {
  const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Fantasy', 'Biography'];
  return genres[Math.floor(Math.random() * genres.length)];
} 