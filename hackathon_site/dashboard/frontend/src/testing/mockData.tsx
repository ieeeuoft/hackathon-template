import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import PinDrop from "@material-ui/icons/PinDrop";
import {
    Category,
    Hardware,
    Incident,
    IncidentState,
    Order,
    OrderItem,
    OrderStatus,
    PartReturnedHealth,
} from "api/types";
import { CartItem } from "api/types";

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
export const cartQuantity = 5;
export const userEmail = "graham@email.com";

// Product Overview
export const productInformation = {
    id: 1,
    name: "Arduino",
    total: 30,
    quantityAvailable: 19,
    img: "https://i.imgur.com/IO6e5a6.jpg",
    category: ["MCU", "FPGA"],
    manufacturer: "Canakit",
    model_num: "Model 3B+",
    datasheet: "https://www.facebook.com",
    notes: "- For micropython ask for image\n- randomnerdtutorials.com",
    constraints: ["- Max 1 of this item", "- Max 3 microcontroller labelled red"],
    constraintMax: 3, // Can also be null
};

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
export const mockUser = {
    id: 1,
    first_name: "Foo",
    last_name: "Bar",
    email: "foo@bar.com",
    profile: {
        id: 1,
        status: "Accepted",
        id_provided: false,
        attended: false,
        acknowledge_rules: false,
        e_signature: null,
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

export const mockHardware: Hardware[] = [
    {
        id: 1,
        name: "Arduino",
        model_number: "Uno",
        manufacturer: "Arduino",
        datasheet: "https://example.com/datasheet",
        quantity_available: 10,
        max_per_team: 2,
        picture: "https://i.imgur.com/iUpI1hC.jpg",
        categories: [1],
        quantity_remaining: 5,
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
    },
];

export const mockCartItems: CartItem[] = [
    { hardware_id: 1, quantity: 3 },
    { hardware_id: 2, quantity: 1 },
    { hardware_id: 3, quantity: 2 },
];

export const mockPendingOrders: Order[] = [
    {
        id: 1,
        hardware: mockHardware.slice(0, 2),
        team: 1,
        team_code: "IEEE",
        status: "Submitted",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
    {
        id: 2,
        hardware: mockHardware.slice(2, 4),
        team: 1,
        team_code: "IEEE",
        status: "Ready for Pickup",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
];

export const mockCheckedOutOrders: Order[] = [
    {
        id: 3,
        hardware: mockHardware.slice(4, 6),
        team: 1,
        team_code: "IEEE",
        status: "Picked Up",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
    {
        id: 4,
        hardware: mockHardware.slice(6, 8),
        team: 1,
        team_code: "IEEE",
        status: "Picked Up",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
];

export const mockReturnedItems: Incident[] = [
    {
        id: 0,
        state: "Heavily Used",
        time_occurred: "2021-11-24T16:26:58.404Z",
        description: "Just a normal returned item.",
        order_item: {
            id: 0,
            hardware: 2,
            order: 5,
            part_returned_health: "Healthy",
        },
        team_id: "IEEE",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
    {
        id: 1,
        state: "Broken",
        time_occurred: "2021-11-24T16:26:58.404Z",
        description: "Got Smashed",
        order_item: {
            id: 2,
            hardware: 1,
            order: 5,
            part_returned_health: "Broken",
        },
        team_id: "IEEE",
        created_at: new Date().toDateString(),
        updated_at: new Date().toDateString(),
    },
];
