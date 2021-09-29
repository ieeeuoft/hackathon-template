import React from "react";

import { makeMockApiListResponse, render, waitFor, when } from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockCategories, mockHardware } from "testing/mockData";

import { get } from "api/api";
import { within } from "@testing-library/react";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";

describe("Inventory Page", () => {
    it("Clears filters and fetches fresh data on load", () => {
        render(<Inventory />);

        expect(get).toHaveBeenCalledWith(hardwareUri, {});
        expect(get).toHaveBeenCalledWith(categoriesUri);
    });

    it("Has necessary page elements", async () => {
        // Mock inventory data to make sure the inventory grid and filters
        // are being rendered
        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri)
            .mockResolvedValue(categoryApiResponse);

        const { getByText, queryByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(getByText(mockCategories[0].name)).toBeInTheDocument();
        });

        // by default the hardwareUri has a limit of 100
        if (mockHardware.length <= 100) {
            expect(queryByText(/load more/i)).not.toBeInTheDocument();
        } else {
            expect(getByText(/load more/i)).toBeInTheDocument();
        }
    });

    test("Hardware count", async () => {
        // Mock hardware api response with a limit of mockHardware.length - 2
        const limit = mockHardware.length - 2;
        const hardwareApiResponse = makeMockApiListResponse(
            mockHardware.slice(0, limit),
            null,
            null,
            mockHardware.length
        );

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);

        const { getByText, getByTestId } = render(<Inventory />);
        const { getByText: getTotalCountText } = within(
            getByTestId("inventory-total-count")
        );

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });

        expect(getTotalCountText(`${mockHardware.length} items`)).toBeInTheDocument();
        expect(
            getByText(`SHOWING ${limit} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();
        expect(getByText(/load more/i)).toBeInTheDocument();
    });
});
