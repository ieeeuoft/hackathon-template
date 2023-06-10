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
    max_per_team?: number;
    picture?: string;
    image_url?: string;
    categories: number[];
    quantity_remaining: number;
    notes?: string;
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
    max_per_team?: number;
    unique_hardware_count?: number;
}

/** Event API */
export interface ProfileRequestBody {
    acknowledge_rules: boolean;
    e_signature: string | null;
}

export interface Profile extends ProfileRequestBody {
    id: number;
    id_provided: boolean;
    attended: boolean;
    team: string;
    acknowledge_rules: boolean;
    e_signature: string | null;
    phone_number: string;
}

type ProfileWithoutTeamNumber = Omit<Profile, "team">;

export type Group = {
    id: number;
    name: string;
};

export interface UserWithoutProfile {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface UserWithReviewStatus extends UserWithoutProfile {
    review_status: "Accepted" | "Waitlisted" | "Rejected" | "Incomplete" | "None";
}

export interface User extends UserWithoutProfile {
    profile: ProfileWithUser | null;
    groups: Group[];
}

export interface Team {
    id: number;
    team_code: string;
    created_at: string;
    updated_at: string;
    profiles: ProfileWithUser[];
}

export interface ProfileWithUser extends ProfileWithoutTeamNumber {
    user: UserWithoutProfile;
}

/** Orders API */
export type OrderStatus =
    | "Submitted"
    | "Ready for Pickup"
    | "Picked Up"
    | "Cancelled"
    | "Returned";
export type PartReturnedHealth =
    | "Healthy"
    | "Heavily Used"
    | "Broken"
    | "Lost"
    | "Rejected";

export type ItemsInOrder = Omit<OrderItem, "order" | "time_occurred">;

export interface Order {
    id: number;
    items: ItemsInOrder[];
    team_id: number;
    team_code: string;
    status: OrderStatus;
    request: {
        id: number;
        requested_quantity: number;
    }[];
    created_at: string;
    updated_at: string;
}

export type OrderOrdering = "" | "created_at" | "-created_at";

export interface OrderFilters {
    ordering?: OrderOrdering;
    status?: OrderStatus[];
    search?: string;
    limit?: number;
}

/** Sanitized Orders */
export interface OrderItemTableRow {
    id: number;
    quantityRequested: number;
    quantityGranted: number;
    quantityGrantedBySystem: number;
}

export interface OrderInTable {
    id: number;
    hardwareInTableRow: OrderItemTableRow[];
    status: OrderStatus;
    createdTime: string;
    updatedTime: string;
}

export type ReturnedItem = ItemsInOrder & { quantity: number; time: string };
export interface ReturnOrderInTable {
    id: number;
    hardwareInOrder: ReturnedItem[];
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
