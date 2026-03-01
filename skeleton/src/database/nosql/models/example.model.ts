{% if values.nosqlDatabase == 'mongodb' -%}
import mongoose from 'mongoose';
import { exampleSchema, IExample } from '../schemas/example.schema';

const ExampleDocument = mongoose.model<IExample>('Example', exampleSchema);

/**
 * Example NoSQL Model using Mongoose.
 * Replace or extend this with your own document models.
 */
export class ExampleNoSqlModel {
  async findAll(): Promise<IExample[]> {
    return ExampleDocument.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string): Promise<IExample | null> {
    return ExampleDocument.findById(id).lean();
  }

  async create(data: Pick<IExample, 'name' | 'description'>): Promise<IExample> {
    const doc = new ExampleDocument(data);
    return doc.save();
  }

  async update(id: string, data: Partial<Pick<IExample, 'name' | 'description'>>): Promise<IExample | null> {
    return ExampleDocument.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await ExampleDocument.findByIdAndDelete(id);
    return !!result;
  }
}
{% else -%}
export {};
{% endif -%}
