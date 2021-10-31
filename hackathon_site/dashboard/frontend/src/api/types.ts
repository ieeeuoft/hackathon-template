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

/** Event API */
export interface Profile {
    id: number;
    id_provided: boolean;
    attended: boolean;
    acknowledge_rules: boolean;
    e_signature: string;
    team: number;
}

interface UserWithoutProfile {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface User extends UserWithoutProfile {
    profile: Profile;
}

export interface Team {
    id: number;
    team_code: string;
    created_at: Date;
    updated_at: Date;
    profiles: Profile & { user: UserWithoutProfile }[];
}

/** Orders API **/
export type OrderStatus = "Submitted" | "Ready for Pickup" | "Picked Up" | "Cancelled";

export interface Order {
    id: number;
    hardware: Hardware[];
    team: number;
    team_code: string;
    status: OrderStatus;
    created_at: Date;
    updated_at: Date;
}
