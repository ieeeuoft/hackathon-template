import React from "react";
import EditTeam from "./EditTeam";
import { mockCartItems, mockCategories, mockHardware } from "testing/mockData";
import {
    render,
    fireEvent,
    waitFor,
    makeStoreWithEntities,
    promiseResolveWithDelay,
    when,
    makeMockApiResponse,
} from "testing/utils";
import { makeStore } from "slices/store";
import { cartSelectors } from "slices/hardware/cartSlice";
import { SnackbarProvider } from "notistack";
import SnackbarNotifier from "components/general/SnackbarNotifier/SnackbarNotifier";
import { get } from "api/api";
import { getUpdatedHardwareDetails } from "slices/hardware/hardwareSlice";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<EditTeam />", () => {
    test("The team code is correctly displayed", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });

        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={false} teamSize={1} />,
            {
                store,
            }
        );

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("ABCDE")).toBeInTheDocument();
    });

    test("Both buttons are disabled when canChangeTeam is false", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={false} teamSize={1} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).toBeDisabled();

        const button_leave_team = getByText("LEAVE TEAM").closest("button");
        expect(button_leave_team).toBeDisabled();
    });

    test("Both buttons are not disabled when canChangeTeam is true", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={true} teamSize={1} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).not.toBeDisabled();

        const button_leave_team = getByText("LEAVE TEAM").closest("button");
        expect(button_leave_team).not.toBeDisabled();
    });
});
