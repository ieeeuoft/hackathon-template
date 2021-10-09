import React from "react";
import { DeepPartial } from "redux";

import {
    render,
    fireEvent,
    waitFor,
    promiseResolveWithDelay,
    makeMockApiListResponse,
} from "testing/utils";

import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";
import { get } from "api/api";
import { mockCategories, mockHardware } from "testing/mockData";
import { makeStore, RootState } from "slices/store";
import {
    hardwareReducerName,
    HardwareState,
    initialState,
} from "slices/hardware/hardwareSlice";
import { HardwareFilters } from "api/types";
import { getCategories } from "slices/hardware/categorySlice";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const makeState = (overrides: Partial<HardwareState>): DeepPartial<RootState> => ({
    [hardwareReducerName]: {
        ...initialState,
        ...overrides,
    },
});

const hardwareUri = "/api/hardware/hardware/";

describe("<InventoryFilter />", () => {
    /* Inventory filter tests
     *
     * Rather than testing just the unconnected inventory filter and using
     * mocks for redux actions, these tests are closer to integration tests.
     * They directly test the connected filter, and assert all the way on
     * the level of the (mocked) API requests.
     */

    const prepopulateStore = () => {
        const apiResponse = makeMockApiListResponse(mockCategories);
        mockedGet.mockResolvedValue(apiResponse);

        const store = makeStore();
        store.dispatch(getCategories());

        return store;
    };

    it("Submits selected filters", async () => {
        const store = prepopulateStore();
        const { getByText, findByText } = render(<InventoryFilter />, { store });

        const orderByNameButton = getByText("Z-A");
        const inStockCheckbox = getByText("In stock");

        const firstCheckbox = await findByText(mockCategories[0].name);
        const secondCheckbox = await findByText(mockCategories[1].name);

        const applyButton = getByText("Apply");

        fireEvent.click(orderByNameButton);
        fireEvent.click(inStockCheckbox);
        fireEvent.click(firstCheckbox);
        fireEvent.click(secondCheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: HardwareFilters = {
            ordering: "-name",
            in_stock: true,
            category_ids: [mockCategories[0].id, mockCategories[1].id],
        };

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Clears filters when toggled", async () => {
        const store = prepopulateStore();
        const { getByText, findByText } = render(<InventoryFilter />, { store });

        const orderByNameButton = getByText("Z-A");
        const inStockCheckbox = getByText("In stock");
        const firstCheckbox = await findByText(mockCategories[0].name);

        const applyButton = getByText("Apply");

        fireEvent.click(orderByNameButton);
        fireEvent.click(inStockCheckbox);
        fireEvent.click(firstCheckbox);

        fireEvent.click(inStockCheckbox);
        fireEvent.click(firstCheckbox);
        fireEvent.click(applyButton);

        const expectedFilters: HardwareFilters = {
            ordering: "-name",
        };

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Clears all filters except search when the clear button is clicked", async () => {
        const initialFilters: HardwareFilters = {
            in_stock: true,
            ordering: "-name",
            category_ids: [1, 2],
            search: "abc123",
        };

        const preloadedState = makeState({ filters: initialFilters });

        const { getByText } = render(<InventoryFilter />, { preloadedState });

        const clearButton = getByText(/clear all/i);

        fireEvent.click(clearButton);

        const expectedFilters = { search: "abc123" };

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith(hardwareUri, expectedFilters);
        });
    });

    it("Disables the clear and apply buttons when loading", async () => {
        const apiResponse = makeMockApiListResponse(mockHardware);
        mockedGet.mockReturnValue(promiseResolveWithDelay(apiResponse, 500));

        const { getByText } = render(<InventoryFilter />);

        const applyButton = getByText("Apply");
        const clearButton = getByText(/clear all/i);

        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(applyButton.closest("button")).toBeDisabled();
            expect(clearButton.closest("button")).toBeDisabled();
        });

        // After the results are returned, the buttons should be re-enabled
        await waitFor(() => {
            expect(applyButton.closest("button")).toBeEnabled();
            expect(clearButton.closest("button")).toBeEnabled();
        });
    });

    it("Renders loading bar, then options for each category", async () => {
        const categoryApiResponse = makeMockApiListResponse(mockCategories);
        mockedGet.mockReturnValue(promiseResolveWithDelay(categoryApiResponse, 500));

        // Pre-populate the store by dispatching fetch categories action
        const store = makeStore();
        store.dispatch(getCategories());

        const { getByText, queryByTestId } = render(<InventoryFilter />, { store });

        await waitFor(() => {
            expect(queryByTestId("categories-linear-progress")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(queryByTestId("categories-linear-progress")).not.toBeInTheDocument();
            for (let c of mockCategories) {
                expect(getByText(c.name)).toBeInTheDocument();
            }
        });
    });
});
