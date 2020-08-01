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

// Product Overview
export const productInformation = {
    name: "Arduino",
    type: "red",
    total: 30,
    quantityAvailable: 0,
    img: "https://i.imgur.com/IO6e5a6.jpg",
    category: ["MCU", "FPGA"],
    manufacturer: "Canakit",
    model_num: "Model 3B+",
    datasheet: "link",
    notes: "- For micropython ask for image \n - randomnerdtutorials.com",
    constraints: ["- Max 1 of this item", "- Max 3 microcontroller labelled red"],
    quantity: 3,
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
