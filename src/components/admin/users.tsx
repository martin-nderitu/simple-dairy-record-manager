import {useMemo} from "react";
import {Route} from "react-router-dom";
import {format} from "date-fns";
import UsersView from "../users/users";
import CreateUser from "../users/create";
import UpdateUser from "../users/update";
import {Admin} from "../api";

export default function Users() {
    const cols = useMemo(() => [
        {title: "Id", field: "id", link: "/admin/users/update"},
        {title: "Email", field: "email"},
        {title: "First name", field: "firstName"},
        {title: "Last name", field: "lastName"},
        {title: "Role", field: "role"},
        {title: "Active", field: "active"},
        {title: "Date joined", field: "createdAt",
            callback: (date: number | Date) => format(new Date(date), "E MMM dd yyyy HH:mm:ss").toString()
        },
    ],[]);

    return (
        <>
            <Route
                exact path="/admin/users"
                // @ts-ignore
                render={ (props) =>
                    <UsersView
                        createLink="/admin/users/create"
                        cols={cols}
                        fetchCallback={(query: string) => Admin.Users.findAll(query)}
                        {...props}
                    />
                }
            />
            <Route exact path="/admin/users/create" component={CreateUser}/>
            <Route
                exact path="/admin/users/update/:id"
                // @ts-ignore
                render={ (props) => <UpdateUser {...props}/> }
            />
        </>
    );
}