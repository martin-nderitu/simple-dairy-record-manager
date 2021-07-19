import {Route} from "react-router-dom";
import {RecordsView} from "../records";
import {useMemo} from "react";
import {Farmer} from "../api";
import {format} from "date-fns";


export default function Records() {
    const cols = useMemo(() => [
        {title: "Amount (litres)", field: "amount"},
        {title: "Shift", field: "shift"},
        {title: "Rate (Ksh.)", field: "rate",
            callback: (rate: any) => rate.rate.toString()
        },
        {title: "Date created", field: "createdAt",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy HH:mm:ss").toString()

        },
    ],[]);

    return (
        <>
            <Route
                exact path="/farmers/records"
                // @ts-ignore
                render={ (props) =>
                    <RecordsView
                        cols={cols}
                        fetchCallback={(query: string) => Farmer.Records.findAll(query)}
                        selection={false}
                        {...props}
                    />
                }
            />
        </>
    );
}