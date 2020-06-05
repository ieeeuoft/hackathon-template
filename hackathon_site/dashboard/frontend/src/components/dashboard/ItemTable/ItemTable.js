import React from "react";
import styles from "./ItemTable.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Info from "@material-ui/icons/Info";

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";


function createData(url, name, info, qty, btn) {
    return { url, name, info, qty, btn };
}

const rows = [
    createData('https://i.imgur.com/bxd6PNO.jpeg', 'Arduino', <Info/>, 6, 24),
    createData('https://i.imgur.com/bxd6PNO.jpeg', 'Raspi', <Info/>, 9, 37),
    createData('https://i.imgur.com/bxd6PNO.jpeg', 'Grove temperature and humidity sensor pro', <Info/>, 16, 24),
    createData('https://i.imgur.com/bxd6PNO.jpeg', 'Blah', <Info/>, 7, 67),
    createData('https://i.imgur.com/bxd6PNO.jpeg', 'Blah', <Info/>, 16, 49),
];

const ColWidth = ({ name } ) => {
    if (name === "Checked out items") {
        return (
            <colgroup>
                <col style={{width:'100px'}}/>
                <col style={{width:'50%'}}/>
                <col style={{width:'100px'}}/>
                <col style={{width:'100px'}}/>
                <col style={{width:'50%'}}/>
            </colgroup>
        )
    } else {
        return (
            <colgroup>
                <col style={{width:'100px'}}/>
                <col style={{width:'50%'}}/>
                <col style={{width:'25%'}}/>
                <col style={{width:'25%'}}/>
            </colgroup>
        )
    }
};

// order pending: name, url, requested qty, granted qty
// checked out: url, name, info, qty
// returned: url, name, time, condition
const HeadNames = ({ name } ) => {
    switch (name) {
        case "Checked out items":
            return (
                <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Info</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">blah</TableCell>
                </TableRow>
            )
        case "Returned items":
            return (
                <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Info</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell align="right">Condition</TableCell>
                </TableRow>
            )
        case "Order pending":
            return (
                <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Info</TableCell>
                    <TableCell align="right">Requested Qty</TableCell>
                    <TableCell align="right">Granted Qty</TableCell>
                </TableRow>
            )
        default:
            return;
    }
}

const BodyContent = ({name, items}) => {
    switch (name) {
        case "Checked out items":
            return (
                <TableBody>
                {items.map((row) => (
                    <TableRow key={row.name}>
                    <TableCell align="left"><img className={styles.itemImg} src={row.url} /></TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">
                        <IconButton
                            color="inherit"
                            aria-label="Info"
                        >
                            {row.info}
                        </IconButton>
                    </TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.btn}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            )
        case "Returned items":
            return (
                <TableBody>
                {items.map((row) => (
                    <TableRow key={row.name}>
                    <TableCell align="left"><img className={styles.itemImg} src={row.url} /></TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">
                        <IconButton
                            color="inherit"
                            aria-label="Info"
                        >
                            {row.info}
                        </IconButton>
                    </TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.btn}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            )
        case "Order pending":
            return (
                <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Info</TableCell>
                    <TableCell align="right">Requested Qty</TableCell>
                    <TableCell align="right">Granted Qty</TableCell>
                </TableRow>
            )
        default:
            return;
    }
    
}

export const UnconnectedItemTable = ({ title, items } ) => (
    <Container>
        <div className={styles.title}>
            <Typography variant="h2" className={styles.titleText}>{title}</Typography>
            <Button className={styles.titleBtn} onClick={() => { alert('bye bish') }}>Hide all</Button>
        </div>
        
        <TableContainer component={Paper}>
            <Table className={styles.table} size="small" aria-label="a dense table">
                <ColWidth name={title} />
                <TableHead>
                    <HeadNames name={title} />
                </TableHead>
                <TableBody>
                {items.map((row) => (
                    <TableRow key={row.name}>
                    <TableCell align="left"><img className={styles.itemImg} src={row.url} /></TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">
                        <IconButton
                            color="inherit"
                            aria-label="Info"
                        >
                            {row.info}
                        </IconButton>
                    </TableCell>
                    <TableCell align="right">{row.qty}</TableCell>
                    <TableCell align="right">{row.btn}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>
);

const ConnectedItemTable = () => <UnconnectedItemTable title="Checked out items" items={rows} />;

export default ConnectedItemTable;