import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";
import PinDrop from "@material-ui/icons/PinDrop";

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
export const inventoryCategories = [
    { name: "MCU", qty: 12 },
    { name: "MCU_limit_3", qty: 6 },
    { name: "FPGA", qty: 9 },
    { name: "Sensors", qty: 21 },
    { name: "Sensors_limit_2", qty: 3 },
    { name: "Peripherals", qty: 389 },
    { name: "1080p_cameras", qty: 4 },
    { name: "Grove", qty: 22 },
    { name: "Grove_style_boards", qty: 12 },
    { name: "Grove_style_modules", qty: 10 },
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

export const inventoryItems = [
    {
        id: 1,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Arduino",
        total: 20,
        currentStock: 19,
    },
    {
        id: 2,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Some Hardware 2",
        total: 16,
        currentStock: 0,
    },
    {
        id: 3,
        image: "https://i.imgur.com/IO6e5a6.jpg",
        title: "Some Hardware 3",
        total: 16,
        currentStock: 12,
    },
    {
        id: 4,
        image: "https://i.imgur.com/IO6e5a6.jpg",
        title: "Grove temperature and humidity sensor pro",
        total: 6,
        currentStock: 5,
    },
    {
        id: 5,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Some Hardware 5",
        total: 6,
        currentStock: 1,
    },
    {
        id: 6,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Some Hardware 6",
        total: 8,
        currentStock: 3,
    },
    {
        id: 7,
        image: "https://i.imgur.com/IO6e5a6.jpg",
        title: "Some Hardware 7",
        total: 10,
        currentStock: 7,
    },
    {
        id: 8,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Some Hardware 8",
        total: 22,
        currentStock: 13,
    },
    {
        id: 9,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Raspi",
        total: 19,
        currentStock: 16,
    },
    {
        id: 10,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Some Hardware 10",
        total: 27,
        currentStock: 3,
    },
    {
        id: 11,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Some Hardware 11",
        total: 16,
        currentStock: 0,
    },
    {
        id: 12,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Some Hardware 12",
        total: 6,
        currentStock: 0,
    },
    {
        id: 13,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Some Hardware 13",
        total: 21,
        currentStock: 13,
    },
    {
        id: 14,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Some Hardware 14",
        total: 20,
        currentStock: 2,
    },
    {
        id: 15,
        image: "https://i.imgur.com/IO6e5a6.jpg",
        title: "Some Hardware 15",
        total: 3,
        currentStock: 0,
    },
];

export const cartItems = [
    {
        id: 1,
        image: "https://i.imgur.com/iUpI1hC.jpg",
        title: "Arduino",
        currentStock: 19,
        checkedOutQuantity: 3,
        isError: false,
    },
    {
        id: 2,
        image: "https://i.imgur.com/kOlrXto.jpg",
        title: "Some Hardware 2",
        currentStock: 0,
        checkedOutQuantity: 1,
        isError: false,
    },
    {
        id: 3,
        image: "https://i.imgur.com/IO6e5a6.jpg",
        title: "Some Hardware 3",
        currentStock: 12,
        checkedOutQuantity: 2,
        isError: false,
    },
];
