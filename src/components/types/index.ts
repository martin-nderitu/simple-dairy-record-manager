export interface Pagination {
    [k: string]: number;
    count: number;
    offset: number;
    limit: number;
    currentPage: number;
}

export interface Message {
    type: string;
    message: string;
}

export interface ViewManyProps {
    createLink?: string;
    selection?: boolean;
    cols: {
        [k: string]: any;
        title: string;
        field: string;
        link?: string;
        foreignKey?: {
            field: string;
            link: string;
        };
    }[];
    fetchCallback: (query: string) => Promise<{data: any, ok: any, status: any} | undefined>;
}

export interface SearchFormProps {
    handleSearchForm: (values: {[k: string]: string}) => void;
}