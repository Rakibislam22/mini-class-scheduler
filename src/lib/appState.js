const AUTH_STORAGE_KEY = 'mini-class-scheduler-auth';
const SLOT_STORAGE_KEY = 'mini-class-scheduler-slots';

export const SLOT_DURATION_MINUTES = 15;

export const ROLES = [
    {
        value: 'teacher',
        label: 'Teacher',
        description: 'Create and manage class openings.',
    },
    {
        value: 'student',
        label: 'Student',
        description: 'Browse and book available time slots.',
    },
];

const isBrowser = typeof window !== 'undefined';

export const isValidRole = (role) => ROLES.some((item) => item.value === role);

export const getRoleLabel = (role) => ROLES.find((item) => item.value === role)?.label ?? 'Member';

export const getDashboardPath = (role) => `/dashboard/${role}`;

export const getStoredAuth = () => {
    if (!isBrowser) {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsedValue = JSON.parse(rawValue);
        if (!parsedValue || !isValidRole(parsedValue.role)) {
            return null;
        }

        return parsedValue;
    } catch {
        return null;
    }
};

export const storeAuth = (auth) => {
    if (!isBrowser) {
        return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
    if (!isBrowser) {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const roundToNextQuarterHour = (date) => {
    const next = new Date(date);
    next.setSeconds(0, 0);
    const remainder = next.getMinutes() % SLOT_DURATION_MINUTES;
    if (remainder !== 0) {
        next.setMinutes(next.getMinutes() + (SLOT_DURATION_MINUTES - remainder));
    }

    return next;
};

export const createSlot = (startDateTime) => ({
    id: crypto.randomUUID(),
    start: startDateTime.toISOString(),
    end: new Date(startDateTime.getTime() + SLOT_DURATION_MINUTES * 60 * 1000).toISOString(),
    status: 'Available',
});

const createDefaultSlots = () => {
    const now = roundToNextQuarterHour(new Date());
    const first = new Date(now.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
    const second = new Date(first.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    return [createSlot(first), createSlot(second)];
};

export const loadStoredSlots = () => {
    if (!isBrowser) {
        return createDefaultSlots();
    }

    try {
        const rawValue = window.localStorage.getItem(SLOT_STORAGE_KEY);
        if (!rawValue) {
            return createDefaultSlots();
        }

        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : createDefaultSlots();
    } catch {
        return createDefaultSlots();
    }
};

export const saveStoredSlots = (slots) => {
    if (!isBrowser) {
        return;
    }

    window.localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(slots));
};