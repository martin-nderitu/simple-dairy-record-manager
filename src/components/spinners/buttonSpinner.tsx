export default function ButtonSpinner({text = null}: {text: string | null}) {
    return (
        <>
            {text && <span className="p-2">{text}</span>}
            <span className="spinner-border spinner-border-sm" role="status"/>
        </>
    );
}
