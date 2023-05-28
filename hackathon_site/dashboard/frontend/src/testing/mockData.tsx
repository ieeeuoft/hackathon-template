import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import PinDrop from "@material-ui/icons/PinDrop";

import {
    Category,
    Hardware,
    Order,
    OrderInTable,
    Profile,
    ProfileRequestBody,
    ReturnOrderInTable,
    Team,
    User,
    UserWithoutProfile,
    UserWithReviewStatus,
} from "api/types";
import { CartItem } from "api/types";
import { adminGroup } from "constants.js";
import { ReturnOrderResponse } from "slices/order/teamOrderSlice";

// For DashCard on Dashboard
export const cardItems = [
    {
        title: "Important Links",
        content: [
            {
                name: "Hackathon main site",
                url: "https://www.facebook.com",
                icon: <OpenInNew />,
            },
            {
                name: "Hardware Signout Site",
                url: "https://hardware.newhacks.ca",
                icon: <OpenInNew />,
            },
        ],
    },
    {
        title: "General electronics aid",
        content: [
            {
                name: "Test1 asdajslkd",
                url: "https://www.youtube.com",
                icon: <OpenInNew />,
            },
            { name: "Test2", url: "https://www.youtube.com", icon: <OpenInNew /> },
            {
                name: "Test3 asknd",
                url: "https://www.youtube.com",
                icon: <OpenInNew />,
            },
            { name: "Test4 blah", url: "https://www.youtube.com", icon: <GetApp /> },
            { name: "Test5", url: "https://www.youtube.com", icon: <GetApp /> },
        ],
    },
    {
        title: "Stores nearby",
        content: [
            {
                name: "Home Hardware",
                url: "https://www.facebook.com",
                icon: <PinDrop />,
            },
            { name: "Test2", url: "https://www.facebook.com", icon: <PinDrop /> },
        ],
    },
];

// For ItemTable on Dashboard
export const itemsCheckedOut = [
    { id: 1, url: "https://i.imgur.com/IO6e5a6.jpg", name: "Arduino", qty: 6 },
    { id: 9, url: "https://i.imgur.com/kOlrXto.jpg", name: "Raspi", qty: 9 },
    {
        id: 4,
        url: "https://i.imgur.com/iUpI1hC.jpg",
        name: "Grove temperature and humidity sensor pro",
        qty: 16,
    },
    { id: 22, url: "https://i.imgur.com/kOlrXto.jpg", name: "Blah", qty: 7 },
];

