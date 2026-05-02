import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  merchantId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId; // Optional for guest reviews
  customerName: string;
  customerEmail?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[]; // Optional images for review
  isVerifiedPurchase: boolean; // Did they actually buy this product?
  status: 'pending' | 'approved' | 'rejected';
  helpfulVotes: number; // Number of people who found this helpful
  merchantResponse?: {
    comment: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    comment: { type: String, required: true, maxlength: 2000 },
    images: [{ type: String }], // URLs of uploaded images
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    helpfulVotes: { type: Number, default: 0 },
    merchantResponse: {
      comment: { type: String, maxlength: 1000 },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ merchantId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ productId: 1, rating: 1 });

// Compound index to prevent duplicate reviews from same customer on same product
ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
