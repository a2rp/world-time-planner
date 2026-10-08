const partsFor = (date, timeZone) => {
    const values = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    return Object.fromEntries(values.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
};

const datePartAsUtc = ({ year, month, day }) => Date.UTC(Number(year), Number(month) - 1, Number(day));

const offsetAt = (instant, timeZone) => {
    const parts = partsFor(instant, timeZone);
    const zoneTimeAsUtc = datePartAsUtc(parts) + Number(parts.hour) * 3600000 + Number(parts.minute) * 60000 + Number(parts.second) * 1000;
    return zoneTimeAsUtc - instant.getTime();
};

export const localDateTimeForZone = (instant, timeZone) => {
    const parts = partsFor(instant, timeZone);
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const instantFromZonedInput = (value, timeZone) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
    const [date, time] = value.split("T");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const wallTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    let instant = wallTimeAsUtc;
    for (let attempt = 0; attempt < 3; attempt += 1) instant = wallTimeAsUtc - offsetAt(new Date(instant), timeZone);
    return new Date(instant);
};

export const compareInZone = (instant, sourceZone, targetZone) => {
    const source = partsFor(instant, sourceZone);
    const local = partsFor(instant, targetZone);
    const dayOffset = Math.round((datePartAsUtc(local) - datePartAsUtc(source)) / 86400000);
    const weekdayNumber = new Date(datePartAsUtc(local)).getUTCDay();
    const hour = Number(local.hour);
    return {
        time: new Intl.DateTimeFormat("en-US", { timeZone: targetZone, hour: "numeric", minute: "2-digit", hour12: true }).format(instant),
        date: new Intl.DateTimeFormat("en-US", { timeZone: targetZone, weekday: "short", month: "short", day: "numeric" }).format(instant),
        dayOffset,
        hour,
        workingHours: weekdayNumber > 0 && weekdayNumber < 6 && hour >= 9 && hour < 17,
        offset: new Intl.DateTimeFormat("en", { timeZone: targetZone, timeZoneName: "shortOffset" }).formatToParts(instant).find(({ type }) => type === "timeZoneName")?.value ?? "UTC",
        isNight: hour < 6 || hour >= 20,
    };
};

export const formatInZone = (instant, timeZone) => new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(instant);

export const dateInZone = (instant, timeZone) => new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(instant);
