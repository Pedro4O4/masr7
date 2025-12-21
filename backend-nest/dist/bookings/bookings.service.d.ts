import { Model } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { EventDocument } from '../events/schemas/event.schema';
import { TheaterDocument } from '../theaters/schemas/theater.schema';
export declare class BookingsService {
    private bookingModel;
    private eventModel;
    private theaterModel;
    constructor(bookingModel: Model<BookingDocument>, eventModel: Model<EventDocument>, theaterModel: Model<TheaterDocument>);
    create(createDto: any, userId: string): Promise<BookingDocument>;
    findOne(id: string): Promise<BookingDocument>;
    findAllForUser(userId: string): Promise<BookingDocument[]>;
    delete(id: string): Promise<void>;
    getAvailableSeats(eventId: string): Promise<any>;
}
