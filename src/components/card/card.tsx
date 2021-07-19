import CardProps from "./cardProps";
import Alert from "../alert";

export default function Card({title, message, setMessage, body, footer = null}: CardProps) {
    return (
        <div className="container-fluid pt-3">
            <div className="card shadow-lg rounded-0">
                { message && (
                    <div className="container pt-2">
                        <Alert message={message} setMessage={setMessage} />
                    </div>
                )}
                <div className="card-header text-white bg-success rounded-0">
                    <h4 className="text-lg-start">{title}</h4>
                </div>

                <div className="card-body">{body}</div>

                { footer && <div className="card-footer">{ footer }</div> }
            </div>
        </div>
    );
}
