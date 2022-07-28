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
            .calledWith("/api/event/teams/1/")
            .mockResolvedValue(teamInfoApiResponse);

        const { getByText, queryByTestId, getAllByRole } = render(<TeamInfoTable />);

        const firstNames = mockTeam.profiles.map((user) => {
            return user.user.first_name;
        });
        const lastNames = mockTeam.profiles.map((user) => {
            return user.user.last_name;
        });
        const emails = mockTeam.profiles.map((user) => {
            return user.user.email;
        });
        let numIdsProvided = 0;
        mockTeam.profiles.forEach((user) => {
            if (user.id_provided) numIdsProvided++;
        });

        await waitFor(() => {
            expect(queryByTestId("team-info-linear-progress")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/event/teams/1/");
        });

        let numChecked = 0;
        const checkboxesActual = getAllByRole("checkbox");
        checkboxesActual.forEach((element) => {
            if (element.classList.contains("Mui-checked")) numChecked++;
        });

        expect(getByText("Team info")).toBeInTheDocument();
        firstNames.forEach((firstName) => {
            expect(getByText(firstName)).toBeInTheDocument;
        });
        lastNames.forEach((lastName) => {
            expect(getByText(lastName)).toBeInTheDocument;
        });
        emails.forEach((email) => {
            expect(getByText(email)).toBeInTheDocument;
        });
        expect(numIdsProvided).toEqual(numChecked);
    });
});
