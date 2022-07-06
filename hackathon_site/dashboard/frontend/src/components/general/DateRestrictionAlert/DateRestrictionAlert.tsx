import React from "react";
import AlertBox from "components/general/AlertBox/AlertBox";
import { hardwareSignOutEndDate, hardwareSignOutStartDate } from "constants.js";

const DateRestrictionAlert = () => {
    const currentDateTime = new Date();
    const isBeforeSignOutPeriod = currentDateTime < hardwareSignOutStartDate;
    const isOutsideSignOutPeriod =
        isBeforeSignOutPeriod || currentDateTime > hardwareSignOutEndDate;

    return isOutsideSignOutPeriod ? (
        <AlertBox
            data-testid="date-restriction-alert"
            title={
                isBeforeSignOutPeriod
                    ? "The allocated time period for checking out hardware has not begun yet"
                    : "The allocated time period for checking out hardware is over"
            }
            error={`
                        The period ${
                            isBeforeSignOutPeriod ? "begins" : "began"
                        } on ${hardwareSignOutStartDate.toDateString()} at ${hardwareSignOutStartDate.toLocaleTimeString()}
                        and ${
                            isBeforeSignOutPeriod ? "ends" : "ended"
                        } on ${hardwareSignOutEndDate.toDateString()} at ${hardwareSignOutEndDate.toLocaleTimeString()}.
                        ${
                            isBeforeSignOutPeriod
                                ? "When the period starts, you'll be able to place orders and rent our hardware. For now, you can familiarize yourself with our site and create or join a team."
                                : "Hardware sign out is now over and you cannot place anymore orders. Please return any checked out items back to inventory station."
                        }
                    `}
            type="info"
        />
    ) : null;
};

export default DateRestrictionAlert;
