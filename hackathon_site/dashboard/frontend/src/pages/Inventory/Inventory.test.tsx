import React from "react";
import { render } from "@testing-library/react";
import Inventory from "pages/Inventory/Inventory";
import { withStoreAndRouter } from "testing/utils";
import { inventoryItems } from "testing/mockData";

test("renders without crashing", () => {
    const { queryByText } = render(withStoreAndRouter(<Inventory />));

    for (let i of inventoryItems) {
        expect(queryByText(i.title)).toBeTruthy();
    }
});
