import React, { useState, useRef, useEffect } from "react";
import { initializeTelegramLogin } from "../telegramApi";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

export default function TelegramLogin({ onLoginSuccess }) {
  const existingToken = getCookie("telegram_token");
  const navigate = useNavigate();

  const [step, setStep] = useState(existingToken ? 5 : 1);
  const [apiId, setApiId] = useState(getCookie("telegram_apiId") || "");
  const [apiHash, setApiHash] = useState(getCookie("telegram_apiHash") || "");
  const [showApiHash, setShowApiHash] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(undefined);
  const [phoneCode, setPhoneCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setSessionToken] = useState(existingToken || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [connectingState, setConnectingState] = useState("Initializing MTProto...");

  const phoneCodeResolver = useRef(null);
  const passwordResolver = useRef(null);

  useEffect(() => {
    if (existingToken) {
      navigate("/drives");
    }
  }, [existingToken, navigate]);

  // Dynamic connecting message effect
  useEffect(() => {
    let timer1, timer2, timer3;
    if (step === 2) {
      setConnectingState("Connecting to Telegram DC servers...");
      timer1 = setTimeout(() => {
        setConnectingState("Establishing end-to-end cryptographic tunnel...");
      }, 1500);
      timer2 = setTimeout(() => {
        setConnectingState("Awaiting official MTProto authentication handshake...");
      }, 3000);
      timer3 = setTimeout(() => {
        setConnectingState("Requesting verification code dispatch...");
      }, 4500);
    }
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  const startLogin = async (e) => {
    e.preventDefault();
    if (!apiId.trim() || !apiHash.trim() || !phoneNumber) {
      setErrorMsg("Please provide API ID, API Hash, and a valid phone number.");
      return;
    }
    setErrorMsg("");
    setStep(2);
    try {
      const { client, token } = await initializeTelegramLogin({
        apiId: apiId.trim(),
        apiHash: apiHash.trim(),
        phoneNumber,
        phoneCodeCallback: async () => {
          setStep(3);
          return new Promise((resolve) => {
            phoneCodeResolver.current = resolve;
          });
        },
        passwordCallback: async () => {
          setStep(4);
          return new Promise((resolve) => {
            passwordResolver.current = resolve;
          });
        },
        onErrorCallback: (err) => {
          setErrorMsg(err.message || "An error occurred during Telegram authentication.");
        },
      });

      setSessionToken(token);
      setCookie("telegram_apiId", apiId.trim());
      setCookie("telegram_apiHash", apiHash.trim());
      setCookie("telegram_token", token);
      setStep(5);

      if (onLoginSuccess) {
        onLoginSuccess(client, token);
      }
      setTimeout(() => {
        navigate("/drives");
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || "Failed to initialize Telegram MTProto client. Check your credentials.");
      setStep(1);
    }
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (!phoneCode.trim()) return;
    if (phoneCodeResolver.current) {
      phoneCodeResolver.current(phoneCode.trim());
      setStep(2);
    }
  };

  const submitPassword = (e) => {
    e.preventDefault();
    if (!password) return;
    if (passwordResolver.current) {
      passwordResolver.current(password);
      setStep(2);
    }
  };

  const handleLogout = () => {
    deleteCookie("telegram_token");
    deleteCookie("telegram_selected_chat_id");
    deleteCookie("telegram_selected_chat_name");
    setSessionToken("");
    setStep(1);
    setPhoneNumber(undefined);
    setPhoneCode("");
    setPassword("");
    setErrorMsg("");
  };

  const resetToStepOne = () => {
    setStep(1);
    setErrorMsg("");
  };

  const stepsList = [
    { num: 1, title: "Credentials", desc: "API ID & Hash" },
    { num: 2, title: "Handshake", desc: "MTProto DC" },
    { num: 3, title: "Verify Code", desc: "In-App Code" },
    { num: 4, title: "2FA Password", desc: "Cloud Security" },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#07080f] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ─── Ambient Multi-Layered Glows ────────────────── */}
      <div className="fixed -top-40 left-1/4 -translate-x-1/2 w-[750px] h-[500px] bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 right-1/4 w-[650px] h-[550px] bg-gradient-to-tl from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-radial from-indigo-500/[0.04] to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.035] pointer-events-none z-0" />

      {/* ─── Header ────────────────────────────────────────── */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between border-b border-white/[0.05]">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-semibold text-slate-300 hover:text-white transition-all group active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to NexGenStorage</span>
        </Link>

        {/* Live Client-Side Security Pill */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs font-medium text-slate-300 px-3.5 py-1.5 rounded-full bg-emerald-500/[0.07] border border-emerald-500/20 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-slate-300 font-medium">100% Client-Side MTProto</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Zero Middleman Server</span>
        </div>
      </header>

      {/* ─── Main Content Showcase + Auth Form ──────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ──── LEFT COLUMN: Product & Security Showcase (Hidden on small, rich on lg) ──── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left">
            
            {/* Brand Title Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-max shadow-sm">
              <span className="text-sm">⚡</span>
              <span>DIRECT TELEGRAM CLOUD STORAGE</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Connect your account securely.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                NexGenStorage communicates directly with Telegram's official MTProto protocol from your browser. Your credentials and files never pass through any intermediate server.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 pt-2">
              
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/30 transition-all flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">End-to-End MTProto Crypto</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Session keys are stored locally in your browser cookies with HTTP strict isolation.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/30 transition-all flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">Unlimited Unmetered Storage</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Leverage Telegram's global CDN infrastructure with up to 4GB per file upload.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-emerald-500/30 transition-all flex items-start gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white tracking-wide">Virtual Folder Organization</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    Convert any private channel or group into a clean, hierarchical file manager.
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Security Assurance Quote */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/15 flex items-center gap-3">
              <span className="text-base">🛡️</span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Open architecture: NexGenStorage never collects, logs, or transmits your personal data.
              </p>
            </div>

          </div>

          {/* ──── RIGHT COLUMN: The Interactive Auth Card ──── */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-xl">

              {/* Stepper Progress Bar */}
              <div className="mb-6 px-1">
                <div className="flex items-center justify-between relative">
                  
                  {/* Connecting line behind icons */}
                  <div className="absolute left-4 right-4 top-4 h-0.5 bg-white/[0.08] -z-0" />
                  <div
                    className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 -z-0"
                    style={{
                      width: step === 1 ? "0%" : step === 2 ? "33%" : step === 3 ? "66%" : "100%",
                    }}
                  />

                  {stepsList.map((s) => {
                    const isCurrent = step === s.num;
                    const isPassed = step > s.num;
                    return (
                      <div key={s.num} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCurrent
                              ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/40 ring-4 ring-indigo-500/20 scale-110"
                              : isPassed
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                              : "bg-[#111320] text-slate-500 border border-white/[0.1]"
                          }`}
                        >
                          {isPassed ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            s.num
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-semibold mt-2 transition-colors hidden sm:block ${
                            isCurrent ? "text-indigo-300 font-bold" : isPassed ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Auth Glass Card */}
              <div className="glass-strong rounded-3xl p-6 sm:p-9 border border-white/[0.12] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                
                {/* Accent Inner Sheens */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-start justify-between gap-3 bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-2xl mb-6 text-xs animate-scale-in shadow-inner">
                    <div className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="leading-relaxed font-medium">{errorMsg}</span>
                    </div>
                    <button
                      onClick={() => setErrorMsg("")}
                      className="text-red-400 hover:text-red-100 p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Dismiss error"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* ────────── STEP 1: CREDENTIALS FORM ────────── */}
                {step === 1 && (
                  <div className="animate-fade-up">
                    
                    {/* Card Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 ring-1 ring-white/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          Connect Telegram
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Authenticate directly using your personal Telegram API credentials.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={startLogin} className="space-y-4">
                      
                      {/* API ID & Hash in Responsive 2-Col Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* API ID Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              <span>API ID</span>
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">Numeric</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={apiId}
                              onChange={(e) => setApiId(e.target.value)}
                              placeholder="e.g. 2938472"
                              className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.09] focus:border-indigo-500 focus:bg-white/[0.07] text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all shadow-inner glow-ring"
                              required
                            />
                          </div>
                        </div>

                        {/* API Hash Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>API Hash</span>
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">32-char hex</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showApiHash ? "text" : "password"}
                              value={apiHash}
                              onChange={(e) => setApiHash(e.target.value)}
                              placeholder="••••••••••••••••••••••••••••••••"
                              className="w-full px-3.5 py-3 pr-16 rounded-xl bg-white/[0.04] border border-white/[0.09] focus:border-indigo-500 focus:bg-white/[0.07] text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all shadow-inner glow-ring"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiHash(!showApiHash)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all"
                              tabIndex={-1}
                            >
                              {showApiHash ? "Hide" : "Show"}
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Phone Number Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Telegram Phone Number</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">With Country Code</span>
                        </label>
                        <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.09] focus-within:border-indigo-500 focus-within:bg-white/[0.07] transition-all shadow-inner glow-ring">
                          <PhoneInput
                            international
                            withCountryCallingCode
                            placeholder="+1 234 567 8900"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            defaultCountry="US"
                            className="custom-phone-input text-sm"
                          />
                        </div>
                      </div>

                      {/* Submit Primary CTA Button */}
                      <button
                        type="submit"
                        className="w-full mt-3 py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <span>Connect Telegram Account</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>

                    </form>

                    {/* ──── Interactive API Credential Accordion Guide ──── */}
                    <div className="mt-6 pt-5 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] text-xs font-semibold text-slate-300 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 text-xs">💡</span>
                          <span>Need help finding your Telegram API ID & Hash?</span>
                        </div>
                        <svg
                          className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${showGuide ? "rotate-180 text-indigo-400" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {showGuide && (
                        <div className="mt-3 p-4.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/40 border border-indigo-500/20 text-xs text-slate-300 space-y-3.5 animate-fade-in shadow-lg">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-white text-xs">Easy 2-Minute Setup:</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                              Free & Instant
                            </span>
                          </div>
                          
                          <ol className="list-none space-y-2.5 text-slate-300">
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
                              <span>
                                Open <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-bold underline hover:text-indigo-300">my.telegram.org</a> in your browser.
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
                              <span>Log in with your Telegram phone number and confirm the official security code.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
                              <span>Navigate to <strong className="text-slate-100">"API development tools"</strong>.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">4</span>
                              <span>Fill in any App title & short name, then copy your generated <strong className="text-indigo-300">api_id</strong> and <strong className="text-indigo-300">api_hash</strong>.</span>
                            </li>
                          </ol>

                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                            <a
                              href="https://my.telegram.org"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 font-semibold text-xs transition-colors"
                            >
                              <span>Launch my.telegram.org</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <span className="text-[10px] text-slate-400 italic">Saved securely in browser cookies</span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* ────────── STEP 2: CONNECTING / MTPROTO HANDSHAKE ────────── */}
                {step === 2 && (
                  <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center animate-fade-in space-y-6">
                    
                    {/* Animated Radar Pulse Visualizer */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping opacity-50" />
                      <div className="absolute inset-2 rounded-full border-2 border-violet-500/30 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin-smooth" />
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 z-10">
                        <svg className="w-7 h-7 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Connecting to Telegram MTProto
                      </h3>
                      <p className="text-xs text-indigo-300 font-medium animate-pulse">
                        {connectingState}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        Performing cryptographic Diffie-Hellman handshake directly with Telegram data center cluster.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetToStepOne}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all active:scale-95"
                    >
                      ← Cancel & Edit Credentials
                    </button>
                  </div>
                )}

                {/* ────────── STEP 3: PHONE VERIFICATION CODE ────────── */}
                {step === 3 && (
                  <div className="animate-fade-up">
                    
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3.5 text-indigo-400 text-2xl shadow-lg shadow-indigo-500/10">
                        💬
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Check Your Telegram App</h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                        Telegram dispatched an official login verification code to your active Telegram application on <span className="font-semibold text-white">{phoneNumber || "your phone"}</span>.
                      </p>
                    </div>

                    {/* Notice Callout */}
                    <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3 mb-6 text-xs text-slate-300">
                      <span className="text-base">📱</span>
                      <p className="leading-normal">
                        Open your <strong>Telegram app</strong> and check messages from the official <strong>"Telegram"</strong> service notification account.
                      </p>
                    </div>

                    <form onSubmit={submitCode} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 block text-center uppercase tracking-wider">
                          Enter 5-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          placeholder="• • • • •"
                          className="w-full py-4 px-4 text-center tracking-[0.4em] text-3xl font-mono font-extrabold rounded-2xl bg-white/[0.04] border border-white/[0.12] focus:border-indigo-500 focus:bg-white/[0.08] text-white outline-none transition-all shadow-inner glow-ring"
                          maxLength={6}
                          autoFocus
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-98 cursor-pointer"
                      >
                        Confirm & Access Cloud Drives
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={resetToStepOne}
                          className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
                        >
                          ← Change Phone Number / Credentials
                        </button>
                      </div>
                    </form>

                  </div>
                )}

                {/* ────────── STEP 4: 2FA CLOUD PASSWORD ────────── */}
                {step === 4 && (
                  <div className="animate-fade-up">
                    
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3.5 text-violet-400 text-2xl shadow-lg shadow-violet-500/10">
                        🔐
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Two-Step Verification</h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                        Your Telegram account has 2-Step Verification enabled. Please enter your Telegram cloud password to decrypt the session.
                      </p>
                    </div>

                    <form onSubmit={submitPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 block">
                          Telegram Cloud 2FA Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your 2FA password"
                            className="w-full py-3.5 px-4 pr-16 rounded-xl bg-white/[0.04] border border-white/[0.12] focus:border-indigo-500 focus:bg-white/[0.08] text-white outline-none transition-all shadow-inner glow-ring"
                            autoFocus
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all"
                            tabIndex={-1}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-98 cursor-pointer"
                      >
                        Authenticate Session
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={resetToStepOne}
                          className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
                        >
                          ← Cancel & Return to Credentials
                        </button>
                      </div>
                    </form>

                  </div>
                )}

                {/* ────────── STEP 5: CONNECTED SUCCESS ────────── */}
                {step === 5 && (
                  <div className="py-8 flex flex-col items-center justify-center text-center animate-scale-in">
                    
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20">
                        <svg className="w-10 h-10 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center text-black text-xs font-black shadow-md">
                        ✓
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Telegram Connected!</h3>
                    <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-7">
                      Your cryptographic MTProto session has been established. Redirecting you to your cloud drive workspace…
                    </p>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => navigate("/drives")}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                      >
                        Open Drives Dashboard →
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs font-semibold border border-white/[0.08] hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Bottom Security Assurance Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-slate-400 font-medium">Direct MTProto TLS</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-slate-400 font-medium">Cookie-Only Storage</span>
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-slate-400 font-medium">No Intermediate Servers</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

