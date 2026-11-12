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

const wallTimeAsUtc = (value) => {
    if (typeof value !== "string") return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) return null;
    const [, year, month, day, hour, minute] = match.map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, 0, 0);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || date.getUTCHours() !== hour || date.getUTCMinutes() !== minute) return null;
    return date.getTime();
};

export const isValidLocalDateTime = (value) => wallTimeAsUtc(value) !== null;

export const instantFromZonedInput = (value, timeZone) => {
    const wallTime = wallTimeAsUtc(value);
    if (wallTime === null) return null;
    let instant = wallTime;
    try {
        for (let attempt = 0; attempt < 3; attempt += 1) instant = wallTime - offsetAt(new Date(instant), timeZone);
    } catch { return null; }
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
