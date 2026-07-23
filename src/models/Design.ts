import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const designSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    garment: { type: String, default: "Custom Tee" },
    color: { type: String, default: "Onyx" },
    fabric: { type: String, default: "Heavyweight 280 GSM" },
    price: { type: Number, default: 1499 },
    // The customizer layer stack (arbitrary shape) + optional preview thumbnail
    layers: { type: Schema.Types.Mixed, default: [] },
    preview: { type: String }, // data URL (optional)
  },
  { timestamps: true }
);

export type DesignDoc = InferSchemaType<typeof designSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Design: Model<DesignDoc> =
  (mongoose.models.Design as Model<DesignDoc>) ||
  mongoose.model<DesignDoc>("Design", designSchema);