export const itemsReturned = [
    {
        id: 1,
        url: "https://i.imgur.com/IO6e5a6.jpg",
        name: "Arduino",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        id: 9,
        url: "https://i.imgur.com/kOlrXto.jpg",
        name: "Raspi",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        id: 4,
        url: "https://i.imgur.com/IO6e5a6.jpg",
        name: "Grove temperature and humidity sensor pro",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
];

export const itemsPending = [
    {
        id: 1,
        url: "https://i.imgur.com/iUpI1hC.jpg",
        name: "Arduino",
        reqQty: 1,
        grantQty: null,
    },
];

export const itemsBroken = [
    {
        id: 1,
        url: "https://i.imgur.com/IO6e5a6.jpg",
        name: "Arduino",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Broken",
    },
    {
        id: 9,
        url: "https://i.imgur.com/kOlrXto.jpg",
        name: "Raspi",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Lost",
    },
];

export const orderStatus = "pending";

// Team card
export const members = [
    "Aki Kimura",
    "Graham Hoyes",
    "Alex Bogdan",
    "Raymond Aksjdkjah",
];
export const teamCode = "PAS3NLQ3";

// Navbar
export const cartQuantity = 0;
export const userEmail = "graham@email.com";

export const addCartTest = () => {
    alert("Added to Cart");
};

// Inventory
export const mockCategories: Category[] = [
    { id: 1, name: "MCU", max_per_team: 12, unique_hardware_count: 10 },
    { id: 2, name: "MCU_limit_3", max_per_team: 3, unique_hardware_count: 6 },
    { id: 3, name: "FPGA", max_per_team: 2, unique_hardware_count: 9 },
    { id: 4, name: "Sensors", max_per_team: 12, unique_hardware_count: 21 },
    { id: 5, name: "Sensors_limit_2", max_per_team: 2, unique_hardware_count: 3 },
    { id: 6, name: "Peripherals", max_per_team: 12, unique_hardware_count: 389 },
    { id: 7, name: "1080p_cameras", max_per_team: 4, unique_hardware_count: 4 },
    { id: 8, name: "Grove", max_per_team: 12, unique_hardware_count: 22 },
    { id: 9, name: "Grove_style_boards", max_per_team: 12, unique_hardware_count: 12 },
    {
        id: 10,
        name: "Grove_style_modules",
        max_per_team: 12,
        unique_hardware_count: 10,
    },
];

// User details
export const mockUser: User = {
    id: 1,
    first_name: "Foo",
    last_name: "Bar",
    email: "foo@bar.com",
    profile: {
        id: 1,
        id_provided: false,
        attended: false,
        acknowledge_rules: false,
        e_signature: null,
        phone_number: "1234567890",
        user: {
            id: 1,
            first_name: "Foo",
            last_name: "Bar",
            email: "foo@bar.com",
        },
    },
    groups: [
        {
            id: 1,
            name: "Tech Team",
        },
        {
            id: 2,
            name: "Admins",
        },
    ],
};

export const mockAdminUser: User = {
    ...mockUser,
    profile: null,
    groups: [
        {
            id: 1,
            name: adminGroup,
        },
    ],
};

export const mockUserWithoutProfile: UserWithoutProfile = {
    id: 1,
    first_name: "Foo",
    last_name: "Bar",
    email: "foo@bar.com",
};

export const mockUserWithReviewStatus: UserWithReviewStatus = {
    ...mockUserWithoutProfile,
    review_status: "Accepted",
};

export const mockProfileRequestBody: ProfileRequestBody = {
    acknowledge_rules: true,
    e_signature: "signature",
};

// Team Detail
export const mockProfile: Profile = {
    id: 1,
    id_provided: false,
    attended: false,
    acknowledge_rules: true,
    phone_number: "1234567890",
    e_signature: "mock profile",
    team: "ABCDE",
};

export const mockTeam: Team = {
    id: 1,
    team_code: "A48E5",
    created_at: "2021-11-12T22:37:54.106311-05:00",
    updated_at: "2021-11-12T22:37:54.106323-05:00",
    profiles: [
        {
            id: 1,
            id_provided: false,
            attended: false,
            acknowledge_rules: false,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 1,
                first_name: "Foo",
                last_name: "Bar",
                email: "foo@bar.com",
            },
        },
    ],
};

export const mockTeamMultiple = {
    id: 1,
    team_code: "A48E5",
    created_at: "2021-11-12T22:37:54.106311-05:00",
    updated_at: "2021-11-12T22:37:54.106323-05:00",
    profiles: [
        {
            id: 1,
            id_provided: false,
            attended: false,
            acknowledge_rules: false,
            e_signature: null,
            user: {
                id: 1,
                first_name: "Foo",
                last_name: "Bar",
                email: "foo@bar.com",
                phone: "802-999-9999",
            },
        },
        {
            id: 2,
            id_provided: true,
            attended: false,
            acknowledge_rules: false,
            e_signature: null,
            user: {
                id: 2,
                first_name: "Bat",
                last_name: "Buzz",
                email: "bat@buzz.com",
                phone: "802-567-9909",
            },
        },
        {
            id: 3,
            id_provided: true,
            attended: false,
            acknowledge_rules: false,
            e_signature: null,
            user: {
                id: 3,
                first_name: "Super",
                last_name: "Cool",
                email: "super@cool.com",
                phone: "802-542-0000",
            },
        },
        {
            id: 4,
            id_provided: false,
            attended: false,
            acknowledge_rules: false,
            e_signature: null,
            user: {
                id: 4,
                first_name: "Tick",
                last_name: "Tock",
                email: "tick@tock.com",
                phone: "802-123-4567",
            },
        },
    ],
};

// Valid Team Size
export const mockValidTeam: Team = {
    id: 2,
    team_code: "A48E6",
    created_at: "2022-05-28T22:37:54.106311-05:00",
    updated_at: "2022-05-28T22:37:54.106323-05:00",
    profiles: [
        {
            id: 2,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 2,
                first_name: "Foothe",
                last_name: "Second",
                email: "foo2@bar.com",
            },
        },
        {
            id: 3,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 3,
                first_name: "Foothe",
                last_name: "Third",
                email: "foo3@bar.com",
            },
        },
    ],
};

