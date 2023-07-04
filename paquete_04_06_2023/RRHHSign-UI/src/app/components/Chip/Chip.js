import React from 'react';
import {makeStyles} from '@material-ui/styles';
import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root : {
        display        : 'flex',
        alignItems     : 'center',
        height         : 21,
        borderRadius   : 2,
        padding        : '0 6px',
        fontSize       : 11,
        backgroundColor: 'rgba(0,0,0,.08);'
    },
    color: {
        width       : 8,
        height      : 8,
        marginRight : 4,
        borderRadius: '50%'
    }
}));

function Chip(props)
{
    const classes = useStyles();

    return (
        <Tooltip title={props.tooltip} placement="right">
            <div className={clsx(classes.root, props.className)} style={{cursor: 'pointer'}}>
                <div className={classes.color} style={{backgroundColor: props.color }}/>
                <div>{props.title}</div>
            </div>
        </Tooltip>
    );
}

export default Chip;
