import React from "react";
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import MapIcon from '@material-ui/icons/Map';
import GetAppIcon from '@material-ui/icons/GetApp';
import styles from "./TeamCard.module.scss";

function handleClick(){
    alert("You clicked the link");
}

function ItemIcon(props){
    if(props.icon === "location"){
        return(
            <MapIcon onClick={handleClick}>

            </MapIcon>
        );
    }else if(props.icon === "link"){
        return (
            <LinkIcon href="https://css-tricks.com/fixing-tables-long-strings/">

            </LinkIcon>
        );
    }else if(props.icon === "download"){
        return(
            <GetAppIcon onClick={handleClick}>

            </GetAppIcon>
        );
    }
    return;
}

function CardItem(props){
    return (
        <tr>
            <td className={styles.name}>
                <Typography>
                    {props.name}
                </Typography>
            </td>
            <td>
                <ItemIcon url={props.url} icon={props.icon}/>
            </td>
        </tr>
    );
}

function CardTable(props){
    const tableList =  props.table;
    return (
        <table><tbody>{
            tableList.map((row) =>
                <CardItem name={row.name} url={row.url} icon={row.icon} />
            )
        }</tbody></table>
    );
}

function TeamCard(props){
    return (
        <Container className={styles.teamCard} maxWidth={false} disableGutters={true}>
          <h2>{props.title}</h2>
          <Paper elevation={3} className={styles.paper}>
            <CardTable table={props.list} />
          </Paper>
        </Container>
      );
}

export default TeamCard;