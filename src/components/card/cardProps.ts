type Message = {
    type: string;
    message: string;
}

export default interface CardProps {
    title: string;
    message?: Message | null;
    setMessage?: any;
    body: any;
    footer?: any;
}