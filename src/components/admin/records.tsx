import {useMemo} from "react";
import {Route} from "react-router-dom";
import {RecordsView, CreateRecord, UpdateRecord} from "../records";
import {Admin} from "../api";
import {format} from "date-fns";

export default function Records() {
    const cols = useMemo(() => [
        {title: "Id", field: "id", link: "/admin/records/update"},
        {title: "Amount (litres)", field: "amount"},
        {title: "Shift", field: "shift"},
        {title: "Farmer id", field: "farmerId", foreignKey: { field: "farmerId", link: "/admin/users/update"}},
        {title: "Milk collector id", field: "milkCollectorId",  foreignKey: { field: "milkCollectorId", link: "/admin/users/update"}},
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
                exact path="/admin/records"
                // @ts-ignore
                render={ (props) =>
                    <RecordsView
                        createLink="/admin/records/create"
                        cols={cols}
                        fetchCallback={(query: string) => Admin.Records.findAll(query)}
                        {...props}
                    />
                }
            />

            <Route exact path="/admin/records/create" component={CreateRecord}/>

            <Route
                exact path="/admin/records/update/:id"
                // @ts-ignore
                render={ (props) =>
                    <UpdateRecord
                        fetchCallback={(id: string | number) => Admin.Records.find(id)}
                        updateCallback={(values: any) => Admin.Records.update(values)}
                        destroyCallback={(id: string | number) => Admin.Records.destroy(id)}
                        recordsPath="/admin/records"
                        {...props}
                    />
                }
            />
        </>
    );
}