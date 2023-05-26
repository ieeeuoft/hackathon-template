import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStoreWithEntities } from "../../../testing/utils";
import { mockHardware, mockPendingOrders } from "../../../testing/mockData";
import OrdersCount from "./OrdersCount";

describe("<OrdersCount />", () => {
    const store = makeStoreWithEntities({
        hardware: mockHardware,
        allOrders: mockPendingOrders,
    });

    it("Has necessary component elements", async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                {" "}
                <OrdersCount />{" "}
            </Provider>
        );
        expect(getByTestId("refreshOrders")).toBeInTheDocument();
        const expectedCount = mockPendingOrders.length;
        expect(getByText(`${expectedCount} results`)).toBeInTheDocument();
    });
});
