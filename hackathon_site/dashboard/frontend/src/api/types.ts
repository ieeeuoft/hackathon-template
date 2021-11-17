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
    max_per_team: number | null;
    picture: string | null;
    categories: number[];
    quantity_remaining: number;
    notes: string | null;
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
export interface ProductOverviewItem extends Omit<Hardware, "categories"> {
    constraints: string[];
    categories: string[];
}

/** Category API */
export interface Category {
    id: number;
    name: string;
    max_per_team: number | null;
    unique_hardware_count: number | null;
}

/** Event API */
export interface Profile {
    id: number;
    id_provided: boolean | null;
    attended: boolean | null;
    acknowledge_rules: boolean | null;
    e_signature: string | null;
    team: number;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile: Profile;
}

type UserWithoutProfile = Omit<User, "profile">;
type ProfileWithoutTeamNumber = Omit<Profile, "team">;

export interface Team {
    id: number;
    team_code: string;
    created_at: string;
    updated_at: string;
    profiles: (ProfileWithoutTeamNumber & { user: UserWithoutProfile })[];
}

/** Orders API */
export type OrderStatus = "Submitted" | "Ready for Pickup" | "Picked Up" | "Cancelled";

export interface Order {
    id: number;
    hardware: Hardware[];
    team: number;
    team_code: string;
    status: OrderStatus;
    created_at: string;
    updated_at: string;
}

/** Cart API */
export interface CartItem {
    hardware_id: number;
    quantity: number;
}
