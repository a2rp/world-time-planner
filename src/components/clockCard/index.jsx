import { FaXmark } from "react-icons/fa6";
import styles from "./styles.module.css";

const dayShiftLabel = (shift) => shift === 0 ? "SAME DAY" : shift === 1 ? "NEXT DAY" : shift === -1 ? "PREVIOUS DAY" : `${shift > 0 ? "+" : ""}${shift} DAYS`;

const ClockCard = ({ city, clock, index, onRemove }) => (
    <article className={styles.clockCard} data-night={clock.isNight}>
        <div className={styles.cityHead}>
            <div><span className={styles.cityIndex}>{String(index + 1).padStart(2, "0")}</span><div className={styles.cityName}><h3>{city.city}</h3><span>{city.country}</span></div></div>
            <button type="button" className={styles.removeButton} aria-label={`Remove ${city.city}`} onClick={() => onRemove(city)}><FaXmark aria-hidden="true" /></button>
        </div>
        <div className={styles.zoneName}>{city.zone}</div>
        <div className={styles.timeLine}><p>{clock.time}</p><span>{clock.offset}</span></div>
        <div className={styles.dateLine}><span>{clock.date}</span><span className={styles.dayShift}>{dayShiftLabel(clock.dayOffset)}</span></div>
        <div className={styles.workLine}><span className={styles.statusDot} />{clock.workingHours ? "Within weekday work hours" : "Outside weekday work hours"}</div>
    </article>
);

export default ClockCard;
