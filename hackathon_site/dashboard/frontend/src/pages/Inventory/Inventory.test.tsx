import React from "react";

import { makeMockApiListResponse, render, waitFor, when } from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockCategories, mockHardware } from "testing/mockData";

import { get } from "api/api";

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

        const { getByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(getByText(mockCategories[0].name)).toBeInTheDocument();
        });

        expect(getByText(/load more/i)).toBeInTheDocument();
    });
});
