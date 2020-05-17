import React from "react";
import { render } from "@testing-library/react";
import SponsorCard from "./SponsorCard";

it("renders correctly when there are no images", () => {
    const { asFragment } = render(
        <SponsorCard sponsors={[]} />
    );
    expect(asFragment()).toMatchSnapshot();
});

it("renders correctly when there are images", () => {
    let sponsors = [{ imgSrc: "AMD.svg" }, { imgSrc: "CityofBrampton.svg" }];
    const { asFragment } = render(
        <SponsorCard sponsors={sponsors} />
    );
    expect(asFragment()).toMatchSnapshot();
});