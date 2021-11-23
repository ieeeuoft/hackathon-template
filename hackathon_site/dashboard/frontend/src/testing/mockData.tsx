import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import PinDrop from "@material-ui/icons/PinDrop";
import { Category, Hardware } from "api/types";
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
        notes: "",
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
];

export const mockCartItems: CartItem[] = [
    { hardware_id: 1, quantity: 3 },
    { hardware_id: 2, quantity: 1 },
    { hardware_id: 3, quantity: 2 },
];
