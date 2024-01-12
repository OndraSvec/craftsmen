import { Craftsman, Review } from '../services/firestore/credentials.type';

export function capitalize(input: string) {
  const trimmed = input.trim();
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export function capitalizeCity(input: string) {
  let split = input.split(' ');
  split = split.map((string) => capitalize(string));
  return split.join(' ');
}

export function sortCraftsmen(
  craftsmanArr: Craftsman[],
  sortBy: string,
  orderBy: string
): Craftsman[] {
  let sortedCraftsmen: Craftsman[] = [];
  if (sortBy === 'Last Name') {
    if (orderBy === 'asc') {
      sortedCraftsmen = craftsmanArr.sort((a, b) =>
        a.lastName < b.lastName ? -1 : a.lastName === b.lastName ? 0 : 1
      );
    } else if (orderBy === 'desc') {
      sortedCraftsmen = craftsmanArr.sort((a, b) =>
        a.lastName < b.lastName ? 1 : a.lastName === b.lastName ? 0 : -1
      );
    }
  } else if (sortBy === 'Rating') {
    if (orderBy === 'asc') {
      sortedCraftsmen = craftsmanArr.sort((a, b) =>
        getAverageRating(a.reviews) < getAverageRating(b.reviews)
          ? -1
          : getAverageRating(a.reviews) === getAverageRating(b.reviews)
          ? 0
          : 1
      );
    } else if (orderBy === 'desc') {
      sortedCraftsmen = craftsmanArr.sort((a, b) =>
        getAverageRating(a.reviews) < getAverageRating(b.reviews)
          ? 1
          : getAverageRating(a.reviews) === getAverageRating(b.reviews)
          ? 0
          : -1
      );
    }
  }
  return sortedCraftsmen;
}

function getAverageRating(reviews: Review[]): number {
  const sum = reviews.reduce((acc, cur) => (acc += cur['rating']), 0);
  const average = sum / reviews.length;
  return average ? average : 0;
}
