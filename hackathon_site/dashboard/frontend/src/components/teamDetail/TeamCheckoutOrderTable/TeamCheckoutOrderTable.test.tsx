import React from "react";
import { render, screen } from "testing/utils";
import { mockCheckedOutOrders, mockHardware } from "testing/mockData";

import TeamCheckoutOrderTable from "./TeamCheckoutOrderTable";

// describe("team checked out order table", () => {
//     test("renders team checked out order table", () => {
//         const { container } = render(<TeamCheckoutOrderTable />);
//         const checkboxes = container.getElementsByClassName("MuiCheckbox-root");
//
//
//
//         for (let i = 0; i < mockCheckedOutOrders; i++) {
//
//             expect(screen.getByText({`Order #${checkoutOrder.id}`})).toBeInTheDocument();
//             // renders all user names
//             expect(
//                 screen.getByText(
//                     `${mockTeamMultiple.profiles[i].user.first_name} ${mockTeamMultiple.profiles[i].user.last_name}`
//                 )
//             ).toBeInTheDocument();
//
//             // renders all user emails
//             expect(
//                 screen.getByText(mockTeamMultiple.profiles[i].user.email)
//             ).toBeInTheDocument();
//
//             // renders all user phone numbers
//             expect(
//                 screen.getByText(mockTeamMultiple.profiles[i].user.phone)
//             ).toBeInTheDocument();
//
//             // renders checkboxes correctly checked
//             // NOTE: this test assumes that users are rendered in the table in the same order that they are stored in the json test data
//             if (mockTeamMultiple.profiles[i].id_provided) {
//                 expect(checkboxes[i].classList.contains("Mui-checked")).toBe(true);
//             } else {
//                 expect(checkboxes[i].classList.contains("Mui-checked")).toBe(false);
//             }
//         }
//     });
// });
