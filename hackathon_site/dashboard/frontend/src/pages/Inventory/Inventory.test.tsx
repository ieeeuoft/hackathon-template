import React from "react";

import { makeMockApiListResponse, render, waitFor, when } from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockCategories, mockHardware } from "testing/mockData";

import { get } from "api/api";
import { within } from "@testing-library/react";
import InventoryGrid from "../../components/inventory/InventoryGrid/InventoryGrid";

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

        const { getByText, getByTestId } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(getByText(mockCategories[0].name)).toBeInTheDocument();
        });

        expect(getByText(`${mockHardware.length} results`)).toBeInTheDocument();
    });

    it("Shows count and load more button when there is more hardware to fetch", async () => {
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

        const { getByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });

        expect(
            getByText(`SHOWING ${limit} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();
        expect(getByText(/load more/i)).toBeInTheDocument();
    });

    it("Shows count and no load more button when there is no more hardware to fetch", () => {});

    it("Displays a message when no items found", () => {
        const { getByText } = render(<InventoryGrid />);

        expect(getByText(/no items found/i)).toBeInTheDocument();
    });
});
