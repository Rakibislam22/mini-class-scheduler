import { Link } from 'react-router';
import { ROLES } from './lib/appState';

const Landing = () => {
    return (
        <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl shadow-slate-950/40 backdrop-blur">
                    <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
                        <div className="space-y-6">
                            <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                                Class scheduler
                            </span>

                            <div className="space-y-4">
                                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                    One place to publish class openings, reserve a time, and keep every lesson organized.
                                </h1>
                                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                    The landing page gives a quick overview, then the sign-in flow drops each user into the right role dashboard with only the tools they need.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
                                >
                                    Login to dashboard
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Create account
                                </Link>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Slots</p>
                                    <p className="mt-2 text-lg font-semibold text-white">15-minute blocks</p>
                                </article>
                                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Protection</p>
                                    <p className="mt-2 text-lg font-semibold text-white">No overlaps or past times</p>
                                </article>
                                <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Access</p>
                                    <p className="mt-2 text-lg font-semibold text-white">Role-based dashboards</p>
                                </article>
                            </div>
                        </div>

                        <aside className="rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-sky-400/5 to-emerald-400/10 p-6">
                            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">How it works</p>
                            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
                                {ROLES.map((role) => (
                                    <div key={role.value} className="rounded-2xl bg-slate-950/40 p-4">
                                        <p className="font-semibold text-white">{role.label}</p>
                                        <p className="mt-1 text-slate-300">{role.description}</p>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Landing;