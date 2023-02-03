import React from "react";
import { render } from "testing/utils";
import OrdersFilter from "./OrderFilter";
import { makeMockApiListResponse } from "testing/utils";
import { mockOrders } from "testing/mockData";
import { makeStore } from "slices/store";
import { get } from "api/api";
import { getOrdersWithFilters } from "slices/order/adminOrderSlice";
import { fireEvent, waitFor } from "testing/utils";
import { OrderFilters } from "api/types";
import { getByDisplayValue } from "@testing-library/react";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const ordersUri = "/api/hardware/orders/";

// TODO: test should require multiple checkboxes to be clicked, but it only works with one. fix this test
describe("<OrdersFilter />", () => {
    const prepopulateStore = () => {
        const apiResponse = makeMockApiListResponse(mockOrders);
        mockedGet.mockResolvedValue(apiResponse);

        const store = makeStore();
        store.dispatch(getOrdersWithFilters());

        return store;
    };

    it("Submits selected filters", async () => {
        const store = prepopulateStore();
        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(ordersUri, {});
        });
        const { getByTestId, getByDisplayValue } = render(<OrdersFilter />, {
            store,
        });

        // status filters
        const readyForPickupCheckbox = getByDisplayValue("Ready for Pickup");

        const applyButton = getByTestId("apply-button");

        fireEvent.click(readyForPickupCheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: OrderFilters = {
            status: ["Ready for Pickup"],
        };

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(2, ordersUri, expectedFilters);
        });
    });

    it("Clears filters when clear all button is pressed", async () => {
        const store = prepopulateStore();
        const { getByTestId, getByText, getByDisplayValue } = render(<OrdersFilter />, {
            store,
        });

        // add some filters
        const readyForPickupCheckbox = getByDisplayValue("Ready for Pickup");
        fireEvent.click(readyForPickupCheckbox);

        const applyButton = getByTestId("apply-button");
        fireEvent.click(applyButton);

        // reset filters
        const resetButton = getByText(/clear all/i);
        fireEvent.click(resetButton);

        // check default filters are checked, nothing else
        const expectedFilters: OrderFilters = {
            status: [],
        };

        await waitFor(() => {
            expect(store.getState()["adminOrder"]["filters"]).toEqual(expectedFilters);
        });
    });
});
