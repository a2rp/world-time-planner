import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarDays, FaChevronDown, FaGlobe, FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import ClockCard from "../clockCard/index.jsx";
import DeleteZoneDialog from "../deleteZoneDialog/index.jsx";
import { initialReferenceZone, initialZoneIds, timeZones as availableZones } from "../../data/timeZones.js";
import { compareInZone, formatInZone, instantFromZonedInput, localDateTimeForZone } from "../../utils/timeConversion.js";
import styles from "./styles.module.css";

const storageKey = "hourline-world-time-v1";
const findZone = (id) => availableZones.find((city) => city.id === id);
const getDefaultSettings = () => ({ zoneIds: initialZoneIds, referenceZone: initialReferenceZone, referenceTime: localDateTimeForZone(new Date(), initialReferenceZone) });

const readSettings = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && Array.isArray(saved.zoneIds) && availableZones.some((city) => city.zone === saved.referenceZone)) {
            return {
                zoneIds: saved.zoneIds.filter((id) => findZone(id)),
                referenceZone: saved.referenceZone,
                referenceTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(saved.referenceTime) ? saved.referenceTime : localDateTimeForZone(new Date(), saved.referenceZone),
            };
        }
    } catch { /* Start with the example city board if browser storage is unavailable. */ }
    return getDefaultSettings();
};

