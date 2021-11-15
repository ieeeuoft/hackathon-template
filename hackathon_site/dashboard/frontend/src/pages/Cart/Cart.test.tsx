import React from "react";

import {
    render,
    makeStoreWithEntities,
    waitFor,
    promiseResolveWithDelay,
    makeMockApiListResponse,
} from "testing/utils";
import { mockCartItems, mockHardware } from "testing/mockData";
import { get } from "api/api";

import Cart from "pages/Cart/Cart";
import { Hardware } from "api/types";

jest.mock("api/api");
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("Cart Page", () => {
    test("Cart items and Cart Summary card appears", async () => {
        // TODO: Cart page currently loads all of mockCartItems. Update this test once
        // the page pulls items from redux.
        const store = makeStoreWithEntities({ hardware: mockHardware });

        const { getByText } = render(<Cart />, { store });

        await waitFor(() => {
            for (let e of mockCartItems) {
                const hardware = mockHardware.find((h) => h.id === e.hardware_id)!;
                expect(getByText(hardware.name)).toBeInTheDocument();
            }
        });

        expect(getByText("Cart Summary")).toBeInTheDocument();
    });

    it("Fetches any missing hardware on load", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware.filter(
                (hardware) => hardware.id === mockCartItems[0].hardware_id
            ),
        });

        const hardwareIdsToFetch = new Set(
            mockCartItems.slice(1).map((item) => item.hardware_id)
        );
        const hardwareToFetch = mockHardware.filter((hardware) =>
            hardwareIdsToFetch.has(hardware.id)
        );
        const response = makeMockApiListResponse<Hardware>(hardwareToFetch);

        mockedGet.mockReturnValue(promiseResolveWithDelay(response));

        const { queryByTestId, getByText } = render(<Cart />, { store });

        // At first, there should be a loading bar for the missing hardware
        await waitFor(() => {
            expect(queryByTestId("cart-linear-progress")).toBeInTheDocument();
        });

        // Then, the hardware should be there
        await waitFor(() => {
            expect(queryByTestId("cart-linear-progress")).not.toBeInTheDocument();

            for (let e of mockCartItems) {
                const hardware = mockHardware.find((h) => h.id === e.hardware_id)!;

                expect(getByText(hardware.name)).toBeInTheDocument();
            }
        });

        expect(mockedGet).toHaveBeenCalledWith("/api/hardware/hardware/", {
            hardware_ids: Array.from(hardwareIdsToFetch),
        });
    });
});
