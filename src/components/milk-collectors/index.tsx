import { Route } from "react-router-dom";
import Rates from "./rates";
import Records from "./records";

export default function MilkCollectorRoutes() {
    return (
        <>
            <Route path="/milk-collectors/rates" component={Rates} />

            <Route path="/milk-collectors/records" component={Records} />
        </>
    );
}

