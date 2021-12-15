import React from "react";
import { fireEvent, makeStoreWithEntities, render } from "testing/utils";
import {
    ChipStatus,
    PendingTable,
    CheckedOutTable,
    ReturnedTable,
} from "components/dashboard/ItemTable/ItemTable";
import {
    itemsCheckedOut,
    mockPendingOrders,
    mockCheckedOutOrders,
    mockHardware,
} from "testing/mockData";
import { RootStore } from "slices/store";

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

    it("Hides the pending table when isVisible is false", () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isPendingTableVisible: false,
                },
            },
        });
        const { getByText, queryByText } = render(
            <PendingTable orders={mockPendingOrders} />,
            { store }
        );

        expect(getByText(/pending orders/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
    });

    it("Doesn't show when there are no pending orders", () => {
        const { queryByText } = render(<PendingTable orders={[]} />);
        expect(queryByText("Pending Orders")).toBeNull();
    });

    it("PendingTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText, queryByText } = render(
            <PendingTable orders={mockPendingOrders} />
        );
        const button = getByText(/hide all/i);

        fireEvent.click(button);
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockPendingOrders.map(({ id }) => {
            expect(queryByText(`Order #${id}`)).toBeNull();
        });
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

    it("Hides the table when isVisible is false", () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isCheckedOutTableVisible: false,
                },
            },
        });
        const { getByText, queryByText } = render(
            <CheckedOutTable orders={mockCheckedOutOrders} />,
            { store }
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
    let store: RootStore;
    const mockReturnedItems = mockCheckedOutOrders.flatMap((order) =>
        order.items.flatMap((item) => item.part_returned_health !== null)
    );

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            ui: {
                dashboard: {
                    isReturnedTableVisible: true,
                },
            },
        });
    });

    it("Shows a message when there's no returned items", () => {
        const { getByText } = render(<ReturnedTable orders={[]} />, { store });
        expect(
            getByText(
                "Please bring items to the tech table and a tech team member will assist you."
            )
        ).toBeInTheDocument();
    });

    it("Shows returned items", () => {
        const { getByText } = render(<ReturnedTable orders={mockCheckedOutOrders} />, {
            store,
        });
        expect(getByText(/returned items/i)).toBeInTheDocument();
        mockReturnedItems.map(({ hardware_id }) => {
            expect(
                getByText(
                    mockHardware.find(({ id }) => id === hardware_id)?.name ??
                        "Not Found"
                )
            ).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            ui: {
                dashboard: {
                    isReturnedTableVisible: false,
                },
            },
        });
        const { getByText, queryByText } = render(
            <ReturnedTable items={mockCheckedOutOrders} />,
            { store }
        );
        expect(getByText(/returned items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        mockReturnedItems.map(({ hardware_id }) => {
            expect(
                queryByText(
                    mockHardware.find(({ id }) => id === hardware_id)?.name ??
                        "Not Found"
                )
            ).toBeNull();
        });
    });

    it("ReturnedTable dispatches an action to toggle visibility when button clicked", () => {
        const { getByText, queryByText } = render(
            <ReturnedTable orders={mockCheckedOutOrders} />,
            {
                store,
            }
        );
        const button = getByText(/hide all/i);

        mockReturnedItems.map(({ hardware_id }) => {
            expect(
                getByText(
                    mockHardware.find(({ id }) => id === hardware_id)?.name ??
                        "Not Found"
                )
            ).toBeInTheDocument();
        });
        fireEvent.click(button);
        mockReturnedItems.map(({ hardware_id }) => {
            expect(
                queryByText(
                    mockHardware.find(({ id }) => id === hardware_id)?.name ??
                        "Not Found"
                )
            ).not.toBeInTheDocument();
        });
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