// Team with too many members
export const mockLargeTeam: Team = {
    id: 3,
    team_code: "A48E7",
    created_at: "2022-06-03T22:37:54.106311-05:00",
    updated_at: "2022-06-03T22:37:54.106323-05:00",
    profiles: [
        {
            id: 4,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 4,
                first_name: "Foothe",
                last_name: "Fourth",
                email: "foo4@bar.com",
            },
        },
        {
            id: 5,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 5,
                first_name: "Foothe",
                last_name: "Fifth",
                email: "foo5@bar.com",
            },
        },
        {
            id: 6,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 6,
                first_name: "Foothe",
                last_name: "Sixth",
                email: "foo6@bar.com",
            },
        },
        {
            id: 7,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 7,
                first_name: "Foothe",
                last_name: "Seventh",
                email: "foo7@bar.com",
            },
        },
        {
            id: 8,
            id_provided: true,
            attended: true,
            acknowledge_rules: true,
            e_signature: null,
            phone_number: "1234567890",
            user: {
                id: 8,
                first_name: "Foothe",
                last_name: "Eighth",
                email: "foo8@bar.com",
            },
        },
    ],
};

export const mockHardware: Hardware[] = [
    {
        id: 1,
        name: "Arduino",
        model_number: "Uno",
        manufacturer: "Adafruit",
        datasheet: "https://example.com/datasheet",
        quantity_available: 10,
        max_per_team: 2,
        picture: "https://i.imgur.com/iUpI1hC.jpg",
        categories: [1],
        quantity_remaining: 5,
        notes: "Cool microcontroller, great for learning and hobbyists",
    },
    {
        id: 2,
        name: "Some Hardware 2",
        model_number: "ABC",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 16,
        max_per_team: 3,
        picture: "https://i.imgur.com/kOlrXto.jpg",
        categories: [3],
        quantity_remaining: 0,
        notes: "",
    },
    {
        id: 3,
        name: "Some Hardware 3",
        model_number: "DEF",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 16,
        max_per_team: 3,
        picture: "https://i.imgur.com/IO6e5a6.jpg",
        categories: [4],
        quantity_remaining: 12,
        notes: "",
    },
    {
        id: 4,
        name: "Grove temperature and humidity sensor pro",
        model_number: "DHT11",
        manufacturer: "Grove",
        datasheet: "https://example.com/datasheet",
        quantity_available: 6,
        max_per_team: 1,
        picture: "https://i.imgur.com/IO6e5a6.jpg",
        categories: [2, 8, 9],
        quantity_remaining: 5,
        notes: "",
    },
    {
        id: 5,
        name: "Some Hardware 5",
        model_number: "GHI",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 6,
        max_per_team: 1,
        picture: "https://i.imgur.com/iUpI1hC.jpg",
        categories: [4],
        quantity_remaining: 1,
        notes: "This is an interesting piece of hardware",
    },
    {
        id: 6,
        name: "Some Hardware 6",
        model_number: "JKL",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 8,
        max_per_team: 1,
        picture: "https://i.imgur.com/iUpI1hC.jpg",
        categories: [3],
        quantity_remaining: 3,
        notes: "",
    },
    {
        id: 7,
        name: "Some Hardware 7",
        model_number: "MNO",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 10,
        max_per_team: 2,
        picture: "https://i.imgur.com/IO6e5a6.jpg",
        categories: [6],
        quantity_remaining: 7,
        notes: "",
    },
    {
        id: 8,
        name: "Some Hardware 8",
        model_number: "PQR",
        manufacturer: "Acme",
        datasheet: "https://example.com/datasheet",
        quantity_available: 22,
        max_per_team: 2,
        picture: "https://i.imgur.com/IO6e5a6.jpg",
        categories: [6],
        quantity_remaining: 13,
        notes: "",
    },
    {
        id: 9,
        name: "Raspberry Pi",
        model_number: "Pi",
        manufacturer: "Raspberry Pi Foundation",
        datasheet: "https://example.com/datasheet",
        quantity_available: 19,
        max_per_team: 3,
        picture: "https://i.imgur.com/kOlrXto.jpg",
        categories: [1, 2],
        quantity_remaining: 16,
        notes: "",
    },
    {
        id: 10,
        name: "Hardware with no optional fields",
        model_number: "ABCD",
        manufacturer: "Nobody",
        datasheet: "https://example.com/datasheet",
        quantity_available: 20,
        categories: [1],
        quantity_remaining: 16,
    },
];

export const mockCartItems: CartItem[] = [
    { hardware_id: 1, quantity: 3 },
    { hardware_id: 2, quantity: 1 },
    { hardware_id: 3, quantity: 2 },
];

