import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/// <reference types="react" />
import { useState, useEffect, useRef } from "react";
const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const DAYS = [
    { id: 1, title: "Meet the Letters", emoji: "🌟", color: "#f59e0b", game: "flashcard", desc: "Sing the ABC song & explore letter flashcards!" },
    { id: 2, title: "More Letters!", emoji: "🎵", color: "#f97316", game: "flashcard", desc: "Keep building your letter knowledge!" },
    { id: 3, title: "My Name Letters", emoji: "🏷️", color: "#ef4444", game: "hunt", desc: "Discover the letters hiding in your name!" },
    { id: 4, title: "Letter Hunt!", emoji: "🔍", color: "#ec4899", game: "hunt", desc: "Be a letter detective — find them all!" },
    { id: 5, title: "Tracing Time", emoji: "✏️", color: "#a855f7", game: "trace", desc: "Trace the letters in your name!" },
    { id: 6, title: "Finger Fun", emoji: "👆", color: "#6366f1", game: "trace", desc: "Draw letters with your finger!" },
    { id: 7, title: "Copy Writing", emoji: "✍️", color: "#3b82f6", game: "write", desc: "Copy each letter of your name!" },
    { id: 8, title: "Guided Writing", emoji: "📝", color: "#06b6d4", game: "write", desc: "Write your name letter by letter!" },
    { id: 9, title: "Name Challenge!", emoji: "🏆", color: "#14b8a6", game: "memory", desc: "Spell your name from scrambled tiles!" },
    { id: 10, title: "Memory Master!", emoji: "🎲", color: "#22c55e", game: "memory", desc: "Put the letters back in perfect order!" },
];
export default function App() {
    const [view, setView] = useState("loading");
    const [name, setName] = useState("");
    const [stars, setStars] = useState(0);
    const [done, setDone] = useState([]);
    const [dayCtx, setDayCtx] = useState(null);
    const [gameCtx, setGameCtx] = useState(null);
    const [pop, setPop] = useState(0);
    useEffect(() => {
        (async () => {
            try {
                const n = await window.storage.get("cname");
                const s = await window.storage.get("cstars");
                const d = await window.storage.get("cdone");
                if (n?.value) {
                    setName(n.value);
                    setView("home");
                }
                else
                    setView("welcome");
                if (s?.value)
                    setStars(+s.value || 0);
                if (d?.value)
                    setDone(JSON.parse(d.value) || []);
            }
            catch {
                setView("welcome");
            }
        })();
    }, []);
    const saveName = async (v) => {
        const n = v.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12);
        if (!n)
            return;
        setName(n);
        try {
            await window.storage.set("cname", n);
        }
        catch { }
        setView("home");
    };
    const earn = async (n) => {
        setStars(s => { const ns = s + n; window.storage.set("cstars", String(ns)).catch(() => { }); return ns; });
        setPop(n);
        setTimeout(() => setPop(0), 1400);
    };
    const markDone = (id) => {
        if (done.includes(id))
            return;
        setDone(d => { const nd = [...d, id]; window.storage.set("cdone", JSON.stringify(nd)).catch(() => { }); return nd; });
        earn(3);
    };
    const goHome = () => { setView("home"); setDayCtx(null); setGameCtx(null); };
    const openDay = (d) => { setDayCtx(d); setView("day"); };
    const openGame = (g, fromDay = false) => { setGameCtx({ ...g, fromDay }); setView("game"); };
    if (view === "loading")
        return _jsx(Loader, {});
    if (view === "welcome")
        return _jsx(Welcome, { onSave: saveName });
    if (view === "game")
        return _jsx(GameRouter, { ctx: gameCtx, name: name, earn: earn, onDone: () => { if (gameCtx?.fromDay && dayCtx) {
                markDone(dayCtx.id);
                goHome();
            }
            else
                goHome(); }, onBack: () => setView(gameCtx?.fromDay ? "day" : "home") });
    if (view === "day")
        return dayCtx ? _jsx(DayView, { day: dayCtx, name: name, isDone: done.includes(dayCtx.id), onGame: g => openGame(g, true), onComplete: () => { markDone(dayCtx.id); goHome(); }, onBack: goHome }) : null;
    return (_jsxs("div", { style: { position: "relative" }, children: [_jsx(Home, { name: name, stars: stars, done: done, onDay: openDay, onGame: g => openGame(g, false) }), pop > 0 && _jsx("div", { style: { position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 999, fontSize: 56, textAlign: "center", animation: "pop 1.4s ease forwards", pointerEvents: "none" }, children: "⭐".repeat(Math.min(pop, 5)) }), _jsx("style", { children: `@keyframes pop{0%{opacity:1;transform:translate(-50%,-50%) scale(.4)}50%{opacity:1;transform:translate(-50%,-65%) scale(1.3)}100%{opacity:0;transform:translate(-50%,-90%) scale(1)}}
      @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}` })] }));
}
// ── Welcome ───────────────────────────────────────────────────────
function Welcome({ onSave }) {
    const [v, setV] = useState("");
    return (_jsxs("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fbbf24 0%,#f472b6 50%,#a78bfa 100%)", padding: 24, textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 88, animation: "bounce 1.6s infinite" }, children: "\uD83C\uDF08" }), _jsx("h1", { style: { fontSize: 38, fontWeight: 900, color: "white", textShadow: "2px 3px 10px rgba(0,0,0,.25)", margin: "12px 0 6px" }, children: "Letter Adventure!" }), _jsx("p", { style: { color: "rgba(255,255,255,.9)", fontSize: 18, marginBottom: 32 }, children: "Learn letters & write your name! \uD83C\uDF89" }), _jsxs("div", { style: { background: "white", borderRadius: 28, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,.2)", maxWidth: 380, width: "100%" }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 12 }, children: "\uD83D\uDE0A" }), _jsx("p", { style: { fontSize: 20, fontWeight: 800, color: "#7c3aed", marginBottom: 16 }, children: "What's your name?" }), _jsx("input", { value: v, onChange: e => setV(e.target.value), onKeyDown: e => e.key === "Enter" && onSave(v), placeholder: "Type your name\u2026", maxLength: 12, style: { width: "100%", padding: "14px 18px", fontSize: 24, borderRadius: 14, border: "3px solid #a78bfa", outline: "none", fontWeight: 800, textAlign: "center", color: "#4c1d95", boxSizing: "border-box" } }), _jsx("button", { onClick: () => onSave(v), style: { marginTop: 14, width: "100%", padding: 14, fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg,#a78bfa,#f472b6)", color: "white", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 6px 18px rgba(167,139,250,.5)" }, children: "Let's Go! \uD83D\uDE80" })] })] }));
}
// ── Loader ────────────────────────────────────────────────────────
function Loader() {
    return _jsx("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#a78bfa,#f472b6)" }, children: _jsx("div", { style: { fontSize: 80, animation: "spin 1.5s linear infinite" }, children: "\uD83C\uDF1F" }) });
}
// ── Home ──────────────────────────────────────────────────────────
function Home({ name, stars, done, onDay, onGame }) {
    const pct = Math.round((done.length / 10) * 100);
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f0f4ff", paddingBottom: 40 }, children: [_jsxs("div", { style: { background: "linear-gradient(135deg,#7c3aed,#ec4899)", padding: "28px 20px", borderRadius: "0 0 36px 36px", textAlign: "center", boxShadow: "0 6px 24px rgba(124,58,237,.35)" }, children: [_jsx("div", { style: { fontSize: 52 }, children: "\uD83C\uDF92" }), _jsxs("h1", { style: { fontSize: 30, fontWeight: 900, color: "white", margin: "8px 0 2px" }, children: ["Hello, ", name, "! \uD83D\uDC4B"] }), _jsx("p", { style: { color: "rgba(255,255,255,.85)", fontSize: 15, margin: "0 0 14px" }, children: "Your Letter Adventure" }), _jsxs("div", { style: { display: "inline-flex", gap: 10, background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "8px 22px", alignItems: "center" }, children: [_jsx("span", { style: { fontSize: 26 }, children: "\u2B50" }), _jsxs("span", { style: { color: "white", fontWeight: 900, fontSize: 22 }, children: [stars, " Stars"] })] }), _jsx("div", { style: { marginTop: 14, background: "rgba(255,255,255,.2)", borderRadius: 12, height: 10, overflow: "hidden" }, children: _jsx("div", { style: { height: "100%", background: "#fbbf24", width: `${pct}%`, borderRadius: 12, transition: "width .6s ease" } }) }), _jsxs("p", { style: { color: "rgba(255,255,255,.8)", fontSize: 13, marginTop: 4 }, children: [done.length, "/10 days complete (", pct, "%)"] })] }), _jsxs("div", { style: { padding: "20px 16px" }, children: [_jsx("h2", { style: { fontSize: 19, fontWeight: 800, color: "#4c1d95", margin: "0 0 12px" }, children: "\uD83C\uDFAE Quick Play" }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }, children: [{ type: "flashcard", label: "Flashcards", emoji: "🃏", bg: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
                            { type: "hunt", label: "Letter Hunt", emoji: "🔍", bg: "linear-gradient(135deg,#f472b6,#db2777)" },
                            { type: "trace", label: "Tracing", emoji: "✏️", bg: "linear-gradient(135deg,#a78bfa,#7c3aed)" },
                            { type: "memory", label: "Memory", emoji: "🎲", bg: "linear-gradient(135deg,#34d399,#059669)" }]
                            .map(({ type, label, emoji, bg }) => (_jsxs("button", { onClick: () => onGame({ type }), style: { background: bg, border: "none", borderRadius: 20, padding: "22px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(0,0,0,.15)" }, children: [_jsx("span", { style: { fontSize: 38 }, children: emoji }), _jsx("span", { style: { fontWeight: 800, color: "white", fontSize: 15, textShadow: "1px 1px 4px rgba(0,0,0,.2)" }, children: label })] }, type))) }), _jsx("h2", { style: { fontSize: 19, fontWeight: 800, color: "#4c1d95", margin: "0 0 12px" }, children: "\uD83D\uDCC5 10-Day Adventure" }), DAYS.map((day, i) => {
                        const isDone = done.includes(day.id);
                        const locked = !isDone && i > 0 && !done.includes(DAYS[i - 1]?.id) && i > done.length;
                        return (_jsxs("button", { onClick: () => !locked && onDay(day), style: { width: "100%", background: isDone ? "#d1fae5" : locked ? "#f3f4f6" : "white", border: `3px solid ${isDone ? "#34d399" : locked ? "#e5e7eb" : day.color}`, borderRadius: 20, padding: "14px 16px", cursor: locked ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, textAlign: "left", opacity: locked ? .55 : 1, boxShadow: isDone ? "none" : "0 3px 12px rgba(0,0,0,.07)", animation: "fadein .4s ease" }, children: [_jsx("div", { style: { width: 50, height: 50, borderRadius: 14, background: locked ? "#d1d5db" : isDone ? "#34d399" : day.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }, children: isDone ? "✅" : locked ? "🔒" : day.emoji }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsxs("div", { style: { fontWeight: 800, color: locked ? "#9ca3af" : "#1e1b4b", fontSize: 15 }, children: ["Day ", day.id, ": ", day.title] }), _jsx("div", { style: { color: locked ? "#9ca3af" : "#6b7280", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: day.desc })] }), isDone && _jsx("span", { style: { fontSize: 20, flexShrink: 0 }, children: "\u2B50\u2B50\u2B50" }), !isDone && !locked && _jsx("span", { style: { color: day.color, fontSize: 20, flexShrink: 0 }, children: "\u25B6" })] }, day.id));
                    })] })] }));
}
// ── DayView ───────────────────────────────────────────────────────
function DayView({ day, name, isDone, onGame, onComplete, onBack }) {
    const [abcOpen, setAbcOpen] = useState(false);
    if (abcOpen)
        return _jsx(AlphabetSong, { name: name, onBack: () => setAbcOpen(false) });
    const gameLabel = { flashcard: "🃏 Flashcard Game", hunt: "🔍 Letter Hunt", trace: "✏️ Letter Tracing", write: "✍️ Writing Practice", memory: "🎲 Memory Game" };
    return (_jsxs("div", { style: { minHeight: "100vh", background: "#f0f4ff" }, children: [_jsxs("div", { style: { background: `linear-gradient(135deg,${day.color},${day.color}bb)`, padding: "20px 16px", borderRadius: "0 0 28px 28px", textAlign: "center" }, children: [_jsx("button", { onClick: onBack, style: { position: "absolute", left: 16, top: 20, background: "rgba(255,255,255,.25)", border: "none", borderRadius: 12, padding: "7px 14px", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14 }, children: "\u2190 Back" }), _jsx("div", { style: { fontSize: 48 }, children: day.emoji }), _jsxs("h2", { style: { color: "white", fontWeight: 900, fontSize: 22, margin: "6px 0 2px" }, children: ["Day ", day.id, ": ", day.title] }), _jsx("p", { style: { color: "rgba(255,255,255,.85)", fontSize: 14, margin: 0 }, children: day.desc })] }), _jsxs("div", { style: { padding: 18 }, children: [_jsxs("div", { style: { background: "white", borderRadius: 20, padding: 18, marginBottom: 14, textAlign: "center", boxShadow: "0 4px 14px rgba(0,0,0,.07)" }, children: [_jsx("p", { style: { color: "#6b7280", fontWeight: 600, fontSize: 13, marginBottom: 8 }, children: "\u2728 Your Name" }), _jsx("div", { style: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }, children: name.split("").map((l, i) => (_jsx("div", { style: { width: 50, height: 50, borderRadius: 12, background: `hsl(${i * 47 + 200},65%,62%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "white", boxShadow: "0 3px 8px rgba(0,0,0,.2)" }, children: l }, i))) })] }), _jsx("h3", { style: { fontWeight: 800, color: "#4c1d95", fontSize: 17, margin: "0 0 12px" }, children: "Today's Activities:" }), day.id <= 2 && (_jsxs("button", { onClick: () => setAbcOpen(true), style: { width: "100%", background: "linear-gradient(135deg,#fbbf24,#f59e0b)", border: "none", borderRadius: 18, padding: 18, cursor: "pointer", textAlign: "left", marginBottom: 12, boxShadow: "0 4px 14px rgba(251,191,36,.4)" }, children: [_jsx("div", { style: { fontSize: 26, marginBottom: 6 }, children: "\uD83C\uDFB5" }), _jsx("div", { style: { fontWeight: 800, color: "white", fontSize: 17 }, children: "Alphabet Song" }), _jsx("div", { style: { color: "rgba(255,255,255,.85)", fontSize: 13, marginTop: 3 }, children: "Watch the letters light up as we sing!" })] })), _jsxs("button", { onClick: () => onGame({ type: day.game }), style: { width: "100%", background: `linear-gradient(135deg,${day.color},${day.color}aa)`, border: "none", borderRadius: 18, padding: 18, cursor: "pointer", textAlign: "left", boxShadow: `0 4px 14px ${day.color}66` }, children: [_jsx("div", { style: { fontSize: 26, marginBottom: 6 }, children: day.emoji }), _jsx("div", { style: { fontWeight: 800, color: "white", fontSize: 17 }, children: gameLabel[day.game] }), _jsx("div", { style: { color: "rgba(255,255,255,.85)", fontSize: 13, marginTop: 3 }, children: "Tap to start playing!" })] }), !isDone ? (_jsx("button", { onClick: onComplete, style: { marginTop: 16, width: "100%", padding: 15, fontSize: 17, fontWeight: 800, background: "linear-gradient(135deg,#34d399,#10b981)", color: "white", border: "none", borderRadius: 16, cursor: "pointer", boxShadow: "0 4px 14px rgba(52,211,153,.4)" }, children: "\u2705 Mark Day Complete (+3 \u2B50)" })) : (_jsx("div", { style: { marginTop: 16, textAlign: "center", padding: 14, background: "#d1fae5", borderRadius: 16, color: "#065f46", fontWeight: 700, fontSize: 15 }, children: "\u2705 Day Complete! Great job! \u2B50\u2B50\u2B50" }))] })] }));
}
// ── AlphabetSong ──────────────────────────────────────────────────
function AlphabetSong({ name, onBack }) {
    const [cur, setCur] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const ref = useRef();
    const start = () => {
        setPlaying(true);
        setCur(0);
        let i = 0;
        ref.current = setInterval(() => { i++; if (i >= 26) {
            clearInterval(ref.current);
            setPlaying(false);
        }
        else
            setCur(i); }, 480);
    };
    useEffect(() => () => clearInterval(ref.current), []);
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#fef3c7,#fde68a)", padding: 20 }, children: [_jsx("button", { onClick: onBack, style: { background: "rgba(255,255,255,.7)", border: "none", borderRadius: 12, padding: "8px 16px", cursor: "pointer", fontWeight: 700, marginBottom: 16 }, children: "\u2190 Back" }), _jsxs("div", { style: { textAlign: "center", marginBottom: 20 }, children: [_jsx("div", { style: { fontSize: 48 }, children: "\uD83C\uDFB5" }), _jsx("h2", { style: { fontSize: 26, fontWeight: 900, color: "#92400e", margin: "4px 0" }, children: "ABC Song!" }), _jsxs("p", { style: { color: "#78350f", fontSize: 14 }, children: ["Letters in ", _jsx("strong", { children: name }), " are highlighted!"] })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7, marginBottom: 22 }, children: AZ.map((l, i) => {
                    const inName = name.includes(l);
                    const active = playing && i === cur;
                    const past = playing && i < cur;
                    return _jsx("div", { style: { aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: 19, fontWeight: 900, transition: "all .2s",
                            background: active ? "#f59e0b" : inName ? "#fde68a" : past ? "#d1fae5" : "white",
                            color: active ? "white" : inName ? "#92400e" : "#374151",
                            transform: active ? "scale(1.35)" : "scale(1)",
                            boxShadow: active ? "0 4px 14px rgba(245,158,11,.7)" : inName ? "0 2px 8px rgba(245,158,11,.3)" : "0 1px 4px rgba(0,0,0,.08)",
                            border: inName ? "2px solid #f59e0b" : "2px solid transparent" }, children: l }, l);
                }) }), _jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "center" }, children: [_jsx("button", { onClick: start, disabled: playing, style: { padding: "13px 26px", fontSize: 17, fontWeight: 800, background: "#f59e0b", color: "white", border: "none", borderRadius: 14, cursor: "pointer", opacity: playing ? .6 : 1 }, children: playing ? "Singing… 🎵" : "▶ Start Singing!" }), _jsx("button", { onClick: onBack, style: { padding: "13px 26px", fontSize: 17, fontWeight: 800, background: "#34d399", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }, children: "Done \u2713" })] })] }));
}
// ── GameRouter ────────────────────────────────────────────────────
function GameRouter({ ctx, name, earn, onDone, onBack }) {
    const p = { name, earn, onDone, onBack };
    if (ctx?.type === "flashcard")
        return _jsx(FlashcardGame, { ...p });
    if (ctx?.type === "hunt")
        return _jsx(HuntGame, { ...p });
    if (ctx?.type === "trace")
        return _jsx(TraceGame, { ...p });
    if (ctx?.type === "write")
        return _jsx(WriteGame, { ...p });
    if (ctx?.type === "memory")
        return _jsx(MemoryGame, { ...p });
    return null;
}
// ── FlashcardGame ─────────────────────────────────────────────────
function FlashcardGame({ name, earn, onDone, onBack }) {
    const letters = useRef(shuffle([...new Set([...name.split(""), ...shuffle(AZ).slice(0, 12)])]).slice(0, 12)).current;
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [score, setScore] = useState(0);
    const [fin, setFin] = useState(false);
    const answer = (knew) => {
        if (knew) {
            setScore(s => s + 1);
            earn(1);
        }
        if (idx < letters.length - 1) {
            setFlipped(false);
            setTimeout(() => setIdx(i => i + 1), 200);
        }
        else
            setFin(true);
    };
    if (fin)
        return _jsx(Win, { score: score, total: letters.length, msg: "You're a letter star!", onDone: onDone });
    const l = letters[idx];
    const inName = name.includes(l);
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#fef9c3,#fef3c7)", padding: 20 }, children: [_jsx(Header, { title: "\uD83C\uDCCF Flashcards", left: `${idx + 1}/${letters.length}`, right: `⭐${score}`, onBack: onBack }), inName && _jsx("p", { style: { textAlign: "center", color: "#d97706", fontWeight: 700, marginBottom: 8, fontSize: 14 }, children: "\u2B50 This letter is in YOUR name!" }), _jsx("div", { onClick: () => setFlipped(true), style: { margin: "0 auto 24px", maxWidth: 280, height: 280, borderRadius: 28, background: flipped ? `hsl(${l.charCodeAt(0) * 11 % 360},65%,60%)` : "linear-gradient(135deg,#a78bfa,#ec4899)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 12px 40px rgba(0,0,0,.2)", transition: "all .3s" }, children: flipped ? _jsxs(_Fragment, { children: [_jsx("div", { style: { fontSize: 130, fontWeight: 900, color: "white", lineHeight: 1 }, children: l }), _jsx("div", { style: { fontSize: 52, color: "rgba(255,255,255,.7)" }, children: l.toLowerCase() })] })
                    : _jsxs(_Fragment, { children: [_jsx("div", { style: { fontSize: 52 }, children: "\u2753" }), _jsx("div", { style: { color: "rgba(255,255,255,.85)", fontWeight: 700, fontSize: 17, marginTop: 8 }, children: "Tap to reveal!" })] }) }), flipped ? (_jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "center" }, children: [_jsx("button", { onClick: () => answer(false), style: { flex: 1, maxWidth: 160, padding: 13, fontSize: 15, fontWeight: 800, background: "#f87171", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }, children: "\uD83D\uDE15 Still Learning" }), _jsx("button", { onClick: () => answer(true), style: { flex: 1, maxWidth: 160, padding: 13, fontSize: 15, fontWeight: 800, background: "#34d399", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }, children: "\uD83C\uDF89 I Know It!" })] })) : _jsx("p", { style: { textAlign: "center", color: "#78350f", fontWeight: 600 }, children: "Look at the card \u2014 what letter is it?" })] }));
}
// ── HuntGame ──────────────────────────────────────────────────────
function HuntGame({ name, earn, onDone, onBack }) {
    const nameLs = [...new Set(name.split(""))];
    const extra = shuffle(AZ.filter(l => !nameLs.includes(l))).slice(0, 24 - nameLs.length);
    const grid = useRef(shuffle([...nameLs, ...extra])).current;
    const [found, setFound] = useState(new Set());
    const [wrong, setWrong] = useState(null);
    const [fin, setFin] = useState(false);
    const tap = (l, i) => {
        if (found.has(i))
            return;
        if (nameLs.includes(l)) {
            const nf = new Set([...found, i]);
            setFound(nf);
            earn(1);
            const foundUniq = [...new Set([...nf].map(x => grid[x]))];
            if (foundUniq.length >= nameLs.length)
                setTimeout(() => setFin(true), 400);
        }
        else {
            setWrong(i);
            setTimeout(() => setWrong(null), 550);
        }
    };
    const foundUniq = [...new Set([...found].map(i => grid[i]))];
    if (fin)
        return _jsx(Win, { score: nameLs.length, total: nameLs.length, msg: `You found all letters in ${name}!`, onDone: onDone });
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#fce7f3,#fdf4ff)", padding: 20 }, children: [_jsx(Header, { title: "\uD83D\uDD0D Letter Hunt", left: `${foundUniq.length}/${nameLs.length}`, right: "", onBack: onBack }), _jsxs("div", { style: { background: "white", borderRadius: 16, padding: 14, marginBottom: 14, boxShadow: "0 3px 10px rgba(0,0,0,.07)" }, children: [_jsx("p", { style: { textAlign: "center", fontWeight: 700, color: "#6b7280", fontSize: 13, marginBottom: 8 }, children: "Find letters in your name:" }), _jsx("div", { style: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }, children: nameLs.map(l => {
                            const f = foundUniq.includes(l);
                            return (_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: f ? "#34d399" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: f ? "white" : "#374151", transition: "all .25s" }, children: f ? "✓" : l }, l));
                        }) })] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }, children: grid.map((l, i) => {
                    const f = found.has(i);
                    const w = wrong === i;
                    return (_jsx("button", { onClick: () => tap(l, i), style: { aspectRatio: "1", borderRadius: 14, border: "none", fontSize: 21, fontWeight: 900, cursor: "pointer", background: f ? "#34d399" : w ? "#f87171" : "white", color: f || w ? "white" : "#374151", transform: w ? "scale(.88)" : f ? "scale(1.05)" : "scale(1)", transition: "all .15s", boxShadow: `0 3px 8px ${f ? "rgba(52,211,153,.4)" : w ? "rgba(248,113,113,.4)" : "rgba(0,0,0,.08)"}` }, children: f ? "✓" : l }, i));
                }) }), _jsxs("p", { style: { textAlign: "center", marginTop: 14, color: "#9d174d", fontWeight: 600, fontSize: 13 }, children: ["Tap each letter in: ", _jsx("strong", { children: name })] })] }));
}
// ── TraceGame ─────────────────────────────────────────────────────
function TraceGame({ name, earn, onDone, onBack }) {
    const letters = name.split("");
    const [idx, setIdx] = useState(0);
    const cvs = useRef(null);
    const drawing = useRef(false);
    const l = letters[idx];
    const getXY = (e, c) => { const r = c.getBoundingClientRect(), t = e.touches?.[0] || e; return { x: t.clientX - r.left, y: t.clientY - r.top }; };
    const guide = () => { if (!cvs.current)
        return; const ctx = cvs.current.getContext("2d"); if (!ctx)
        return; ctx.clearRect(0, 0, 280, 280); ctx.font = "bold 195px Arial"; ctx.fillStyle = "rgba(167,139,250,.18)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l, 140, 148); };
    useEffect(() => { guide(); }, [idx]);
    const sd = (e) => { e.preventDefault(); drawing.current = true; if (!cvs.current)
        return; const ctx = cvs.current.getContext("2d"); if (!ctx)
        return; const { x, y } = getXY(e, cvs.current); ctx.beginPath(); ctx.moveTo(x, y); };
    const d = (e) => { e.preventDefault(); if (!drawing.current || !cvs.current)
        return; const ctx = cvs.current.getContext("2d"); if (!ctx)
        return; const { x, y } = getXY(e, cvs.current); ctx.lineTo(x, y); ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.stroke(); };
    const ed = () => { drawing.current = false; };
    const clear = () => { if (!cvs.current)
        return; const ctx = cvs.current.getContext("2d"); if (!ctx)
        return; ctx.clearRect(0, 0, 280, 280); guide(); };
    const next = () => { earn(1); if (idx < letters.length - 1)
        setIdx(i => i + 1);
    else
        onDone(); };
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#ede9fe,#faf5ff)", padding: 20 }, children: [_jsx(Header, { title: `✏️ Trace: ${l}`, left: `${idx + 1}/${letters.length}`, right: "", onBack: onBack }), _jsx("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }, children: letters.map((x, i) => _jsx("div", { style: { width: 44, height: 44, borderRadius: 10, background: i < idx ? "#a78bfa" : i === idx ? "#7c3aed" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: i <= idx ? "white" : "#9ca3af", border: i === idx ? "3px solid #6d28d9" : "3px solid transparent" }, children: x }, i)) }), _jsxs("p", { style: { textAlign: "center", color: "#7c3aed", fontWeight: 600, marginBottom: 12 }, children: ["Trace the big letter ", _jsx("strong", { style: { fontSize: 22 }, children: l }), " with your finger!"] }), _jsx("div", { style: { display: "flex", justifyContent: "center", marginBottom: 16 }, children: _jsx("canvas", { ref: cvs, width: 280, height: 280, style: { borderRadius: 24, background: "white", boxShadow: "0 8px 28px rgba(124,58,237,.2)", border: "3px solid #c4b5fd", cursor: "crosshair", touchAction: "none" }, onMouseDown: sd, onMouseMove: d, onMouseUp: ed, onMouseLeave: ed, onTouchStart: sd, onTouchMove: d, onTouchEnd: ed }) }), _jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "center" }, children: [_jsx("button", { onClick: clear, style: { padding: "12px 22px", fontSize: 15, fontWeight: 700, background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 14, cursor: "pointer" }, children: "\uD83D\uDDD1\uFE0F Clear" }), _jsx("button", { onClick: next, style: { padding: "12px 26px", fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }, children: idx < letters.length - 1 ? "Next Letter →" : "All Done! 🎉" })] })] }));
}
// ── WriteGame ─────────────────────────────────────────────────────
function WriteGame({ name, earn, onDone, onBack }) {
    const [input, setInput] = useState("");
    const [result, setResult] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const check = () => {
        setAttempts(a => a + 1);
        const v = input.trim().toUpperCase().replace(/[^A-Z]/g, "");
        if (v === name) {
            setResult("ok");
            earn(2);
        }
        else
            setResult("no");
    };
    if (result === "ok")
        return _jsx(Win, { score: 2, total: 2, msg: `You wrote ${name} perfectly!`, onDone: onDone });
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)", padding: 20 }, children: [_jsx(Header, { title: "\u270D\uFE0F Write Your Name", left: "", right: "", onBack: onBack }), _jsxs("div", { style: { background: "white", borderRadius: 20, padding: 18, marginBottom: 14, textAlign: "center", boxShadow: "0 4px 14px rgba(0,0,0,.07)" }, children: [_jsx("p", { style: { color: "#6b7280", fontWeight: 600, fontSize: 13, marginBottom: 10 }, children: "Copy this name:" }), _jsx("div", { style: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }, children: name.split("").map((l, i) => (_jsxs("div", { style: { width: 52, height: 60, borderRadius: 12, background: `hsl(${i * 55 + 200},60%,58%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(0,0,0,.15)" }, children: [_jsx("span", { style: { fontSize: 26, fontWeight: 900, color: "white" }, children: l }), _jsx("span", { style: { fontSize: 15, color: "rgba(255,255,255,.75)" }, children: l.toLowerCase() })] }, i))) })] }), _jsxs("div", { style: { background: "white", borderRadius: 20, padding: 18, marginBottom: 14, boxShadow: "0 4px 14px rgba(0,0,0,.07)" }, children: [_jsx("p", { style: { color: "#0c4a6e", fontWeight: 700, marginBottom: 10 }, children: "Now write it here:" }), _jsx("input", { value: input, onChange: e => { setInput(e.target.value); setResult(null); }, maxLength: 20, placeholder: "Type your name\u2026", style: { width: "100%", padding: "14px", fontSize: 26, borderRadius: 14, border: `3px solid ${result === "no" ? "#f87171" : result === "ok" ? "#34d399" : "#bae6fd"}`, outline: "none", fontWeight: 800, textAlign: "center", color: "#0c4a6e", boxSizing: "border-box", letterSpacing: 6 } }), result === "no" && _jsx("p", { style: { textAlign: "center", color: "#dc2626", fontWeight: 700, marginTop: 8, fontSize: 14 }, children: "Not quite! Look at the letters above and try again \uD83D\uDCAA" })] }), _jsx("div", { style: { background: "#e0f2fe", borderRadius: 14, padding: 12, marginBottom: 14 }, children: _jsxs("p", { style: { textAlign: "center", color: "#0c4a6e", fontWeight: 600, margin: 0, fontSize: 13 }, children: ["\uD83D\uDCA1 Say each letter aloud: ", name.split("").join(" — ")] }) }), _jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "center" }, children: [_jsx("button", { onClick: () => { setInput(""); setResult(null); }, style: { padding: "12px 22px", fontSize: 15, fontWeight: 700, background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 14, cursor: "pointer" }, children: "\uD83D\uDDD1\uFE0F Clear" }), _jsx("button", { onClick: check, style: { padding: "12px 26px", fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg,#0ea5e9,#0369a1)", color: "white", border: "none", borderRadius: 14, cursor: "pointer" }, children: "Check \u2713" })] })] }));
}
// ── MemoryGame ────────────────────────────────────────────────────
function MemoryGame({ name, earn, onDone, onBack }) {
    const init = () => ({ tiles: shuffle(name.split("").map((l, i) => ({ l, id: i }))), placed: Array(name.length).fill(null), sel: null, moves: 0 });
    const [state, setState] = useState(init);
    const { tiles, placed, sel, moves } = state;
    const placedIds = placed.filter((p) => p !== null).map(p => p.id);
    const available = tiles.filter(t => !placedIds.includes(t.id));
    const tapTile = (t) => setState(s => ({ ...s, sel: s.sel?.id === t.id ? null : t }));
    const tapSlot = (i) => {
        if (!sel)
            return;
        if (placed[i])
            return;
        const np = [...placed];
        np[i] = sel;
        const newMoves = moves + 1;
        const won = np.every((p) => p !== null) && np.map(p => p.l).join("") === name;
        setState(s => ({ ...s, placed: np, sel: null, moves: newMoves }));
        if (won) {
            earn(3);
            setTimeout(() => onDone(), 400);
        }
    };
    const removeSlot = (i) => setState(s => { const np = [...s.placed]; np[i] = null; return { ...s, placed: np }; });
    const reset = () => setState(init());
    const allPlaced = placed.every((p) => p !== null);
    const correct = allPlaced && placed.map(p => p.l).join("") === name;
    const wrong = allPlaced && !correct;
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", padding: 20 }, children: [_jsx(Header, { title: "\uD83C\uDFB2 Memory Game", left: `Moves: ${moves}`, right: "", onBack: onBack }), _jsxs("p", { style: { textAlign: "center", color: "#065f46", fontWeight: 600, marginBottom: 16, fontSize: 14 }, children: [sel ? `Tap a blank slot to place "${sel.l}"` : `Tap a letter tile, then tap a slot. Spell: `, _jsx("strong", { children: !sel && name })] }), wrong && _jsx("p", { style: { textAlign: "center", color: "#dc2626", fontWeight: 700, fontSize: 14, marginBottom: 8 }, children: "Not quite! Try rearranging the letters \uD83D\uDD04" }), _jsx("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }, children: placed.map((tile, i) => (_jsx("div", { onClick: () => tile ? removeSlot(i) : tapSlot(i), style: { width: 52, height: 58, borderRadius: 13, background: tile ? (wrong ? "#fca5a5" : correct ? "#34d399" : "#34d399") : "white", border: `3px dashed ${tile ? (wrong ? "#ef4444" : "#10b981") : "#86efac"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s", boxShadow: tile ? "0 4px 12px rgba(52,211,153,.4)" : "none", transform: sel && !tile ? "scale(1.08)" : "scale(1)" }, children: tile ? _jsxs(_Fragment, { children: [_jsx("span", { style: { fontSize: 24, fontWeight: 900, color: "white" }, children: tile.l }), _jsx("span", { style: { fontSize: 10, color: "rgba(255,255,255,.75)" }, children: "remove" })] }) : _jsx("span", { style: { color: "#86efac", fontSize: 20 }, children: "+" }) }, i))) }), _jsx("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(name.length, 6)},1fr)`, gap: 10, maxWidth: 360, margin: "0 auto" }, children: available.map(t => {
                    const s2 = sel?.id === t.id;
                    return (_jsx("button", { onClick: () => tapTile(t), style: { aspectRatio: "1", borderRadius: 14, border: `3px solid ${s2 ? "#10b981" : "transparent"}`, fontSize: 26, fontWeight: 900, background: s2 ? "#a7f3d0" : "white", color: s2 ? "#065f46" : "#374151", cursor: "pointer", transform: s2 ? "scale(1.12)" : "scale(1)", transition: "all .15s", boxShadow: `0 4px 12px ${s2 ? "rgba(16,185,129,.4)" : "rgba(0,0,0,.08)"}` }, children: t.l }, t.id));
                }) }), _jsx("button", { onClick: reset, style: { display: "block", margin: "18px auto 0", padding: "10px 22px", fontSize: 13, fontWeight: 700, background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 12, cursor: "pointer" }, children: "\uD83D\uDD04 Reset" })] }));
}
// ── Shared ────────────────────────────────────────────────────────
function Header({ title, left, right, onBack }) {
    return (_jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, children: [_jsx("button", { onClick: onBack, style: { background: "rgba(255,255,255,.8)", border: "none", borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 14 }, children: "\u2190 Back" }), _jsx("h2", { style: { fontSize: 20, fontWeight: 900, color: "#1e1b4b", margin: 0 }, children: title }), _jsx("div", { style: { fontWeight: 800, color: "#6b7280", fontSize: 14, minWidth: 60, textAlign: "right" }, children: left || right })] }));
}
function Win({ score, total, msg, onDone }) {
    return (_jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg,#d1fae5,#fef9c3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }, children: [_jsx("div", { style: { fontSize: 88, animation: "bounce 1.2s infinite" }, children: "\uD83C\uDF89" }), _jsx("h2", { style: { fontSize: 34, fontWeight: 900, color: "#065f46", margin: "12px 0 6px" }, children: "Amazing!" }), _jsx("p", { style: { fontSize: 18, color: "#374151", fontWeight: 600, marginBottom: 6 }, children: msg }), _jsxs("p", { style: { fontSize: 16, color: "#6b7280", marginBottom: 28 }, children: ["You earned ", score, " \u2B50 star", score !== 1 ? "s" : "", "!"] }), _jsx("div", { style: { display: "flex", gap: 8, marginBottom: 28 }, children: Array(score).fill(0).map((_, i) => _jsx("span", { style: { fontSize: 36, animation: `bounce 1s ease ${i * .15}s infinite` }, children: "\u2B50" }, i)) }), _jsx("button", { onClick: onDone, style: { padding: "15px 32px", fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#34d399,#059669)", color: "white", border: "none", borderRadius: 16, cursor: "pointer", boxShadow: "0 6px 18px rgba(52,211,153,.4)" }, children: "\uD83C\uDFE0 Back Home" })] }));
}
