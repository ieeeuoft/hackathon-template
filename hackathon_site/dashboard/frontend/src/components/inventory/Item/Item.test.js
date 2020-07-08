import React from "react";
import Item from "./Item";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("InventoryItem", () => {
    const image =
        "hackathon_site/dashboard/frontend/src/assets/images/testImages/IO6e5a6.jpg";
    const title = "Some Hardware";
    const total = 6;
    let currentStock = 4;

    test("Has stock with no limit", () => {
        const { getByText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />
        );
        expect(getByText("Some Hardware")).toBeInTheDocument();
        expect(getByText(`${currentStock} OF ${total} IN STOCK`)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Out of Stock", () => {
        let currentStock = null;
        const { getByText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />
        );
        expect(getByText("Some Hardware")).toBeInTheDocument();
        expect(getByText("OUT OF STOCK")).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("For the image", () => {
        const { getByAltText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />
        );

        expect(getByAltText(title)).toBeInTheDocument();
    });
});
