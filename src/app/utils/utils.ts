export function capitalize(input: string) {
  const trimmed = input.trim();
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}
