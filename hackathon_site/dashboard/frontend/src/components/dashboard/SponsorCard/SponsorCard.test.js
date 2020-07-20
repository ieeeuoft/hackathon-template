import React from "react";
import { render } from "@testing-library/react";
import { UnconnectedSponsorCard } from "./SponsorCard";

it("renders correctly when there are 2 images", () => {
    let testList = [{ imgSrc: "AMD.svg" }, { imgSrc: "ECE.png" }];
    const { queryByAltText } = render(<UnconnectedSponsorCard sponsors={testList} />);
    for (let e of testList) {
        expect(queryByAltText(e.imgSrc)).toBeTruthy();
    }
});
