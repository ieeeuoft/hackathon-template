import React from "react";
import styles from "./InventoryFilter.module.scss";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const InventoryFilter = ({ categories, applyFilter, removeFilter }) => (
    <div className={styles.filter}>
        <Paper className={styles.filterPaper} square={true} elevation={3}>
            <form>
                <fieldset>
                    <legend>
                        <Typography variant="h2">Order by</Typography>
                    </legend>
                    <RadioGroup aria-label="order by" name="orderBy">
                        <FormControlLabel
                            name="orderBy"
                            value="all"
                            label="All"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="orderBy"
                            value="a-z"
                            label="A-Z"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="orderBy"
                            value="z-a"
                            label="Z-A"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="orderBy"
                            value="stock-high-low"
                            label="Stock remaining: high to low"
                            control={<Radio color="primary" />}
                        />
                        <FormControlLabel
                            name="orderBy"
                            value="stock-low-high"
                            label="Stock remaining: low to high"
                            control={<Radio color="primary" />}
                        />
                    </RadioGroup>
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">Availability</Typography>
                    </legend>
                    <FormControlLabel
                        name="inStock"
                        value="in-stock"
                        label="In stock"
                        control={<Checkbox color="primary" />}
                    />
                </fieldset>
                <Divider className={styles.filterDivider} />
                <fieldset>
                    <legend>
                        <Typography variant="h2">Categories</Typography>
                    </legend>
                    {categories.map((item, i) => (
                        <div className={styles.filterCategory} key={i}>
                            <FormControlLabel
                                name="inventoryFilter"
                                value={`category-${item.id}`}
                                label={item.name}
                                control={<Checkbox color="primary" />}
                            />
                            <Chip
                                label={item.qty}
                                className={styles.filterCategoryChip}
                            />
                        </div>
                    ))}
                </fieldset>
            </form>
        </Paper>
        <div className={styles.filterBtns}>
            <Button
                type="submit"
                onClick={applyFilter}
                color="primary"
                variant="contained"
                fullWidth={true}
                className={styles.filterBtnsApply}
            >
                Apply
            </Button>
            <Button type="reset" color="secondary" onClick={removeFilter}>
                Clear all
            </Button>
        </div>
    </div>
);

export default InventoryFilter;
