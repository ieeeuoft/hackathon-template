import store, { makeStore } from "slices/store";
import {
    initialState,
    AdminOrderState,
    adminOrderReducerName,
    adminOrderSliceSelector,
    isLoadingSelector,
    errorSelector,
    getOrdersWithFilters,
    adminOrderSelectors,
    adminOrderTotalWithFiltersSelector,
    adminOrderTotalSelector,
    adminCheckedOutOrderTotalSelector,
} from "slices/order/adminOrderSlice";
import { get } from "api/api";
import { makeMockApiListResponse, makeStoreWithEntities } from "testing/utils";
import { mockCheckedOutOrders, mockOrders, mockPendingOrders } from "testing/mockData";
import { waitFor } from "@testing-library/react";

jest.mock("api/api", () => ({
    ...jest.requireActual("api/api"),
    get: jest.fn(),
}));

const mockedGet = get as jest.MockedFunction<typeof get>;

const mockStateWithAdminOrders = (adminOrderState?: Partial<AdminOrderState>) => ({
    ...store.getState(),
    [adminOrderReducerName]: {
        ...initialState,
        ...adminOrderState,
    },
});

describe("adminOrderSlice Selectors", () => {
    const mockState = mockStateWithAdminOrders();

    test("adminOrderSliceSelector returns correctly", () => {
        expect(adminOrderSliceSelector(mockState)).toEqual(
            mockState[adminOrderReducerName]
        );
    });

    test("isLoadingSelector", () => {
        const loadingTrueState = mockStateWithAdminOrders({ isLoading: true });
        const loadingFalseState = mockStateWithAdminOrders({ isLoading: false });
        expect(isLoadingSelector(loadingTrueState)).toEqual(true);
        expect(isLoadingSelector(loadingFalseState)).toEqual(false);
    });

    test("errorSelector", () => {
        const errorExistsState = mockStateWithAdminOrders({ error: "exists" });
        const errorNullState = mockStateWithAdminOrders({ error: null });
        expect(errorSelector(errorExistsState)).toEqual("exists");
        expect(errorSelector(errorNullState)).toEqual(null);
    });
    test("adminOrderTotalWithFiltersSelector", () => {
        const store = makeStoreWithEntities({ allOrders: mockPendingOrders });
        const total = adminOrderTotalWithFiltersSelector(store.getState());
        expect(total).toEqual(mockPendingOrders.length);
    });
    // todo not working, doesnt select all orders
    test("adminOrderTotalSelector", () => {
        const store = makeStoreWithEntities({ allOrders: mockOrders });
        const total = adminOrderTotalSelector(store.getState());
        expect(total).toEqual(mockOrders.length);
    });
    test("adminCheckedOutOrderTotalSelector", () => {
        const store = makeStoreWithEntities({ allOrders: mockCheckedOutOrders });
        const total = adminCheckedOutOrderTotalSelector(store.getState());
        const totalRequestedQuantity = mockCheckedOutOrders.reduce((sum, order) => {
            return (
                sum +
                order.request.reduce((orderSum, item) => {
                    return orderSum + item.requested_quantity;
                }, 0)
            );
        }, 0);
        expect(total).toEqual(totalRequestedQuantity); // total number of orders in mockCheckedOutOrders
    });
});
describe("getOrdersWithFilters Thunk", () => {
    it("Updates the store on API success", async () => {
        const response = makeMockApiListResponse(mockPendingOrders);
        mockedGet.mockResolvedValueOnce(response);

        const store = makeStore();
        await store.dispatch(getOrdersWithFilters());

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledWith("/api/hardware/orders/", {});
            expect(adminOrderSelectors.selectAll(store.getState())).toEqual(
                mockPendingOrders
            );
        });
    });

    it("Updates the store on API failure", async () => {
        const failureResponse = {
            response: {
                status: 500,
                message: "There was a problem loading orders",
            },
        };

        mockedGet.mockRejectedValue(failureResponse);

        const store = makeStore();
        await store.dispatch(getOrdersWithFilters());

        expect(store.getState()[adminOrderReducerName]).toHaveProperty(
            "error",
            failureResponse.response.message
        );
    });
});
