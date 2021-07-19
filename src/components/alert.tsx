import {useState, useEffect} from "react";

type Message = {
    type: string;
    message: string;
}

interface AlertProps {
    message: Message | null;
    setMessage: any;
    timeout?: number;
}

export default function Alert ({message, setMessage, timeout=10000}: AlertProps) {
    const [show, setShow] = useState(true);

    useEffect( () => {
        if (timeout) {
            const timer = setTimeout(() => {
                setShow(false);
                setMessage(null);
            }, timeout);
            return () => clearTimeout(timer);
        }
    }, [setMessage, timeout]);

    const handleClick = () => {
        setShow(false);
        setMessage(null);
    }

    return (
        <>
            { show && message &&
                <div className={`alert alert-${message.type} alert-dismissible fade show rounded-0`} role="alert">
                    {message.message}
                    <button type="button" className="btn-close" onClick={handleClick} aria-label="Close"/>
                </div>
            }
        </>
    );
};