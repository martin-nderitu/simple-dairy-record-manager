import { Route } from "react-router-dom";
import Users from "./users";
import Rates from "./rates";
import Records from "./records";

export default function AdminRoutes() {
    return (
        <>
            <Route path="/admin/users" component={Users} />

            <Route path="/admin/rates" component={Rates} />

            <Route path="/admin/records" component={Records} />
        </>
    );
}

