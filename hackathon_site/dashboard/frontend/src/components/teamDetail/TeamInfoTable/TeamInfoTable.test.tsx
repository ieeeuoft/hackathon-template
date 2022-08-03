import React from "react";
import { makeMockApiResponse, render, waitFor, when } from "testing/utils";
import { mockTeam } from "testing/mockData";
import { get } from "api/api";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import { makeStore } from "slices/store";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

describe("Team info table", () => {
    it("Renders team info table", async () => {
        const teamInfoApiResponse = makeMockApiResponse(mockTeam);

        when(mockedGet)
            .calledWith("/api/event/teams/2/")
            .mockResolvedValue(teamInfoApiResponse);

        const { getByText, queryAllByTestId, queryByTestId, getAllByRole } = render(
            <TeamInfoTable />
        );

        const checkboxes = queryAllByTestId("checkbox");

        mockTeam.profiles.forEach((user, index) => {
            expect(getByText(user.user.first_name)).toBeInTheDocument();
            expect(getByText(user.user.last_name)).toBeInTheDocument();
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
});
