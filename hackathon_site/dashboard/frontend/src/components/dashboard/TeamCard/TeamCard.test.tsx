import React from "react";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import { render, makeStoreWithEntities, waitFor } from "testing/utils";
import "@testing-library/jest-dom/extend-expect";
import { mockTeam } from "testing/mockData";
import { fireEvent } from "@testing-library/react";

describe("TeamCard", () => {
    test("Calls handleEditTeam when the edit button is clicked", async () => {
        const handleEditTeamSpy = jest.fn();

        const store = makeStoreWithEntities({
            team: {
                team: mockTeam,
            },
        });
        const { getByText, getByTestId } = render(
            <TeamCard handleEditTeam={handleEditTeamSpy} />,
            {
                store,
            }
        );
        await waitFor(() => {
            expect(getByTestId("teamCardBtn")).toBeInTheDocument();
        });

        const thebutton = getByText("Edit");
        fireEvent.click(thebutton);

        await waitFor(() => {
            expect(handleEditTeamSpy).toHaveBeenCalled();
        });
    });
});
