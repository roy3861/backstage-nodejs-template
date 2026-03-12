import { Schema, Document } from 'mongoose';

export interface IExample extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const exampleSchema = new Schema<IExample>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const output = ret as {
          _id?: { toString(): string };
          __v?: unknown;
          id?: string;
        };

        if (output._id) {
          output.id = output._id.toString();
        }
        delete output._id;
        delete output.__v;
        return output;
      },
    },
  },
);
