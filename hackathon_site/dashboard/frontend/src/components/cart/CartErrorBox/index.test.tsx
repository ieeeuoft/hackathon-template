import React from "react";
import { makeStoreWithEntities, render } from "testing/utils";
import CartErrorBox from "./index";
import { mockCartItems } from "testing/mockData";
import { CartItem } from "api/types";

describe("Cart Error Box displays correctly with the right information", () => {
    const makeCartStoreWithEntities = (
        error?: string | string[],
        cartItems?: CartItem[]
    ) => {
        return makeStoreWithEntities({
            cartState: {
                isLoading: false,
                error: error ?? null,
                fulfillmentError: null,
            },
            cartItems: cartItems ?? mockCartItems,
        });
    };

    it("Shows internal server error on API failure", async () => {
        const store = makeCartStoreWithEntities("An Internal server error occurred.");

        const { getByText } = render(<CartErrorBox />, {
            store,
        });

        getByText(/an internal server error occurred/i);
    });

    it("Shows item limit reached error on order submission failure", async () => {
        const store = makeCartStoreWithEntities([
            "Limit for Category Sensor is reached",
        ]);

        const { getByText } = render(<CartErrorBox />, {
            store,
        });

        getByText(/unable to submit your order because:/i);
        getByText(/limit for category sensor is reached/i);
    });

    it("Shows item limit reached error on order submission failure", async () => {
        const store = makeCartStoreWithEntities("Internal error has occurred", []);

        const { queryByText } = render(<CartErrorBox />, {
            store,
        });

        expect(queryByText(/internal error has occurred/i)).not.toBeInTheDocument();
    });
});
