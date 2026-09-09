import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";

export default function Landing() {
  const navigate = useNavigate();
  const token = getCookie("telegram_token");
  const isAuthenticated = Boolean(token);

  // State for interactive drive preview mockup
  const [selectedFolder, setSelectedFolder] = useState("all");

  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Mock files for interactive preview
  const mockFiles = [
    { name: "Final_Design_System_v2.fig", size: "84.2 MB", type: "figma", date: "Today, 4:12 PM", folder: "work", tag: "Design" },
    { name: "Production_Backup_2026.tar.gz", size: "1.42 GB", type: "archive", date: "Yesterday", folder: "backups", tag: "DevOps" },
    { name: "Cinematic_Drone_4K_Reel.mp4", size: "892.0 MB", type: "video", date: "Sep 7, 2026", folder: "media", tag: "Video" },
    { name: "Quarterly_Financial_Report.pdf", size: "12.8 MB", type: "pdf", date: "Sep 4, 2026", folder: "work", tag: "Finance" },
    { name: "Arch_Linux_Custom_Config.iso", size: "1.86 GB", type: "iso", date: "Aug 29, 2026", folder: "backups", tag: "OS" },
  ];

  const filteredFiles = selectedFolder === "all"
    ? mockFiles
    : mockFiles.filter(f => f.folder === selectedFolder);

  const faqs = [
    {
      q: "Is NexGenStorage secure and private?",
      a: "Yes, 100%. NexGenStorage is a purely client-side application. It communicates directly with Telegram's official MTProto servers via your browser. No middleman backend servers exist, no databases record your files, and your API credentials and session keys remain strictly in your local browser cookies."
    },
    {
      q: "What are the file size and storage limits?",
      a: "Total storage is completely unmetered and unlimited thanks to Telegram's cloud architecture. For individual file sizes, standard Telegram accounts can upload files up to 2.0 GB each, while Telegram Premium accounts support files up to 4.0 GB each."
    },
    {
      q: "Can I still access my files in Telegram directly?",
      a: "Absolutely! NexGenStorage stores your files as real messages in your designated Telegram private group or channel. If you ever open the native Telegram mobile or desktop app, all your files are right there in your chat history."
    },
    {
      q: "Why do I need a Telegram API ID and API Hash?",
      a: "Telegram requires an API ID and Hash for third-party client apps to communicate with its MTProto protocol. It's completely free to obtain from my.telegram.org in less than two minutes, and it gives you direct personal access without relying on any shared server tokens."
    },
    {
      q: "How does the virtual folder system work?",
      a: "NexGenStorage embeds lightweight, non-destructive metadata markers within your chat storage. This enables high-performance nested folders, instant O(1) folder renaming, and organized directory hierarchies without needing external databases."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#07080f] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">

      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/[0.07] rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0" />

      {/* ─── 1. Top Sticky Navigation ──────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/[0.08] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  NexGenStorage
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  v2.0 Web
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium -mt-0.5">Telegram Cloud Reimagined</span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#demo" className="hover:text-slate-100 transition-colors">Drive Demo</a>
            <a href="#how-it-works" className="hover:text-slate-100 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-slate-100 transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/drives")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open Your Drive</span>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95 group"
                >
                  <span>Connect Telegram</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ─── 2. Hero Section ───────────────────────────────── */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        {/* Luminous Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in shadow-inner">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Unlimited Cloud Storage • 100% Free • Client-Side Only</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 animate-fade-up">
          Turn Telegram into your <br />
          <span className="text-gradient-purple">
            Unlimited Personal Cloud.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal animate-fade-up" style={{ animationDelay: "100ms" }}>
          Transform any Telegram chat, channel, or group into a structured, blazing-fast virtual drive. Enjoy nested folders, instant search, and zero monthly subscriptions.
        </p>

        {/* Hero CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <button
            onClick={() => navigate(isAuthenticated ? "/drives" : "/login")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 group"
          >
            <span>{isAuthenticated ? "Launch Your Drive Now" : "Connect Telegram Free"}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <a
            href="#demo"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-indigo-500/30 text-slate-300 hover:text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5"
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Explore Interactive Demo</span>
          </a>
        </div>

        {/* Micro-guarantee perks */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>No Server Middleman</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Official MTProto Protocol</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Credentials In Browser Only</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Zero Subscription Fees</span>
          </div>
        </div>

      </section>

      {/* ─── 3. Interactive Drive Preview Mockup ───────────── */}
      <section id="demo" className="relative z-10 px-6 max-w-6xl mx-auto pb-28">
        
        {/* Section title */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Interactive Preview</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Experience the NexGenStorage Drive UI
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Click on folders and preview how simple organizing your Telegram files becomes.
          </p>
        </div>

        {/* Dashboard Shell Mockup */}
        <div className="glass-card rounded-3xl p-4 sm:p-7 border border-white/[0.12] shadow-2xl relative overflow-hidden">
          
          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-4 w-[1px] bg-white/[0.1] mx-1" />
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Drive: 🚀 Cloud Storage Archive (Channel)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium hidden sm:inline-block">
                ⚡ MTProto Connected
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-semibold">
                Capacity: ∞ Unmetered
              </span>
            </div>
          </div>

          {/* Folder Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <button
              onClick={() => setSelectedFolder("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedFolder === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              <span>📁 All Files</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-slate-200">5</span>
            </button>

            <button
              onClick={() => setSelectedFolder("work")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedFolder === "work"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              <span>📂 Work & Documents</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-slate-200">2</span>
            </button>

            <button
              onClick={() => setSelectedFolder("backups")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedFolder === "backups"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              <span>📦 Backups & Code</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-slate-200">2</span>
            </button>

            <button
              onClick={() => setSelectedFolder("media")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedFolder === "media"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200"
              }`}
            >
              <span>🎬 4K Media & Video</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-slate-200">1</span>
            </button>

            <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span>Sorted by:</span>
              <span className="text-slate-300 font-medium">Recent Activity ↓</span>
            </div>
          </div>

          {/* Simulated File List */}
          <div className="space-y-2.5">
            {filteredFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-indigo-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400 group-hover:scale-105 transition-transform">
                    {file.type === "pdf" ? "📄" : file.type === "video" ? "🎬" : file.type === "figma" ? "🎨" : "📦"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hidden sm:inline-block">
                    {file.tag}
                  </span>
                  <button className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-600 hover:text-white text-slate-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats banner in card */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Showing <strong>{filteredFiles.length}</strong> items</span>
              <span>•</span>
              <span>Virtual Folder Hierarchy: <strong>Active</strong></span>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Zero-knowledge client-side encryption</span>
            </div>
          </div>

        </div>

      </section>

      {/* ─── 4. Problem vs Solution ─────────────────────────── */}
      <section className="relative z-10 px-6 max-w-7xl mx-auto py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Why NexGenStorage?</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            The Messy Telegram Reality vs. Organized Drive
          </h2>
          <p className="text-slate-400 text-base mt-3">
            Using Telegram as cloud storage has always been free, but managing files inside raw chat feeds is chaotic. Here is how NexGenStorage transforms it:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Old Way */}
          <div className="p-8 rounded-3xl bg-red-950/[0.08] border border-red-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">
                ✕
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Raw Telegram Storage</h3>
                <p className="text-xs text-red-400/80 font-medium">Unstructured & Chaotic</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>Files buried under thousands of text messages, stickers, and voice notes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>No folders or subdirectories — everything is a flat, infinite chat stream.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>Searching requires remembering exact timestamps or exact file names.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>Zero storage analytics or visibility into total GBs and category distributions.</span>
              </li>
            </ul>
          </div>

          {/* NexGenStorage Way */}
          <div className="p-8 rounded-3xl bg-indigo-950/[0.15] border border-indigo-500/30 backdrop-blur-sm relative overflow-hidden shadow-xl shadow-indigo-900/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">NexGenStorage Experience</h3>
                <p className="text-xs text-indigo-400 font-medium">Clean, Structured & Fast</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Virtual Folders & Subdirectories</strong>: Group your files into custom folders with instantaneous O(1) renaming.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Instant Search & Type Filtering</strong>: Find any document, media file, or archive in milliseconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Full Storage Analytics</strong>: Track unmetered capacity, file sizes, and categorized usage.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span><strong>Drag-and-Drop Direct Uploads</strong>: Upload files directly from your browser straight into Telegram data centers.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ─── 5. Core Features Grid ─────────────────────────── */}
      <section id="features" className="relative z-10 px-6 max-w-7xl mx-auto py-20">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Architected for Speed & Privacy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Packed with Next-Gen Features
          </h2>
          <p className="text-slate-400 text-base mt-3">
            A state-of-the-art web drive interface built directly over Telegram MTProto.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Feature 1 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              📂
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Virtual Folder System</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create nested directories, rename folders instantly without re-uploading, and safely perform clean recursive deletions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Direct MTProto Protocol</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your browser initiates a direct cryptographic session with Telegram's global data centers. No backend proxy or middleman.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Search & Sort</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time fuzzy search across thousands of files. Sort dynamically by file size, modification timestamp, or alphabetical name.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Storage Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gain deep insight into your storage footprint. Visual charts display file count, category distributions, and total stored gigabytes.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <h3 className="text-lg font-bold text-white mb-2">100% Client-Side Privacy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zero telemetry, zero databases. Your phone number, API credentials, and MTProto auth keys reside purely in your browser's local cookies.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card glass-card-hover p-7 rounded-3xl border border-white/[0.08] relative group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform">
              ♾️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">True Unlimited Capacity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No tiers, no storage limits, and no credit cards. Upload files up to 2GB each (or 4GB with Telegram Premium) with unmetered overall storage.
            </p>
          </div>

        </div>

      </section>

      {/* ─── 6. How It Works (3 Steps) ─────────────────────── */}
      <section id="how-it-works" className="relative z-10 px-6 max-w-7xl mx-auto py-20 border-t border-white/[0.06]">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Quick Onboarding</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Up and Running in 3 Minutes
          </h2>
          <p className="text-slate-400 text-base mt-3">
            Getting your personal Telegram drive ready takes just three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="glass-card p-8 rounded-3xl border border-white/[0.08] relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg mb-6 shadow-inner">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Your API Keys</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Log into <strong className="text-slate-200">my.telegram.org</strong>, click "API development tools", and create an application to copy your personal <code>API ID</code> and <code>API Hash</code>.
              </p>
            </div>
            <a
              href="https://my.telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Visit my.telegram.org</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 rounded-3xl border border-white/[0.08] relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-extrabold text-lg mb-6 shadow-inner">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sign In Securely</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Enter your phone number and credentials on our login page. Telegram will send a verification code directly to your official Telegram app.
              </p>
            </div>
            <span className="text-xs text-slate-500">Official Telegram 2FA supported</span>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 rounded-3xl border border-white/[0.08] relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-6 shadow-inner">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pick Any Chat Drive</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Select any private group or channel from your dialogue list. Start creating folders, dragging files, and enjoying unlimited free cloud storage!
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Ready to organize immediately</span>
          </div>

        </div>

      </section>



      {/* ─── 8. Interactive FAQ Accordion ──────────────────── */}
      <section id="faq" className="relative z-10 px-6 max-w-4xl mx-auto py-20 border-t border-white/[0.06]">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Questions & Answers
          </h2>
          <p className="text-slate-400 text-base mt-3">
            Everything you need to know about NexGenStorage, security, and how Telegram MTProto works.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-slate-100 hover:text-indigo-300 transition-colors"
                >
                  <span className="text-base">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 bg-indigo-600/20 text-indigo-400" : "text-slate-400"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── 9. Call to Action Banner ──────────────────────── */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto pb-28">
        <div className="relative rounded-3xl p-10 sm:p-14 overflow-hidden border border-indigo-500/30 text-center shadow-2xl bg-gradient-to-b from-indigo-950/60 via-[#0b0d1e] to-[#07080f]">
          
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Ready to Upgrade Your Cloud?</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-3 mb-5">
              Unlock Unlimited Storage in Seconds.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed mb-8">
              Join NexGenStorage now. No credit cards, no servers tracking your files, and no recurring subscriptions.
            </p>

            <button
              onClick={() => navigate(isAuthenticated ? "/drives" : "/login")}
              className="px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-95 inline-flex items-center gap-3 group"
            >
              <span>{isAuthenticated ? "Open Your Cloud Drive" : "Connect With Telegram Now"}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </section>

      {/* ─── 10. Aesthetic Footer ──────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#05060a] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base font-bold text-white tracking-tight">NexGenStorage</span>
            <span className="text-xs text-slate-500">© 2026 Open-Source Project</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">Telegram Developer Portal</a>
            <a href="https://core.telegram.org/api" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200 transition-colors">MTProto Docs</a>
            <Link to="/login" className="hover:text-slate-200 transition-colors">Sign In</Link>
          </div>

          <p className="text-[11px] text-slate-600 max-w-xs text-center md:text-right">
            NexGenStorage is an independent open-source client. Not affiliated with or endorsed by Telegram FZ-LLC.
          </p>

        </div>
      </footer>

    </div>
  );
}
