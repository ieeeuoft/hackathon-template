import React from "react";

import {
    makeMockApiListResponse,
    makeStoreWithEntities,
    render,
    waitFor,
    when,
} from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockCategories, mockHardware } from "testing/mockData";

import { get } from "api/api";
import { fireEvent } from "@testing-library/react";

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
        });

        expect(getByTestId("inventoryCountDivider")).toBeInTheDocument();
        expect(
            getByText(`SHOWING ${limit} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();
        expect(getByText(/load more/i)).toBeInTheDocument();
        expect(getByText(`${mockHardware.length} results`)).toBeInTheDocument();
    });

    it("Shows count and no load more button when there is no more hardware to fetch", async () => {
        // Mock hardware api response
        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri)
            .mockResolvedValue(categoryApiResponse);

        const { getByText, queryByText, getByTestId } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });

        expect(getByTestId("inventoryCountDivider")).toBeInTheDocument();
        expect(
            getByText(`SHOWING ${mockHardware.length} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();
        expect(queryByText(/load more/i)).not.toBeInTheDocument();
        expect(getByText(`${mockHardware.length} results`)).toBeInTheDocument();
    });

    it("Displays a message when no items are found", () => {
        const { getByText, queryByTestId } = render(<Inventory />);

        expect(queryByTestId("inventoryCountDivider")).not.toBeInTheDocument();
        expect(getByText(/no items found/i)).toBeInTheDocument();
    });

    it("Shows product overview when hardware item is clicked", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            categories: mockCategories,
        });

        const { getByText } = render(<Inventory />, { store });

        await waitFor(() => {
            mockHardware.forEach((hardware) =>
                expect(getByText(hardware.name)).toBeInTheDocument()
            );
        });

        fireEvent.click(getByText(mockHardware[0].name));

        expect(getByText("Product Overview")).toBeVisible();
        expect(
            getByText(`- Max ${mockHardware[0].max_per_team} of this item`)
        ).toBeInTheDocument();
        expect(
            getByText(
                `- Max ${mockCategories[0].max_per_team} of items under category ${mockCategories[0].name}`
            )
        ).toBeInTheDocument();
        expect(getByText(mockHardware[0].model_number)).toBeInTheDocument();
        expect(getByText(mockHardware[0].manufacturer)).toBeInTheDocument();
        expect(getByText(mockHardware[0].notes)).toBeInTheDocument();
    });
});