export const mockPendingOrders: Order[] = [
    {
        id: 3,
        items: [
            {
                id: 6,
                hardware_id: 3,
                part_returned_health: null,
            },
            {
                id: 7,
                hardware_id: 4,
                part_returned_health: null,
            },
        ],
        team_id: 2,
        team_code: "IEEE",
        status: "Ready for Pickup",
        created_at: "2020-10-17T18:28:44.691969-06:00",
        updated_at: "2021-12-03T23:01:46.606892-06:00",
        request: [
            {
                id: 3,
                requested_quantity: 1,
            },
            {
                id: 4,
                requested_quantity: 1,
            },
        ],
    },
    {
        id: 4,
        items: [
            {
                id: 8,
                hardware_id: 4,
                part_returned_health: null,
            },
            {
                id: 9,
                hardware_id: 1,
                part_returned_health: null,
            },
            {
                id: 11,
                hardware_id: 1,
                part_returned_health: null,
            },
        ],
        team_id: 2,
        team_code: "IEEE",
        status: "Submitted",
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2022-10-17T18:28:44.691969-04:00",
        request: [
            {
                id: 1,
                requested_quantity: 2,
            },
            {
                id: 4,
                requested_quantity: 1,
            },
        ],
    },
    {
        id: 5,
        items: [
            {
                id: 10,
                hardware_id: 10,
                part_returned_health: null,
            },
        ],
        team_id: 1,
        team_code: "IEEE",
        status: "Ready for Pickup",
        created_at: "2021-10-17T18:28:44.691969-03:00",
        updated_at: "2021-10-17T18:28:44.691969-06:00",
        request: [
            {
                id: 10,
                requested_quantity: 2,
            },
        ],
    },
    {
        id: 6,
        items: [
            {
                id: 12,
                hardware_id: 10,
                part_returned_health: null,
            },
        ],
        team_id: 1,
        team_code: "IEEE",
        status: "Cancelled",
        created_at: "2020-10-17T18:28:44.691969-04:00",
        updated_at: "2020-12-03T23:01:46.606892-05:00",
        request: [
            {
                id: 10,
                requested_quantity: 2,
            },
        ],
    },
];

export const mockCheckedOutOrders: Order[] = [
    {
        id: 1,
        items: [
            {
                id: 1,
                hardware_id: 1,
                part_returned_health: null,
            },
            {
                id: 2,
                hardware_id: 1,
                part_returned_health: null,
            },
        ],
        team_id: 2,
        team_code: "IEEE",
        status: "Picked Up",
        created_at: "2021-10-17T18:28:44.691969-01:00",
        updated_at: "2021-12-03T23:01:46.606892-02:00",
        request: [
            {
                id: 1,
                requested_quantity: 2,
            },
        ],
    },
    {
        id: 2,
        items: [
            {
                id: 3,
                hardware_id: 1,
                part_returned_health: "Healthy",
            },
            {
                id: 4,
                hardware_id: 1,
                part_returned_health: null,
            },
            {
                id: 5,
                hardware_id: 2,
                part_returned_health: null,
            },
        ],
        team_id: 2,
        team_code: "IEEE",
        status: "Picked Up",
        created_at: "2020-10-17T18:28:44.691969-03:00",
        updated_at: "2020-12-03T23:01:45.606892-04:00",
        request: [
            {
                id: 1,
                requested_quantity: 2,
            },
            {
                id: 2,
                requested_quantity: 1,
            },
        ],
    },
    {
        id: 7,
        items: [
            {
                id: 10,
                hardware_id: 10,
                part_returned_health: null,
            },
            {
                id: 11,
                hardware_id: 10,
                part_returned_health: "Heavily Used",
            },
            {
                id: 12,
                hardware_id: 10,
                part_returned_health: null,
            },
        ],
        team_id: 1,
        team_code: "IEEE",
        status: "Picked Up",
        created_at: "2022-10-17T18:28:44.691969-06:00",
        updated_at: "2022-12-03T23:01:46.606892-09:00",
        request: [
            {
                id: 10,
                requested_quantity: 3,
            },
        ],
    },
];

export const mockOrders: Order[] = mockCheckedOutOrders.concat(mockPendingOrders);

export const mockSubmittedOrder: Order = {
    id: 4,
    items: [
        {
            id: 8,
            hardware_id: 4,
            part_returned_health: null,
        },
        {
            id: 9,
            hardware_id: 1,
            part_returned_health: null,
        },
        {
            id: 11,
            hardware_id: 1,
            part_returned_health: null,
        },
    ],
    team_id: 2,
    team_code: "IEEE",
    status: "Submitted",
    created_at: "2020-10-17T18:28:44.691969-01:00",
    updated_at: "2020-12-03T23:01:46.606892-04:00",
    request: [
        {
            id: 1,
            requested_quantity: 2,
        },
        {
            id: 4,
            requested_quantity: 1,
        },
    ],
};

