import { Transform } from 'class-transformer';

type Arrayable<T> = T | T[] | null | undefined;

export function ToArray<T>() {
  return Transform(({ value }: { value: Arrayable<T> }): T[] | undefined => {
    if (!value) {
      return undefined;
    }

    return Array.isArray(value) ? value : [value];
  });
}
