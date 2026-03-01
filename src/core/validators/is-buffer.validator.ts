import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsBuffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBuffer',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return Buffer.isBuffer(value);
        },
        defaultMessage(): string {
          return `${propertyName} must be a Buffer`;
        },
      },
    });
  };
}
