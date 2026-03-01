import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  faqQuestion: string;
  faqAnswer: string;
}

const FAQSchema: Schema<IFAQ> = new Schema(
  {
    faqQuestion: {
      type: String,
      required: true,
      trim: true,
    },

    faqAnswer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.FAQ ||
  mongoose.model<IFAQ>('FAQ', FAQSchema);