import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LaunchIcon from "@material-ui/icons/Launch";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import Alert from "@material-ui/lab/Alert";

import FileCopyIcon from "@material-ui/icons/FileCopy";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

import * as Yup from "yup";
import { Formik, FormikValues } from "formik";

import styles from "./EditTeamModal.module.scss";
import {
    displaySnackbar,
    isProductOverviewVisibleSelector,
    isTeamModalVisibleSelector,
    removeTeamModalItem,
} from "slices/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectCategoriesByIds } from "slices/hardware/categorySlice";
import { RootState } from "slices/store";
import { addToCart, cartSelectors } from "slices/hardware/cartSlice";
import { Category } from "api/types";
import { Grid } from "@material-ui/core";
//import styles from "../../inventory/ProductOverview/ProductOverview.module.scss";

interface TeamModalProps {
    teamCode: string;
    canChangeTeam: boolean;
}
// export const ERROR_MESSAGES = {
//     quantityMissing: "Quantity is required",
// };
//
// const addToCartFormSchema = Yup.object().shape({
//     quantity: Yup.number().required(ERROR_MESSAGES.quantityMissing),
// });
//
// const createQuantityList = (number: number) => {
//     let entry = [];
//
//     for (let i = 1; i <= number; i++) {
//         entry.push(
//             <MenuItem key={i} role="quantity" value={i.toString()}>
//                 {i}
//             </MenuItem>
//         );
//     }
//
//     return entry;
// };
//
// interface AddToCartFormProps extends FormikValues {
//     quantityAvailable: number;
//     maxPerTeam: number | null;
// }
// export const AddToCartForm = ({
//     quantityAvailable,
//     maxPerTeam,
//     handleSubmit,
//     handleChange,
//     values: { quantity },
// }: AddToCartFormProps) => {
//     const dropdownNum =
//         maxPerTeam !== null
//             ? Math.min(quantityAvailable, maxPerTeam)
//             : quantityAvailable;
//
//     return (
//         <>
//             <form className={styles.form} onSubmit={handleSubmit}>
//                 <FormControl variant="outlined" className={styles.formControl}>
//                     <InputLabel id="qtyLabel">Qty</InputLabel>
//                     <Select
//                         value={dropdownNum === 0 ? "" : quantity}
//                         onChange={handleChange}
//                         label="Qty"
//                         labelId="qtyLabel"
//                         name="quantity"
//                         disabled={dropdownNum === 0}
//                     >
//                         {createQuantityList(dropdownNum)}
//                     </Select>
//                 </FormControl>
//                 <div className={styles.formButton}>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         fullWidth={true}
//                         size="large"
//                         type="submit"
//                         onClick={handleSubmit}
//                         disabled={dropdownNum === 0}
//                         disableElevation
//                     >
//                         Add to cart
//                     </Button>
//                 </div>
//             </form>
//         </>
//     );
// };
//
// interface EnhancedAddToCartFormProps {
//     quantityAvailable: number;
//     hardwareId: number;
//     name: string;
//     maxPerTeam: number | null;
// }
// export const EnhancedAddToCartForm = ({
//     quantityAvailable,
//     hardwareId,
//     name,
//     maxPerTeam,
// }: EnhancedAddToCartFormProps) => {
//     const dispatch = useDispatch();
//     const currentQuantityInCart =
//         useSelector((state: RootState) => cartSelectors.selectById(state, hardwareId))
//             ?.quantity ?? 0;
//
//     const onSubmit = (formikValues: { quantity: string }) => {
//         const numQuantity: number = parseInt(formikValues.quantity);
//         if (currentQuantityInCart + numQuantity <= (maxPerTeam ?? quantityAvailable)) {
//             dispatch(addToCart({ hardware_id: hardwareId, quantity: numQuantity }));
//             dispatch(
//                 displaySnackbar({
//                     message: `Added ${numQuantity} ${name} item(s) to your cart.`,
//                     options: {
//                         variant: "success",
//                     },
//                 })
//             );
//         } else {
//             dispatch(
//                 displaySnackbar({
//                     message: `Adding this amount to your cart will exceed the quantity limit for this item.`,
//                     options: {
//                         variant: "warning",
//                     },
//                 })
//             );
//         }
//     };
//
//     return (
//         <Formik
//             initialValues={{ quantity: "1" }}
//             onSubmit={onSubmit}
//             validateOnBlur={false}
//             validationOnChange={false}
//             validationSchema={addToCartFormSchema}
//         >
//             {(formikProps) => (
//                 <>
//                     {currentQuantityInCart > 0 && (
//                         <Typography
//                             variant="body2"
//                             color="primary"
//                             className={styles.heading}
//                         >
//                             You currently have {currentQuantityInCart} of this item in
//                             your cart.
//                         </Typography>
//                     )}
//                     <AddToCartForm
//                         quantityAvailable={quantityAvailable}
//                         maxPerTeam={maxPerTeam}
//                         handleSubmit={formikProps.handleSubmit}
//                         handleChange={formikProps.handleChange}
//                         values={formikProps.values}
//                     />
//                 </>
//             )}
//         </Formik>
//     );
// };
//
// interface DetailInfoSectionProps {
//     manufacturer: string;
//     modelNumber: string;
//     datasheet: string;
//     notes: string;
//     constraints: string[];
// }
// const DetailInfoSection = ({
//     manufacturer,
//     modelNumber,
//     datasheet,
//     notes,
//     constraints,
// }: DetailInfoSectionProps) => {
//     return (
//         <>
//             <Typography variant="body2" color="secondary" className={styles.heading}>
//                 Constraints
//             </Typography>
//             {constraints?.length > 0 &&
//                 constraints.map((constraint, i) => (
//                     <Typography key={i}>- {constraint}</Typography>
//                 ))}
//             <Typography variant="body2" className={styles.heading}>
//                 Manufacturer
//             </Typography>
//             <Typography>{manufacturer}</Typography>
//             <Typography variant="body2" className={styles.heading}>
//                 Model Number
//             </Typography>
//             <Typography>{modelNumber}</Typography>
//             <Typography variant="body2" className={styles.heading}>
//                 Datasheet
//             </Typography>
//             <Button
//                 href={datasheet}
//                 rel="noopener"
//                 target="_blank"
//                 startIcon={<LaunchIcon />}
//             >
//                 Link
//             </Button>
//             <Typography variant="body2" className={styles.heading}>
//                 Notes
//             </Typography>
//             {notes.split("\n").map((note, i) => (
//                 <Typography key={i}>{note}</Typography>
//             ))}
//         </>
//     );
// };
//
// interface MainSectionProps {
//     name: string;
//     quantityAvailable: number;
//     quantityRemaining: number;
//     categories: string[];
//     picture: string;
// }
// const MainSection = ({
//     name,
//     quantityAvailable,
//     quantityRemaining,
//     categories,
//     picture,
// }: MainSectionProps) => {
//     const availability =
//         quantityRemaining === 0 ? (
//             <Typography color="secondary">OUT OF STOCK</Typography>
//         ) : (
//             <Typography className={styles.quantityAvailable}>
//                 {quantityRemaining} OF {quantityAvailable} IN STOCK
//             </Typography>
//         );
//
//     return (
//         <div className={styles.mainSection}>
//             <div>
//                 <Typography variant="h6">{name}</Typography>
//                 {availability}
//                 <Typography variant="body2" className={styles.heading}>
//                     Category
//                 </Typography>
//                 <div>
//                     {categories?.length > 0 &&
//                         categories.map((category, i) => (
//                             <Chip
//                                 label={category}
//                                 size="small"
//                                 className={styles.categoryItem}
//                                 key={i}
//                             />
//                         ))}
//                 </div>
//             </div>
//             <img src={picture} alt={name} />
//         </div>
//     );
// };

