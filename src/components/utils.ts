export function isEmpty (value: any) {
    return value === undefined ||
        value === null ||
        (typeof value === "object" && Object.keys(value).length === 0) ||
        (typeof value === "string" && value.trim().length === 0);
}

export function generateQuery(obj: any) {
    return Object.entries(obj).map( ([key, value]) => {
        if (value) { return `${key}=${value}`; }
    }).filter( (value) => value !== undefined ).join("&");
}
