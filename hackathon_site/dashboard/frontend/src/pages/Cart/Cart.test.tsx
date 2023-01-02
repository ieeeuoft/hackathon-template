import React from "react";

import {
    render,
    makeStoreWithEntities,
    waitFor,
    promiseResolveWithDelay,
    makeMockApiListResponse,
    fireEvent,
    within,
} from "testing/utils";
import { mockCartItems, mockHardware, mockValidTeam } from "testing/mockData";
import { get, post } from "api/api";

import Cart from "pages/Cart/Cart";
import { Hardware } from "api/types";
import { addToCart, cartSelectors, OrderResponse } from "slices/hardware/cartSlice";
import { AxiosResponse } from "axios";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;
const mockedGet = get as jest.MockedFunction<typeof get>;

const mockHardwareSignOutStartDate = jest.fn();
const mockHardwareSignOutEndDate = jest.fn();
jest.mock("constants.js", () => ({
    get hardwareSignOutStartDate() {
        return mockHardwareSignOutStartDate();
    },
    get hardwareSignOutEndDate() {
        return mockHardwareSignOutEndDate();
    },
    get minTeamSize() {
        return 2;
    },
    get maxTeamSize() {
        return 4;
    },
}));

describe("Cart Page", () => {
    test("Cart items from store and Cart Summary card appears", async () => {
        const store = makeStoreWithEntities({ hardware: mockHardware });
        mockCartItems.forEach((item) => {
            store.dispatch(addToCart(item));
        });

        const { getByText } = render(<Cart />, { store });

        await waitFor(() => {
            for (let e of mockCartItems) {
                const hardware = mockHardware.find((h) => h.id === e.hardware_id)!;
                expect(getByText(hardware.name)).toBeInTheDocument();
            }
        });

        expect(getByText("Cart Summary")).toBeInTheDocument();
        const expectedQuantity = mockCartItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        expect(getByText(expectedQuantity)).toBeInTheDocument();
    });

    it("Fetches any missing hardware on load", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware.filter(
                (hardware) => hardware.id === mockCartItems[0].hardware_id
            ),
        });
        mockCartItems.forEach((item) => {
            store.dispatch(addToCart(item));
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

    test("No items in the cart", async () => {
        const store = makeStoreWithEntities({ hardware: mockHardware });

        const { getByText } = render(<Cart />, { store });

        expect(getByText(/no items in cart/i)).toBeInTheDocument();
        // Test for quantity
        expect(getByText(0)).toBeInTheDocument();
    });

    test("removeFromCart button", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
        });

        const { getByTestId, queryByText, getByText } = render(<Cart />, {
            store,
        });

        const removeButton = within(
            getByTestId("cart-item-" + mockCartItems[2].hardware_id.toString())
        ).getByTestId("remove-cart-item");

        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(queryByText(mockHardware[2].name)).not.toBeInTheDocument();
            expect(getByText(mockHardware[1].name)).toBeInTheDocument();
        });
    });

    test("updateCart action", async () => {
        const quantityToBeSelected = "1";

        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
        });

        const { getByText, getByTestId } = render(<Cart />, {
            store,
        });

        // click the select
        const card = getByTestId(`cart-item-${mockCartItems[0].hardware_id}`);
        const quantityDropdown = within(card).getByLabelText("Quantity");

        fireEvent.mouseDown(quantityDropdown);

        // select the quantity
        const quantitySelected = getByText(quantityToBeSelected);
        fireEvent.click(quantitySelected);

        await waitFor(() => {
            expect(getByTestId("cart-quantity-total")).toHaveTextContent("4");
            expect(quantityDropdown).toHaveTextContent(quantityToBeSelected);
            expect(quantityDropdown).not.toHaveTextContent("3");
        });
    });

    test("Checks for POST and updates store", async () => {
        // checks all mock cart items
        const orderResponse: AxiosResponse<OrderResponse> = {
            config: {},
            headers: {},
            status: 200,
            statusText: "OK",
            data: {
                order_id: 1,
                hardware: [
                    {
                        hardware_id: 1,
                        quantity_fulfilled: 3,
                    },
                    {
                        hardware_id: 2,
                        quantity_fulfilled: 1,
                    },
                    {
                        hardware_id: 3,
                        quantity_fulfilled: 2,
                    },
                ],
                errors: [],
            },
        };
        mockedPost.mockResolvedValueOnce(orderResponse);

        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
            team: { team: mockValidTeam },
        });

        const { getByTestId, queryByTestId } = render(<Cart />, { store });

        mockCartItems.forEach((cartItem) => {
            expect(
                getByTestId("cart-item-" + cartItem.hardware_id.toString())
            ).toBeInTheDocument();
        });

        const submitOrderBtn = getByTestId("submit-order-button");
        fireEvent.click(submitOrderBtn);

        await waitFor(() => {
            expect(mockedPost).toBeCalledWith("/api/hardware/orders/", {
                hardware: [
                    {
                        id: 1,
                        quantity: 3,
                    },
                    {
                        id: 2,
                        quantity: 1,
                    },
                    {
                        id: 3,
                        quantity: 2,
                    },
                ],
            });
            // Cart should be empty when the order is submitted
            const cartItems = cartSelectors.selectAll(store.getState());
            expect(cartItems).toEqual([]);

            // test if each cart item is missing
            mockCartItems.forEach((cartItem) => {
                expect(
                    queryByTestId("cart-item-" + cartItem.hardware_id.toString())
                ).not.toBeInTheDocument();
            });
            expect(getByTestId("cart-quantity-total")).toHaveTextContent("0");
        });
    });

    test("Checks if submit order button is disabled when cart is empty", async () => {
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            team: { team: mockValidTeam },
        });

        const { getByTestId } = render(<Cart />, { store });

        const submitOrderBtn = getByTestId("submit-order-button");
        expect(submitOrderBtn).toBeDisabled();
    });
});
