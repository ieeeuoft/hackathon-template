import React from "react";
import { render } from "@testing-library/react";

import InventoryGrid from "components/inventory/InventoryGrid/InventoryGrid";
import { withStore } from "testing/utils";
import { get, AxiosResponse } from "api/api";
import { mockHardware } from "testing/mockData";
import { APIListResponse, Hardware } from "api/types";
import { AppDispatch, makeStore, RootStore } from "slices/store";
import { getHardwareWithFilters } from "slices/hardware/hardwareSlice";
import { logout } from "slices/users/userSlice";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<InventoryGrid />", () => {
    it("Displays a message when no items found", () => {
        const { getByText } = render(withStore(<InventoryGrid />));

        expect(getByText(/no items found/i)).toBeInTheDocument();
    });

    it("Renders all hardware from the store", () => {
        // To populate the store, dispatch a thunk while mocking the API response
        const apiResponse: APIListResponse<Hardware> = {
            count: mockHardware.length,
            results: mockHardware,
            next: null,
            previous: null,
        };

        mockedGet.mockResolvedValue({ data: apiResponse } as AxiosResponse<
            typeof apiResponse
        >);

        const store = makeStore();
        const dispatch = store.dispatch;
        const action = logout();
        dispatch(action);
    });
});
