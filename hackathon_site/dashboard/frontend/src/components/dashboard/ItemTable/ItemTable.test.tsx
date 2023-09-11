import React from "react";
import { fireEvent, makeStoreWithEntities, render } from "testing/utils";
import {
    PendingTables,
    CheckedOutTables,
    ReturnedTable,
} from "components/dashboard/ItemTable/ItemTable";
import {
    mockPendingOrders,
    mockCheckedOutOrders,
    mockHardware,
    mockPendingOrdersInTable,
    mockCheckedOutOrdersInTable,
    mockReturnedOrdersInTable,
} from "testing/mockData";
import { ReturnOrderInTable } from "api/types";
import { getAllByText } from "@testing-library/react";

describe("<PendingTables />", () => {
    it("Shows pending items and status chip", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, queryByText } = render(<PendingTables />, { store });
        expect(getByText(/pending orders/i)).toBeInTheDocument();
        expect(queryByText("In progress")).toBeInTheDocument();
        mockPendingOrdersInTable.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
    });

    it("Hides the pending table when isVisible is false", () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isPendingTableVisible: false,
                },
            },
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, queryByText } = render(<PendingTables />, { store });

        expect(getByText(/pending orders/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("Doesn't show when there are no pending orders", () => {
        const { queryByText } = render(<PendingTables />);
        expect(queryByText("Pending Orders")).toBeNull();
    });

    it("PendingTable dispatches an action to toggle visibility when button clicked", async () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, queryByText } = render(<PendingTables />, { store });
        const button = getByText(/hide all/i);

        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("PendingTable hides cancel order button when hide all button is enabled", async () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, queryByText } = render(<PendingTables />, {
            store,
        });
        const button = getByText(/hide all/i);
        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        expect(queryByText(/cancel order/i)).toBeNull();
    });

    it("cancel order modal shows when cancel order button is clicked", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, getAllByText } = render(<PendingTables />, {
            store,
        });
        const button = getByText(/cancel order/i);
        fireEvent.click(button);

        const cancelOrderModalMessage = getAllByText(
            /Are you sure you want to cancel this order/i
        );
        expect(cancelOrderModalMessage[0]).toBeInTheDocument();
    });

    it("cancel order modal disappears when modal is dismissed", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, getAllByText } = render(<PendingTables />, {
            store,
        });
        const button = getByText(/cancel order/i);
        fireEvent.click(button);

        const cancelOrderModalMessage = getAllByText(
            /Are you sure you want to cancel this order/i
        );
        expect(cancelOrderModalMessage[0]).toBeInTheDocument();

        const dismiss_button = getByText(/Go Back/i);
        fireEvent.click(dismiss_button);

        expect(cancelOrderModalMessage[0]).not.toBeInTheDocument();
    });

    it("cancel order modal disappears when modal is submitted", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getByText, getAllByText } = render(<PendingTables />, {
            store,
        });
        const button = getByText(/cancel order/i);
        fireEvent.click(button);

        const cancelOrderModalMessage = getAllByText(
            /Are you sure you want to cancel this order/i
        );
        expect(cancelOrderModalMessage[0]).toBeInTheDocument();

        const submit_button = getByText(/Delete Order/i);
        fireEvent.click(submit_button);

        expect(cancelOrderModalMessage[0]).not.toBeInTheDocument();
    });

    it("Displays pending orders from oldest to newest", () => {
        const store = makeStoreWithEntities({
            pendingOrders: mockPendingOrdersInTable,
        });
        const { getAllByTestId } = render(<PendingTables />, { store });
        const orderElements = getAllByTestId(/pending-order-table-\d+/);
        const orders = orderElements.map((element) => {
            const updatedTime = element.getAttribute("data-updated-time");
            return { updatedTime };
        });
        let isSorted = true;
        for (let i = 0; i < orders.length - 1; i++) {
            const currentDate = orders[i];
            const previousDate = orders[i + 1];

            if (currentDate > previousDate) {
                isSorted = false;
                break;
            }
        }
        expect(isSorted).toBe(true);
    });
});

