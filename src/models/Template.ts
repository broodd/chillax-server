import mongoose from 'mongoose';

export type ITemplate = mongoose.Document & {
    name: string;
    img: string;
};

const templateSchema = new mongoose.Schema({
    name: {
      type: String,
      required: '{PATH} is required!'
    },
    img: {
      type: String,
      required: '{PATH} is required!'
    }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: false },
  timestamps: true
});

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
