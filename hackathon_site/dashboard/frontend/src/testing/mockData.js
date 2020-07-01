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
    { url: "https://i.imgur.com/IO6e5a6.jpg", name: "Arduino", qty: 6 },
    { url: "https://i.imgur.com/kOlrXto.jpg", name: "Raspi", qty: 9 },
    {
        url: "https://i.imgur.com/iUpI1hC.jpg",
        name: "Grove temperature and humidity sensor pro",
        qty: 16,
    },
    { url: "https://i.imgur.com/kOlrXto.jpg", name: "Blah", qty: 7 },
];

export const itemsReturned = [
    {
        url: "https://i.imgur.com/IO6e5a6.jpg",
        name: "Arduino",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        url: "https://i.imgur.com/kOlrXto.jpg",
        name: "Raspi",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
    {
        url: "https://i.imgur.com/IO6e5a6.jpg",
        name: "Grove temperature and humidity sensor pro",
        qty: 1,
        time: "9:30PM XX-XX-2020",
        condition: "Good",
    },
];

export const itemsPending = [
    {
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
