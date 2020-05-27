import React from "react";
import { render } from "@testing-library/react";
import ConnectedSponsorCard from "./SponsorCard";

it("renders correctly when there are images", () => {
    const { asFragment } = render(<ConnectedSponsorCard />);
    expect(asFragment()).toMatchSnapshot();
});
