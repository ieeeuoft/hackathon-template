import React from "react";
import { render } from "@testing-library/react";
import SponsorCard from "./SponsorCard";

it("renders correctly when it is null", () => {
    const { queryByTestId } = render(<SponsorCard sponsors={[]} />);
    expect(queryByTestId("sponsor-card")).toBeNull();
});

it("renders correctly when there are images", () => {
    let sponsors = [{ imgSrc: "AMD.svg" }, { imgSrc: "CityofBrampton.svg" }];
    const { asFragment } = render(<SponsorCard sponsors={sponsors} />);
    expect(asFragment()).toMatchSnapshot();
});
