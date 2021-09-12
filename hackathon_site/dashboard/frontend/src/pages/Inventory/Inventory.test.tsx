import React from "react";

import { render, waitFor } from "testing/utils";

import Inventory from "pages/Inventory/Inventory";
import { mockHardware } from "testing/mockData";

import { get } from "api/api";
import { APIListResponse, Hardware } from "api/types";
import { AxiosResponse } from "axios";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

const hardwareUri = "/api/hardware/hardware/";

describe("Inventory Page", () => {
    it("Clears filters and fetches fresh data on load", () => {
        render(<Inventory />);

        expect(get).toHaveBeenCalledWith(hardwareUri, {});
    });

    it("Has necessary page elements", async () => {
        // Mock inventory data to make sure the inventory grid is being rendered
        const apiResponse: APIListResponse<Hardware> = {
            count: mockHardware.length,
            results: mockHardware,
            next: null,
            previous: null,
        };

        mockedGet.mockResolvedValue({ data: apiResponse } as AxiosResponse);

        const { getByText } = render(<Inventory />);

        await waitFor(() => {
            expect(getByText(mockHardware[0].name)).toBeInTheDocument();
        });

        expect(getByText(/load more/i)).toBeInTheDocument();
    });
});
