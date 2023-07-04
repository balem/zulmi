import React from 'react';
import {Typography, Paper} from '@material-ui/core';


function Widget(props)
{
    return (
        <Paper className="w-full rounded-8 shadow-none border-1">
            <div className="text-center pt-12 pb-28">
                <Typography
                    className={`text-72 leading-none ${props.color}`}>{props.value}</Typography>
                <Typography className="text-16" color="textSecondary">{props.label}</Typography>
            </div>
        </Paper>
    );
}

export default Widget;
