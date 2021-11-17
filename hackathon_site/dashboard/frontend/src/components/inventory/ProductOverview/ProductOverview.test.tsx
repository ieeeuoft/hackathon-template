import React from "react";
import ProductOverview, { EnhancedAddToCartForm } from "./ProductOverview";
import { mockCategories, mockHardware } from "testing/mockData";
import { render, fireEvent, waitFor, makeStoreWithEntities } from "testing/utils";
import { makeStore } from "slices/store";

describe("<ProductOverview />", () => {
    test("all 3 parts of the product overview is there", () => {
        const store = makeStore({
            ui: {
                inventory: {
                    hardwareItemBeingViewed: mockHardware[0],
                    isProductOverviewVisible: true,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton={true} />, {
            store,
        });

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("Add to cart")).toBeInTheDocument();
    });

    test("minimum constraint between hardware and categories is used", () => {
        const store = makeStoreWithEntities({
            hardware: [mockHardware[0]],
            categories: mockCategories,
            ui: {
                inventory: {
                    hardwareItemBeingViewed: mockHardware[0],
                    isProductOverviewVisible: true,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton={true} />, {
            store,
        });

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("Add to cart")).toBeInTheDocument();
    });
});

describe("<EnhancedAddToCartForm />", () => {
    test("add to cart button calls the correct function", async () => {
        // TODO: add to cart store is updated to the correct amount
        const { getByText } = render(<EnhancedAddToCartForm quantityAvailable={3} />);

        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });
    });

    test("button and select are disabled if quantityAvailable is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm quantityAvailable={0} />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("dropdown values are minimum between quantityAvailable and max per team", () => {
        const { queryByText, getByText, getByRole } = render(
            <EnhancedAddToCartForm quantityAvailable={3} maxPerTeam={2} />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText("3")).not.toBeInTheDocument();
        expect(getByText("2")).toBeInTheDocument();
    });
});
