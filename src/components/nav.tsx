import React from "react";
import { Link, NavLink } from "react-router-dom";
import {useUser} from "./users/userContext";

const AdminLinks = (
    <>
        <li className="nav-item">
            <NavLink to="/admin/users" className="nav-link text-white">Users</NavLink>
        </li>

        <li className="nav-item">
            <NavLink to="/admin/records" className="nav-link text-white">Records</NavLink>
        </li>

        <li className="nav-item">
            <NavLink to="/admin/rates" className="nav-link text-white">Rates</NavLink>
        </li>
    </>
);

const FarmerLinks = (
    <>
        <li className="nav-item">
            <NavLink to="/farmers/records" className="nav-link text-white">Records</NavLink>
        </li>

        <li className="nav-item">
            <NavLink to="/farmers/rates" className="nav-link text-white">Rates</NavLink>
        </li>
    </>
);

const MilkCollectorLinks = (
    <>
        <li className="nav-item">
            <NavLink to="/milk-collectors/records" className="nav-link text-white">Records</NavLink>
        </li>

        <li className="nav-item">
            <NavLink to="/milk-collectors/rates" className="nav-link text-white">Rates</NavLink>
        </li>
    </>
);

const AccountsLinks = (user: any) => (
    <ul className="nav nav-pills ms-auto">
        {user ? (
            <>
                <span className="navbar-text">{user?.firstName} logged in</span>
                <li className="nav-item">
                    <NavLink exact to="/accounts/logout" className="nav-link text-white">Logout</NavLink>
                </li>
            </>
        ): (
            <>
                <li className="nav-item">
                    <NavLink exact to="/accounts/login" className="nav-link text-white">Login</NavLink>
                </li>

                <li className="nav-item">
                    <NavLink exact to="/accounts/register" className="nav-link text-white">Register</NavLink>
                </li>
            </>
        )}
    </ul>
);

export default function Nav() {
    const user = useUser();

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-success sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    {user?.role === "admin" ? "SDRM Admin" : "SDRM"}
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarContent" aria-controls="navbarContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="nav nav-pills">
                        <li className="nav-item">
                            <NavLink exact to="/" className="nav-link text-white">Home</NavLink>
                        </li>
                        {user?.role === "admin" ? AdminLinks : null}
                        {user?.role === "farmer" ? FarmerLinks : null}
                        {user?.role === "milk collector" ? MilkCollectorLinks: null}
                    </ul>
                    {AccountsLinks(user)}
                </div>
            </div>
        </nav>
    );
}
