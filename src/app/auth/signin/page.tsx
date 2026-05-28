"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carveout Router</h1>
          <p className="mt-2 text-gray-500">Route M&amp;A deal documents to the right contacts</p>
        </div>

        <div className="card p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
              <p className="mt-2 text-gray-500">
                A magic link has been sent to <strong>{email}</strong>. Click it to sign in.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                (In local dev without SMTP, the link is printed in the server console.)
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in with email</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