describe("<CheckedOutTables />", () => {
    it("Shows a message when there's no checked out items", () => {
        const { getByText } = render(<CheckedOutTables />);
        expect(
            getByText("You have no items checked out yet. View our inventory.")
        ).toBeInTheDocument();
    });

    it("Shows a error when failed to fetch orders", () => {
        const store = makeStoreWithEntities({
            orderState: {
                checkedOutOrders: mockCheckedOutOrdersInTable,
                error: "A problem has occurred when fetching orders",
            },
        });
        const { getByText } = render(<CheckedOutTables />, { store });
        expect(getByText(/Unable to view checked out items/i)).toBeInTheDocument();
    });

    it("Shows checked out items", () => {
        const store = makeStoreWithEntities({
            orderState: {
                checkedOutOrders: mockCheckedOutOrdersInTable,
            },
        });
        const { getByText } = render(<CheckedOutTables />, { store });
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/hide all/i)).toBeInTheDocument();
        mockCheckedOutOrders.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isCheckedOutTableVisible: false,
                },
            },
            orderState: {
                checkedOutOrders: mockCheckedOutOrdersInTable,
            },
        });
        const { getByText, queryByText } = render(<CheckedOutTables />, { store });
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockCheckedOutOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("CheckedOutTable dispatches an action to toggle visibility when button clicked", async () => {
        const store = makeStoreWithEntities({
            orderState: {
                checkedOutOrders: mockCheckedOutOrdersInTable,
            },
        });
        const { getByText, queryByText } = render(<CheckedOutTables />, { store });
        const button = getByText(/hide all/i);

        fireEvent.click(button);

        expect(getByText(/show all/i)).toBeInTheDocument();
        mockCheckedOutOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).not.toBeInTheDocument();
        });
    });

    it("Displays checked out orders from most recent to oldest order", async () => {
        const store = makeStoreWithEntities({
            orderState: {
                checkedOutOrders: mockCheckedOutOrdersInTable,
            },
        });
        const { getAllByTestId } = render(<CheckedOutTables />, { store });
        const orderElements = getAllByTestId(/checked-out-order-table-\d+/);
        const orders = orderElements.map((element) => {
            const updatedTime = element.getAttribute("data-updated-time");
            return { updatedTime };
        });
        let isSorted = true;
        for (let i = 0; i < orders.length - 1; i++) {
            const currentDate = orders[i];
            const previousDate = orders[i + 1];

            if (currentDate < previousDate) {
                isSorted = false;
                break;
            }
        }
        expect(isSorted).toBe(true);
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

describe("<ReturnedTable />", () => {
    const makeStoreWithReturnedOrders = (
        returnedOrders?: ReturnOrderInTable[],
        isReturnedTableVisible: boolean = true
    ) =>
        makeStoreWithEntities({
            hardware: mockHardware,
            ui: {
                dashboard: {
                    isReturnedTableVisible,
                },
            },
            ...(returnedOrders && {
                orderState: {
                    returnedOrders,
                },
            }),
        });

    it("Shows a message when there's no returned items", () => {
        const store = makeStoreWithReturnedOrders();
        const { getByText } = render(<ReturnedTable />, { store });
        expect(
            getByText(
                "Please bring items to the tech table and a tech team member will assist you."
            )
        ).toBeInTheDocument();
    });

    it("Shows an error message when failed to fetch orders", () => {
        const store = makeStoreWithEntities({
            orderState: {
                returnedOrders: mockReturnedOrdersInTable,
                error: "Unable to display returned orders",
            },
        });
        const { getByText } = render(<ReturnedTable />, { store });
        expect(getByText(/Unable to view returned items/i)).toBeInTheDocument();
    });

    it("Shows returned items", () => {
        const store = makeStoreWithReturnedOrders(mockReturnedOrdersInTable);
        const { getByText } = render(<ReturnedTable />, {
            store,
        });
        expect(getByText(/returned items/i)).toBeInTheDocument();
        mockReturnedOrdersInTable.map(({ id }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        const store = makeStoreWithReturnedOrders(mockReturnedOrdersInTable, false);
        const { getByText, queryByText } = render(<ReturnedTable />, { store });
        expect(getByText(/returned items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockReturnedOrdersInTable.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("ReturnedTable dispatches an action to toggle visibility when button clicked", () => {
        const store = makeStoreWithReturnedOrders(mockReturnedOrdersInTable);
        const { getByText, queryByText } = render(<ReturnedTable />, {
            store,
        });
        const button = getByText(/hide all/i);
        mockReturnedOrdersInTable.map(({ id, hardwareInOrder }) => {
            expect(getByText(`Order #${id}`)).toBeInTheDocument();
            hardwareInOrder.forEach((hardwareItem) => {
                expect(getByText(hardwareItem.time)).toBeInTheDocument();
            });
        });
        fireEvent.click(button);
        mockReturnedOrdersInTable.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).not.toBeInTheDocument();
        });
    });

    it("Displays the returned orders from newest to oldest", () => {
        const store = makeStoreWithReturnedOrders(mockReturnedOrdersInTable, false);
        const { getAllByTestId, getByText } = render(<ReturnedTable />, {
            store,
        });
        const button = getByText("Show all");
        fireEvent.click(button);
        const orderElements = getAllByTestId(/returned-order-table-\d+/);
        const orders = orderElements.map((element) => {
            const updatedTime = element.getAttribute("data-updated-time");
            return { updatedTime };
        });
        let isSorted = true;
        for (let i = 0; i < orders.length - 1; i++) {
            const currentDate = orders[i];
            const previousDate = orders[i + 1];

            if (currentDate < previousDate) {
                isSorted = false;
                break;
            }
        }
        expect(isSorted).toBe(true);
    });
});

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
