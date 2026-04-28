import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { getDashboardPath, getStoredAuth, storeAuth } from '../lib/appState';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Login = () => {
    const navigate = useNavigate();
    const existingAuth = getStoredAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [message, setMessage] = useState({ type: 'info', text: 'Sign in to continue to the right dashboard.' });
    const [isLoading, setIsLoading] = useState(false);

    // Auto-clear error and success messages after 5 seconds
    useEffect(() => {
        if (message.type === 'error' || message.type === 'success') {
            const timer = setTimeout(() => {
                setMessage({ type: 'info', text: 'Sign in to continue to the right dashboard.' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (existingAuth) {
        return <Navigate to={getDashboardPath(existingAuth.role)} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Enter your email and password.' });
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const payload = await res.json();
            if (!res.ok || !payload?.success) {
                setMessage({ type: 'error', text: payload?.message || 'Login failed.' });
                setIsLoading(false);
                return;
            }

            storeAuth(payload.user);
            navigate(getDashboardPath(payload.user.role));
        } catch (err) {
            setMessage({ type: 'error', text: 'Login failed.' });
            setIsLoading(false);
            console.error(err.message);
        }
    };

    return (
        <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <section className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-10">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Welcome back</p>
                        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Sign in and jump to your role dashboard.</h1>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                            Choose the role you want to use, and the app will open the matching teacher, student, or admin view.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Email</span>
                            <input
                                type="email"
                                placeholder="mail@site.com"
                                value={formData.email}
                                onChange={(event) => {
                                    setFormData((current) => ({ ...current, email: event.target.value }));
                                    if (message.type === 'error') {
                                        setMessage({ type: 'info', text: 'Sign in to continue to the right dashboard.' });
                                    }
                                }}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-300">Password</span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(event) => {
                                    setFormData((current) => ({ ...current, password: event.target.value }));
                                    if (message.type === 'error') {
                                        setMessage({ type: 'info', text: 'Sign in to continue to the right dashboard.' });
                                    }
                                }}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white/10"
                            />
                        </label>

                        {/* Role selection removed on login; role is determined from account */}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:bg-cyan-400/50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Login'}
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
                        New here?{' '}
                        <Link to="/register" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
                            Create an account
                        </Link>
                    </p>
                </section>

                <aside className="rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-teal-400/5 to-cyan-400/10 p-6 shadow-xl shadow-slate-950/30 backdrop-blur sm:p-8">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">Quick overview</p>
                    <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
                        <div className="rounded-2xl bg-slate-950/40 p-4">
                            <p className="font-semibold text-white">Teacher</p>
                            <p className="mt-1 text-slate-300">Publish new 15-minute slots and keep the schedule conflict-free.</p>
                        </div>
                        <div className="rounded-2xl bg-slate-950/40 p-4">
                            <p className="font-semibold text-white">Student</p>
                            <p className="mt-1 text-slate-300">See what is open and reserve a slot instantly.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Login;