import Modal from "../modal";

interface ActionsProps {
    actions: {
        rows: number;
        destroy: {
            handleDestroy: () => Promise<void>;
            modalTitle: string;
            modalBody: string;
        }
    }
}

export default function Actions ({actions}: ActionsProps) {
    const {rows, destroy} = actions;

    return (
        <>
            {rows &&
                <div className="mt-3">
                    <span className="me-2">{rows} row(s) selected. With selected:</span>
                    <button
                        type="button"
                        className="ml-3 btn btn-danger rounded-0"
                        data-bs-toggle="modal"
                        data-bs-target="#delete"
                    >
                        Delete
                    </button>
                    <Modal
                        id="delete"
                        label="deleteLabel"
                        title={destroy.modalTitle}
                        body={destroy.modalBody}
                        handleAction={destroy.handleDestroy}
                    />
                </div>
            }
        </>
    );
}
