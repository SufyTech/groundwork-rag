"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Send, CheckCircle2, ArrowLeft } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Doc = {
  source: string;
  chunk_count: number;
};

/** Strips inline [n] markers from the text body (they're rendered as pills below instead) */
function stripCitationMarkers(text: string): string {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}

function extractCitationNumbers(text: string): string[] {
  const matches = [...text.matchAll(/\[(\d+)\]/g)];
  const unique = Array.from(new Set(matches.map((m) => m[1])));
  return unique;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  async function loadDocuments() {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function toggleDoc(source: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      await loadDocuments();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const sourcesParam =
        selected.size > 0
          ? `&sources=${encodeURIComponent(Array.from(selected).join(","))}`
          : "";
      const res = await fetch(
        `${API_BASE}/ask?question=${encodeURIComponent(question)}${sourcesParam}`,
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong — is the backend server running?",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  const chatLabel =
    selected.size === 0 ? "All documents" : Array.from(selected).join(", ");

  return (
    <main className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/"
            className="font-serif font-semibold text-lg tracking-tight"
          >
            Groundwork
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/analytics"
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto min-h-0">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 px-5 py-6 flex flex-col shrink-0">
          <p className="text-xs font-semibold text-slate-400 tracking-wider mb-3">
            DOCUMENTS
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm px-3 py-2.5 rounded-lg font-medium mb-4 shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading..." : "Upload new file"}
          </button>

          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {docs.length === 0 && (
              <p className="text-xs text-slate-400 py-2">
                No documents yet — upload one to get started.
              </p>
            )}
            {docs.map((doc) => (
              <label
                key={doc.source}
                className={`flex items-start gap-2.5 text-sm cursor-pointer group rounded-lg px-2.5 py-2 transition-colors border ${
                  selected.has(doc.source)
                    ? "bg-indigo-50 border-indigo-200"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(doc.source)}
                  onChange={() => toggleDoc(doc.source)}
                  className="mt-0.5 accent-indigo-600"
                />
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-slate-800 group-hover:text-slate-900">
                    {doc.source}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Indexed
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
            {docs.length} document{docs.length !== 1 ? "s" : ""} indexed
          </p>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col px-8 py-5 min-h-0">
          <p className="text-sm text-slate-500 mb-3 shrink-0 font-mono">
            Chat: <span className="text-slate-800">{chatLabel}</span>
          </p>

          <div className="flex-1 overflow-y-auto flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 -mt-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-5 shadow-sm">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="font-serif text-2xl text-slate-800 mb-2">
                  Ask Groundwork anything
                </p>
                <p className="text-sm max-w-xs mx-auto leading-relaxed">
                  Answers come straight from your indexed documents, with
                  citations you can trust.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => {
                    const citationNums =
                      m.role === "assistant"
                        ? extractCitationNumbers(m.content)
                        : [];
                    const displayText =
                      m.role === "assistant"
                        ? stripCitationMarkers(m.content)
                        : m.content;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`max-w-[70%] ${
                          m.role === "user" ? "ml-auto" : ""
                        }`}
                      >
                        <div
                          className={`text-sm rounded-lg px-4 py-3 leading-relaxed shadow-sm ${
                            m.role === "user"
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-slate-100 text-slate-800 rounded-tl-none"
                          }`}
                        >
                          {displayText}
                        </div>
                        {citationNums.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {citationNums.map((n) => (
                              <span
                                key={n}
                                className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full shadow-sm"
                              >
                                Source {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-100 rounded-lg rounded-tl-none px-4 py-3 max-w-[85%] w-fit shadow-sm"
                  >
                    <TypingDots />
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3 border border-slate-200 rounded-xl p-2 shadow-sm bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-sm"
            >
              Send
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
