import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type TheaterDocument = Theater & Document;
declare class Stage {
    position: string;
    width: number;
    height: number;
}
declare class FloorInfo {
    rows: number;
    seatsPerRow: number;
    aislePositions: number[];
    rowLabels: string[];
}
declare class TheaterLayout {
    stage: Stage;
    mainFloor: FloorInfo;
    hasBalcony: boolean;
    balcony: FloorInfo;
    removedSeats: string[];
    disabledSeats: string[];
    hCorridors: Record<string, number>;
    vCorridors: Record<string, number>;
    seatCategories: Record<string, string>;
    labels: any[];
}
declare class SeatConfig {
    row: string;
    seatNumber: number;
    seatType: string;
    section: string;
    isActive: boolean;
}
export declare class Theater {
    name: string;
    description: string;
    createdBy: User | MongooseSchema.Types.ObjectId;
    layout: TheaterLayout;
    seatConfig: SeatConfig[];
    totalSeats: number;
    vipSeats: number;
    premiumSeats: number;
    isActive: boolean;
    image: string;
}
export declare const TheaterSchema: MongooseSchema<Theater, import("mongoose").Model<Theater, any, any, any, Document<unknown, any, Theater, any, import("mongoose").DefaultSchemaOptions> & Theater & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any, Theater>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Theater, Document<unknown, {}, Theater, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<User | MongooseSchema.Types.ObjectId, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    layout?: import("mongoose").SchemaDefinitionProperty<TheaterLayout, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    seatConfig?: import("mongoose").SchemaDefinitionProperty<SeatConfig[], Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalSeats?: import("mongoose").SchemaDefinitionProperty<number, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    vipSeats?: import("mongoose").SchemaDefinitionProperty<number, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    premiumSeats?: import("mongoose").SchemaDefinitionProperty<number, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    image?: import("mongoose").SchemaDefinitionProperty<string, Theater, Document<unknown, {}, Theater, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Theater & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Theater>;
export {};
