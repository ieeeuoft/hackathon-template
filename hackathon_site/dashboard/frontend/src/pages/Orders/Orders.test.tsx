import React from "react";
import { render } from "testing/utils";
import Orders from "./Orders";

test("Has necessary page elements", () => {
    const { getByText, getByTestId } = render(<Orders />);
    expect(getByText("Orders")).toBeInTheDocument();
    expect(getByTestId("ordersCountDivider")).toBeInTheDocument();
});