const TeamInfoBlock = ({ teamCode, canChangeTeam }: TeamModalProps) => {
    return (
        <div>
            <Alert severity="info" icon={false} className={styles.alertBox}>
                Team code:
                <span className={styles.teamCode}> {teamCode} </span>
                <Button color={"primary"}>
                    <FileCopyIcon fontSize={"small"} />
                    Copy
                </Button>
                <p>There are 3 spots remaining on your team.</p>
            </Alert>
        </div>
    );
};

const TeamChangeForm = ({ teamCode, canChangeTeam }: TeamModalProps) => {
    return (
        <>
            <Typography variant={"h2"} className={styles.heading}>
                Join a different team
            </Typography>
            <form noValidate autoComplete="off" className={styles.teamForm}>
                <Grid container spacing={3}>
                    <Grid item xs={8} spacing={3}>
                        <TextField
                            fullWidth={true}
                            label="Team code"
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            color={"primary"}
                            className={styles.teamButton}
                            variant="contained"
                            disabled={!canChangeTeam}
                        >
                            SUBMIT
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export const EditTeamModal = ({ teamCode, canChangeTeam }: TeamModalProps) =>
    //{
    //     showAddToCartButton,
    // }: {
    //     showAddToCartButton: boolean;
    // }
    {
        // let categoryNames: string[] = [];
        // let maxPerTeam: number | null = null;
        // let constraints: string[] = [];
        //
        const dispatch = useDispatch();
        const closeTeamModal = () => dispatch(removeTeamModalItem());
        //
        const isTeamModalVisible: boolean = useSelector(isTeamModalVisibleSelector);
        // const hardware = useSelector(hardwareBeingViewedSelector);
        // const categories = useSelector((state: RootState) =>
        //     selectCategoriesByIds(state, hardware?.categories || [])
        // );
        // if (categories.length > 0) {
        //     categoryNames = categories
        //         .filter((category): category is Category => !!category)
        //         .map((category) => category.name);
        //     constraints =
        //         hardware?.max_per_team !== undefined
        //             ? [`Max ${hardware.max_per_team} of this item`]
        //             : [];
        //     maxPerTeam = hardware?.max_per_team ?? null;
        //     for (const category of categories) {
        //         if (category?.max_per_team !== undefined) {
        //             constraints.push(
        //                 `Max ${category.max_per_team} of items under category ${category.name}`
        //             );
        //             maxPerTeam =
        //                 maxPerTeam === null
        //                     ? category.max_per_team
        //                     : Math.min(category.max_per_team, maxPerTeam);
        //         }
        //     }
        // }

        return (
            <SideSheetRight
                title="Edit Team"
                isVisible={isTeamModalVisible}
                handleClose={closeTeamModal}
            >
                <div className={styles.editTeamModal}>
                    <div className={styles.editTeamModalDiv}>
                        <Typography variant="body1">
                            Create a team with up to 4 people. Share your code with
                            others who have RSVP’ed to MakeUofT, or join another team.
                        </Typography>
                        <Typography variant="body2" className={styles.heading}>
                            Note: You do not have to stay in the same team you applied
                            with.
                        </Typography>
                        <TeamInfoBlock teamCode={teamCode} canChangeTeam={false} />
                        <Typography variant="body1" className={styles.heading}>
                            Your team will be locked after you make your first order on
                            the day of the event. After that, in order to leave the team
                            or add new members, please speak to the tech team at the
                            tech station.
                        </Typography>

                        <TeamChangeForm
                            teamCode={teamCode}
                            canChangeTeam={canChangeTeam}
                        />
                    </div>
                    <div className={styles.formButton}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth={true}
                            size="large"
                            type="submit"
                            disableElevation
                            disabled={!canChangeTeam}
                        >
                            LEAVE TEAM
                        </Button>
                    </div>
                </div>
            </SideSheetRight>

            // <SideSheetRight
            //     title="Edit team"
            //     isVisible={true}
            //     handleClose={true}
            //     //isVisible={isProductOverviewVisible}
            //     // handleClose={closeProductOverview}
            // >
            //     {true ? (
            //         <div>
            //             <div>
            //
            //                 <Typography variant="body2" className={styles.heading}>
            //                     Create a team with up to 4 people. Share your code with
            //                     others who have RSVP’ed to MakeUofT, or join another
            //                     team. Note: You do not have to stay in the same team you
            //                     applied with.
            //                 </Typography>
            //                 <TeamInfoBlock />
            //                 <Typography>
            //                     Your team will be locked after you make your first order
            //                     on the day of the event. After that, in order to leave
            //                     the team or add new members, please speak to the tech
            //                     team at the tech station.
            //                 </Typography>
            //
            //                 <TeamChangeForm />
            //
            //                 <div className={styles.formButton}>
            //                     <Button
            //                         variant="contained"
            //                         color="primary"
            //                         fullWidth={true}
            //                         size="large"
            //                         type="submit"
            //                         disableElevation
            //                     >
            //                         LEAVE TEAM
            //                     </Button>
            //                 </div>
            //             </div>
            //         </div>
            //     ) : (
            //         <Typography variant="subtitle2" align="center" paragraph>
            //             Unable to display hardware. Please refresh the page and try
            //             again.
            //         </Typography>
            //     )}
            // </SideSheetRight>
        );
    };

export default EditTeamModal;
