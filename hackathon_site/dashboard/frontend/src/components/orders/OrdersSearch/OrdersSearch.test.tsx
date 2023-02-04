import React from "react";
import { DeepPartial } from "redux";
import OrdersFilter from "./OrdersSearch";
import OrdersSearch from "./OrdersSearch";
import { render, fireEvent, waitFor } from "testing/utils";
import { get } from "api/api";
import { RootState } from "slices/store";
import { Order, OrderFilters } from "../../../api/types";
import {
    orderReducerName,
    initialState,
    OrderState,
} from "../../../slices/order/orderSlice";
import OrderFilter from "../OrdersFilter/OrderFilter";

jest.mock("api/api");

const makeState = (overrides: Partial<OrderState>): DeepPartial<RootState> => ({
    [orderReducerName]: {
        ...initialState,
        ...overrides,
    },
});

const orderUri = "/api/hardware/orders/";

describe("<OrderSearch />", () => {
    it("Submits search query", async () => {
        const { getByLabelText } = render(<OrdersSearch />);

        const input = getByLabelText(/search items/i);

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters: OrderFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(orderUri, expectedFilters);
        });
    });

    it("Submits search query when clicking search button", async () => {
        const { getByLabelText, getByTestId } = render(<OrdersSearch />);

        const input = getByLabelText(/search items/i);
        const searchButton = getByTestId("search-button");

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.click(searchButton);

        const expectedFilters: OrderFilters = {
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(orderUri, expectedFilters);
        });
    });

    it("Changes only the search filter when submitted", async () => {
        const initialFilters: OrderFilters = {
            ordering: "created_at",
            status: ["Submitted"],
            search: "abc123",
        };

        const preloadedState = makeState({ filters: initialFilters });

        const { getByLabelText } = render(<OrdersSearch />, { preloadedState });

        const input = getByLabelText(/search items/i);
        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters = {
            ...initialFilters,
            search: "foobar",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(orderUri, expectedFilters);
        });
    });

    it("Removes the search filter and submits when cleared", async () => {
        const initialFilters: OrderFilters = {
            ordering: "created_at",
            status: ["Submitted"],
            search: "abc123",
        };

        const preloadedState = makeState({ filters: initialFilters });

        const { getByTestId } = render(<OrdersSearch />, { preloadedState });

        const clearButton = getByTestId("clear-button");
        fireEvent.click(clearButton);

        const { search, ...expectedFilters } = initialFilters;

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(orderUri, expectedFilters);
        });
    });
});
