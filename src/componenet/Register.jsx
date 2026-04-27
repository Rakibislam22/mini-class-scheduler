import React from 'react';

const Register = () => {
    return (
        <div className='flex items-center justify-center h-screen'>
            <fieldset className="space-y-4 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-8">
                <legend className="fieldset-legend text-2xl">Register</legend>

                <label className="floating-label">
                    <span>Your Email</span>
                    <input type="text" placeholder="mail@site.com" className="input input-md" />
                </label>
                <label className="floating-label">
                    <span>Password</span>
                    <input type="password" placeholder="Password" className="input input-md" />
                </label>
                <label className="floating-label">
                    <span>Confirm Password</span>
                    <input type="password" placeholder="Confirm Password" className="input input-md" />
                </label>

                <button className="btn btn-neutral mt-4">Register</button>
            </fieldset>
        </div>
    );
};

export default Register;