import { Model } from 'mongoose';
import { EventDocument } from './schemas/event.schema';
import { BookingDocument } from '../bookings/schemas/booking.schema';
import { MailService } from '../mail/mail.service';
export declare class EventsService {
    private eventModel;
    private bookingModel;
    private mailService;
    constructor(eventModel: Model<EventDocument>, bookingModel: Model<BookingDocument>, mailService: MailService);
    create(createDto: any, userId: string, role: string): Promise<EventDocument>;
    findAllApproved(): Promise<EventDocument[]>;
    findAll(): Promise<EventDocument[]>;
    findOne(id: string): Promise<EventDocument>;
    update(id: string, updateDto: any): Promise<EventDocument>;
    requestDeletionOTP(id: string, user: any): Promise<void>;
    verifyDeletionOTP(id: string, otp: string): Promise<void>;
    delete(id: string): Promise<void>;
    findByOrganizer(organizerId: string): Promise<EventDocument[]>;
    getOrganizerAnalytics(organizerId: string): Promise<any>;
}
