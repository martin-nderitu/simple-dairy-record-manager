import {Route} from "react-router-dom";
import {RecordsView, CreateRecord, UpdateRecord} from "../records";
import {useMemo} from "react";
import {MilkCollector} from "../api";
import {format} from "date-fns";


export default function Records() {
    const cols = useMemo(() => [
        {title: "Id", field: "id", link: "/milk-collectors/records/update"},
        {title: "Amount (litres)", field: "amount"},
        {title: "Shift", field: "shift"},
        {title: "Farmer id", field: "farmerId"},
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
                exact path="/milk-collectors/records"
                // @ts-ignore
                render={ (props) =>
                    <RecordsView
                        createLink="/milk-collectors/records/create"
                        cols={cols}
                        fetchCallback={(query: string) => MilkCollector.Records.findAll(query)}
                        selection={false}
                        {...props}
                    />
                }
            />

            <Route exact path="/milk-collectors/records/create" component={CreateRecord}/>

            <Route
                exact path="/milk-collectors/records/update/:id"
                // @ts-ignore
                render={ (props) =>
                    <UpdateRecord
                        fetchCallback={(id: string | number) => MilkCollector.Records.find(id)}
                        updateCallback={(values: any) => MilkCollector.Records.update(values)}
                        destroyCallback={(id: string | number) => MilkCollector.Records.destroy(id)}
                        recordsPath="/milk-collectors/records"
                        {...props}
                    />
                }
            />
        </>
    );
}