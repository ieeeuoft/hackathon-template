import SubmittedIcon from "assets/images/icons/statusIcons/unfulfilled-status.svg";
import ReadyForPickupIcon from "assets/images/icons/statusIcons/readyforpickup-status.svg";
import PickedUpIcon from "assets/images/icons/statusIcons/checkout-status.svg";
import CancelledIcon from "assets/images/icons/statusIcons/cancelled-status.svg";
import ReturnedIcon from "assets/images/icons/statusIcons/checkout-status.svg";
import PackingIcon from "assets/images/icons/statusIcons/pending-status.svg";
//TODO: A low-priority task, but perhaps looking into changing the PackingIcon to be a more accurate fit
//import InProgressIcon from "assets/images/icons/statusIcons/inprogress-status.svg";

import styles from "components/orders/OrdersTable/OrdersTable.module.scss";

export const statusIconMap: { [key: string]: string } = {
    Submitted: SubmittedIcon,
    ReadyforPickup: ReadyForPickupIcon,
    PickedUp: PickedUpIcon,
    Cancelled: CancelledIcon,
    Returned: ReturnedIcon,
    Packing: PackingIcon,
    //InProgress: InProgressIcon, //Commented out since we likely don't need this status anymore (Packing should mean the same thing as "In Progress?")
};

export const statusStylesMap: { [key: string]: string } = {
    Submitted: styles.SubmittedIcon,
    ReadyforPickup: styles.ReadyforPickupIcon,
    PickedUp: styles.PickedUpIcon,
    Cancelled: styles.CancelledIcon,
    Returned: styles.ReturnedIcon,
    Packing: styles.PackingIcon,
    //InProgress: styles.InProgressIcon, //Commented out since we likely don't need this status anymore (Packing should mean the same thing as "In Progress?")
};
