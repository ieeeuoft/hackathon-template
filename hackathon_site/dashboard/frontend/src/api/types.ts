/** Generics */
export interface APIListResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Hardware API */
export interface Hardware {
    id: number;
    name: string;
    model_number: string;
    manufacturer: string;
    datasheet: string;
    quantity_available: number;
    max_per_team: number;
    picture: string;
    categories: number[];
    quantity_remaining: number;
    notes: string,
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

/** Hardware Product Overview Types */
export interface ProductOverviewItem extends Omit<Hardware, 'categories'> {
    constraints: string[],
    categories: string[],
}

/** Category API */
export interface Category {
    id: number;
    name: string;
    max_per_team: number;
    unique_hardware_count: number;
}
