import mongoose, {Document, Model, Schema} from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, 'Overview is required'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
        },
        mode: {
            type: String,
            required: [true, 'Mode is required'],
            enum: ['online', 'offline', 'hybrid'],
            trim: true,
        },
        audience: {
            type: String,
            required: [true, 'Audience is required'],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Agenda must contain at least one item',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Organizer is required'],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, 'Tags are required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Tags must contain at least one item',
            },
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
    }
);

// Create unique index on slug for fast lookups and uniqueness
EventSchema.index({slug: 1}, {unique: true});

/**
 * Pre-save hook to auto-generate slug and normalize date/time
 * Only regenerates slug if title has been modified
 */
EventSchema.pre('save', async function () {
    if (this.isModified('title')) {
        let baseSlug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;
        const Event = mongoose.models.Event || this.constructor;

        while (await Event.exists({slug, _id: {$ne: this._id}})) {
            slug = `${baseSlug}-${counter++}`;
        }
        this.slug = slug;
    }

    if (this.isModified('date')) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(this.date)) {
            throw new Error('Date must be in YYYY-MM-DD format');
        }
        const [year, month, day] = this.date.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (isNaN(parsedDate.getTime()) || parsedDate.getMonth() !== month - 1) {
            throw new Error('Invalid date');
        }
    }
    if (this.isModified('time')) {
        const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(this.time)) {
            throw new Error('Time must be in HH:MM format');
        }
    }
});

// Prevent model recompilation in development (Next.js hot reload)
const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
