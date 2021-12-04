import React from "react";
import Dashboard from "pages/Dashboard/Dashboard";

import { makeMockApiListResponse, render, waitFor, when } from "testing/utils";
import {
    cardItems,
    mockCategories,
    mockCheckedOutOrders,
    mockHardware,
} from "testing/mockData";
import { get } from "api/api";
import { fireEvent, within } from "@testing-library/react";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";

it("Renders correctly when the dashboard appears 4 cards and 3 tables", () => {
    const { queryByText, getByText } = render(<Dashboard />);
    for (let e of cardItems) {
        expect(queryByText(e.title)).toBeTruthy();
    }
    expect(getByText("Checked out items")).toBeInTheDocument();
    expect(getByText("Pending Orders")).toBeInTheDocument();
    // TODO: add check for returned items and broken items when those are ready
});

it("Opens Product Overview with the correct hardware information", async () => {
    const hardwareApiResponse = makeMockApiListResponse(mockHardware);
    const categoryApiResponse = makeMockApiListResponse(mockCategories);

    when(mockedGet).calledWith(hardwareUri, {}).mockResolvedValue(hardwareApiResponse);
    when(mockedGet).calledWith(categoriesUri).mockResolvedValue(categoryApiResponse);

    const { getByTestId, getByText } = render(<Dashboard />);

    const hardware = mockHardware.find(
        ({ id }) => id === mockCheckedOutOrders[0].hardware[0].id
    );
    const category = mockCategories.find(({ id }) => id === hardware?.categories[0]);

    if (hardware && category) {
        const infoButton = within(
            getByTestId(
                `checked-out-hardware-${hardware.id}-${mockCheckedOutOrders[0].id}`
            )
        ).getByTestId("info-button");
        fireEvent.click(infoButton);

        await waitFor(() => {
            expect(getByText("Product Overview")).toBeVisible();
            expect(
                getByText(`- Max ${hardware.max_per_team} of this item`)
            ).toBeInTheDocument();
            expect(
                getByText(
                    `- Max ${mockCategories[0].max_per_team} of items under category ${mockCategories[0].name}`
                )
            ).toBeInTheDocument();
            expect(getByText(hardware.model_number)).toBeInTheDocument();
            expect(getByText(hardware.manufacturer)).toBeInTheDocument();
            expect(getByText(hardware.notes)).toBeInTheDocument();
        });
    }
});
