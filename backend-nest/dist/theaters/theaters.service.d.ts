import { Model } from 'mongoose';
import { TheaterDocument } from './schemas/theater.schema';
export declare class TheatersService {
    private theaterModel;
    private eventModel;
    constructor(theaterModel: Model<TheaterDocument>, eventModel: Model<any>);
    getTheaterForEvent(theaterId: string, eventId: string): Promise<any>;
    create(createTheaterDto: any, userId: string): Promise<TheaterDocument>;
    findAll(activeOnly?: boolean): Promise<TheaterDocument[]>;
    findOne(id: string): Promise<TheaterDocument>;
    update(id: string, updateDto: any): Promise<TheaterDocument>;
    hardDelete(id: string): Promise<void>;
    updateSeatConfig(id: string, seatConfig: any[]): Promise<TheaterDocument>;
    private generateRowLabels;
}
