import React from "react";
import configureStore from "redux-mock-store";

import { fireEvent, render } from "testing/utils";

import {
    ChipStatus,
    PendingTable,
    CheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import {
    itemsCheckedOut,
    mockPendingOrders,
    mockCheckedOutOrders,
} from "testing/mockData";

const mockStore = configureStore();

describe("<ChipStatus />", () => {
    test("Ready status", () => {
        const { getByText } = render(<ChipStatus status="Ready for Pickup" />);
        expect(getByText("Ready for pickup")).toBeInTheDocument();
    });

    test("Pending status", () => {
        const { getByText } = render(<ChipStatus status="Submitted" />);
        expect(getByText("In progress")).toBeInTheDocument();
    });

    test("Error status", () => {
        const { getByText } = render(<ChipStatus status="Error" />);
        expect(getByText("Visit the tech station")).toBeInTheDocument();
    });
});

describe("<PendingTable />", () => {
    it("Shows pending items and status chip", () => {
        const { getByText, queryByText } = render(
            <PendingTable orders={mockPendingOrders} />
        );
        expect(getByText(/pending orders/i)).toBeInTheDocument();
        expect(queryByText("In progress")).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
    });

    // TODO: mock ui store
    it("Hides the pending table when isVisible is false", () => {
        const { getByText } = render(<PendingTable orders={mockPendingOrders} />);

        expect(getByText(/pending orders/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeNull();
        });
    });

    it("Doesn't show when there are no pending orders", () => {
        const { queryByText } = render(<PendingTable orders={[]} />);
        expect(queryByText("Pending Orders")).toBeNull();
    });

    it("PendingTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText } = render(<PendingTable orders={mockPendingOrders} />);
        const button = getByText(/hide all/i);

        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeNull();
        });
        // TODO: check to see store updated
    });
});

describe("<CheckedOutTable />", () => {
    it("Shows a message when there's no checked out items", () => {
        const { getByText } = render(<CheckedOutTable orders={[]} />);
        expect(
            getByText("You have no items checked out yet. View our inventory.")
        ).toBeInTheDocument();
    });

    it("Shows checked out items", () => {
        const { getByText } = render(<CheckedOutTable orders={mockCheckedOutOrders} />);
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/hide all/i)).toBeInTheDocument();
        mockCheckedOutOrders.map((order) =>
            order.hardware.map(({ name }) =>
                expect(getByText(name)).toBeInTheDocument()
            )
        );
    });

    // TODO: mock ui store
    it("Hides the table when isVisible is false", () => {
        const { getByText, queryByText } = render(
            <CheckedOutTable orders={mockCheckedOutOrders} />
        );
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
    });

    it("CheckedOutTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText, queryByText } = render(
            <CheckedOutTable orders={mockCheckedOutOrders} />
        );
        const button = getByText(/hide all/i);

        fireEvent.click(button);

        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
        // TODO: check to see store updated
    });

    // TODO: implement when incidents are ready
    // it("Calls 'push' and 'reportIncident' when 'Report broken/lost' is clicked", () => {
    //     const push = jest.fn();
    //     const reportIncident = jest.fn();
    //     const oneRow = [itemsCheckedOut[0]];
    //     const { getByText } = render(
    //         <UnconnectedCheckedOutTable
    //             items={oneRow}
    //             isVisible={true}
    //             push={push}
    //             reportIncident={reportIncident}
    //         />
    //     );
    //     const button = getByText(/report broken\/lost/i);
    //     fireEvent.click(button);
    //     expect(push).toHaveBeenCalled();
    //     expect(reportIncident).toHaveBeenCalled();
    // });
    // it("Makes sure there's the same number of buttons as rows", () => {
    //     const { getAllByText } = render(
    //         <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={true} />
    //     );
    //     const numItems = itemsCheckedOut.length;
    //     expect(getAllByText(/report broken\/lost/i).length).toBe(numItems);
    // });
});

// TODO: add back in when there is more clarity about returned items
// describe("<UnconnectedReturnedTable />", () => {
//     it("Shows a message when there's no returned items", () => {
//         const { getByText } = render(
//             <UnconnectedReturnedTable items={[]} isVisible={true} />
//         );
//         expect(
//             getByText(
//                 "Please bring items to the tech table and a tech team member will assist you."
//             )
//         ).toBeInTheDocument();
//     });
//
//     it("Shows returned items", () => {
//         const { getByText } = render(
//             <UnconnectedReturnedTable items={itemsReturned} isVisible={true} />
//         );
//         expect(getByText(/returned items/i)).toBeInTheDocument();
//         itemsReturned.map(({ name }) => {
//             expect(getByText(name)).toBeInTheDocument();
//         });
//     });
//
//     it("Hides the table when isVisible is false", () => {
//         const { getByText, queryByText } = render(
//             <UnconnectedReturnedTable items={itemsReturned} isVisible={false} />
//         );
//         expect(getByText(/returned items/i)).toBeInTheDocument();
//         expect(getByText(/show all/i)).toBeInTheDocument();
//         itemsReturned.map(({ name }) => {
//             expect(queryByText(name)).toBeNull();
//         });
//     });
//
//     it("ReturnedTable dispatches an action to toggle visibility when button clicked", async () => {
//         const { getByText } = render(<ReturnedTable items={itemsReturned} />, {
//             store,
//         });
//         const button = getByText(/hide all/i);
//
//         await fireEvent.click(button);
//         expect(store.getActions()).toContainEqual(
//             expect.objectContaining({ type: toggleReturnedTable.type })
//         );
//     });
// });

// TODO: add back in when incidents are done
// describe("<BrokenTable />", () => {
//     it("shows when there are broken or lost items", () => {
//         const { getByText } = render(
//             <BrokenTable items={itemsBroken} status="error" />
//         );
//
//         expect(getByText(/Reported broken\/lost items/i)).toBeInTheDocument();
//         expect(getByText("Visit the tech station")).toBeInTheDocument();
//         itemsBroken.map(({ name }) => {
//             expect(getByText(name)).toBeInTheDocument();
//         });
//     });
//
//     it("Calls 'openReportAlert' when 'View Report' is clicked", () => {
//         const openReportAlert = jest.fn();
//         const oneRow = [itemsBroken[0]];
//         const { getByText } = render(
//             <BrokenTable
//                 items={oneRow}
//                 status="error"
//                 openReportAlert={openReportAlert}
//             />
//         );
//
//         const button = getByText(/View Report/i);
//         fireEvent.click(button);
//         expect(openReportAlert).toHaveBeenCalled();
//     });
//
//     it("Calls the same amount of chips and buttons as the rows", () => {
//         const { getAllByText } = render(
//             <BrokenTable items={itemsBroken} status="error" />
//         );
//
//         const numItems = itemsBroken.length;
//         expect(getAllByText(/View Report/i).length).toBe(numItems);
//     });
//
//     it("Disappears when there are no broken items", () => {
//         const { queryByText } = render(<BrokenTable items={[]} status={null} />);
//         expect(queryByText(/Reported broken\/lost items/)).toBeNull();
//     });
// });
