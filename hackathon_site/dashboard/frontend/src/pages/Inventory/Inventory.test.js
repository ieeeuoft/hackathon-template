import React from "react";
import { render } from "@testing-library/react";
import Inventory from "./Inventory";
import { withStoreAndRouter } from "testing/helpers";
import { inventoryItems } from "testing/mockData";

test("renders without crashing", () => {
    const { queryByText } = render(withStoreAndRouter(<Inventory />));

    for (let i of inventoryItems) {
        expect(queryByText(i.title)).toBeTruthy();
    }
});
