import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import PinDrop from "@material-ui/icons/PinDrop";

import {
    Category,
    Hardware,
    Order,
    OrderInTable,
    ReturnOrderInTable,
    Team,
    User,
} from "api/types";
import { CartItem } from "api/types";
import { adminGroup } from "constants.js";

// For DashCard on Dashboard

export const mockOverviewStats = [
    {
        title: "checked_out",
        quantity: 123,
    },
    {
        title: "participants",
        quantity: 200,
    },
    {
        title: "teams",
        quantity: 14,
    },
    {
        title: "orders",
        quantity: 123,
    },
    {
        title: "broken",
        quantity: 7,
    },
];

export const mockAdminPendingOrders = [
    {
        team: 3,
        order_quantity: 4,
        time_ordered: "11:30",
        id: 1342,
    },
    {
        team: 2,
        order_quantity: 5,
        time_ordered: "16:30",
        id: 1345,
    },
    {
        team: 7,
        order_quantity: 2,
        time_ordered: "19:30",
        id: 1342,
    },
    {
        team: 10,
        order_quantity: 1,
        time_ordered: "10:30",
        id: 1232,
    },
    {
        team: 5,
        order_quantity: 1,
        time_ordered: "08:00",
        id: 1394,
    },
    {
        team: 1,
        order_quantity: 1,
        time_ordered: "23:30",
        id: 2234,
    },
    {
        team: 9,
        order_quantity: 1,
        time_ordered: "10:00",
        id: 2312,
    },
];

export const cardItems = [
    {
        title: "Important Links",
        content: [
            {
                name: "Hackathon main site",
                url: "https://www.facebook.com",
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

// Team Detail
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
            user: {
                id: 1,
                first_name: "Foo",
                last_name: "Bar",
                email: "foo@bar.com",
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:46.606892-05:00",
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
        updated_at: "2021-12-03T23:01:46.606892-05:00",
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:46.606892-05:00",
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:46.606892-05:00",
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:46.606892-05:00",
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:45.606892-05:00",
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
        id: 3,
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
        created_at: "2021-10-17T18:28:44.691969-04:00",
        updated_at: "2021-12-03T23:01:46.606892-05:00",
        request: [
            {
                id: 10,
                requested_quantity: 3,
            },
        ],
    },
];

export const mockOrders: Order[] = mockCheckedOutOrders.concat(mockPendingOrders);

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
    },
];

export const mockCheckedOutOrdersInTable: OrderInTable[] = [
    {
        id: 3,
        hardwareInTableRow: [
            {
                id: 10,
                quantityRequested: 3,
                quantityGranted: 2,
            },
        ],
        status: "Picked Up",
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
        id: 3,
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
