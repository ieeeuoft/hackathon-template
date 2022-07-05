import React from "react";
import { render } from "testing/utils";
import DateRestrictionAlert from "./DateRestrictionAlert";

const mockHardwareSignOutStartDate = jest.fn();
const mockHardwareSignOutEndDate = jest.fn();
jest.mock("constants.js", () => ({
    get hardwareSignOutStartDate() {
        return mockHardwareSignOutStartDate();
    },
    get hardwareSignOutEndDate() {
        return mockHardwareSignOutEndDate();
    },
}));

export const mockHardwareSignOutDates = (
    numDaysRelativeToStart?: number,
    numDaysRelativeToEnd?: number
): {
    start: Date;
    end: Date;
} => {
    const currentDate = new Date();
    const start = new Date();
    const end = new Date();
    start.setDate(currentDate.getDate() + (numDaysRelativeToStart ?? -1));
    end.setDate(currentDate.getDate() + (numDaysRelativeToEnd ?? 1));
    mockHardwareSignOutStartDate.mockReturnValue(start);
    mockHardwareSignOutEndDate.mockReturnValue(end);
    return { start, end };
};

describe("<DateRestrictionAlert />", () => {
    test("alert does not appear if current date is within allocated period", () => {
        mockHardwareSignOutDates(-5, 5);
        const { queryByTestId } = render(<DateRestrictionAlert />);
        expect(queryByTestId("date-restriction-alert")).toBeNull();
    });

    test("alert appears if current date is before start date", async () => {
        const { start, end } = mockHardwareSignOutDates(5, 10);
        const alertText = `The period begins on ${start.toDateString()} at ${start.toLocaleTimeString()} and ends on ${end.toDateString()} at ${end.toLocaleTimeString()}. When the period starts, you'll be able to place orders and rent our hardware. For now, you can familiarize yourself with our site and create or join a team.`;

        const { getByTestId, getByText } = render(<DateRestrictionAlert />);

        expect(getByTestId("date-restriction-alert")).toBeInTheDocument();
        expect(
            getByText(
                /the allocated time period for checking out hardware has not begun yet/i
            )
        ).toBeInTheDocument();
        expect(getByText(new RegExp(alertText, "i"))).toBeInTheDocument();
    });

    test("alert appears if current date is after start date", () => {
        const { start, end } = mockHardwareSignOutDates(-10, -1);
        const alertText = `The period began on ${start.toDateString()} at ${start.toLocaleTimeString()} and ended on ${end.toDateString()} at ${end.toLocaleTimeString()}. Hardware sign out is now over and you cannot place anymore orders. Please return any checked out items back to inventory station.`;

        const { getByTestId, getByText } = render(<DateRestrictionAlert />);

        expect(getByTestId("date-restriction-alert")).toBeInTheDocument();
        expect(
            getByText(/the allocated time period for checking out hardware is over/i)
        ).toBeInTheDocument();
        expect(getByText(new RegExp(alertText, "i"))).toBeInTheDocument();
    });
});
