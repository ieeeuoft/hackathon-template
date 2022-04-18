import {
    Order,
    OrderInTable,
    OrderItemTableRow,
    ReturnedItem,
    ReturnOrderInTable,
} from "./types";

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
    const hardwareIdsToFetch: number[] = [];
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
                hardwareIdsToFetch.push(hardware_id);
            });
            const returnedHardware = Object.values(returnedItems);
            if (returnedHardware.length)
                returnedOrders.push({
                    id: order.id,
                    hardwareInOrder: returnedHardware,
                });
            (order.status === "Submitted" || order.status === "Ready for Pickup"
                ? pendingOrders
                : checkedOutOrders
            ).push({
                id: order.id,
                status: order.status,
                hardwareInTableRow: Object.values(hardwareItems),
            });
        }
    });
    return {
        pendingOrders,
        checkedOutOrders,
        returnedOrders,
        hardwareIdsToFetch,
    };
};
