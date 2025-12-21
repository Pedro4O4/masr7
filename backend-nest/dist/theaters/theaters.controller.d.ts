import { TheatersService } from './theaters.service';
export declare class TheatersController {
    private readonly theatersService;
    constructor(theatersService: TheatersService);
    create(createTheaterDto: any, req: any): Promise<{
        success: boolean;
        data: import("./schemas/theater.schema").TheaterDocument;
    }>;
    findAll(active: string): Promise<{
        success: boolean;
        count: number;
        data: import("./schemas/theater.schema").TheaterDocument[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("./schemas/theater.schema").TheaterDocument;
    }>;
    update(id: string, updateTheaterDto: any): Promise<{
        success: boolean;
        data: import("./schemas/theater.schema").TheaterDocument;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSeatConfig(id: string, seatConfig: any[]): Promise<{
        success: boolean;
        data: import("./schemas/theater.schema").TheaterDocument;
    }>;
    getTheaterForEvent(theaterId: string, eventId: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
