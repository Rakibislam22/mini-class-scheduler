/**
 * Mini Class Scheduler - React Dashboard Component
 *
 * Main dashboard for managing class scheduling functionality.
 * Supports two user roles with distinct responsibilities:
 *
 * TEACHER ROLE:
 * - Create 15-minute time slots for students to book
 * - View all slots they've created
 * - See which slots are available and which are booked
 *
 * STUDENT ROLE:
 * - Browse all available slots across all teachers
 * - Book available slots
 * - View their own booked slots
 *
 * Architecture:
 * - Uses React hooks (useState, useEffect, useMemo) for state management
 * - Fetches data from backend API (GET /slots, GET /slots/booked, GET /slots/created, etc.)
 * - Stores auth state in browser localStorage for persistence
 * - Two-column layout for both roles (left: primary action, right: reference data)
 */

import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import {
    clearStoredAuth,
    getDashboardPath,
    getRoleLabel,
    getStoredAuth,
    SLOT_DURATION_MINUTES,
} from './lib/appState';

// API base URL from environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Formats a datetime string into a localized, human-readable format.
 * Example output: "Tue, Jan 28, 2:30 PM"
 *
 * @param {string} value - ISO 8601 datetime string
 * @returns {string} Formatted date/time string using user's locale
 */
const formatDateTime = (value) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
};

/**
 * Returns the initial message to display on dashboard load.
 * Varies by user role to provide contextual guidance.
 *
 * @param {string} role - User role ('teacher' or 'student')
 * @returns {Object} Message object with type and text properties
 */
const getInitialMessage = (role) => {
    if (role === 'student') {
        return { type: 'info', text: 'Book an available 15-minute slot to reserve your class time.' };
    }

    return { type: 'info', text: 'Add a future 15-minute slot to start scheduling.' };
};

/**
 * Main App Component - Dashboard
 *
 * Renders the complete scheduling dashboard with authentication checks.
 * Dynamically shows teacher or student interface based on user role.
 * Handles all data fetching, slot management, and user interactions.
 *
 * State managed:
 * - slots: Array of all available slots or created slots (role-dependent)
 * - bookedSlots: Array of slots booked by the current student
 * - slotDate/slotTime: Form inputs for creating new slots (teachers only)
 * - message: Toast-like notifications (error/success/info)
 *
 * Side effects:
 * - Fetches slots on mount using role-specific endpoints
 * - Automatically refetches after creating or booking a slot
 * - Updates initial message based on active role
 */
