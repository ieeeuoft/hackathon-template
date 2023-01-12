import React from "react";
import Item from "components/inventory/Item/Item";
import { render, makeStoreWithEntities } from "testing/utils";
import "@testing-library/jest-dom/extend-expect";
import { mockAdminUser, mockUser } from "testing/mockData";

describe("InventoryItem", () => {
    const image =
        "hackathon_site/dashboard/frontend/src/assets/images/testImages/IO6e5a6.jpg";
    const title = "Some Hardware";
    const total = 6;
    let currentStock = 4;

    test("Has stock on admin side", () => {
        const store = makeStoreWithEntities({
            user: {
                userData: {
                    user: mockAdminUser,
                    isLoading: false,
                    error: null,
                },
            },
        });
        const { getByText, getByAltText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />,
            { store }
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(`${currentStock} OF ${total} IN STOCK`)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Has stock on participant side", () => {
        const store = makeStoreWithEntities({
            user: {
                userData: {
                    user: mockUser,
                    isLoading: false,
                    error: null,
                },
            },
        });
        const { getByText, getByAltText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />,
            { store }
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(`${currentStock} IN STOCK`)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Out of Stock", () => {
        const store = makeStoreWithEntities({
            user: {
                userData: {
                    user: mockUser,
                    isLoading: false,
                    error: null,
                },
            },
        });

        let currentStock = 0;
        const { getByText, getByAltText } = render(
            <Item
                image={image}
                title={title}
                total={total}
                currentStock={currentStock}
            />,
            { store }
        );

        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText("OUT OF STOCK")).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });
});
