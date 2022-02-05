import React from "react";
import ProductOverview, { EnhancedAddToCartForm } from "./ProductOverview";
import { mockCartItems, mockCategories, mockHardware } from "testing/mockData";
import { render, fireEvent, waitFor, makeStoreWithEntities } from "testing/utils";
import { makeStore } from "slices/store";
import { addToCart, cartSelectors } from "slices/hardware/cartSlice";
import { SnackbarProvider } from "notistack";
import SnackbarNotifier from "../../general/SnackbarNotifier/SnackbarNotifier";

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

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
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

        const minConstraint: number = mockCategories
            .map((category) => category.max_per_team)
            .concat([mockHardware[0].max_per_team])
            .reduce((prev, curr) => Math.min(prev, curr));

        const { getByText, queryByText, getByRole } = render(
            <ProductOverview showAddToCartButton={true} />,
            {
                store,
            }
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText(minConstraint + 1)).not.toBeInTheDocument();
        expect(getByText(minConstraint)).toBeInTheDocument();
    });

    it("displays error message when unable to get hardware", () => {
        const store = makeStore({
            ui: {
                inventory: {
                    hardwareItemBeingViewed: null,
                    isProductOverviewVisible: true,
                },
            },
        });

        const { getByText } = render(<ProductOverview showAddToCartButton />, {
            store,
        });

        expect(
            getByText(
                "Unable to display hardware. Please refresh the page and try again."
            )
        ).toBeInTheDocument();
    });

    test("Add to Cart button adds hardware to cart store", async () => {
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

        const { getByText } = render(
            <SnackbarProvider>
                <SnackbarNotifier />
                <ProductOverview showAddToCartButton />
            </SnackbarProvider>,
            {
                store,
            }
        );

        // by default, quantity is 1
        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(cartSelectors.selectAll(store.getState())).toEqual([
            { hardware_id: mockHardware[0].id, quantity: 1 },
        ]);
        expect(
            getByText(`Added 1 ${mockHardware[0].name} item(s) to your cart.`)
        ).toBeInTheDocument();
    });

    test("Add to Cart button doesn't add hardware if user exceeds max per team limit", async () => {
        const store = makeStoreWithEntities({
            hardware: [mockHardware[0]],
            categories: mockCategories,
            ui: {
                inventory: {
                    hardwareItemBeingViewed: mockHardware[0],
                    isProductOverviewVisible: true,
                },
            },
            cartItems: mockCartItems,
        });

        const { getByText } = render(
            <SnackbarProvider>
                <SnackbarNotifier />
                <ProductOverview showAddToCartButton />
            </SnackbarProvider>,
            {
                store,
            }
        );

        expect(
            getByText(
                `You currently have ${mockCartItems.length} of this item in your cart.`
            )
        );

        // by default, quantity is 1
        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(cartSelectors.selectAll(store.getState())).toEqual(mockCartItems);
        expect(
            getByText(
                "Adding this amount to your cart will exceed the quantity limit for this item."
            )
        ).toBeInTheDocument();
    });
});

describe("<EnhancedAddToCartForm />", () => {
    test("button and select are disabled if quantityAvailable is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm
                quantityAvailable={0}
                maxPerTeam={null}
                hardwareId={1}
                name="Arduino"
            />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("button and select are disabled if minimum constraint is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm
                quantityAvailable={3}
                maxPerTeam={0}
                hardwareId={1}
                name="Arduino"
            />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("dropdown values are minimum between quantityAvailable and max per team", () => {
        const { queryByText, getByText, getByRole } = render(
            <EnhancedAddToCartForm
                quantityAvailable={3}
                maxPerTeam={2}
                hardwareId={1}
                name="Arduino"
            />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText("3")).not.toBeInTheDocument();
        expect(getByText("2")).toBeInTheDocument();
    });

    test("dropdown value defaults to quantityAvailable when maxPerTeam is null", () => {
        const { getByText, getByRole } = render(
            <EnhancedAddToCartForm
                quantityAvailable={3}
                maxPerTeam={null}
                hardwareId={1}
                name="Arduino"
            />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(getByText("3")).toBeInTheDocument();
    });
});