const App = () => {
    // Router hooks for navigation
    const navigate = useNavigate();
    const { role: roleParam } = useParams();

    // State management
    const [slots, setSlots] = useState([]); // All slots (or teacher's created slots)
    const [bookedSlots, setBookedSlots] = useState([]); // Student's booked slots only
    const [slotDate, setSlotDate] = useState(''); // Form field: date input
    const [slotTime, setSlotTime] = useState(''); // Form field: time input
    const [message, setMessage] = useState({ type: 'info', text: 'Loading schedule...' }); // User feedback
    const [isAddingSlot, setIsAddingSlot] = useState(false); // Loading state for add slot button
    const [loadingSlotId, setLoadingSlotId] = useState(null); // Loading state for book slot buttons
    const [isLoggingOut, setIsLoggingOut] = useState(false); // Loading state for logout button

    // Auth from browser localStorage
    const auth = getStoredAuth();
    const activeRole = roleParam || auth?.role;

    /**
     * Fetches slots data from backend based on user role.
     *
     * TEACHER: Loads only slots they created (GET /slots/created?email=...)
     * STUDENT: Loads both all available slots (GET /slots) and their booked slots
     *          (GET /slots/booked?email=...) in parallel for efficiency
     *
     * Error handling: Sets error message visible to user if fetch fails
     */
    const fetchSlots = async () => {
        try {
            // Guard against missing auth or activeRole
            if (!auth?.email || !activeRole) {
                return;
            }

            // Teacher-specific endpoint: only their created slots
            if (activeRole === 'teacher') {
                const response = await fetch(`${API_BASE}/slots/created?email=${encodeURIComponent(auth.email)}`);
                const payload = await response.json();

                if (!response.ok || !payload?.success) {
                    setMessage({ type: 'error', text: payload?.message || 'Failed to load slots.' });
                    return;
                }

                setSlots(payload.slots || []);
                setBookedSlots([]); // Teachers don't use booked slots panel
                return;
            }

            // Student endpoints: load both available and booked slots in parallel
            const [allSlotsResponse, myBookedResponse] = await Promise.all([
                fetch(`${API_BASE}/slots`), // All slots for browsing
                fetch(`${API_BASE}/slots/booked?email=${encodeURIComponent(auth.email)}`), // Their bookings
            ]);

            const [allSlotsPayload, myBookedPayload] = await Promise.all([
                allSlotsResponse.json(),
                myBookedResponse.json(),
            ]);

            // Check for errors in either response
            if (!allSlotsResponse.ok || !allSlotsPayload?.success) {
                setMessage({ type: 'error', text: allSlotsPayload?.message || 'Failed to load slots.' });
                return;
            }

            if (!myBookedResponse.ok || !myBookedPayload?.success) {
                setMessage({ type: 'error', text: myBookedPayload?.message || 'Failed to load booked slots.' });
                return;
            }

            // Update both slot lists
            setSlots(allSlotsPayload.slots || []);
            setBookedSlots(myBookedPayload.slots || []);
        } catch {
            setMessage({ type: 'error', text: 'Failed to load slots.' });
        }
    };

    // Initialize message when role changes
    useEffect(() => {
        if (activeRole) {
            setMessage(getInitialMessage(activeRole));
        }
    }, [activeRole]);

    // Fetch slots when auth or activeRole changes
    useEffect(() => {
        if (auth && activeRole) {
            fetchSlots();
        }
    }, [auth, activeRole]);

    // ==================== AUTHENTICATION GUARDS ====================

    // Redirect unauthenticated users to login page
    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to correct dashboard if user tries to access wrong role path
    if (roleParam && roleParam !== auth.role) {
        return <Navigate to={getDashboardPath(auth.role)} replace />;
    }

    // Fallback guard (should not reach without activeRole if auth exists)
    if (!activeRole) {
        return <Navigate to={getDashboardPath(auth.role)} replace />;
    }

    // ==================== DERIVED STATE & MEMOIZATION ====================

    // Total number of slots (or booked slots for students)
    const totalSlots = slots.length;

    // Filter slots with "Available" status - shown to students for booking
    const availableSlots = useMemo(
        () => slots.filter((slot) => slot.status === 'Available'),
        [slots],
    );

    // Student's booked slots sorted by start time
    const sortedBookedSlots = useMemo(
        () => [...bookedSlots].sort((left, right) => new Date(left.start) - new Date(right.start)),
        [bookedSlots],
    );

    // All slots (teacher's created or all available) sorted by start time
    const sortedSlots = useMemo(
        () => [...slots].sort((left, right) => new Date(left.start) - new Date(right.start)),
        [slots],
    );

    /**
     * Checks if a proposed slot time overlaps with any existing slot.
     * Used to prevent double-booking the same time.
     *
     * Overlap logic: Two time ranges overlap if:
     * - candidateStart < existingEnd AND candidateEnd > existingStart
     *
     * @param {Date} candidateStart - Start time of proposed slot
     * @returns {boolean} True if overlap detected, false otherwise
     */
    const slotExists = (candidateStart) =>
        slots.some((slot) => {
            const existingStart = new Date(slot.start).getTime();
            const existingEnd = new Date(slot.end).getTime();
            const candidateEnd = candidateStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000;
            return candidateStart.getTime() < existingEnd && candidateEnd > existingStart;
        });

    /**
     * Handles slot creation form submission (Teachers only).
     * Validates date/time inputs, checks for conflicts, and submits to backend.
     *
     * Validations:
     * - Both date and time must be provided
     * - DateTime must be in the future
     * - No overlap with existing slots (checked locally before submission)
     *
     * Flow:
     * 1. Validate inputs
     * 2. Parse date/time into ISO string
     * 3. Check for overlaps
     * 4. POST to /slots with teacher email and name
     * 5. Refresh slot list and clear form
     *
     * @param {Event} event - Form submission event
     */
    const handleAddSlot = async (event) => {
        event.preventDefault();

        // Validate both date and time are selected
        if (!slotDate || !slotTime) {
            setMessage({ type: 'error', text: 'Choose both a date and a time.' });
            return;
        }

        // Parse the selected date and time into a Date object
        const candidateStart = new Date(`${slotDate}T${slotTime}`);

        // Validate the parsed date is valid
        if (Number.isNaN(candidateStart.getTime())) {
            setMessage({ type: 'error', text: 'The selected date and time are not valid.' });
            return;
        }

        // Prevent creating slots in the past
        if (candidateStart <= new Date()) {
            setMessage({ type: 'error', text: 'Past time slots cannot be added.' });
            return;
        }

        // Check for local overlap before submitting (improves UX by failing fast)
        if (slotExists(candidateStart)) {
            setMessage({ type: 'error', text: 'That slot overlaps with an existing 15-minute slot.' });
            return;
        }

        setIsAddingSlot(true);
        try {
            // Submit slot creation to backend
            const response = await fetch(`${API_BASE}/slots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: candidateStart.toISOString(),
                    createdBy: auth?.email ?? null, // Teacher's email for ownership
                    creatorName: auth?.name ?? null, // Teacher's name for display
                }),
            });

            const payload = await response.json();

            // Check for API errors
            if (!response.ok || !payload?.success) {
                setMessage({ type: 'error', text: payload?.message || 'Failed to add slot.' });
                setIsAddingSlot(false);
                return;
            }

            // Refresh the slot list to show the new slot
            await fetchSlots();

            // Show success message and reset form
            setMessage({ type: 'success', text: `Slot added for ${formatDateTime(candidateStart.toISOString())}.` });
            setSlotDate('');
            setSlotTime('');
            setIsAddingSlot(false);
        } catch {
            setMessage({ type: 'error', text: 'Failed to add slot.' });
            setIsAddingSlot(false);
        }
    };

    /**
     * Handles slot booking action (Students only).
     * Updates slot status from "Available" to "Booked" and records student email.
     *
     * Flow:
     * 1. Send PUT request to /slots/:id/book with student email
     * 2. Backend validates slot exists and is available
     * 3. Refresh slot lists to update counts and availability
     * 4. Display success or error message
     *
     * @param {string} slotId - MongoDB ObjectId of the slot to book
     */
    const handleBookSlot = async (slotId) => {
        setLoadingSlotId(slotId);
        try {
            // Submit booking request to backend
            const response = await fetch(`${API_BASE}/slots/${slotId}/book`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookedBy: auth?.email || null }), // Student's email for booking record
            });

            const payload = await response.json();

            // Check for API errors
            if (!response.ok || !payload?.success) {
                setMessage({ type: 'error', text: payload?.message || 'Failed to book slot.' });
                setLoadingSlotId(null);
                return;
            }

            // Refresh both available and booked slot lists
            await fetchSlots();

            // Show success message
            setMessage({ type: 'success', text: 'Slot booked successfully.' });
            setLoadingSlotId(null);
        } catch {
            setMessage({ type: 'error', text: 'Failed to book slot.' });
            setLoadingSlotId(null);
        }
    };


/**
 * Handles user logout.
 * Clears auth from localStorage and redirects to landing page.
 */
const handleLogout = async () => {
    setIsLoggingOut(true);
    clearStoredAuth();
    navigate('/');
};

// ==================== COMPUTED VALUES ====================

// Get human-readable label for the user's role (e.g., "Teacher" or "Student")
const roleLabel = getRoleLabel(activeRole);

// Determine which UI sections to show based on role
const canManageSlots = activeRole === 'teacher'; // Teachers see slot creation form
const canBookSlots = activeRole === 'student'; // Students see booking interface

// ==================== JSX RENDER ====================
// Main dashboard layout with:
// 1. Header: User info and logout button
// 2. Hero section: Dashboard title and stats
// 3. Role-specific content grid:
//    - Teachers: Left=Form to create slots, Right=List of created slots
//    - Students: Left=Available slots for booking, Right=Your booked slots

return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 px-5 py-4 shadow-xl shadow-slate-950/30 backdrop-blur sm:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Role dashboard</p>
                        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Welcome back, {auth.name}</h1>
                        <p className="mt-1 text-sm text-slate-400">Signed in as {auth.name ? `${auth.name} (${auth.email})` : auth.email}.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                            {roleLabel}
                        </span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Log out'}
                        </button>
                    </div>
                </div>
            </header>

            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/40 backdrop-blur">
                <div className="grid gap-8 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
                    <div className="space-y-6">
                        <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                            Class scheduler
                        </span>
                        <div className="space-y-4">
                            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                {activeRole === 'student'
                                    ? 'Browse available openings and book your class time.'

                                    : 'Manage class time slots and keep the schedule organized.'}
                            </h2>
                            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Create 15-minute slots, protect against overlaps and past times, then let students reserve any available opening.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {activeRole === 'teacher' ? (<article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Teacher</p>
                                <p className="mt-2 text-xl font-semibold text-white">{auth?.name || 'Unassigned'}</p>
                            </article>) : (
                                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">My booked slots</p>
                                    <p className="mt-2 text-xl font-semibold text-white">{sortedBookedSlots?.length || 0}</p>
                                </article>
                            )}


                            <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total slots</p>
                                <p className="mt-2 text-xl font-semibold text-white">{activeRole === 'student' ? sortedBookedSlots.length : totalSlots}</p>
                            </article>
                            <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Available</p>
                                <p className="mt-2 text-xl font-semibold text-white">{availableSlots.length}</p>
                            </article>
                        </div>
                    </div>

                    <aside className="rounded-[1.75rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-teal-400/5 to-cyan-400/10 p-6">
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">Today&apos;s flow</p>
                        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
                            {canManageSlots && (
                                <div className="rounded-2xl bg-slate-950/40 p-4">
                                    <p className="font-semibold text-white">Manage slots</p>
                                    <p className="mt-1 text-slate-300">Add future 15-minute openings and keep the calendar conflict-free.</p>
                                </div>
                            )}
                            {canBookSlots && (
                                <div className="rounded-2xl bg-slate-950/40 p-4">
                                    <p className="font-semibold text-white">Book a slot</p>
                                    <p className="mt-1 text-slate-300">Reserve an available opening before it disappears from the list.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                {canManageSlots && (
                    <>
                        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-white">Teacher Dashboard</h3>
                                    <p className="mt-2 text-sm text-slate-400">Create and manage slots for students.</p>
                                </div>
                            </div>

                            <form className="mt-6 space-y-4" onSubmit={handleAddSlot}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-300">Date</span>
                                        <input
                                            type="date"
                                            value={slotDate}
                                            onChange={(event) => setSlotDate(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:bg-white/10"
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-300">Time</span>
                                        <input
                                            type="time"
                                            value={slotTime}
                                            onChange={(event) => setSlotTime(event.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:bg-white/10"
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isAddingSlot}
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:bg-emerald-400/50 disabled:cursor-not-allowed"
                                >
                                    {isAddingSlot ? 'Adding slot...' : 'Add 15-minute slot'}
                                </button>
                            </form>

                            <div
                                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${message.type === 'error'
                                    ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                                    : message.type === 'success'
                                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                                        : 'border-white/10 bg-white/5 text-slate-300'
                                    }`}
                            >
                                {message.text}
                            </div>
                        </section>

                        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white">All created slots</h3>
                                <span className="text-sm text-slate-400">{sortedSlots.length} total</span>
                            </div>

                            <div className="mt-6 space-y-3">
                                {sortedSlots.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                                        No slots created yet.
                                    </div>
                                ) : (
                                    sortedSlots.map((slot) => (
                                        <article
                                            key={slot.id}
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{formatDateTime(slot.start)}</p>
                                                <p className="mt-1 text-sm text-slate-400">15 minutes long</p>
                                                <p className="mt-1 text-sm text-slate-400">Teacher: {slot.creatorName || auth?.name || 'Unassigned'}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.status === 'Booked'
                                                    ? 'bg-slate-200 text-slate-900'
                                                    : 'bg-emerald-400/15 text-emerald-200'
                                                    }`}
                                            >
                                                {slot.status}
                                            </span>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

                {canBookSlots && (
                    <>
                        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-white">Available Slots</h3>
                                    <p className="mt-2 text-sm text-slate-400">Browse available openings and book one instantly.</p>
                                </div>
                                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                    {availableSlots.length} available
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                {availableSlots.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                                        No available slots right now.
                                    </div>
                                ) : (
                                    availableSlots.map((slot) => (
                                        <article
                                            key={slot.id}
                                            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{formatDateTime(slot.start)}</p>
                                                <p className="mt-1 text-sm text-slate-400">Status: Available</p>
                                                <p className="mt-1 text-sm text-slate-400">Teacher: {slot.creatorName || auth?.name || 'Unassigned'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleBookSlot(slot.id)}
                                                disabled={loadingSlotId === slot.id}
                                                className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:bg-cyan-400/50 disabled:cursor-not-allowed"
                                            >
                                                {loadingSlotId === slot.id ? 'Booking...' : 'Book slot'}
                                            </button>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-white">My Booked Slots</h3>
                                    <p className="mt-2 text-sm text-slate-400">Track the openings you have already reserved.</p>
                                </div>
                                <span className="rounded-full bg-slate-200/10 px-3 py-1 text-xs font-semibold text-slate-200">
                                    {sortedBookedSlots.length} booked
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                {sortedBookedSlots.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                                        You have not booked any slot yet.
                                    </div>
                                ) : (
                                    sortedBookedSlots.map((slot) => (
                                        <article
                                            key={slot.id}
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                                        >
                                            <div>
                                                <p className="font-medium text-white">{formatDateTime(slot.start)}</p>
                                                <p className="mt-1 text-sm text-slate-400">Teacher: {slot.creatorName || 'Unassigned'}</p>
                                            </div>
                                            <span className={`rounded-full ${slot.start <= new Date().toISOString() ? 'bg-red-200' : 'bg-cyan-400'} px-3 py-1 text-xs font-semibold text-slate-900`}>
                                                {slot.start <= new Date().toISOString() ? 'Past' : 'Upcoming'}
                                            </span>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    </main>
);
};

// Export the App component as the default export for use in main.jsx
export default App;