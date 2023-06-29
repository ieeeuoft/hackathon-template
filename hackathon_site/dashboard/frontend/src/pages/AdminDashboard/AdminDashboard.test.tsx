import React from "react";
import AdminDashboard from "pages/AdminDashboard/AdminDashboard";

import { render, waitFor } from "testing/utils";

describe("Admin Dashboard Page", () => {
    it("Renders correctly when the dashboard appears 4 Pending Order cards and all Overview Cards", async () => {
        const { queryByText, getByText } = render(<AdminDashboard />);

        await waitFor(() => {
            expect(getByText("Hackathon Name Admin Dashboard")).toBeInTheDocument();
            expect(getByText("Overview")).toBeInTheDocument();
            expect(getByText("Pending Orders")).toBeInTheDocument();
        });
    });
});
