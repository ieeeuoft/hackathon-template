import React from "react";

import { get } from "api/api";
import { render, fillStoreWithEntities, waitFor } from "testing/utils";
import { cartItems, mockHardware } from "testing/mockData";

import Cart from "pages/Cart/Cart";
import { makeStore } from "slices/store";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("Cart Page", () => {
    test("Cart items and Cart Summary card appears", async () => {
        // TODO: Cart page currently loads all of mockHardware. Update this test once
        // the page pulls items from redux.
        const store = makeStore();
        fillStoreWithEntities(store, { hardware: mockHardware }, mockedGet);

        const { getByText } = render(<Cart />, { store });

        await waitFor(() => {
            for (let e of cartItems) {
                const hardware = mockHardware.find((h) => h.id === e.hardware_id)!;
                expect(getByText(hardware.name)).toBeInTheDocument();
            }
        });

        expect(getByText("Cart Summary")).toBeInTheDocument();
    });
});
