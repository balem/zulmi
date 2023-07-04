import React, { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router';
//import login from 'app/auth/store/reducers/login.reducer';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';


function zroute() {
    
    function RenderObject() {
        const user = useSelector(({ auth }) => auth.user);
        let userEmail = user.data.email;
        let userRole = user.role[0];
    
        console.log('USER ', user)
        if ((userRole == 'master') || (userRole == 'rh') || (userRole == 'rh_not_signer') || (userRole == 'director')) {
            return <Redirect to='/dashboard'/>;
        } else if(userRole == 'seguridad') {
            return <Redirect to='/user-maintenance'/>;
        }else{
            return <Redirect to='/document-list'/>;
        }
    }
    return (
        <div>
            <RenderObject />
        </div>
    );
}

export default zroute;
