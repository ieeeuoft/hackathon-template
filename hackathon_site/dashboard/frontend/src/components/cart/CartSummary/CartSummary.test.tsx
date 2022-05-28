import React from "react";
import CartSummary from "components/cart/CartSummary/CartSummary";
import {
    cartQuantity,
    mockCartItems,
    mockHardware,
    mockValidTeam,
} from "testing/mockData";
import store from "slices/store";
import { Provider } from "react-redux";
import {
    render,
    waitFor,
    fireEvent,
    makeStoreWithEntities,
    promiseResolveWithDelay,
    when,
} from "testing/utils";
import { get, post } from "api/api";
import { AxiosResponse } from "axios";
import { Team } from "api/types";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
    get: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;
const mockedGet = get as jest.MockedFunction<typeof get>;

describe("Render cartQuantity", () => {
    it(`Renders correctly when it reads the number ${cartQuantity}`, async () => {
        const { getByText } = render(
            <Provider store={store}>
                <CartSummary />
            </Provider>
        );
        await waitFor(() => {
            expect(getByText(cartQuantity.toString())).toBeInTheDocument();
        });
    });
    it("Renders loading icon and disables submit button on submission", async () => {
        const response = { data: mockValidTeam } as AxiosResponse<Team>;
        when(mockedGet)
            .calledWith("/api/event/teams/team/")
            .mockResolvedValue(response);

        when(mockedPost)
            .calledWith("/api/hardware/orders/")
            .mockReturnValue(
                promiseResolveWithDelay(
                    {
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
                    },
                    500
                )
            );

        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
            // team: mockValidTeam,
        });

        const { getByText, getByTestId, queryByTestId } = render(<CartSummary />, {
            store,
        });

        fireEvent.click(getByText(/submit order/i));

        await waitFor(() => {
            expect(getByTestId("order-loading-icon")).toBeInTheDocument();
            expect(getByTestId("submit-order-button")).toBeDisabled();
        });

        await waitFor(() => {
            expect(queryByTestId("order-loading-icon")).not.toBeInTheDocument();
            mockCartItems.forEach((cartItem) => {
                expect(
                    queryByTestId("cart-item-" + cartItem.hardware_id.toString())
                ).not.toBeInTheDocument();
            });
        });
    });
});
