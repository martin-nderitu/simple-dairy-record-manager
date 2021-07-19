import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {Accounts} from "../api";

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserContext = createContext<User | null>(null);
const UserSetContext = createContext(null);

export const useUser =  () => useContext(UserContext);
export const useSetUser = () => useContext(UserSetContext);

export function UserProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState(null);

    const isLoggedIn = useCallback(async () => {
        const response = await Accounts.isLoggedIn();
        if (response?.ok) { setUser(response.data.user) }
    }, []);

    useEffect(() => { (async () => await isLoggedIn())() }, []);

    return (
        <UserContext.Provider value={user}>
            {/* @ts-ignore */}
            <UserSetContext.Provider value={setUser}>
                {children}
            </UserSetContext.Provider>
        </UserContext.Provider>
    );
}