const WorldClockBoard = () => {
    const [settings] = useState(readSettings);
    const [zoneIds, setZoneIds] = useState(settings.zoneIds);
    const [referenceZone, setReferenceZone] = useState(settings.referenceZone);
    const [referenceTime, setReferenceTime] = useState(settings.referenceTime);
    const [liveMode, setLiveMode] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [cityToRemove, setCityToRemove] = useState(null);
    const pickerRef = useRef(null);
    const searchRef = useRef(null);
    const referenceCity = availableZones.find((city) => city.zone === referenceZone) ?? findZone("mumbai");

    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify({ zoneIds, referenceZone, referenceTime })); } catch { /* Current settings remain available if storage is full. */ }
    }, [zoneIds, referenceZone, referenceTime]);

    useEffect(() => {
        if (!liveMode) return undefined;
        const tick = () => setReferenceTime(localDateTimeForZone(new Date(), referenceZone));
        const timer = window.setInterval(tick, 30000);
        return () => window.clearInterval(timer);
    }, [liveMode, referenceZone]);

    useEffect(() => {
        if (!pickerOpen) return undefined;
        searchRef.current?.focus();
        const closeOnOutsideClick = (event) => { if (!pickerRef.current?.contains(event.target)) setPickerOpen(false); };
        const closeOnEscape = (event) => { if (event.key === "Escape") setPickerOpen(false); };
        document.addEventListener("pointerdown", closeOnOutsideClick);
        window.addEventListener("keydown", closeOnEscape);
        return () => { document.removeEventListener("pointerdown", closeOnOutsideClick); window.removeEventListener("keydown", closeOnEscape); };
    }, [pickerOpen]);

    const instant = useMemo(() => instantFromZonedInput(referenceTime, referenceZone), [referenceTime, referenceZone]);
    const cities = useMemo(() => zoneIds.map(findZone).filter(Boolean), [zoneIds]);
    const clocks = useMemo(() => instant ? cities.map((city) => ({ city, local: compareInZone(instant, referenceZone, city.zone) })) : [], [cities, instant, referenceZone]);
    const workCount = clocks.filter(({ local }) => local.workingHours).length;
    const referenceLocal = instant ? compareInZone(instant, referenceZone, referenceZone) : null;
    const matchingZones = useMemo(() => availableZones.filter((city) => !zoneIds.includes(city.id) && `${city.city} ${city.country} ${city.zone}`.toLowerCase().includes(search.trim().toLowerCase())), [search, zoneIds]);

    const setNow = () => { setReferenceTime(localDateTimeForZone(new Date(), referenceZone)); setLiveMode(true); };
    const handleReferenceZoneChange = (zone) => { setReferenceZone(zone); setLiveMode(false); };
    const handleReferenceTimeChange = (value) => { setReferenceTime(value); setLiveMode(false); };
    const addCity = (city) => { setZoneIds((current) => current.includes(city.id) ? current : [...current, city.id]); setSearch(""); setPickerOpen(false); };
    const closeDeleteDialog = useCallback(() => setCityToRemove(null), []);
    const removeCity = () => { const id = cityToRemove.id; setZoneIds((current) => current.filter((zoneId) => zoneId !== id)); setCityToRemove(null); };

    const overlapMessage = workCount >= 2 ? "There's room to meet." : workCount === 1 ? "One city is in work hours." : "Most clocks are off duty.";

    return <section className={styles.worldClockBoard} aria-label="World time comparison">
        <div className={styles.plannerControls}>
            <section className={styles.referencePanel}>
                <div className={styles.panelHeading}><div><p>PLAN FROM</p><h2>Choose your moment</h2></div><span className={styles.referenceIcon}><FaGlobe aria-hidden="true" /></span></div>
                <div className={styles.controlFields}>
                    <label className={styles.fieldGroup}><span>Starting city</span><span className={styles.selectWrap}><select value={referenceZone} onChange={(event) => handleReferenceZoneChange(event.target.value)} aria-label="Planning timezone">{availableZones.map((city) => <option value={city.zone} key={city.id}>{city.city}, {city.country}</option>)}</select><FaChevronDown aria-hidden="true" /></span></label>
                    <label className={styles.fieldGroup}><span>Date and local time</span><span className={styles.dateWrap}><FaCalendarDays aria-hidden="true" /><input type="datetime-local" value={referenceTime} onChange={(event) => handleReferenceTimeChange(event.target.value)} aria-label="Reference date and time" /></span></label>
                    <button className={`${styles.liveButton} ${liveMode ? styles.liveActive : ""}`} type="button" onClick={setNow} aria-pressed={liveMode}><span />{liveMode ? "Live now" : "Use current time"}</button>
                </div>
                <p className={styles.referenceFootnote}>{referenceLocal ? `${formatInZone(instant, referenceZone)} in ${referenceCity.city} · ${referenceLocal.offset}` : "Choose a valid date and time to compare."}</p>
            </section>

            <section className={styles.overlapCard} aria-live="polite">
                <p>MEETING WINDOW</p>
                <div className={styles.overlapCount} role="status" aria-label={`${workCount} of ${clocks.length} cities in weekday work hours`}><strong>{workCount}</strong><span>of {clocks.length} cities in weekday work hours</span></div>
                <h2>{overlapMessage}</h2>
                <span className={styles.overlapTrack} aria-hidden="true"><i style={{ width: `${clocks.length ? workCount / clocks.length * 100 : 0}%` }} /></span>
                <span className={styles.overlapTip}>{workCount >= 2 ? "Check the city cards for the best local fit." : workCount === 1 ? "Try moving the time to find more overlap." : "Move the reference time and compare again."}</span>
            </section>
        </div>

        <div className={styles.clockSection} id="clocks">
            <div className={styles.clockSectionHeader}><div><p>CITY BOARD</p><h2>One moment, around the world.</h2><span>Local time, date, and weekday work hours for each saved city.</span></div>
                <div className={styles.addZoneWrap} ref={pickerRef}>
                    <button className={styles.addZoneButton} type="button" onClick={() => setPickerOpen((open) => !open)} aria-expanded={pickerOpen} aria-controls="timezone-picker"><FaPlus aria-hidden="true" /> Add city</button>
                    {pickerOpen && <div className={styles.zonePicker} id="timezone-picker">
                        <label className={styles.searchField}><FaMagnifyingGlass aria-hidden="true" /><input ref={searchRef} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a city or timezone" aria-label="Search cities" /></label>
                        {matchingZones.length ? <ul>{matchingZones.map((city) => <li key={city.id}><button type="button" onClick={() => addCity(city)}><span><strong>{city.city}</strong><small>{city.country}</small></span><code>{city.zone}</code></button></li>)}</ul> : <p className={styles.noMatches}>No cities found. Clear the search or remove a duplicate.</p>}
                    </div>}
                </div>
            </div>

            {clocks.length ? <div className={styles.clockGrid}>{clocks.map(({ city, local }, index) => <ClockCard city={city} clock={local} index={index} key={city.id} onRemove={setCityToRemove} />)}</div> : <div className={styles.emptyBoard}><span>YOUR BOARD IS CLEAR</span><strong>Add a city to compare its local time.</strong><button type="button" onClick={() => setPickerOpen(true)}>Choose a city</button></div>}
            {cityToRemove && <DeleteZoneDialog city={cityToRemove} onClose={closeDeleteDialog} onConfirm={removeCity} />}
        </div>
    </section>;
};

export default WorldClockBoard;
