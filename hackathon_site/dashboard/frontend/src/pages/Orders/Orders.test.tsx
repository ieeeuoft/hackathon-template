import React from "react";

import {
    makeMockApiListResponse,
    waitFor,
    when,
    fireEvent,
    promiseResolveWithDelay,
    makeMockApiResponse,
} from "testing/utils";

import { render } from "testing/utils";

import Orders from "./Orders";

test("renders without crashing", () => {
    const { getByText } = render(<Orders />);
    expect(getByText("Orders")).toBeInTheDocument();
});
