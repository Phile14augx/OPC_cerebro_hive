import { Injectable } from '@nestjs/common';

export interface TransformationPrimitive {
  name: string;
  apply(data: any): any;
}

@Injectable()
export class TransformationEngineService {
  private primitives: Map<string, TransformationPrimitive> = new Map();

  registerPrimitive(primitive: TransformationPrimitive) {
    this.primitives.set(primitive.name, primitive);
  }

  applyTransformation(name: string, data: any): any {
    const primitive = this.primitives.get(name);
    if (!primitive) {
      throw new Error(`Transformation primitive ${name} not found`);
    }
    return primitive.apply(data);
  }
}
