import React from "react";
import { render } from "@testing-library/react";
import Teams from "./Teams";
import { withStoreAndRouter } from "testing/utils";

test("renders without crashing", () => {
    const { getByText } = render(withStoreAndRouter(<Teams />));
    expect(getByText("IEEEEEE")).toBeInTheDocument();
});
