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

const InventoryFilter = ({ categories, applyFilter, removeFilter, elevation = 3 }) => (
    <div className={styles.filter}>
        <Paper className={styles.filterPaper} square={true} elevation={elevation}>
            <form>
                <Typography variant="h2" noWrap>
                    Order by
                </Typography>
                <RadioGroup aria-label="order by" name="order by">
                    <FormControlLabel
                        value="all"
                        control={<Radio color="primary" />}
                        label="All"
                    />
                    <FormControlLabel
                        value="a-z"
                        control={<Radio color="primary" />}
                        label="A-Z"
                    />
                    <FormControlLabel
                        value="z-a"
                        control={<Radio color="primary" />}
                        label="Z-A"
                    />
                    <FormControlLabel
                        value="stock-high-low"
                        control={<Radio color="primary" />}
                        label="Stock remaining: high to low"
                    />
                    <FormControlLabel
                        value="stock-low-high"
                        control={<Radio color="primary" />}
                        label="Stock remaining: low to high"
                    />
                </RadioGroup>
                <Divider className={styles.filterDivider} />
                <Typography variant="h2" noWrap>
                    Availability
                </Typography>
                <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="In stock"
                />
                <Divider className={styles.filterDivider} />
                <Typography variant="h2" noWrap>
                    Categories
                </Typography>
                {categories.map((item, i) => (
                    <div className={styles.filterCategory} key={i}>
                        <FormControlLabel
                            control={<Checkbox color="primary" />}
                            label={item.name}
                        />
                        <Chip label={item.qty} className={styles.filterCategoryChip} />
                    </div>
                ))}
            </form>
        </Paper>
        <div className={styles.filterBtns}>
            <Button
                color="primary"
                variant="contained"
                onClick={applyFilter}
                fullWidth={true}
                className={styles.filterBtnsApply}
            >
                Apply
            </Button>
            <Button color="secondary" onClick={removeFilter}>
                Clear all
            </Button>
        </div>
    </div>
);

export default InventoryFilter;
