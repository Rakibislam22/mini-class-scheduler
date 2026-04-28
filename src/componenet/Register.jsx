import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ROLES, getDashboardPath, getStoredAuth, isValidRole, storeAuth } from '../lib/appState';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Register = () => {
    const navigate = useNavigate();
    const existingAuth = getStoredAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });
    const [message, setMessage] = useState({ type: 'info', text: 'Create a profile and enter the matching dashboard.' });

    if (existingAuth) {
        return <Navigate to={getDashboardPath(existingAuth.role)} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Fill in every field before registering.' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (!isValidRole(formData.role)) {
            setMessage({ type: 'error', text: 'Choose a valid role before creating the account.' });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const payload = await res.json();
            if (!res.ok || !payload?.success) {
                setMessage({ type: 'error', text: payload?.message || 'Registration failed.' });
                return;
            }

            storeAuth(payload.user);
            navigate(getDashboardPath(payload.user.role));
        } catch (err) {
            setMessage({ type: 'error', text: 'Registration failed.' });
        }
    };

    return (
        <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                <aside className="order-2 rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-teal-400/5 to-cyan-400/10 p-6 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-8 lg:order-1">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">Create account</p>
                    <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
                        <div className="rounded-2xl bg-slate-950/40 p-4">
                            <p className="font-semibold text-white">Pick a role</p>
                            <p className="mt-1 text-slate-300">Choose teacher or student to open the matching dashboard after sign-up.</p>
                        </div>
                        <div className="rounded-2xl bg-slate-950/40 p-4">
                            <p className="font-semibold text-white">Work flow</p>
                            <p className="mt-1 text-slate-300">This stores the account in database so you can move straight into the app flow.</p>
                        </div>
                    </div>
                </aside>

                <section className="order-1 space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-10 lg:order-2">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Register</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Set up your role and enter the right dashboard.</h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                            Use the registration screen to choose the account type that matches the way you want to use the scheduler.
                        </p>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Email</span>
                            <input
                                type="email"
                                placeholder="mail@site.com"
                                value={formData.email}
                                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Name</span>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Password</span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Confirm password</span>
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Role</span>
                            <select
                                value={formData.role}
                                onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value} className="bg-slate-900 text-white">
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                            Register
                        </button>
                    </form>

                    <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${message.type === 'error'
                            ? 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                            : 'border-white/10 bg-white/5 text-slate-300'
                            }`}
                    >
                        {message.text}
                    </div>

                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
                            Sign in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default Register;