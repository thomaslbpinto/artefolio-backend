import { Transform } from 'class-transformer';

type Arrayable<T> = T | T[] | null | undefined;

export function ToArray<T>() {
  return Transform(({ value }: { value: Arrayable<T> }): T[] | undefined => {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map((item) => item.trim()) as T[];
    }

    return [value];
  });
}
