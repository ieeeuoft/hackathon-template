import React from "react";
import CartCard from "components/cart/CartCard/CartCard";

import { makeStore, RootStore } from "slices/store";
import { get } from "api/api";
import { render, fillStoreWithEntities, fireEvent, waitFor } from "testing/utils";
import { mockHardware } from "testing/mockData";
import { Hardware } from "api/types";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<CartCard />", () => {
    /**
     * TODO: Additional required tests once the redux slice is ready:
     *  - Test that the remove button removes the item from the store
     *  - Test that updating the quantity updates the store
     */

    let item: Hardware;
    let quantity: number;

    let store: RootStore;

    beforeEach(() => {
        store = makeStore();
    });

    it("Selects hardware from the store and renders", async () => {
        fillStoreWithEntities(store, { hardware: mockHardware }, mockedGet);

        item = mockHardware[0];
        quantity = item.quantity_remaining - 1;

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
        fillStoreWithEntities(store, { hardware }, mockedGet);

        item = hardware[0];
        quantity = mockHardware[0].quantity_remaining - 1;

        const { queryByText } = render(
            <CartCard hardware_id={item.id} quantity={quantity} />,
            { store }
        );

        await waitFor(() => {
            // This is just here to make sure the store has finished populating
            expect(queryByText(item.name)).toBeInTheDocument();

            expect(queryByText(quantity)).not.toBeInTheDocument();
            expect(queryByText(/currently unavailable/i)).toBeInTheDocument();
        });
    });

    test("Error message", async () => {
        const error = "Maximum allowed limit exceeded";

        fillStoreWithEntities(store, { hardware: mockHardware }, mockedGet);

        item = mockHardware[0];
        quantity = item.quantity_remaining - 1;

        const { getByText } = render(
            <CartCard hardware_id={item.id} quantity={quantity} error={error} />,
            { store }
        );

        await waitFor(() => {
            // This is just here to make sure the store has finished populating
            expect(getByText(item.name)).toBeInTheDocument();

            expect(getByText(error)).toBeInTheDocument();
        });
    });
});
