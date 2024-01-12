export function capitalize(input: string) {
  const trimmed = input.trim();
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export function capitalizeCity(input: string) {
  let split = input.split(' ');
  split = split.map((string) => capitalize(string));
  return split.join(' ');
}
