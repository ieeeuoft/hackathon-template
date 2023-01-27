import React from "react";
import CartSummary from "components/cart/CartSummary/CartSummary";
import {
    cartQuantity,
    mockCartItems,
    mockHardware,
    mockValidTeam,
    mockTeam,
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
import Cart from "pages/Cart/Cart";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    post: jest.fn(),
}));

const mockedPost = post as jest.MockedFunction<typeof post>;

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

export const mockHardwareSignOutDates = (
    numDaysRelativeToStart?: number,
    numDaysRelativeToEnd?: number
): {
    start: Date;
    end: Date;
} => {
    const currentDate = new Date();
    const start = new Date();
    const end = new Date();
    start.setDate(currentDate.getDate() + (numDaysRelativeToStart ?? -1));
    end.setDate(currentDate.getDate() + (numDaysRelativeToEnd ?? 1));
    mockHardwareSignOutStartDate.mockReturnValue(start);
    mockHardwareSignOutEndDate.mockReturnValue(end);
    return { start, end };
};

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
        mockHardwareSignOutDates(-5, 5);
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
            team: { team: mockValidTeam },
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
    it("Disables the submit button if team size is invalid", async () => {
        mockHardwareSignOutDates(-5, 5);
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
            team: { team: mockTeam },
        });

        const { getByTestId } = render(<Cart />, { store });

        const submitOrderBtn = getByTestId("submit-order-button");
        expect(submitOrderBtn).toBeDisabled();
    });
    it("Disables the submit button if current date is not within HSS period", async () => {
        mockHardwareSignOutDates(1, 5);
        const store = makeStoreWithEntities({
            hardware: mockHardware,
            cartItems: mockCartItems,
            team: { team: mockValidTeam },
        });

        const { getByTestId } = render(<Cart />, { store });

        const submitOrderBtn = getByTestId("submit-order-button");
        expect(submitOrderBtn).toBeDisabled();
    });
});
