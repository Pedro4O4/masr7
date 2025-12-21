import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Event } from '../../events/schemas/event.schema';

export type BookingDocument = Booking & Document;

@Schema()
class SelectedSeat {
    @Prop({ required: true })
    row: string;

    @Prop({ required: true })
    seatNumber: number;

    @Prop({ enum: ['main', 'balcony'], default: 'main' })
    section: string;

    @Prop({
        enum: ['standard', 'vip', 'premium', 'wheelchair'],
        default: 'standard',
    })
    seatType: string;

    @Prop({ min: 0, required: true })
    price: number;
}

@Schema({ timestamps: true })
export class Booking {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    StandardId: User | MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
    eventId: Event | MongooseSchema.Types.ObjectId;

    @Prop({ required: true, min: 1 })
    numberOfTickets: number;

    @Prop({ required: true, min: 0 })
    totalPrice: number;

    @Prop({
        enum: ['pending', 'confirmed', 'canceled'],
        default: 'pending',
    })
    status: string;

    @Prop({ default: false })
    hasTheaterSeating: boolean;

    @Prop({ type: [SelectedSeat] })
    selectedSeats: SelectedSeat[];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
