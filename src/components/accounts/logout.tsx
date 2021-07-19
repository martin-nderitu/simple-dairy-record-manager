import React, {useState} from "react";
import {useSetUser} from "../users/userContext";
import {Accounts} from "../api";
import {useHistory} from "react-router-dom";
import LoadingScreen from "../spinners/loadingScreen";
import log from "../../log";


export default function Logout() {
    const history = useHistory();
    const setUser = useSetUser();

    (async () => {
        const response = await Accounts.logout();
        log("\n\nlogout response = ", response, "\n\n");

        if (response?.ok) {
            // @ts-ignore
            setUser(null);
            const message = { type: "success", message: "You've been logged out" };
            history.push({ pathname: "/accounts/login", state: {message} });
        } else if (response?.data.error) {
            log("\n\nlogout error = ", response.data.error, "\n\n");
        }
    })();

    return ( <LoadingScreen/> );
}

