export interface TheaterLayout {
    mainFloor: {
        rows: number;
        seatsPerRow: number;
        rowLabels?: string[];
        aislePositions?: number[];
    };
    hasBalcony: boolean;
    balcony?: {
        rows: number;
        seatsPerRow: number;
        rowLabels?: string[];
        aislePositions?: number[];
    };
    stage?: {
        position: 'top' | 'bottom';
        width?: number;
        height?: number;
    };
    removedSeats?: string[];
    disabledSeats?: string[];
    seatCategories?: Record<string, string>;
    vCorridors?: Record<string, number>;
    hCorridors?: Record<string, number>;
    labels?: {
        id: string;
        text: string;
        position: { x: number; y: number };
        width?: string;
        height?: string;
        icon?: string;
        isPixelBased?: boolean;
    }[];
}

export interface Theater {
    _id: string;
    name: string;
    description?: string;
    location: string;
    totalSeats: number;
    layout: TheaterLayout;
    active: boolean;
    isActive?: boolean;
}
