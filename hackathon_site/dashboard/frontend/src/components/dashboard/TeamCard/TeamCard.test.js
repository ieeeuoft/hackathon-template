import React from "react";
import TeamCard from "./TeamCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("TeamCard", () => {
    const members = ["Aki", "Graham", "Alex", "Raymond"];
    const teamCode = "PAS3NLQ3";

    test("render", () => {
        const { asFragment } = render(
            <TeamCard members={members} teamCode={teamCode} />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
