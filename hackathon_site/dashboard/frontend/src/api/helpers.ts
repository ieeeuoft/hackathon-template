import {
    Order,
    OrderInTable,
    OrderItemTableRow,
    ReturnedItem,
    ReturnOrderInTable,
} from "api/types";

export const formatDateTime = (dateTimeString: string): string => {
    const dateTime = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };
    return dateTime.toLocaleString("en-US", options);
};
export const teamOrderListSerialization = (
    orders: Order[]
): {
    pendingOrders: OrderInTable[];
    checkedOutOrders: OrderInTable[];
    returnedOrders: ReturnOrderInTable[];
    hardwareIdsToFetch: number[];
} => {
    const pendingOrders: OrderInTable[] = [];
    const checkedOutOrders: OrderInTable[] = [];
    const returnedOrders: ReturnOrderInTable[] = [];
    const hardwareIdsToFetch: Record<number, number> = {};
    orders.forEach((order) => {
        if (order.status !== "Cancelled") {
            const hardwareItems: Record<number, OrderItemTableRow> = {};
            const hardwareRequested: Record<number, number> = {};
            const returnedItems: Record<string, ReturnedItem> = {};
            order.request.forEach(
                (hardware) =>
                    (hardwareRequested[hardware.id] = hardware.requested_quantity)
            );
            order.items.forEach(({ id, hardware_id, part_returned_health }) => {
                if (part_returned_health) {
                    const returnItemKey = `${hardware_id}-${part_returned_health}`;
                    if (returnedItems[returnItemKey])
                        returnedItems[returnItemKey].quantity += 1;
                    else {
                        const date = new Date(order.updated_at);
                        returnedItems[returnItemKey] = {
                            id,
                            quantity: 1,
                            part_returned_health,
                            hardware_id,
                            time: `${date.toLocaleTimeString()} (${date.toDateString()})`,
                        };
                    }
                } else {
                    if (hardwareItems[hardware_id])
                        hardwareItems[hardware_id].quantityGranted += 1;
                    else
                        hardwareItems[hardware_id] = {
                            id: hardware_id,
                            quantityGranted: 1,
                            quantityRequested: hardwareRequested[hardware_id],
                        };
                }
                hardwareIdsToFetch[hardware_id] = hardware_id;
            });
            const returnedHardware = Object.values(returnedItems);
            if (returnedHardware.length)
                returnedOrders.push({
                    id: order.id,
                    hardwareInOrder: returnedHardware,
                });

            const hardwareInTableRow = Object.values(hardwareItems);
            if (hardwareInTableRow.length > 0)
                (order.status === "Submitted" || order.status === "Ready for Pickup"
                    ? pendingOrders
                    : checkedOutOrders
                ).push({
                    id: order.id,
                    status: order.status,
                    hardwareInTableRow,
                    createdTime: order.created_at,
                    updatedTime: order.updated_at,
                });
        }
    });
    return {
        pendingOrders: [...pendingOrders].sort((a, b) => b.id - a.id),
        checkedOutOrders: [...checkedOutOrders].sort((a, b) => b.id - a.id),
        returnedOrders,
        hardwareIdsToFetch: Object.values(hardwareIdsToFetch),
    };
};

export const sortReturnedOrders = (
    order1: ReturnOrderInTable,
    order2: ReturnOrderInTable
): number => {
    const orderDate1 = order1.hardwareInOrder[0].time;
    const orderDate2 = order2.hardwareInOrder[0].time;

    const matchResult = orderDate1.match(
        /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
    );
    const matchResult2 = orderDate2.match(
        /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
    );

    if (matchResult && matchResult2) {
        // converting invalid date to a valid Date for first order to be compared
        const [, hours, minutes, seconds, meridiem, , month, day, year] = matchResult;
        const monthIndex = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ].indexOf(month);

        const date = new Date(
            Number(year),
            monthIndex,
            Number(day),
            Number(hours) + (meridiem === "PM" ? 12 : 0),
            Number(minutes),
            Number(seconds)
        );
        const formattedDate = date.toISOString();

        // converting invalid date to a valid Date for first order to be compared
        const [, hours2, minutes2, seconds2, meridiem2, , month2, day2, year2] =
            matchResult2;
        const monthIndex2 = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ].indexOf(month2);

        const date2 = new Date(
            Number(year2),
            monthIndex2,
            Number(day2),
            Number(hours2) + (meridiem2 === "PM" ? 12 : 0),
            Number(minutes2),
            Number(seconds2)
        );
        const formattedDate2 = date2.toISOString();

        return new Date(formattedDate2).valueOf() - new Date(formattedDate).valueOf();
    }
    return 0;
};

export const sortCheckedOutOrders = (
    order1: OrderInTable,
    order2: OrderInTable
): number => {
    return (
        new Date(order2.updatedTime).valueOf() - new Date(order1.updatedTime).valueOf()
    );
};

export const sortPendingOrders = (orders: OrderInTable[]): OrderInTable[] => {
    let ready_orders = [];
    let submitted_orders = [];
    for (let order of orders) {
        if (order.status === "Ready for Pickup") {
            ready_orders.push(order);
        } else {
            submitted_orders.push(order);
        }
    }
    ready_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    submitted_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    orders.splice(0, orders.length, ...submitted_orders, ...ready_orders);
    return orders;
};
