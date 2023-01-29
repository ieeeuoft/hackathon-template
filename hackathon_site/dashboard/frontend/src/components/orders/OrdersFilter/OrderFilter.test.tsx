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

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const ordersUri = "/api/hardware/orders/";

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
        const { getByTestId, getByText } = render(<OrdersFilter />, {
            store,
        });

        // sort buttons
        const orderByDefaultButton = getByText("Default");
        const timeOrderedAscButton = getByText("Time Ordered (ASC)");
        const timeOrderedDescButton = getByText("Time Ordered (DESC)");

        // status filters
        const submittedCheckbox = await getByTestId("Submitted");
        const readyForPickupCheckbox = getByTestId("Ready for Pickup");
        const pickedUpCheckbox = getByTestId("Picked Up");
        const cancelledCheckbox = getByTestId("Cancelled");

        const applyButton = getByTestId("apply-button");

        fireEvent.click(timeOrderedAscButton);
        fireEvent.click(readyForPickupCheckbox);
        fireEvent.click(cancelledCheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: OrderFilters = {
            ordering: "created_at",
            status: ["Ready for Pickup", "Cancelled"],
        };

        await waitFor(() => {
            expect(mockedGet).toHaveBeenNthCalledWith(2, ordersUri, expectedFilters);
        });
    });

    it("Clears filters when clear all button is pressed", async () => {
        const store = prepopulateStore();
        const { getByTestId, getByText } = render(<OrdersFilter />, {
            store,
        });

        // add some filters
        const timeOrderedDescButton = getByTestId("Time Ordered (DESC)");
        fireEvent.click(timeOrderedDescButton);

        const submittedCheckbox = await getByTestId("Submitted");
        fireEvent.click(submittedCheckbox);

        const applyButton = getByTestId("apply-button");
        fireEvent.click(applyButton);

        // reset filters
        const resetButton = getByText(/clear all/i);
        fireEvent.click(resetButton);

        // check default filters are checked, nothing else
        const defaultOrderButton = getByTestId("Default");
        expect(
            defaultOrderButton.firstElementChild.firstElementChild.firstElementChild
        ).toBeChecked();
        expect(
            timeOrderedDescButton.firstElementChild.firstElementChild.firstElementChild
        ).not.toBeChecked();
        expect(
            submittedCheckbox.firstElementChild.firstElementChild.firstElementChild
        ).not.toBeChecked();

        const expectedFilters: OrderFilters = {
            status: [],
        };

        await waitFor(() => {
            expect(store.getState()["adminOrder"]["filters"]).toEqual(expectedFilters);
        });
    });
});
