import React from "react";
import Item from "./Item";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("InventoryItem", () => {
    const image =
        "hackathon_site/dashboard/frontend/src/assets/images/testImages/IO6e5a6.jpg";
    const title = "Some Hardware";
    const total = 6;
    let limit = null;
    let currentStock = 4;

    test("Has stock", () => {
        const { getByText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(getByText("Some Hardware")).toBeInTheDocument();
        expect(getByText("4 OF 6 IN STOCK")).toBeInTheDocument();
    });

    test("Out of Stock", () => {
        let currentStock = 0;
        const { getByText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(getByText("Some Hardware")).toBeInTheDocument();
        expect(getByText("OUT OF STOCK")).toBeInTheDocument();
    });
});
