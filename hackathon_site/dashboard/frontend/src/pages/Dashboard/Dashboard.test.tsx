import React from "react";
import Dashboard from "pages/Dashboard/Dashboard";

import {
    makeMockApiListResponse,
    render,
    waitFor,
    when,
    fireEvent,
    within,
    makeStoreWithEntities,
    promiseResolveWithDelay,
} from "testing/utils";
import {
    cardItems,
    members,
    mockCartItems,
    mockCategories,
    mockCheckedOutOrders,
    mockHardware,
    mockPendingOrders,
    mockTeam,
    mockUser,
} from "testing/mockData";
import { get } from "api/api";
import { AxiosResponse } from "axios";
import { Team } from "../../api/types";
import { makeStore } from "../../slices/store";
import { getCurrentTeam, teamReducerName } from "../../slices/event/teamSlice";
import { getByTestId } from "@testing-library/react";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";
const categoriesUri = "/api/hardware/categories/";
const teamUri = "/api/event/teams/team/";

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

    const allOrders = mockPendingOrders.concat(mockCheckedOutOrders);
    const hardware_ids = allOrders.flatMap((order) =>
        order.items.map((item) => item.hardware_id)
    );
    when(mockedGet)
        .calledWith(hardwareUri, { hardware_ids })
        .mockResolvedValue(hardwareApiResponse);
    when(mockedGet).calledWith(categoriesUri).mockResolvedValue(categoryApiResponse);

    const { getByTestId, getByText } = render(<Dashboard />);

    const hardware = mockHardware.find(
        ({ id }) => id === mockCheckedOutOrders[0].items[0].hardware_id
    );
    const category = mockCategories.find(({ id }) => id === hardware?.categories[0]);
    // expect(getByText(mockUser.last_name)).toBeInTheDocument();

    if (hardware && category) {
        await waitFor(() => {
            const infoButton = within(
                getByTestId(
                    `checked-out-hardware-${hardware.id}-${mockCheckedOutOrders[0].id}`
                )
            ).getByTestId("info-button");
            fireEvent.click(infoButton);
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
            //
        });
    }
});

it("get info on the current team", async () => {
    const response = { data: mockTeam } as AxiosResponse<Team>;
    if (response === null) {
        return null;
    }
    mockedGet.mockResolvedValueOnce(response);
    const store = makeStore({ team: mockTeam });
    store.dispatch(getCurrentTeam());

    const { getByText, getByTestId, queryByTestId } = render(<Dashboard />, { store });
    await waitFor(() => {
        expect(queryByTestId("cart-linear-progress")).toBeInTheDocument();
    });
    await waitFor(() => {
        expect(getByTestId("teamCard")).toHaveTextContent(mockUser.first_name);
    });
});
