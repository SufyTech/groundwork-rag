"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["50 questions / month", "1 document", "Community support"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    features: ["Unlimited questions", "50 documents", "Priority support", "Usage analytics"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Unlimited everything", "SSO & audit logs", "Dedicated support", "Custom integrations"],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
        <a href="/" className="font-semibold text-lg">Groundwork</a>
        <a href="/chat" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
          Try it
        </a>
      </nav>

      <section className="text-center py-16 px-8">
        <h1 className="font-serif text-3xl font-medium mb-2">Simple, transparent pricing</h1>
        <p className="text-slate-600 mb-6">Start free. Upgrade when your team needs more.</p>

        <div className="inline-flex border border-slate-200 rounded-full p-1 text-sm">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 rounded-full ${!yearly ? "bg-indigo-600 text-white" : "text-slate-600"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 rounded-full ${yearly ? "bg-indigo-600 text-white" : "text-slate-600"}`}
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-8 pb-24">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl p-6 flex flex-col ${
              tier.highlight
                ? "border-2 border-indigo-600 shadow-lg relative"
                : "border border-slate-200"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="font-medium text-slate-500 mb-1">{tier.name}</h3>
            <p className="text-3xl font-serif font-medium mb-4">
              {tier.price}
              <span className="text-base text-slate-400">{tier.period}</span>
            </p>
            <ul className="space-y-2 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`px-4 py-2.5 rounded-md text-sm font-medium ${
                tier.highlight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-slate-300 hover:border-slate-400"
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </section>

      <footer className="bg-black text-white text-center text-xs py-4">
        Groundwork — built by Sufiyan Khan
      </footer>
    </main>
  );
}