import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { Event, EventDocument } from '../events/schemas/event.schema';
import { Theater, TheaterDocument } from '../theaters/schemas/theater.schema';

@Injectable()
export class BookingsService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(Theater.name) private theaterModel: Model<TheaterDocument>,
    ) { }

    async create(createDto: any, userId: string): Promise<BookingDocument> {
        const { eventId, numberOfTickets, status, selectedSeats } = createDto;

        const event = await this.eventModel.findById(eventId).exec();
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        let totalPrice = 0;
        const bookingData: any = {
            StandardId: userId,
            eventId,
            status: status || 'confirmed',
        };

        if (event.hasTheaterSeating && selectedSeats && selectedSeats.length > 0) {
            const unavailableSeats = [];
            for (const seat of selectedSeats) {
                const isBooked = event.bookedSeats.some(
                    (bs: any) =>
                        bs.row === seat.row &&
                        bs.seatNumber === seat.seatNumber &&
                        bs.section === seat.section,
                );
                if (isBooked) {
                    unavailableSeats.push(`${seat.row}${seat.seatNumber}`);
                }
            }

            if (unavailableSeats.length > 0) {
                throw new BadRequestException(
                    `Seats already booked: ${unavailableSeats.join(', ')}`,
                );
            }

            const theater = await this.theaterModel.findById(event.theater).exec();
            if (!theater) {
                throw new NotFoundException('Theater not found for this event');
            }

            const seatsWithPrices = selectedSeats.map((seat: any) => {
                const seatConfig = theater.seatConfig.find(
                    (s: any) =>
                        s.row === seat.row &&
                        s.seatNumber === seat.seatNumber &&
                        s.section === seat.section,
                );
                const seatType = seatConfig?.seatType || 'standard';
                const pricing = event.seatPricing.find((p: any) => p.seatType === seatType);
                const price = pricing?.price || event.ticketPrice || 0;

                return {
                    row: seat.row,
                    seatNumber: seat.seatNumber,
                    section: seat.section || 'main',
                    seatType,
                    price,
                };
            });

            totalPrice = seatsWithPrices.reduce(
                (sum: number, seat: any) => sum + seat.price,
                0,
            );

            bookingData.hasTheaterSeating = true;
            bookingData.selectedSeats = seatsWithPrices;
            bookingData.numberOfTickets = selectedSeats.length;
            bookingData.totalPrice = totalPrice;

            const booking = new this.bookingModel(bookingData);
            const savedBooking = await booking.save();

            const seatUpdates = seatsWithPrices.map((seat: any) => ({
                row: seat.row,
                seatNumber: seat.seatNumber,
                section: seat.section,
                bookingId: savedBooking._id,
            }));

            await this.eventModel.findByIdAndUpdate(eventId, {
                $push: { bookedSeats: { $each: seatUpdates } },
                $inc: { remainingTickets: -selectedSeats.length },
            });

            return savedBooking;
        } else {
            if (!numberOfTickets || numberOfTickets < 1) {
                throw new BadRequestException('Number of tickets is required');
            }

            if (event.remainingTickets < numberOfTickets) {
                throw new BadRequestException('Not enough tickets available');
            }

            totalPrice = numberOfTickets * event.ticketPrice;

            await this.eventModel.findByIdAndUpdate(eventId, {
                $inc: { remainingTickets: -numberOfTickets },
            });

            bookingData.numberOfTickets = numberOfTickets;
            bookingData.totalPrice = totalPrice;
            bookingData.hasTheaterSeating = false;

            const booking = new this.bookingModel(bookingData);
            return booking.save();
        }
    }

    async findOne(id: string): Promise<BookingDocument> {
        const booking = await this.bookingModel
            .findById(id)
            .populate('eventId')
            .exec();
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }
        return booking;
    }

    async findAllForUser(userId: string): Promise<BookingDocument[]> {
        return this.bookingModel
            .find({ StandardId: userId } as any)
            .populate('eventId')
            .sort({ createdAt: -1 })
            .exec();
    }

    async delete(id: string): Promise<void> {
        const booking = await this.bookingModel.findById(id).exec();
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        const event = await this.eventModel.findById(booking.eventId).exec();
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (booking.hasTheaterSeating && booking.selectedSeats?.length > 0) {
            await this.eventModel.findByIdAndUpdate(booking.eventId, {
                $pull: { bookedSeats: { bookingId: booking._id } },
                $inc: { remainingTickets: booking.numberOfTickets },
            });
        } else {
            await this.eventModel.findByIdAndUpdate(booking.eventId, {
                $inc: { remainingTickets: booking.numberOfTickets },
            });
        }

        await this.bookingModel.findByIdAndDelete(id).exec();
    }

    async getAvailableSeats(eventId: string): Promise<any> {
        const event = await this.eventModel
            .findById(eventId)
            .populate('theater')
            .exec();
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (!event.hasTheaterSeating || !event.theater) {
            throw new BadRequestException('This event does not have theater seating');
        }

        const theater = event.theater as any;
        const bookedSeatsSet = new Set(
            event.bookedSeats.map((s: any) => `${s.section}-${s.row}-${s.seatNumber}`),
        );

        const mergedSeatConfig = [...(theater.seatConfig || [])];
        if (event.seatConfig && event.seatConfig.length > 0) {
            event.seatConfig.forEach((eventSeat: any) => {
                const existingIdx = mergedSeatConfig.findIndex(
                    (ts: any) =>
                        ts.row === eventSeat.row &&
                        ts.seatNumber === eventSeat.seatNumber &&
                        ts.section === eventSeat.section,
                );
                if (existingIdx >= 0) {
                    mergedSeatConfig[existingIdx] = eventSeat;
                } else {
                    mergedSeatConfig.push(eventSeat);
                }
            });
        }

        const allSeats = [];
        const removedSeatsSet = new Set(theater.layout.removedSeats || []);
        const disabledSeatsSet = new Set(theater.layout.disabledSeats || []);

        // Main floor
        const mainRows = theater.layout.mainFloor.rows;
        const mainRowLabels = theater.layout.mainFloor.rowLabels || [];
        for (let r = 0; r < mainRows; r++) {
            const rowLabel = mainRowLabels[r] || String.fromCharCode(65 + r);
            for (let s = 1; s <= theater.layout.mainFloor.seatsPerRow; s++) {
                const seatKey = `main-${rowLabel}-${s}`;
                if (removedSeatsSet.has(seatKey)) continue;

                const seatConfig = mergedSeatConfig.find(
                    (sc: any) =>
                        sc.row === rowLabel && sc.seatNumber === s && sc.section === 'main',
                );
                const isDisabled = disabledSeatsSet.has(seatKey);
                const isActive = !isDisabled && seatConfig?.isActive !== false;
                const seatType = seatConfig?.seatType || 'standard';

                allSeats.push({
                    row: rowLabel,
                    seatNumber: s,
                    section: 'main',
                    seatType,
                    isActive,
                    isBooked: bookedSeatsSet.has(seatKey),
                    price:
                        event.seatPricing.find((p: any) => p.seatType === seatType)?.price ||
                        event.ticketPrice,
                });
            }
        }

        // Balcony
        if (theater.layout.hasBalcony && theater.layout.balcony.rows > 0) {
            const balcRows = theater.layout.balcony.rows;
            const balcRowLabels = theater.layout.balcony.rowLabels || [];
            for (let r = 0; r < balcRows; r++) {
                const rowLabel = balcRowLabels[r] || `BALC-${String.fromCharCode(65 + r)}`;
                for (let s = 1; s <= theater.layout.balcony.seatsPerRow; s++) {
                    const seatKey = `balcony-${rowLabel}-${s}`;
                    if (removedSeatsSet.has(seatKey)) continue;

                    const seatConfig = mergedSeatConfig.find(
                        (sc: any) =>
                            sc.row === rowLabel &&
                            sc.seatNumber === s &&
                            sc.section === 'balcony',
                    );
                    const isDisabled = disabledSeatsSet.has(seatKey);
                    const isActive = !isDisabled && seatConfig?.isActive !== false;
                    const seatType = seatConfig?.seatType || 'standard';

                    allSeats.push({
                        row: rowLabel,
                        seatNumber: s,
                        section: 'balcony',
                        seatType,
                        isActive,
                        isBooked: bookedSeatsSet.has(seatKey),
                        price:
                            event.seatPricing.find((p: any) => p.seatType === seatType)
                                ?.price || event.ticketPrice,
                    });
                }
            }
        }

        return {
            theater: {
                _id: theater._id,
                name: theater.name,
                layout: theater.layout,
                seatConfig: theater.seatConfig,
                totalSeats: theater.totalSeats,
            },
            seatPricing: event.seatPricing,
            seats: allSeats,
            bookedCount: event.bookedSeats.length,
            availableCount: allSeats.filter((s) => !s.isBooked && s.isActive).length,
        };
    }
}
