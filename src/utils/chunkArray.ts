export default function chunkArray<T>(
  array: Array<T>,
  size: number,
): Array<T>[] {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}
