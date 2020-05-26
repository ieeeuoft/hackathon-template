import React from "react";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";

it("renders correctly when the dashboard appears with no sponsor card", () => {
    let sponsors = [{ imgSrc: "AMD.svg" }, { imgSrc: "CityofBrampton.svg" }];
    const { asFragment } = render(<Dashboard sponsors={[]} />);
    expect(asFragment()).toMatchSnapshot();
});

it("renders correctly when the dashboard appears with the sponsor card", () => {
    let sponsors = [{ imgSrc: "AMD.svg" }, { imgSrc: "CityofBrampton.svg" }];
    const { asFragment } = render(<Dashboard sponsors={sponsors} />);
    expect(asFragment()).toMatchSnapshot();
});
