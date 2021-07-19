import {useMemo} from "react";
import {Route} from "react-router-dom";
import {RatesView, CreateRate, UpdateRate} from "../rates";
import {Admin} from "../api";
import {format} from "date-fns";

export default function Rates() {
    const cols = useMemo(() => [
        {title: "Id", field: "id", link: "/admin/rates/update"},
        {title: "Start date", field: "startDate",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy").toString()
        },
        {title: "End date", field: "endDate",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy").toString()
        },
        {title: "Rate (Ksh.)", field: "rate"},
        {title: "Setter id", field: "setterId", foreignKey: { field: "setterId", link: "/admin/users/update"}},
        {title: "Date created", field: "createdAt",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy HH:mm:ss").toString()
        },
    ],[]);

    return (
        <>
            <Route
                exact path="/admin/rates"
                // @ts-ignore
                render={ (props) =>
                    <RatesView
                        createLink="/admin/rates/create"
                        cols={cols}
                        fetchCallback={(query: string) => Admin.Rates.findAll(query)}
                        {...props}
                    />
                }
            />
            <Route exact path="/admin/rates/create" component={CreateRate}/>
            <Route
                exact path="/admin/rates/update/:id"
                // @ts-ignore
                render={ (props) => <UpdateRate {...props}/> }
            />
        </>
    );
}