import { render, fireEvent, waitFor } from "testing/utils";

import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";
import { get } from "api/api";
import { NUM_TEAM_LIMIT } from "slices/event/teamAdminSlice";
import React from "react";

jest.mock("api/api");

const teamsUri = "/api/event/teams/";

describe("<TeamSearchBar />", () => {
    it("Submits search query", async () => {
        const { getByLabelText } = render(<TeamSearchBar />);

        const input = getByLabelText(/search teams/i);

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters = {
            search: "foobar",
            limit: NUM_TEAM_LIMIT,
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
        });
    });

    it("Submits search query when clicking search button", async () => {
        const { getByLabelText, getByTestId } = render(<TeamSearchBar />);

        const input = getByLabelText(/search teams/i);
        const searchButton = getByTestId("search-button");

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.click(searchButton);

        const expectedFilters = {
            search: "foobar",
            limit: NUM_TEAM_LIMIT,
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
        });
    });

    it("Submits search query when clicking Enter key", async () => {
        const { getByLabelText } = render(<TeamSearchBar />);

        const input = getByLabelText(/search teams/i);

        fireEvent.change(input, { target: { value: "foobar" } });
        fireEvent.submit(input);

        const expectedFilters = {
            search: "foobar",
            limit: NUM_TEAM_LIMIT,
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
        });
    });
});
