import SubmittedIcon from "../assets/images/icons/statusIcons/unfulfilled-status.svg";
import ReadyForPickupIcon from "../assets/images/icons/statusIcons/readyforpickup-status.svg";
import PickedUpIcon from "../assets/images/icons/statusIcons/checkout-status.svg";
import CancelledIcon from "../assets/images/icons/statusIcons/cancelled-status.svg";
import ReturnedIcon from "../assets/images/icons/statusIcons/checkout-status.svg";
import PendingIcon from "../assets/images/icons/statusIcons/pending-status.svg";
import InProgressIcon from "../assets/images/icons/statusIcons/inprogress-status.svg";

export const statusIconMap: { [key: string]: string } = {
    Submited: SubmittedIcon,
    ReadyforPickup: ReadyForPickupIcon,
    PickedUp: PickedUpIcon,
    Cancelled: CancelledIcon,
    Returned: ReturnedIcon,
    Pending: PendingIcon,
    InProgress: InProgressIcon,
};
