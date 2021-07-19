import CardProps from "./cardProps";
import Alert from "../alert";

export default function FormCard({title, message, setMessage, body, footer = null}: CardProps) {
    return (
        <div className="container-fluid pt-5">
            <div className="row">
                <div className="col-md-7 mx-auto col-lg-5">
                    { message && (
                        <div className="pb-1">
                            <Alert message={message} setMessage={setMessage} />
                        </div>
                    )}
                    <div className="card shadow-lg rounded-0">
                        <div className="card-header text-white bg-success rounded-0">
                            <h4 className="text-lg-start">{title}</h4>
                        </div>

                        <div className="card-body">{body}</div>

                        { footer && <div className="card-footer">{ footer }</div> }
                    </div>
                </div>
            </div>
        </div>
    );
}
