import React from "react";

import { makeMockApiListResponse, render, waitFor } from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockHardware } from "testing/mockData";

import { get } from "api/api";
import InventoryFilter from "components/inventory/InventoryFilter/InventoryFilter";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";

describe("Inventory Page", () => {
    it("Clears filters and fetches fresh data on load", () => {
        render(<Inventory />);

        expect(get).toHaveBeenCalledWith(hardwareUri, {});
    });

    it("Has necessary page elements", async () => {
        // Mock inventory data to make sure the inventory grid is being rendered
        const apiResponse = makeMockApiListResponse(mockHardware);

        mockedGet.mockResolvedValue(apiResponse);

        const { getByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });

        expect(getByText(/load more/i)).toBeInTheDocument();
    });

    it("Displays an error when fetching hardware fails", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "Something went wrong",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const { getByText } = render(<InventoryFilter />);

        await waitFor(() => {
            expect(
                getByText("Failed to fetch hardware data: Error 500")
            ).toBeInTheDocument();
        });
    });
});
