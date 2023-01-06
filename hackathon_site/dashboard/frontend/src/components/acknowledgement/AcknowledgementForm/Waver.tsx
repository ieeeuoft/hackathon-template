import React from "react";
import Typography from "@material-ui/core/Typography/Typography";
import { hackathonName } from "constants.js";

const Waver = (
    <>
        <Typography variant="h2" id="waver-modal-title">
            Waiver of Liability and Hold Harmless Agreement
        </Typography>
        <br />
        <ol>
            <li id="waver-modal-description">
                I hereby RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE &nbsp;
                <b>{hackathonName}</b> their officers, agents, or employees (hereinafter
                referred to as RELEASEES) from any and all liability, claims, demands,
                actions, and causes of action whatsoever arising out of or related to
                any loss, damage, or injury, including death, that may be sustained by
                me, or to any property belonging to me, while participating in such
                activity, while in, on or upon the premises where the activities are
                being conducted, REGARDLESS OF WHETHER SUCH LOSS IS CAUSED BY THE
                NEGLIGENCE OF THE RELEASEES, or otherwise and regardless of whether such
                liability arises in tort, contract, strict liability, or otherwise, to
                the fullest extent allowed by law.
            </li>
            <li id="waver-modal-description">
                I am fully aware of the risks and hazards connected with the activities
                of handling and operating the Hardware (defined below), and I am aware
                that such activities include the risk of injury and even death, and I
                hereby elect to voluntarily participate in said activities, knowing that
                the activities may be hazardous to my property and me. I understand that
                {hackathonName} does not require me to participate in this activity. I
                voluntarily assume full responsibility for any risks of loss, property
                damage, or personal injury, including death that may be sustained by me
                or any loss or damage to property owned by me, as a result of being
                engaged in such an activities, WHETHER CAUSED BY THE NEGLIGENCE OF
                RELEASEES or otherwise, to the fullest extent allowed by law.
            </li>
            <li id="waver-modal-description">
                I further hereby AGREE TO INDEMNIFY AND HOLD HARMLESS the RELEASEES from
                any loss, liability, damage, or costs, including court costs and
                attorneys' fees that Releases may incur due to my participation in said
                activities, WHETHER CAUSED BY NEGLIGENCE OF RELEASEES or otherwise, to
                the fullest extent allowed by law.
            </li>
            <li id="waver-modal-description">
                It is my express intent that this Waiver and Hold Harmless Agreement
                shall bind the members of my family and spouse, if I am alive, and my
                heirs, assigns and personal representative, if I am deceased, and shall
                be deemed as a RELEASE, WAIVER, DISCHARGE, AND COVENANT NOT TO SUE the
                above-named RELEASEES. I hereby further agree that this Waiver of
                Liability and Hold Harmless Agreement shall be construed in accordance
                with the laws of the State of New York and that any mediation, suit, or
                other proceeding must be filed or entered into only in New York and the
                federal or state courts of New York. Any portion of this document deemed
                unlawful or unenforceable is severable and shall be stricken without any
                effect on the enforceability of the remaining provisions.
            </li>
            <li id="waver-modal-description">
                I acknowledge that all right, title, and interest in and to the
                Hardware, at all times and for the duration of my use of the same, will
                be held solely by {hackathonName}. Should the Hardware be damaged, lost,
                or stolen while it is in my possession, I authorize {hackathonName}
                to charge up to the full replacement value of the Hardware on the credit
                card I provided to {hackathonName} when I checked out the Hardware.
            </li>
            <li id="waver-modal-description">
                The Hardware is the item(s) being checked out here.
            </li>
        </ol>
    </>
);

export default Waver;
