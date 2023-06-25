import React from "react";
import AdminDashboard from "pages/AdminDashboard/AdminDashboard";

import { render, waitFor } from "testing/utils";

import { mockPendingOrders, overviewTitles } from "testing/mockData";

describe("Admin Dashboard Page", () => {
    it("Renders correctly when the dashboard appears 4 Pending Order cards and all Overview Cards", async () => {
        const { queryByText, getByText } = render(<AdminDashboard />);

        await waitFor(() => {
            for (let title of overviewTitles) {
                expect(queryByText(title)).toBeTruthy();
            }
            for (let order of mockPendingOrders) {
                expect(queryByText(order.team_code)).toBeTruthy();
            }
            expect(getByText("Hackathon Name Admin Dashboard")).toBeInTheDocument();
            expect(getByText("Overview")).toBeInTheDocument();
            expect(getByText("Pending Orders")).toBeInTheDocument();
        });
    });
});
