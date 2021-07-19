import React, {useMemo} from "react";
import {Route} from "react-router-dom";
import {RatesView} from "../rates";
import {MilkCollector} from "../api";
import {format} from "date-fns";


export default function Rates() {
    const cols = useMemo(() => [
        {title: "Start date", field: "startDate",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy").toString()
        },
        {title: "End date", field: "endDate",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy").toString()
        },
        {title: "Rate (Ksh.)", field: "rate"},
        {title: "Date created", field: "createdAt",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy HH:mm:ss").toString()
        },
    ],[]);

    return (
        <>
            <Route
                exact path="/milk-collectors/rates"
                // @ts-ignore
                render={ (props) =>
                    <RatesView
                        cols={cols}
                        fetchCallback={(query: string) => MilkCollector.Rates.findAll(query)}
                        selection={false}
                        {...props}
                    />
                }
            />
        </>
    );
}