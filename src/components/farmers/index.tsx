import { Route } from "react-router-dom";
import Rates from "./rates";
import Records from "./records";

export default function FarmerRoutes() {
    return (
        <>
            <Route path="/farmers/records" component={Records} />

            <Route path="/farmers/rates" component={Rates} />
        </>
    );
}
