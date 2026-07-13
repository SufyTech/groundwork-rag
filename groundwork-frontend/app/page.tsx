"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

function CitationBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold align-super ml-0.5">
      {n}
    </span>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-8 py-4 border-b border-slate-200 sticky top-0 bg-white/85 backdrop-blur-sm z-50"
      >
        <Link
          href="/"
          className="font-serif font-semibold text-lg tracking-tight"
        >
          Groundwork
        </Link>
        <div className="hidden md:flex gap-8 text-sm text-slate-600">
          <Link href="/chat" className="hover:text-slate-900 transition-colors">
            Product
          </Link>
          <Link
            href="/pricing"
            className="hover:text-slate-900 transition-colors"
          >
            Pricing
          </Link>
          <a href="#" className="hover:text-slate-900 transition-colors">
            Docs
          </a>
          <a href="#" className="hover:text-slate-900 transition-colors">
            Blog
          </a>
        </div>
        <Link
          href="/chat"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md transition-all hover:scale-[1.03] active:scale-[0.98]"
        >
          Get started
        </Link>
      </motion.nav>

      {/* Hero */}
      <section className="relative px-8 pt-24 pb-28 grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[440px] h-[440px] bg-indigo-50 rounded-full blur-3xl opacity-70 -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block text-xs font-medium tracking-wide text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full mb-5">
            Every answer, sourced
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-medium leading-[1.08] tracking-tight text-slate-900">
            Chat with your documents.
            <br />
            Get answers with{" "}
            <span className="relative">
              citations
              <svg
                className="absolute left-0 -bottom-1 w-full"
                height="6"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,4 Q50,0 100,4"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  fill="none"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-7 text-slate-600 text-lg max-w-md leading-relaxed">
            Upload PDFs, docs, or notes. Ask questions in plain English.
            Groundwork finds accurate answers and shows exactly where they came
            from — no hallucinations.
          </p>
          <motion.div
            className="mt-9 flex gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            <Link
              href="/chat"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium transition-all hover:bg-indigo-700 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
            >
              Try it free
            </Link>
            <a
              href="#how-it-works"
              className="border border-slate-300 px-6 py-3 rounded-md font-medium text-slate-700 transition-all hover:border-slate-400 hover:scale-[1.03] active:scale-[0.98]"
            >
              Watch demo
            </a>
          </motion.div>
        </motion.div>

        {/* Chat mockup styled like an annotated document */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden bg-white"
        >
          <Link href="/chat" className="block">
            <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400 font-mono">
                groundwork — refund_policy.pdf
              </span>
            </div>
            <div className="grid grid-cols-3">
              <div className="col-span-1 border-r border-slate-200 p-3 bg-slate-50 text-xs text-slate-500 space-y-2">
                <p className="font-medium text-slate-700 mb-2">Documents</p>
                <p className="truncate rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600">
                  refund_policy.pdf
                </p>
                <p className="truncate rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600">
                  onboarding_guide.docx
                </p>
                <p className="truncate rounded-md border border-slate-200 bg-white px-2 py-1.5 text-slate-600">
                  contract_terms.pdf
                </p>
              </div>
              <div className="col-span-2 p-4 flex flex-col">
                <div className="flex-1 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-white"
                  >
                    What's the refund policy?
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2.5 leading-relaxed"
                  >
                    Refunds are available within 30 days of purchase
                    <CitationBadge n={1} />.
                  </motion.div>
                </div>
                <div className="mt-3 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-400 bg-white">
                  Ask a question...
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Logo row */}
      <section className="px-8 py-10 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-medium tracking-wider text-slate-400 mb-5">
            TRUSTED BY TEAMS
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["ACME CO", "NORTHWIND", "VERTEX", "ORBIT LABS", "ATLAS"].map(
              (name) => (
                <span
                  key={name}
                  className="border border-slate-200 rounded-lg px-5 py-2.5 text-sm font-medium tracking-wide text-slate-400"
                >
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium tracking-wide text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
              Built for trust
            </span>
            <h2 className="font-serif text-3xl font-medium mt-4 text-slate-900">
              Everything you need
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                n: 1,
                title: "Accurate citations",
                desc: "Every answer links back to the exact source line it came from — click to verify instantly.",
              },
              {
                n: 2,
                title: "Any file format",
                desc: "PDF, Word, CSV, and more — drag, drop, and start asking questions in seconds.",
              },
              {
                n: 3,
                title: "Fast setup",
                desc: "Connect a folder or upload files, and start chatting with your documents in minutes.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-5 font-serif font-medium">
                  {f.n}
                </div>
                <h3 className="font-medium mb-2 text-slate-900">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-8 py-28">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl font-medium text-center mb-16 text-slate-900"
          >
            How it works
          </motion.h2>
          <div className="space-y-12">
            {[
              {
                n: 1,
                title: "Upload your documents",
                desc: "Drag in PDFs, Word docs, or spreadsheets. Groundwork reads and indexes them in the background.",
              },
              {
                n: 2,
                title: "Ask a question, plainly",
                desc: "No special syntax. Type a question the way you'd ask a colleague who'd actually read the file.",
              },
              {
                n: 3,
                title: "Get an answer, with proof",
                desc: "Every claim is paired with the exact document and line it came from — click it to jump straight there.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-indigo-200 text-indigo-700 flex items-center justify-center font-serif font-medium text-lg">
                  {step.n}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-10">
                  <h3 className="font-medium text-lg text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-8 py-28 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl font-medium text-center mb-16 text-slate-900"
          >
            Not another confident guess
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl border border-slate-200 p-7"
            >
              <p className="text-sm font-medium text-slate-400 mb-4">
                Generic AI chat
              </p>
              <p className="text-slate-700 leading-relaxed">
                "Based on typical refund policies, you likely have around 30
                days to request a refund."
              </p>
              <p className="mt-4 text-sm text-red-600">
                No source. No way to verify. Could be wrong.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-xl border-2 border-indigo-200 p-7"
            >
              <p className="text-sm font-medium text-indigo-600 mb-4">
                Groundwork
              </p>
              <p className="text-slate-700 leading-relaxed">
                Refunds are available up to 30 days after purchase, with a valid
                receipt
                <CitationBadge n={1} />.
              </p>
              <p className="mt-4 text-sm text-emerald-700 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-100 text-amber-800 text-[9px] font-semibold flex items-center justify-center">
                  1
                </span>
                refund_policy.pdf, page 2 — verified, clickable
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-24 bg-slate-900 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Stop guessing what your documents say
          </h2>
          <p className="text-slate-300 mb-8">
            Upload your first document and get your first cited answer in under
            two minutes.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-indigo-600 text-white px-7 py-3.5 rounded-md font-medium transition-all hover:bg-indigo-500 hover:scale-[1.03] active:scale-[0.98]"
          >
            Try it free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white px-8 py-7 flex justify-between items-center text-sm border-t border-slate-800">
        <span className="font-serif">Groundwork</span>
        <span className="text-slate-400">© 2026 Groundwork</span>
      </footer>
    </main>
  );
}
