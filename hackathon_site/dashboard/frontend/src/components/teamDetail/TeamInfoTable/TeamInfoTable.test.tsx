import React from "react";
import { makeMockApiResponse, queryByTestId, render, when } from "testing/utils";
import { mockTeam } from "testing/mockData";
import { get } from "api/api";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import { makeStore } from "slices/store";
import { getTeamInfoData } from "slices/event/teamDetailSlice";
import userEvent from "@testing-library/user-event";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

describe("Team info table", () => {
    it("Renders team info table", async () => {
        const teamInfoApiResponse = makeMockApiResponse(mockTeam);

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeam.id}/`)
            .mockResolvedValue(teamInfoApiResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.id.toString()));

        const { getByText, queryAllByTestId } = render(<TeamInfoTable />, {
            store,
        });

        const checkboxes = queryAllByTestId("checkbox");

        mockTeam.profiles.forEach((user, index) => {
            expect(
                getByText(`${user.user.first_name} ${user.user.last_name}`)
            ).toBeInTheDocument();
            expect(getByText(user.user.email)).toBeInTheDocument();
            if (user.id_provided) {
                expect(
                    checkboxes[index].classList.contains("Mui-checked")
                ).toBeTruthy();
            } else {
                expect(checkboxes[index].classList.contains("Mui-checked")).toBeFalsy();
            }
        });
    });
    it("updates checkbox on click", async () => {
        // NOTE: this test relies on at least one checkbox being rendered, so at least one profile in mockTeam
        // setup and render teamInfoTable
        const teamInfoApiResponse = makeMockApiResponse(mockTeam);

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeam.id}/`)
            .mockResolvedValue(teamInfoApiResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.id.toString()));

        const { getByText, queryByTestId } = render(<TeamInfoTable />, {
            store,
        });

        let checkbox = queryByTestId("checkbox");
        if (!checkbox) return false;
        checkbox = checkbox.querySelector('input[type="checkbox"]');
        if (!checkbox) return false;
        // @ts-ignore
        const checkedBefore = checkbox.checked;

        // click checkbox, expect it to now be checked
        checkbox = queryByTestId("checkbox");
        if (!checkbox) return false;
        userEvent.click(checkbox);
        checkbox = checkbox.querySelector('input[type="checkbox"]');
        if (!checkbox) return false;
        if (checkedBefore) {
            // @ts-ignore
            expect(checkbox.cheked).toBeTruthy();
        } else {
            // @ts-ignore
            expect(checkbox.checked).toBeFalsy();
        }
    });
});
