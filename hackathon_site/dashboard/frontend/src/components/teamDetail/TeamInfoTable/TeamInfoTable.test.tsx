import React from "react";
import { makeMockApiResponse, render, when } from "testing/utils";
import { mockProfile, mockTeam } from "testing/mockData";
import { get, patch } from "api/api";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
import { makeStore } from "slices/store";
import { getTeamInfoData } from "slices/event/teamDetailSlice";
import { fireEvent, waitFor } from "@testing-library/react";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    patch: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedPatch = patch as jest.MockedFunction<typeof patch>;

describe("Team info table", () => {
    it("Renders team info table", async () => {
        const teamInfoApiResponse = makeMockApiResponse(mockTeam);

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeam.team_code}/`)
            .mockResolvedValue(teamInfoApiResponse);

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.team_code));

        const { getByText, getByTestId } = render(<TeamInfoTable />, {
            store,
        });

        mockTeam.profiles.forEach((profile, index) => {
            const idProvidedCheckbox = getByTestId(
                `id-provided-check-${profile.id}`
            ).querySelector('input[type="checkbox"]');
            expect(
                getByText(`${profile.user.first_name} ${profile.user.last_name}`)
            ).toBeInTheDocument();
            expect(getByText(profile.user.email)).toBeInTheDocument();
            if (profile.id_provided) {
                expect(idProvidedCheckbox).toBeChecked();
            } else {
                expect(idProvidedCheckbox).not.toBeChecked();
            }
        });
    });

    it("updates checkbox on click", async () => {
        const teamInfoApiResponse = makeMockApiResponse(mockTeam);
        const profile = mockTeam.profiles[0];

        when(mockedGet)
            .calledWith(`/api/event/teams/${mockTeam.team_code}/`)
            .mockResolvedValue(teamInfoApiResponse);
        when(mockedPatch)
            .calledWith(`/api/event/profiles/${profile.id}/`, {
                id_provided: !profile.id_provided,
            })
            .mockResolvedValue(
                makeMockApiResponse({
                    ...mockProfile,
                    id_provided: !profile.id_provided,
                })
            );

        const store = makeStore();
        await store.dispatch(getTeamInfoData(mockTeam.team_code));

        const { getByTestId } = render(<TeamInfoTable />, {
            store,
        });

        const idProvidedCheckbox = getByTestId(
            `id-provided-check-${profile.id}`
        ).querySelector('input[type="checkbox"]');
        expect(idProvidedCheckbox).not.toBeChecked();
        if (idProvidedCheckbox) fireEvent.click(idProvidedCheckbox);
        await waitFor(() => {
            expect(mockedPatch).toHaveBeenCalledWith(
                `/api/event/profiles/${profile.id}/`,
                {
                    id_provided: !profile.id_provided,
                }
            );
            expect(idProvidedCheckbox).toBeChecked();
        });
    });
});
