import React from "react";
import {Route} from "react-router-dom";
import Login from "./login";
import Logout from "./logout";
import Register from "./register";

export default function Accounts() {
    return (
        <>
            <Route exact path="/accounts/login" component={Login} />

            <Route exact path="/accounts/register" component={Register} />

            <Route exact path="/accounts/logout" component={Logout} />
        </>
    );
}