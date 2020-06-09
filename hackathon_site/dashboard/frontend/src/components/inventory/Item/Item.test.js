import React from "react";
import Item from "./Item";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("InventoryItem", () => {
    const image =
        "https://i.pinimg.com/originals/58/1f/23/581f232c3462392f63d57be5649649de.jpg";
    const title = "Some Hardware";
    const total = 6;
    let limit = null;
    let currentStock = 4;

    test("Has stock with no limit", () => {
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("Out of Stock", () => {
        let currentStock = null;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("limit 1", () => {
        let limit = 1;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("limit 2", () => {
        let limit = 2;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("limit 3", () => {
        let limit = 3;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("limit 4", () => {
        let limit = 4;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test("limit 5", () => {
        let limit = 5;
        const { asFragment } = render(
            <Item
                image={image}
                title={title}
                total={total}
                limit={limit}
                currentStock={currentStock}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
