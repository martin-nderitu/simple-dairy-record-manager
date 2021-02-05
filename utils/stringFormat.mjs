import isEmpty from "./isEmpty.mjs";

function toTitleCase(str) {
    str = str.trim();
    if (isEmpty(str)) {
        return str;
    }
    return str.toLowerCase().split(" ").map( word => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(" ");
}

function truncateSentence(str, max=10) {
    str = str.trim();
    if (isEmpty(str)) {
        return str;
    } else {
        const strArray = str.split(" ");
        const ellipsis = strArray.length > max ? "..." : "";
        return strArray.slice(0, max).join(" ") + ellipsis;
    }
}

export {
    toTitleCase, truncateSentence
}