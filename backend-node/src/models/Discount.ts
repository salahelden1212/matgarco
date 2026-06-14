import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscount extends Document {
  merchantId: mongoose.Types.ObjectId;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  applicableProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const DiscountSchema = new Schema(
  {
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

DiscountSchema.index({ merchantId: 1, code: 1 }, { unique: true });

export default mongoose.model<IDiscount>('Discount', DiscountSchema);