export const mockPendingOrdersInTable: OrderInTable[] = [
    {
        id: 5,
        hardwareInTableRow: [
            {
                id: 10,
                quantityRequested: 2,
                quantityGranted: 1,
            },
        ],
        status: "Ready for Pickup",
        createdTime: "2021-10-17T18:28:44.691969-03:00",
        updatedTime: "2021-10-17T18:28:44.691969-06:00",
    },
    {
        id: 4,
        hardwareInTableRow: [
            {
                id: 1,
                quantityRequested: 2,
                quantityGranted: 2,
            },
            {
                id: 4,
                quantityRequested: 1,
                quantityGranted: 1,
            },
        ],
        status: "Submitted",
        createdTime: "2021-10-17T18:28:44.691969-04:00",
        updatedTime: "2022-10-17T18:28:44.691969-04:00",
    },
    {
        id: 3,
        hardwareInTableRow: [
            {
                id: 3,
                quantityRequested: 1,
                quantityGranted: 1,
            },
            {
                id: 4,
                quantityRequested: 1,
                quantityGranted: 1,
            },
        ],
        status: "Ready for Pickup",
        createdTime: "2020-10-17T18:28:44.691969-06:00",
        updatedTime: "2021-12-03T23:01:46.606892-06:00",
    },
];

export const mockCheckedOutOrdersInTable: OrderInTable[] = [
    {
        id: 7,
        hardwareInTableRow: [
            {
                id: 10,
                quantityRequested: 3,
                quantityGranted: 2,
            },
        ],
        status: "Picked Up",
        createdTime: "2022-10-17T18:28:44.691969-06:00",
        updatedTime: "2022-12-03T23:01:46.606892-09:00",
    },
    {
        id: 2,
        hardwareInTableRow: [
            {
                id: 1,
                quantityRequested: 2,
                quantityGranted: 1,
            },
            {
                id: 2,
                quantityRequested: 1,
                quantityGranted: 1,
            },
        ],
        status: "Picked Up",
        createdTime: "2020-10-17T18:28:44.691969-03:00",
        updatedTime: "2020-12-03T23:01:45.606892-04:00",
    },
    {
        id: 1,
        hardwareInTableRow: [
            {
                id: 1,
                quantityRequested: 2,
                quantityGranted: 2,
            },
        ],
        status: "Picked Up",
        createdTime: "2021-10-17T18:28:44.691969-01:00",
        updatedTime: "2021-12-03T23:01:46.606892-02:00",
    },
];

const timeForOrderItem3 = new Date(mockCheckedOutOrders[1].updated_at);
const timeForOrderItem11 = new Date(mockCheckedOutOrders[2].updated_at);

export const mockReturnedOrdersInTable: ReturnOrderInTable[] = [
    {
        id: 2,
        hardwareInOrder: [
            {
                id: 3,
                hardware_id: 1,
                part_returned_health: "Healthy",
                quantity: 1,
                time: `${timeForOrderItem3.toLocaleTimeString()} (${timeForOrderItem3.toDateString()})`,
            },
        ],
    },
    {
        id: 7,
        hardwareInOrder: [
            {
                id: 11,
                hardware_id: 10,
                part_returned_health: "Heavily Used",
                quantity: 1,
                time: `${timeForOrderItem11.toLocaleTimeString()} (${timeForOrderItem11.toDateString()})`,
            },
        ],
    },
];

export const mockReturnedOrder: ReturnOrderResponse[] = [
    {
        order_id: 1,
        team_code: "A48E5",
        returned_items: [
            {
                hardware_id: 1,
                quantity: 2,
            },
        ],
        errors: [
            {
                hardware_id: 1,
                message: "",
            },
        ],
    },
];

export const status = [
    {
        status: "Pending",
        numOrders: 2,
    },
    {
        status: "Ready for Pick up",
        numOrders: 4,
    },
    {
        status: "Checked out",
        numOrders: 4,
    },
];

export const teamsList = [
    {
        TeamName: "Vandal",
        Members: ["Phoenix", "Sage", "Kayo", "Sova"],
    },
    {
        TeamName: "Phantom",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Guardian",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Bulldog",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Bucky",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Judge",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Aries",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Odin",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Sheriff",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
    {
        TeamName: "Ghost",
        Members: ["Name1", "Name2", "Name3", "Name4"],
    },
];

export const mockTeams: Team[] = [mockTeam, mockValidTeam];
