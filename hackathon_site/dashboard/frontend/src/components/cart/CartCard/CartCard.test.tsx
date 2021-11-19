import React from "react";
import CartCard from "components/cart/CartCard/CartCard";

import {
    render,
    makeStoreWithEntities,
    waitFor,
    fireEvent,
    getByRole,
    getByText,
    queryByText,
} from "testing/utils";
import { mockCartItems, mockHardware } from "testing/mockData";
import { addToCart, cartSelectors } from "slices/hardware/cartSlice";

describe("<CartCard />", () => {
    /**
     * TODO: Additional required tests once the redux slice is ready:
     *  - Test that updating the quantity updates the store
     */

    it("Selects hardware from the store and renders", async () => {
        const store = makeStoreWithEntities({ hardware: mockHardware });

        const item = mockHardware[0];
        const quantity = item.quantity_remaining - 1;

        const { getByText, getByAltText } = render(
            <CartCard hardware_id={item.id} quantity={quantity} />,
            { store }
        );

        await waitFor(() => {
            expect(getByText(item.name)).toBeInTheDocument();
            expect(getByAltText(item.name)).toBeInTheDocument();
            expect(getByText(quantity.toString())).toBeInTheDocument();
        });
    });

    test("Out of Stock", async () => {
        const hardware = [{ ...mockHardware[0] }, { ...mockHardware[1] }];
        hardware[0].quantity_remaining = 0;
        const store = makeStoreWithEntities({ hardware });

        const item = hardware[0];
        const quantity = mockHardware[0].quantity_remaining - 1;

        const { queryByText } = render(
            <CartCard hardware_id={item.id} quantity={quantity} />,
            { store }
        );

        await waitFor(() => {
            expect(queryByText(quantity)).not.toBeInTheDocument();
            expect(queryByText(/currently unavailable/i)).toBeInTheDocument();
        });
    });

    test("Error message", async () => {
        const error = "Maximum allowed limit exceeded";
        const store = makeStoreWithEntities({ hardware: mockHardware });

        const item = mockHardware[0];
        const quantity = item.quantity_remaining - 1;

        const { getByText } = render(
            <CartCard hardware_id={item.id} quantity={quantity} error={error} />,
            { store }
        );

        await waitFor(() => {
            expect(getByText(error)).toBeInTheDocument();
        });
    });

    test("removeFromCart button", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
        });

        store.dispatch(
            addToCart({
                hardware_id: mockCartItems[0].hardware_id,
                quantity: mockCartItems[0].quantity,
            })
        );

        store.dispatch(
            addToCart({
                hardware_id: mockCartItems[1].hardware_id,
                quantity: mockCartItems[1].quantity,
            })
        );

        const { getByRole, queryByText } = render(
            <CartCard
                hardware_id={mockCartItems[0].hardware_id}
                quantity={mockCartItems[0].quantity}
            />,
            { store }
        );

        const removeButton = getByRole("remove");
        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(queryByText(mockHardware[0].picture)).not.toBeInTheDocument();
        });
    });
});
