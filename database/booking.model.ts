import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Basic email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to validate that the referenced event exists
 * Prevents bookings for non-existent events
 */
BookingSchema.pre('save', async function () {
    // Only validate eventId if it's new or modified
    if (this.isModified('eventId')) {
        // Dynamically import Event model to avoid circular dependency
        const Event =
            mongoose.models.Event || (await import('./event.model')).default;

        const eventExists = await Event.exists({ _id: this.eventId });

        if (!eventExists) {
            throw new Error('Referenced event does not exist');
        }
    }
});

// Prevent model recompilation in development (Next.js hot reload)
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
