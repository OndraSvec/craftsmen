import { Review } from '../services/firestore/credentials.type';

export function capitalize(input: string) {
  const trimmed = input.trim();
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export function capitalizeCity(input: string) {
  let split = input.split(' ');
  split = split.map((string) => capitalize(string));
  return split.join(' ');
}

function getAverageRating(reviews: Review[]): number {
  const sum = reviews.reduce((acc, cur) => (acc += cur['rating']), 0);
  const average = sum / reviews.length;
  return average ? average : 0;
}
