import React from "react";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import Cart from "../../../pages/Cart/Cart";
import Teams from "../../../pages/Teams/Teams";

describe("TeamCard", () => {
    const members = ["Aki", "Graham", "Alex", "Raymond"];
    const teamCode = "PAS3NLQ3";
    test("place holder test", () => {
        expect(teamCode).not.toBeNull();
    });

    // test("render", () => {
    //     const { asFragment } = render(
    //         <TeamCard members={members} teamCode={teamCode} />
    //     );
    //     expect(asFragment()).toMatchSnapshot();
    // });

    // Currently not using the edit button

    // test("Calls handleEditTeam when the edit button is clicked", () => {
    //     const handleEditTeamSpy = jest.fn();
    //     const { getByText } = render(
    //         <TeamCard
    //             members={members}
    //             teamCode={teamCode}
    //             handleEditTeam={handleEditTeamSpy}
    //         />
    //     );
    //     const thebutton = getByText("Edit");
    //     fireEvent.click(thebutton);
    //     expect(handleEditTeamSpy).toHaveBeenCalled();
    // });
});
