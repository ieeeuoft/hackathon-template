import React from "react";

import {
    makeMockApiListResponse,
    render,
    waitFor,
    when,
    fireEvent,
    promiseResolveWithDelay,
    makeMockApiResponse,
} from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockCategories, mockHardware } from "testing/mockData";

import { get, stripHostnameReturnFilters } from "api/api";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";

describe("Inventory Page", () => {
    it("Clears filters and fetches fresh data on load", () => {
        render(<Inventory />);

        expect(get).toHaveBeenCalledWith(hardwareUri, {});
        expect(get).toHaveBeenCalledWith(categoriesUri, {});
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
            .calledWith(categoriesUri, {})
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
            .calledWith(categoriesUri, {})
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
            .calledWith(categoriesUri, {})
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

    it("Displays a message when no items are found", async () => {
        // Mock hardware api response
        const hardwareApiResponse = makeMockApiListResponse([]);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);

        const { getByText, queryByTestId } = render(<Inventory />);

        expect(queryByTestId("inventoryCountDivider")).not.toBeInTheDocument();
        expect(getByText(/loading/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(getByText(/no items found/i)).toBeInTheDocument();
        });
    });

    it("Shows product overview when hardware item is clicked", async () => {
        const hardwareDetailUri = "/api/hardware/hardware/1/";
        const newHardwareData = {
            ...mockHardware[0],
            name: "Randome hardware",
            model_number: "90",
            manufacturer: "Tesla",
            datasheet: "",
            quantity_available: 5,
            max_per_team: 6,
            picture: "https://example.com/datasheet",
            categories: [2],
            quantity_remaining: 10,
            notes: "notes on temp",
        };

        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const categoryApiResponse = makeMockApiListResponse(mockCategories);
        const hardwareDetailApiResponse = makeMockApiResponse(newHardwareData);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);
        when(mockedGet)
            .calledWith(hardwareDetailUri)
            .mockResolvedValue(hardwareDetailApiResponse);

        const { getByText } = render(<Inventory />);

        await waitFor(() => {
            mockHardware.forEach((hardware) =>
                expect(getByText(hardware.name)).toBeInTheDocument()
            );
        });

        fireEvent.click(getByText(mockHardware[0].name));

        await waitFor(() => {
            expect(get).toHaveBeenNthCalledWith(3, hardwareDetailUri);
            expect(getByText("Product Overview")).toBeVisible();
            expect(
                getByText(`- Max ${newHardwareData.max_per_team} of this item`)
            ).toBeInTheDocument();
            expect(
                getByText(
                    `- Max ${mockCategories[1].max_per_team} of items under category ${mockCategories[1].name}`
                )
            ).toBeInTheDocument();
            expect(getByText(newHardwareData.model_number)).toBeInTheDocument();
            expect(getByText(newHardwareData.manufacturer)).toBeInTheDocument();
            expect(getByText(newHardwareData.notes)).toBeInTheDocument();
        });
    });

    it("Loads more hardware", async () => {
        // Mock hardware api response with a limit of mockHardware.length - 2
        const limit = mockHardware.length - 2;
        const nextURL = `http://localhost:8000${hardwareUri}?offset=${limit}`;
        const hardwareApiResponse = makeMockApiListResponse(
            mockHardware.slice(0, limit),
            nextURL,
            null,
            mockHardware.length
        );
        const hardwareNextApiResponse = makeMockApiListResponse(
            mockHardware.slice(limit),
            null,
            hardwareUri,
            mockHardware.length
        );
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        const { path, filters } = stripHostnameReturnFilters(nextURL);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(path, filters)
            .mockResolvedValue(hardwareNextApiResponse);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);

        const { getByText, queryByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(queryByText(mockHardware[limit].name)).not.toBeInTheDocument();
        });
        expect(
            getByText(`SHOWING ${limit} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();

        fireEvent.click(getByText(/load more/i));
        await waitFor(() => {
            mockHardware
                .slice(limit)
                .forEach((hardware) =>
                    expect(getByText(hardware.name)).toBeInTheDocument()
                );
        });
        expect(
            getByText(`SHOWING ${mockHardware.length} OF ${mockHardware.length} ITEMS`)
        ).toBeInTheDocument();
    });

    it("Can refresh hardware", async () => {
        const hardwareApiResponse = makeMockApiListResponse(mockHardware);
        const hardwareApiResponseAfterRefresh = makeMockApiListResponse(
            mockHardware.slice(2)
        );
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        // first mocked resolved value is the original hardware response
        // second mock is after refresh
        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValueOnce(hardwareApiResponse)
            .mockResolvedValue(hardwareApiResponseAfterRefresh);
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);

        const { getByText, getByTestId, queryByText } = render(<Inventory />);
        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(getByText(mockCategories[0].name)).toBeInTheDocument();
        });
        expect(getByText(`${mockHardware.length} results`)).toBeInTheDocument();

        fireEvent.click(getByTestId("refreshInventory"));
        await waitFor(() => {
            expect(queryByText(mockHardware[0].name)).not.toBeInTheDocument();
            expect(queryByText(mockHardware[1].name)).not.toBeInTheDocument();
            expect(getByText(mockHardware[2].name)).toBeInTheDocument();
        });
        expect(getByText(`${mockHardware.length - 2} results`)).toBeInTheDocument();
    });

    it("Renders loading icon on load more button, then displays hardware", async () => {
        const limit = mockHardware.length - 2;
        const nextURL = `http://localhost:8000${hardwareUri}?offset=${limit}`;
        const hardwareApiResponse = makeMockApiListResponse(
            mockHardware.slice(0, limit),
            nextURL,
            null,
            mockHardware.length
        );
        const hardwareNextApiResponse = makeMockApiListResponse(
            mockHardware.slice(limit),
            null,
            hardwareUri,
            mockHardware.length
        );
        const categoryApiResponse = makeMockApiListResponse(mockCategories);

        const { path, filters } = stripHostnameReturnFilters(nextURL);

        when(mockedGet)
            .calledWith(hardwareUri, {})
            .mockResolvedValue(hardwareApiResponse);
        when(mockedGet)
            .calledWith(path, filters)
            .mockReturnValue(promiseResolveWithDelay(hardwareNextApiResponse, 500));
        when(mockedGet)
            .calledWith(categoriesUri, {})
            .mockResolvedValue(categoryApiResponse);

        const { getByText, queryByText, queryByTestId } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
            expect(queryByText(mockHardware[limit].name)).not.toBeInTheDocument();
        });

        fireEvent.click(getByText(/load more/i));

        await waitFor(() => {
            expect(
                queryByTestId("load-more-hardware-circular-progress")
            ).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(
                queryByTestId("load-more-hardware-circular-progress")
            ).not.toBeInTheDocument();
            for (let hardware of mockHardware) {
                expect(getByText(hardware.name)).toBeInTheDocument();
            }
        });
    });
});
