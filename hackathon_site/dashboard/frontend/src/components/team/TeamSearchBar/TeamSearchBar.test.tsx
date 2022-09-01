import { DeepPartial } from "redux";
import { mockTeams } from "testing/mockData";

import {
    render,
    fireEvent,
    waitFor,
    when,
    getAllByLabelText,
    makeMockApiListResponse,
    getByText,
} from "testing/utils";

import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";
import { get } from "api/api";
import { NUM_TEAM_LIMIT } from "slices/event/teamAdminSlice";

jest.mock("api/api");

const teamsUri = "/api/event/teams/";
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("<TeamSearchBar />", () => {
    it("Submits search query", async () => {
        const teamsApiResponse = makeMockApiListResponse(mockTeams);

        when(mockedGet)
            .calledWith(teamsUri, { limit: NUM_TEAM_LIMIT })
            .mockResolvedValue(teamsApiResponse);

        const { getByLabelText } = render(<TeamSearchBar />);
        const input = getByLabelText(/search items/i);

        fireEvent.change(input, { target: { value: "A48E5" } });
        fireEvent.submit(input);

        const expectedFilters = {
            limit: NUM_TEAM_LIMIT,
            search: "A48E5",
        };

        await waitFor(() => {
            expect(get).toHaveBeenCalledWith(teamsUri, expectedFilters);
        });
    });
});
