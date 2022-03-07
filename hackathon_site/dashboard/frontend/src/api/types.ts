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
    notes: string;
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
    profiles: (ProfileWithoutTeamNumber & {
        user: UserWithoutProfile;
    })[];
}

/** Orders API */
export type OrderStatus = "Submitted" | "Ready for Pickup" | "Picked Up" | "Cancelled";
export type PartReturnedHealth = "Healthy" | "Heavily Used" | "Broken" | "Lost";

export type ItemsInOrder = Omit<OrderItem, "order" | "time_occurred">;

export interface Order {
    id: number;
    items: ItemsInOrder[];
    team_id: number;
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

/** Incidents API */
export type IncidentState =
    | "Heavily Used"
    | "Broken"
    | "Missing"
    | "Minor Repair Required"
    | "Major Repair Required"
    | "Not Sure If Works";

export interface OrderItem {
    id: number;
    hardware_id: number;
    order: number;
    part_returned_health: PartReturnedHealth | null;
    time_occurred: string;
}

export interface Incident {
    id: number;
    state: IncidentState;
    time_occurred: string;
    description: string;
    order_item: Omit<OrderItem, "time_occurred">;
    team_id: string;
    created_at: string;
    updated_at: string;
}
