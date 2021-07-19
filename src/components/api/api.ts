import log from "../../log";

async function getResponse (response: any) {
    return {
        data: await response.json(),
        ok: response.ok,
        status: response.status,
    }
}

async function get (url: string) {
    try {
        let response = await fetch(url, {
            method: "get",
            headers: {
                "Accept": "application/json",
            }
        });
        return await getResponse(response);
    } catch (error) {
        log("\n\nError in get:", error, "\n\n");
    }
}

async function post (url: string, data: any) {
    try {
        const response = await fetch(url, {
            method: "post",
            body: JSON.stringify(data),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });
        return await getResponse(response);
    } catch (error) {
        log("\n\nError in post:", error, "\n\n");
    }
}

async function put (url: string, data: any) {
    try {
        let response = await fetch(url, {
            method: "put",
            body: JSON.stringify(data),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });
        return await getResponse(response);
    } catch (error) {
        log("\n\nError in put:", error, "\n\n");
    }
}

async function destroy (url: string) {
    try {
        let response = await fetch(url, {
            method: "delete",
            headers: {
                "Accept": "application/json",
            }
        });
        return await getResponse(response);
    } catch (error) {
        log("\n\nError in destroy:", error, "\n\n");
    }
}

function ApiFactory(url: string) {
    return {
        findAll: async (query = "") => {
            try {
                let URL = url;
                if (query.length) {
                    URL += `?${query}`;
                }
                return await get(URL);
            } catch (error) {
                log("\n\nError in findAll. Url : ", URL, " Error: ", error, "\n\n");
            }
        },

        create: async (data: any) => {
            try {
                return await post(url, data)
            } catch (error) {
                log("\n\nError in create. Url: ", url, " Error: ", error, "\n\n");
            }
        },

        find: async (id: string | number) => {
            try {
                return await get(`${url}/${id}`);
            } catch (error) {
                log("\n\nError in find. Url: : ", url, " Error: ", error, "\n\n");
            }
        },

        update: async (data: any) => {
            try {
                return await put(url, data);
            } catch (error) {
                log("\n\nError in update. Url: ", url, " Error: ", error, "\n\n");
            }
        },

        destroy: async (id: string | number) => {
            try {
                log("\n\ndestroy url = ", `${url}/${id}`, "\n\n");
                log("\n\ndestroy url id = ", id, "\n\n");
                return await destroy(`${url}/${id}`);
            } catch (error) {
                log("\n\nError in destroy. Url: ", url, " Error: ", error, "\n\n");
            }
        },
    }
}

function Accounts() {
    const ACCOUNTS_URL = "/api/accounts";

    return {
        login: async (data: any) => {
            try {
                const url = `${ACCOUNTS_URL}/login`;
                return await post(url, data)
            } catch (error) {
                log("\n\nError logging in: ", error, "\n\n");
            }
        },

        isLoggedIn: async () => {
            try {
                const url = `${ACCOUNTS_URL}/check/logged-in`;
                return await get(url);
            } catch (error) {
                log("\n\nError checking if logged in: ", error, "\n\n");
            }
        },

        register: async (data: any) =>{
            try {
                const url = `${ACCOUNTS_URL}/register`;
                return await post(url, data)
            } catch (error) {
                log("\n\nError registering: ", error, "\n\n");
            }
        },

        logout: async () => {
            try {
                const url = `${ACCOUNTS_URL}/logout`;
                return await get(url);
            } catch (error) {
                log("\n\nError logging out: ", error, "\n\n");
            }
        }
    };
}

function Admin() {
    const ADMIN_URL = "/api/admin";
    const Users = ApiFactory(`${ADMIN_URL}/users`);
    const Rates = ApiFactory(`${ADMIN_URL}/rates`);
    const Records = ApiFactory(`${ADMIN_URL}/records`);
    return {
        Users, Rates, Records
    }
}

function Farmer() {
    const FARMER_URL = "/api/farmers";
    const Records = ApiFactory(`${FARMER_URL}/records`);
    const Rates = ApiFactory(`${FARMER_URL}/rates`);
    return {
        Records, Rates
    }
}

function MilkCollector() {
    const MILK_COLLECTOR_URL = "/api/milk-collectors";
    const Records = ApiFactory(`${MILK_COLLECTOR_URL}/records`);
    const Rates = ApiFactory(`${MILK_COLLECTOR_URL}/rates`);
    return {
        Records, Rates
    }
}

const Api = {
    Accounts: Accounts(),
    Admin: Admin(),
    Farmer: Farmer(),
    MilkCollector: MilkCollector()
}

export default Api;
