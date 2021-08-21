/** Generics */
export interface APIResponse<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];
}

/** Hardware API */
export interface Hardware {
    id: number;
    name: string;
    model_number: string;
    manufacturer: string;
    datasheet: string;
    quantity_available: string;
    max_per_team: number;
    picture: string;
    categories: number[];
    quantity_remaining: number;
}

export type HardwareOrdering =
    | ""
    | "name"
    | "-name"
    | "quantity_remaining"
    | "-quantity_remaining";

export interface HardwareFilters {
    in_stock?: boolean;
    hardware_ids?: number[];
    category_ids?: number[];
    search?: string;
    ordering?: HardwareOrdering;
}

/** Category API */
export interface Category {
    id: number;
    name: string;
    max_per_team: number;
    unique_hardware_count: number;
}
