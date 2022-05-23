import React from "react";
import CartCard from "components/cart/CartCard/CartCard";

import { render, makeStoreWithEntities, waitFor } from "testing/utils";
import { mockHardware } from "testing/mockData";

describe("<CartCard />", () => {
    it("Selects hardware from the store and renders", async () => {
        const store = makeStoreWithEntities({ hardware: mockHardware });

        const item = mockHardware[0];
        const quantity = item.quantity_remaining - 3;

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
});
