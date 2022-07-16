import React from "react";
import { render, screen, fireEvent } from "testing/utils";

import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";

describe("Team action table", () => {
    test("Renders team action table", () => {
        const { container } = render(<TeamActionTable />);

        expect(
            screen.getByText("Notify team to come to table to resolve issue")
        ).toBeInTheDocument();
        expect(screen.getByText("Split team")).toBeInTheDocument();
        expect(screen.getByText("Merge team")).toBeInTheDocument();
        expect(screen.getByText("Delete team")).toBeInTheDocument();
    });
});
