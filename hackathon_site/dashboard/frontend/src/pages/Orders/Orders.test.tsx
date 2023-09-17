import React from "react";
import { render, within } from "testing/utils";
import { mockHardware, mockPendingOrders } from "testing/mockData";
import Orders from "./Orders";
import { RootStore } from "slices/store";
import { makeStoreWithEntities } from "testing/utils";

describe("Orders Page", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            allOrders: mockPendingOrders,
        });
    });
    test("Has necessary page elements", () => {
        const { getByText, getByTestId } = render(<Orders />, { store });

        expect(getByText("Orders")).toBeInTheDocument();
        expect(getByTestId("ordersCountDivider")).toBeInTheDocument();
    });
});
