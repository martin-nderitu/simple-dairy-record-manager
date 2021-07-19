import {useState, useEffect, useRef} from "react";
import {isEmpty} from "../utils";
import {Link} from "react-router-dom";
import log from "../../log";


interface Col {
    title: string;
    field: string;
    link?: string;
    foreignKey?: {
        field: string;
        link: string;
    },
    callback?: (value: any) => any;
}

interface TableProps {
    cols: Col [];
    data: any[];
    handleChecked: (checked: string []) => void;
    selection: boolean;
}


export default function Table ({cols, data, handleChecked, selection}: TableProps) {
    const [checked, setChecked] = useState<{[k: string]: boolean}>({});
    const [dataIds, setDataIds] = useState<number[]>([]);

    useEffect( () => {
        if (selection) {
            const dataIds = data.map((item: any) => item.id);
            setDataIds(dataIds);
        }
    }, [data, selection]);

    useEffect(() => {
        const checkedValues = Object.keys(checked).filter(id => checked[id]);
        log("\n\nchecked values in table = ", checkedValues, "\n\n");
        handleChecked(checkedValues);
    }, [checked, handleChecked]);

    const handleClick = (event: any) => {
        const {target} = event;
        const temp: any = {};

        if (target.id === "0") {
            for (const id of dataIds) { temp[id] = target.checked; }
        } else {
            temp[target.id] = target.checked;
        }
        setChecked({...checked, ...temp});
    }

    const isChecked = (id: number) => {
        if (isEmpty(checked)) { return false; }

        if (id === 0) {
            for (const id of dataIds) {
                if (!checked[id]) { return false; }
            }
            return true;
        }
        return !!checked[id];
    }

    const tableHeader = () => {
        return cols.map( (col, index) => {
            return (
                <th key={col.field} scope="col">{col.title}</th>
            );
        });
    }

    const td = (item: any) => {
        return cols.map( (col) => {
            return (
                <td key={`${col.field}${item.id}`} className="text-left">
                    {col.link ?
                        <Link to={`${col.link}/${item[col.field]}`}>{item[col.field]}</Link>:
                        <>
                            {col.foreignKey ?
                                <Link to={`${col.foreignKey.link}/${item[col.foreignKey.field]}`}>
                                    {item[col.field]}
                                </Link>:
                                <>
                                {col.callback ?
                                        `${col.callback(item[col.field])}`:
                                        `${item[col.field]}`
                                }
                                </>
                            }
                        </>
                    }
                </td>
            );
        });
    }

    const tableBody = () => {
        return data.map( (item) => {
            return (
                <tr key={`tr${item?.id}`}>
                    {selection &&
                    <td key={`checkboxTd${item.id}`}>
                        <input
                            key={`checkbox${item.id}`}
                            type="checkbox"
                            className="form-check-input"
                            id={item.id}
                            checked={isChecked(item.id)}
                            onChange={handleClick}
                        />
                    </td>
                    }
                    { td(item) }
                </tr>
            );
        });
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="text-white bg-success">
                <tr>
                    {selection &&
                    <th scope="col" style={{width: 50}}>
                        <input
                            key="selectAll"
                            type="checkbox"
                            className="form-check-input"
                            // @ts-ignore
                            id={0}
                            checked={isChecked(0)}
                            onChange={handleClick}
                        />
                    </th>
                    }
                    { tableHeader() }
                </tr>
                </thead>
                <tbody>
                { tableBody() }
                </tbody>
            </table>
        </div>
    );
}
