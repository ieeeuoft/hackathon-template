import React from "react";
import OpenInNew from "@material-ui/icons/OpenInNew";
import GetApp from "@material-ui/icons/GetApp";

// For DashCard on Dashboard
export const cardItems = [
    {
        title: "Hello",
        content: [{ name: "Test", url: "https://www.facebook.com", icon: <GetApp /> }],
    },
    {
        title: "Hi",
        content: [
            { name: "Test2", url: "https://www.youtube.com", icon: <OpenInNew /> },
        ],
    },
];

// For ItemTable on Dashboard
export const itemsC = [
    { url: "https://i.imgur.com/IO6e5a6.jpg", name: "Arduino", qty: 6 },
    { url: "https://i.imgur.com/kOlrXto.jpg", name: "Raspi", qty: 9 },
    {
        url: "https://i.imgur.com/iUpI1hC.jpg",
        name: "Grove temperature and humidity sensor pro",
        qty: 16,
    },
    { url: "https://i.imgur.com/kOlrXto.jpg", name: "Blah", qty: 7 },
];

export const itemsR = [
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

export const itemsP = [
    {
        url: "https://i.imgur.com/iUpI1hC.jpg",
        name: "Arduino",
        reqQty: 1,
        grantQty: null,
    },
];

export const orderStatus = "pending";
