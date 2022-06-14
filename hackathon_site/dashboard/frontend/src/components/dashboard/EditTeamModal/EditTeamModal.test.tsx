import React from "react";
import EditTeamModal from "./EditTeamModal";
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

describe("<EditTeamModal />", () => {
    test("The team code is correctly displayed", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isTeamModalVisible: true,
                },
            },
        });

        const { getByText } = render(
            <EditTeamModal teamCode={"ABCDE"} canChangeTeam={false} />,
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
                    isTeamModalVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeamModal teamCode={"ABCDE"} canChangeTeam={false} />,
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
                    isTeamModalVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeamModal teamCode={"ABCDE"} canChangeTeam={true} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).not.toBeDisabled();

        const button_leave_team = getByText("LEAVE TEAM").closest("button");
        expect(button_leave_team).not.toBeDisabled();
    });

    // test("Whether the copy function works or not", async () => {
    //     const store = makeStoreWithEntities({
    //         ui: {
    //             dashboard: {
    //                 isTeamModalVisible: true,
    //             },
    //         },
    //     });
    //     const { getByText } = render(
    //         <EditTeamModal teamCode={"ABCDE"} canChangeTeam={true} />,
    //         {
    //             store,
    //         }
    //     );
    //
    //     const button = getByText("Copy");
    //
    //     await waitFor(() => {
    //         fireEvent.click(button);
    //     });
    //     let text = navigator.clipboard.readText();
    //     expect(text).toEqual("ABCDE");
    // });
});
