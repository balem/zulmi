import React from 'react';
import {makeStyles} from '@material-ui/styles';
import { Tooltip, Icon } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root : {
        display        : 'flex',
        alignItems     : 'center',
        height         : 30,
        borderRadius   : 5,
        padding        : '8px 6px',
        fontSize       : 16,
        //backgroundColor: 'rgba(0,0,0,.03);'
    },
    color: {
        width       : 8,
        height      : 8,
        marginRight : 4,
        borderRadius: '50%'
    }
}));

function ChipIcon(props)
{
    const classes = useStyles();

    return (
        <Tooltip title={props.tooltip} placement="top">
            <div className={clsx(classes.root, props.className)} style={{cursor: 'pointer', backgroundColor: props.color}}>
                <Icon className="mx-4">{props.icon}</Icon>
                <div>{props.title}</div>
            </div>
        </Tooltip>
    );
}

export default ChipIcon;
