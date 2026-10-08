import { useEffect, useRef } from "react";
import { FaXmark } from "react-icons/fa6";
import styles from "./styles.module.css";

const DeleteZoneDialog = ({ city, onClose, onConfirm }) => {
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        const previousFocus = document.activeElement;
        cancelRef.current?.focus();
        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key === "Tab") {
                const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled)")];
                if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
                else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0]?.focus(); }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => { window.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
    }, [city, onClose]);

    const onOverlayMouseDown = (event) => { if (event.target === event.currentTarget) onClose(); };

    return <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
        <section ref={dialogRef} className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="remove-zone-heading" aria-describedby="remove-zone-description">
            <button className={styles.closeButton} type="button" aria-label="Close dialog" onClick={onClose}><FaXmark aria-hidden="true" /></button>
            <span className={styles.dialogGlyph}>−</span>
            <p className={styles.dialogLabel}>REMOVE CITY</p>
            <h2 id="remove-zone-heading">Remove {city.city}?</h2>
            <p id="remove-zone-description">This city will be taken off your comparison board. Your other saved clocks will stay as they are.</p>
            <div className={styles.dialogActions}><button ref={cancelRef} type="button" className={styles.cancelButton} onClick={onClose}>Keep city</button><button type="button" className={styles.removeConfirm} onClick={onConfirm}>Remove city</button></div>
        </section>
    </div>;
};

export default DeleteZoneDialog;
