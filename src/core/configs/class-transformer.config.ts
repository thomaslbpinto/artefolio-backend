import { ClassTransformOptions } from 'class-transformer';

export const CLASS_TRANSFORMER_OPTIONS: ClassTransformOptions = {
  enableImplicitConversion: true,
  excludeExtraneousValues: true,
  exposeUnsetFields: true,
};
