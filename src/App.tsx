import React, { useState, useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements { [elemName: string]: any; }
  }
}

interface GameContext { type: string; fromDay?: boolean; }
interface DayConfig { id: number; title: string; emoji: string; color: string; game: string; desc: string; }

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// ── Storage: works in Claude artifacts AND Vercel/localStorage ────
const store = {
  get: async (key: string): Promise<string | null> => {
    try {
      const w = window as any;
      if (w.storage?.get) { const r = await w.storage.get(key); return r?.value ?? null; }
      return localStorage.getItem(key);
    } catch { try { return localStorage.getItem(key); } catch { return null; } }
  },
  set: async (key: string, val: string): Promise<void> => {
    try {
      const w = window as any;
      if (w.storage?.set) { await w.storage.set(key, val); return; }
      localStorage.setItem(key, val);
    } catch { try { localStorage.setItem(key, val); } catch {} }
  }
};

// ── Name utilities ─────────────────────────────────────────────────
const sanitizeName = (v: string): string =>
  v.trim().toUpperCase().replace(/[^A-Z\s\.\-\']/g, "").replace(/\s+/g, " ").slice(0, 40);
const getFirstName = (name: string): string => name.split(" ")[0];
const getNameLetters = (name: string): string[] =>
  [...new Set(name.replace(/[^A-Z]/g, "").split(""))];

const DAYS: DayConfig[] = [
  {id:1,title:"Meet the Letters",emoji:"🌟",color:"#f59e0b",game:"flashcard",desc:"Sing the ABC song & explore letter flashcards!"},
  {id:2,title:"More Letters!",emoji:"🎵",color:"#f97316",game:"flashcard",desc:"Keep building your letter knowledge!"},
  {id:3,title:"My Name Letters",emoji:"🏷️",color:"#ef4444",game:"hunt",desc:"Discover the letters hiding in your name!"},
  {id:4,title:"Letter Hunt!",emoji:"🔍",color:"#ec4899",game:"hunt",desc:"Be a letter detective — find them all!"},
  {id:5,title:"Tracing Time",emoji:"✏️",color:"#a855f7",game:"trace",desc:"Trace the letters in your first name!"},
  {id:6,title:"Finger Fun",emoji:"👆",color:"#6366f1",game:"trace",desc:"Draw letters with your finger!"},
  {id:7,title:"Copy Writing",emoji:"✍️",color:"#3b82f6",game:"write",desc:"Copy your first name letter by letter!"},
  {id:8,title:"Guided Writing",emoji:"📝",color:"#06b6d4",game:"write",desc:"Write your first name from memory!"},
  {id:9,title:"Name Challenge!",emoji:"🏆",color:"#14b8a6",game:"memory",desc:"Spell your first name from scrambled tiles!"},
  {id:10,title:"Memory Master!",emoji:"🎲",color:"#22c55e",game:"memory",desc:"Put the letters back in perfect order!"},
];

export default function App() {
  const [view, setView] = useState<string>("loading");
  const [name, setName] = useState<string>("");
  const [stars, setStars] = useState<number>(0);
  const [done, setDone] = useState<number[]>([]);
  const [dayCtx, setDayCtx] = useState<DayConfig | null>(null);
  const [gameCtx, setGameCtx] = useState<GameContext | null>(null);
  const [pop, setPop] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const n = await store.get("cname");
        const s = await store.get("cstars");
        const d = await store.get("cdone");
        if (n) { setName(n); setView("home"); } else setView("welcome");
        if (s) setStars(+s || 0);
        if (d) setDone(JSON.parse(d) || []);
      } catch { setView("welcome"); }
    })();
  }, []);

  const saveName = async (v: string): Promise<void> => {
    const n = sanitizeName(v);
    if (!n) return;
    setName(n);
    try { await store.set("cname", n); } catch {}
    setView("home");
  };

  const earn = async (n: number): Promise<void> => {
    setStars(s => { const ns = s + n; store.set("cstars", String(ns)).catch(() => {}); return ns; });
    setPop(n); setTimeout(() => setPop(0), 1400);
  };

  const markDone = (id: number): void => {
    if (done.includes(id)) return;
    setDone(d => { const nd = [...d, id]; store.set("cdone", JSON.stringify(nd)).catch(() => {}); return nd; });
    earn(3);
  };

  const goHome = (): void => { setView("home"); setDayCtx(null); setGameCtx(null); };
  const openDay = (d: DayConfig): void => { setDayCtx(d); setView("day"); };
  const openGame = (g: GameContext | { type: string }, fromDay = false): void => {
    setGameCtx({ ...g as GameContext, fromDay }); setView("game");
  };

  if (view === "loading") return <Loader />;
  if (view === "welcome") return <Welcome onSave={saveName} />;
  if (view === "game") return <GameRouter ctx={gameCtx} name={name} earn={earn}
    onDone={() => { if (gameCtx?.fromDay && dayCtx) { markDone(dayCtx.id); goHome(); } else goHome(); }}
    onBack={() => setView(gameCtx?.fromDay ? "day" : "home")} />;
  if (view === "day") return dayCtx ? <DayView day={dayCtx} name={name} isDone={done.includes(dayCtx.id)}
    onGame={g => openGame(g, true)} onComplete={() => { markDone(dayCtx.id); goHome(); }} onBack={goHome} /> : null;

  return (
    <div style={{ position: "relative" }}>
      <Home name={name} stars={stars} done={done} onDay={openDay} onGame={g => openGame(g, false)} />
      {pop > 0 && <div style={{ position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 999, fontSize: 56, textAlign: "center", animation: "pop 1.4s ease forwards", pointerEvents: "none" }}>{"⭐".repeat(Math.min(pop, 5))}</div>}
      <style>{`@keyframes pop{0%{opacity:1;transform:translate(-50%,-50%) scale(.4)}50%{opacity:1;transform:translate(-50%,-65%) scale(1.3)}100%{opacity:0;transform:translate(-50%,-90%) scale(1)}}
      @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes fadein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

// ── Welcome ───────────────────────────────────────────────────────
function Welcome({ onSave }: { onSave: (v: string) => Promise<void> }) {
  const [v, setV] = useState<string>("");
  const preview = sanitizeName(v);
  const fname = preview ? getFirstName(preview) : "";
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fbbf24 0%,#f472b6 50%,#a78bfa 100%)",padding:24,textAlign:"center"}}>
      <div style={{fontSize:88,animation:"bounce 1.6s infinite"}}>🌈</div>
      <h1 style={{fontSize:38,fontWeight:900,color:"white",textShadow:"2px 3px 10px rgba(0,0,0,.25)",margin:"12px 0 6px"}}>Letter Adventure!</h1>
      <p style={{color:"rgba(255,255,255,.9)",fontSize:18,marginBottom:32}}>Learn letters & write your name! 🎉</p>
      <div style={{background:"white",borderRadius:28,padding:32,boxShadow:"0 24px 64px rgba(0,0,0,.2)",maxWidth:420,width:"100%"}}>
        <div style={{fontSize:40,marginBottom:12}}>😊</div>
        <p style={{fontSize:20,fontWeight:800,color:"#7c3aed",marginBottom:4}}>What's your full name?</p>
        <p style={{fontSize:13,color:"#9ca3af",marginBottom:16}}>e.g. Jela Allison R. Robles</p>
        <input
          value={v}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setV(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && onSave(v)}
          placeholder="Type your full name…"
          maxLength={40}
          style={{width:"100%",padding:"14px 18px",fontSize:20,borderRadius:14,border:"3px solid #a78bfa",outline:"none",fontWeight:800,textAlign:"center",color:"#4c1d95",boxSizing:"border-box"}}
        />
        {preview && (
          <div style={{marginTop:10,padding:"10px 14px",background:"#f5f3ff",borderRadius:10,textAlign:"left"}}>
            <p style={{fontSize:11,color:"#7c3aed",margin:"0 0 2px",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Saved as:</p>
            <p style={{fontSize:17,fontWeight:900,color:"#4c1d95",margin:"0 0 4px"}}>{preview}</p>
            <p style={{fontSize:11,color:"#9ca3af",margin:0}}>Games will use first name: <strong style={{color:"#7c3aed"}}>{fname}</strong></p>
          </div>
        )}
        <button
          onClick={() => onSave(v)}
          style={{marginTop:14,width:"100%",padding:14,fontSize:22,fontWeight:900,background:"linear-gradient(135deg,#a78bfa,#f472b6)",color:"white",border:"none",borderRadius:14,cursor:"pointer",boxShadow:"0 6px 18px rgba(167,139,250,.5)"}}>
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}

// ── Loader ────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#a78bfa,#f472b6)"}}>
      <div style={{fontSize:80,animation:"spin 1.5s linear infinite"}}>🌟</div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────
function Home({ name, stars, done, onDay, onGame }: {
  name: string; stars: number; done: number[];
  onDay: (d: DayConfig) => void; onGame: (g: GameContext | { type: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [confirmReset, setConfirmReset] = useState(false);
  const pct = Math.round((done.length / 10) * 100);
  const fname = getFirstName(name);
  const isFullName = name.includes(" ") || name.includes(".");

  const saveName = async (v: string): Promise<void> => {
    const n = sanitizeName(v);
    if (!n) return;
    try { await store.set("cname", n); } catch {}
    window.location.reload();
  };

  const resetProgress = async (): Promise<void> => {
    try { await store.set("cstars", "0"); await store.set("cdone", "[]"); } catch {}
    window.location.reload();
  };

  if (confirmReset) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fbbf24 0%,#f472b6 50%,#a78bfa 100%)",padding:24,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>⚠️</div>
      <h1 style={{fontSize:32,fontWeight:900,color:"white",textShadow:"2px 3px 10px rgba(0,0,0,.25)",marginBottom:24}}>Reset Progress?</h1>
      <div style={{background:"white",borderRadius:28,padding:32,boxShadow:"0 24px 64px rgba(0,0,0,.2)",maxWidth:380,width:"100%"}}>
        <p style={{fontSize:16,fontWeight:700,color:"#7c3aed",marginBottom:12}}>This will clear all your progress:</p>
        <ul style={{textAlign:"left",color:"#374151",fontWeight:600,fontSize:14,marginBottom:20}}>
          <li>✓ All completed days will be reset</li>
          <li>✓ Your stars will be cleared</li>
          <li>✓ Your name stays the same</li>
        </ul>
        <p style={{color:"#dc2626",fontWeight:700,marginBottom:16}}>This cannot be undone!</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={() => setConfirmReset(false)}
            style={{flex:1,padding:12,fontSize:15,fontWeight:700,background:"#e5e7eb",color:"#374151",border:"none",borderRadius:12,cursor:"pointer"}}>Cancel</button>
          <button onClick={resetProgress}
            style={{flex:1,padding:12,fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#f87171,#dc2626)",color:"white",border:"none",borderRadius:12,cursor:"pointer"}}>Reset ⚠️</button>
        </div>
      </div>
    </div>
  );

  if (editing) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#fbbf24 0%,#f472b6 50%,#a78bfa 100%)",padding:24,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>✏️</div>
      <h1 style={{fontSize:32,fontWeight:900,color:"white",textShadow:"2px 3px 10px rgba(0,0,0,.25)",marginBottom:24}}>Update Your Name</h1>
      <div style={{background:"white",borderRadius:28,padding:32,boxShadow:"0 24px 64px rgba(0,0,0,.2)",maxWidth:420,width:"100%"}}>
        <p style={{fontSize:14,fontWeight:700,color:"#7c3aed",marginBottom:12}}>Current: <strong>{name}</strong></p>
        <p style={{fontSize:12,color:"#9ca3af",marginBottom:12}}>e.g. Jela Allison R. Robles</p>
        <input value={newName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && saveName(newName)}
          placeholder="Type full name…" maxLength={40}
          style={{width:"100%",padding:"14px 18px",fontSize:18,borderRadius:14,border:"3px solid #a78bfa",outline:"none",fontWeight:800,textAlign:"center",color:"#4c1d95",boxSizing:"border-box",marginBottom:14}}
        />
        {sanitizeName(newName) && (
          <div style={{marginBottom:14,padding:"8px 12px",background:"#f5f3ff",borderRadius:10,fontSize:12,color:"#7c3aed",fontWeight:700}}>
            Games will use: <strong>{getFirstName(sanitizeName(newName))}</strong>
          </div>
        )}
        <div style={{display:"flex",gap:10}}>
          <button onClick={() => { setNewName(name); setEditing(false); }}
            style={{flex:1,padding:12,fontSize:15,fontWeight:700,background:"#e5e7eb",color:"#374151",border:"none",borderRadius:12,cursor:"pointer"}}>Cancel</button>
          <button onClick={() => saveName(newName)}
            style={{flex:1,padding:12,fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#34d399,#10b981)",color:"white",border:"none",borderRadius:12,cursor:"pointer"}}>Save ✓</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f0f4ff",paddingBottom:40}}>
      {/* Header with buttons INSIDE to prevent overlap */}
      <div style={{background:"linear-gradient(135deg,#7c3aed,#ec4899)",padding:"28px 20px 20px",borderRadius:"0 0 36px 36px",textAlign:"center",boxShadow:"0 6px 24px rgba(124,58,237,.35)"}}>
        <div style={{fontSize:52}}>🎒</div>
        <h1 style={{fontSize:30,fontWeight:900,color:"white",margin:"8px 0 2px"}}>Hello, {fname}! 👋</h1>
        {isFullName && <p style={{color:"rgba(255,255,255,.7)",fontSize:12,margin:"0 0 2px"}}>{name}</p>}
        <p style={{color:"rgba(255,255,255,.85)",fontSize:15,margin:"0 0 14px"}}>Your Letter Adventure</p>
        <div style={{display:"inline-flex",gap:10,background:"rgba(255,255,255,.2)",borderRadius:20,padding:"8px 22px",alignItems:"center"}}>
          <span style={{fontSize:26}}>⭐</span>
          <span style={{color:"white",fontWeight:900,fontSize:22}}>{stars} Stars</span>
        </div>
        <div style={{marginTop:14,background:"rgba(255,255,255,.2)",borderRadius:12,height:10,overflow:"hidden"}}>
          <div style={{height:"100%",background:"#fbbf24",width:`${pct}%`,borderRadius:12,transition:"width .6s ease"}} />
        </div>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:13,marginTop:4}}>{done.length}/10 days complete ({pct}%)</p>
        {/* Buttons inside header — always visible */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap"}}>
          <button onClick={() => { setNewName(name); setEditing(true); }}
            style={{background:"rgba(255,255,255,.25)",border:"2px solid rgba(255,255,255,.5)",borderRadius:14,padding:"10px 20px",color:"white",cursor:"pointer",fontWeight:800,fontSize:15,display:"flex",alignItems:"center",gap:6}}>
            ✏️ Edit Name
          </button>
          <button onClick={() => setConfirmReset(true)}
            style={{background:"rgba(239,68,68,.7)",border:"2px solid rgba(255,255,255,.3)",borderRadius:14,padding:"10px 20px",color:"white",cursor:"pointer",fontWeight:800,fontSize:15,display:"flex",alignItems:"center",gap:6}}>
            🔄 Reset Progress
          </button>
        </div>
      </div>

      <div style={{padding:"20px 16px"}}>
        {/* Name letters display */}
        {isFullName && (
          <div style={{background:"white",borderRadius:16,padding:"12px 16px",marginBottom:16,boxShadow:"0 3px 10px rgba(0,0,0,.06)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Letters in your name</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {getNameLetters(name).map((l, i) => (
                <div key={l} style={{width:36,height:36,borderRadius:9,background:`hsl(${i*37+200},60%,62%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"white"}}>{l}</div>
              ))}
            </div>
          </div>
        )}

        <h2 style={{fontSize:19,fontWeight:800,color:"#4c1d95",margin:"0 0 12px"}}>🎮 Quick Play</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
          {[
            {type:"flashcard",label:"Flashcards",emoji:"🃏",bg:"linear-gradient(135deg,#fbbf24,#f59e0b)"},
            {type:"hunt",label:"Letter Hunt",emoji:"🔍",bg:"linear-gradient(135deg,#f472b6,#db2777)"},
            {type:"trace",label:"Tracing",emoji:"✏️",bg:"linear-gradient(135deg,#a78bfa,#7c3aed)"},
            {type:"memory",label:"Memory",emoji:"🎲",bg:"linear-gradient(135deg,#34d399,#059669)"},
          ].map(({ type, label, emoji, bg }) => (
            <button key={type} onClick={() => onGame({ type })}
              style={{background:bg,border:"none",borderRadius:20,padding:"22px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,boxShadow:"0 4px 14px rgba(0,0,0,.15)"}}>
              <span style={{fontSize:38}}>{emoji}</span>
              <span style={{fontWeight:800,color:"white",fontSize:15,textShadow:"1px 1px 4px rgba(0,0,0,.2)"}}>{label}</span>
            </button>
          ))}
        </div>

        <h2 style={{fontSize:19,fontWeight:800,color:"#4c1d95",margin:"0 0 12px"}}>📅 10-Day Adventure</h2>
        {DAYS.map((day, i) => {
          const isDone = done.includes(day.id);
          const locked = !isDone && i > 0 && !done.includes(DAYS[i - 1]?.id) && i > done.length;
          return (
            <button key={day.id} onClick={() => !locked && onDay(day)}
              style={{width:"100%",background:isDone?"#d1fae5":locked?"#f3f4f6":"white",border:`3px solid ${isDone?"#34d399":locked?"#e5e7eb":day.color}`,borderRadius:20,padding:"14px 16px",cursor:locked?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:10,textAlign:"left",opacity:locked ? 0.55 : 1,boxShadow:isDone?"none":"0 3px 12px rgba(0,0,0,.07)",animation:"fadein .4s ease"}}>
              <div style={{width:50,height:50,borderRadius:14,background:locked?"#d1d5db":isDone?"#34d399":day.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                {isDone ? "✅" : locked ? "🔒" : day.emoji}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,color:locked?"#9ca3af":"#1e1b4b",fontSize:15}}>Day {day.id}: {day.title}</div>
                <div style={{color:locked?"#9ca3af":"#6b7280",fontSize:12,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{day.desc}</div>
              </div>
              {isDone && <span style={{fontSize:20,flexShrink:0}}>⭐⭐⭐</span>}
              {!isDone && !locked && <span style={{color:day.color,fontSize:20,flexShrink:0}}>▶</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── DayView ───────────────────────────────────────────────────────
function DayView({ day, name, isDone, onGame, onComplete, onBack }: {
  day: DayConfig; name: string; isDone: boolean;
  onGame: (g: GameContext | { type: string }) => void; onComplete: () => void; onBack: () => void;
}) {
  const [abcOpen, setAbcOpen] = useState(false);
  if (abcOpen) return <AlphabetSong name={name} onBack={() => setAbcOpen(false)} />;
  const gameLabel: Record<string, string> = {
    flashcard: "🃏 Flashcard Game", hunt: "🔍 Letter Hunt",
    trace: "✏️ Letter Tracing", write: "✍️ Writing Practice", memory: "🎲 Memory Game",
  };
  const fname = getFirstName(name);
  const isFullName = name !== fname;

  return (
    <div style={{minHeight:"100vh",background:"#f0f4ff"}}>
      <div style={{background:`linear-gradient(135deg,${day.color},${day.color}bb)`,padding:"20px 16px",borderRadius:"0 0 28px 28px",textAlign:"center",position:"relative"}}>
        <button onClick={onBack} style={{position:"absolute",left:16,top:20,background:"rgba(255,255,255,.25)",border:"none",borderRadius:12,padding:"7px 14px",color:"white",cursor:"pointer",fontWeight:700,fontSize:14}}>← Back</button>
        <div style={{fontSize:48}}>{day.emoji}</div>
        <h2 style={{color:"white",fontWeight:900,fontSize:22,margin:"6px 0 2px"}}>Day {day.id}: {day.title}</h2>
        <p style={{color:"rgba(255,255,255,.85)",fontSize:14,margin:0}}>{day.desc}</p>
      </div>

      <div style={{padding:18}}>
        <div style={{background:"white",borderRadius:20,padding:18,marginBottom:14,textAlign:"center",boxShadow:"0 4px 14px rgba(0,0,0,.07)"}}>
          <p style={{color:"#6b7280",fontWeight:600,fontSize:13,marginBottom:8}}>✨ Your Name</p>
          {isFullName && <p style={{color:"#9ca3af",fontSize:11,marginBottom:8,fontWeight:600}}>{name}</p>}
          <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
            {name.split("").map((l, i) => {
              if (l === " ") return <div key={i} style={{width:12}} />;
              if (l === "." || l === "-") return (
                <div key={i} style={{width:28,height:50,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#9ca3af",fontWeight:900}}>{l}</div>
              );
              return (
                <div key={i} style={{width:44,height:50,borderRadius:12,background:`hsl(${i*47+200},65%,62%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 8px rgba(0,0,0,.2)"}}>
                  <span style={{fontSize:22,fontWeight:900,color:"white"}}>{l}</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>{l.toLowerCase()}</span>
                </div>
              );
            })}
          </div>
          {isFullName && (day.game === "trace" || day.game === "write" || day.game === "memory") && (
            <p style={{marginTop:10,fontSize:12,color:"#7c3aed",fontWeight:700}}>⭐ Game uses first name: <strong>{fname}</strong></p>
          )}
        </div>

        <h3 style={{fontWeight:800,color:"#4c1d95",fontSize:17,margin:"0 0 12px"}}>Today's Activities:</h3>
        {day.id <= 2 && (
          <button onClick={() => setAbcOpen(true)}
            style={{width:"100%",background:"linear-gradient(135deg,#fbbf24,#f59e0b)",border:"none",borderRadius:18,padding:18,cursor:"pointer",textAlign:"left",marginBottom:12,boxShadow:"0 4px 14px rgba(251,191,36,.4)"}}>
            <div style={{fontSize:26,marginBottom:6}}>🎵</div>
            <div style={{fontWeight:800,color:"white",fontSize:17}}>Alphabet Song</div>
            <div style={{color:"rgba(255,255,255,.85)",fontSize:13,marginTop:3}}>Watch the letters light up as we sing!</div>
          </button>
        )}
        <button onClick={() => onGame({ type: day.game })}
          style={{width:"100%",background:`linear-gradient(135deg,${day.color},${day.color}aa)`,border:"none",borderRadius:18,padding:18,cursor:"pointer",textAlign:"left",boxShadow:`0 4px 14px ${day.color}66`}}>
          <div style={{fontSize:26,marginBottom:6}}>{day.emoji}</div>
          <div style={{fontWeight:800,color:"white",fontSize:17}}>{gameLabel[day.game]}</div>
          <div style={{color:"rgba(255,255,255,.85)",fontSize:13,marginTop:3}}>Tap to start playing!</div>
        </button>

        {!isDone ? (
          <button onClick={onComplete}
            style={{marginTop:16,width:"100%",padding:15,fontSize:17,fontWeight:800,background:"linear-gradient(135deg,#34d399,#10b981)",color:"white",border:"none",borderRadius:16,cursor:"pointer",boxShadow:"0 4px 14px rgba(52,211,153,.4)"}}>
            ✅ Mark Day Complete (+3 ⭐)
          </button>
        ) : (
          <div style={{marginTop:16,textAlign:"center",padding:14,background:"#d1fae5",borderRadius:16,color:"#065f46",fontWeight:700,fontSize:15}}>✅ Day Complete! Great job! ⭐⭐⭐</div>
        )}
      </div>
    </div>
  );
}

// ── AlphabetSong ──────────────────────────────────────────────────
function AlphabetSong({ name, onBack }: { name: string; onBack: () => void }) {
  const [cur, setCur] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const letters = getNameLetters(name);

  const start = () => {
    setPlaying(true); setCur(0);
    let i = 0;
    ref.current = setInterval(() => {
      i++; if (i >= 26) { clearInterval(ref.current); setPlaying(false); } else setCur(i);
    }, 480);
  };
  useEffect(() => () => clearInterval(ref.current), []);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fef3c7,#fde68a)",padding:20}}>
      <button onClick={onBack} style={{background:"rgba(255,255,255,.7)",border:"none",borderRadius:12,padding:"8px 16px",cursor:"pointer",fontWeight:700,marginBottom:16}}>← Back</button>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:48}}>🎵</div>
        <h2 style={{fontSize:26,fontWeight:900,color:"#92400e",margin:"4px 0"}}>ABC Song!</h2>
        <p style={{color:"#78350f",fontSize:14}}>Letters in <strong>{name}</strong> are highlighted!</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:7,marginBottom:22}}>
        {AZ.map((l, i) => {
          const inName = letters.includes(l);
          const active = playing && i === cur;
          const past = playing && i < cur;
          return (
            <div key={l} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,fontSize:19,fontWeight:900,transition:"all .2s",
              background: active ? "#f59e0b" : inName ? "#fde68a" : past ? "#d1fae5" : "white",
              color: active ? "white" : inName ? "#92400e" : "#374151",
              transform: active ? "scale(1.35)" : "scale(1)",
              boxShadow: active ? "0 4px 14px rgba(245,158,11,.7)" : inName ? "0 2px 8px rgba(245,158,11,.3)" : "0 1px 4px rgba(0,0,0,.08)",
              border: inName ? "2px solid #f59e0b" : "2px solid transparent",
            }}>{l}</div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={start} disabled={playing}
          style={{padding:"13px 26px",fontSize:17,fontWeight:800,background:"#f59e0b",color:"white",border:"none",borderRadius:14,cursor:"pointer",opacity:playing ? 0.6 : 1}}>
          {playing ? "Singing… 🎵" : "▶ Start Singing!"}
        </button>
        <button onClick={onBack}
          style={{padding:"13px 26px",fontSize:17,fontWeight:800,background:"#34d399",color:"white",border:"none",borderRadius:14,cursor:"pointer"}}>Done ✓</button>
      </div>
    </div>
  );
}

// ── GameRouter ────────────────────────────────────────────────────
function GameRouter({ ctx, name, earn, onDone, onBack }: {
  ctx: GameContext | null; name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const p = { name, earn, onDone, onBack };
  if (ctx?.type === "flashcard") return <FlashcardGame {...p} />;
  if (ctx?.type === "hunt") return <HuntGame {...p} />;
  if (ctx?.type === "trace") return <TraceGame {...p} />;
  if (ctx?.type === "write") return <WriteGame {...p} />;
  if (ctx?.type === "memory") return <MemoryGame {...p} />;
  return null;
}

// ── FlashcardGame ─────────────────────────────────────────────────
// Uses ALL unique letters from full name
function FlashcardGame({ name, earn, onDone, onBack }: {
  name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const nameLs = getNameLetters(name);
  const extra = shuffle(AZ.filter(l => !nameLs.includes(l))).slice(0, Math.max(0, 12 - nameLs.length));
  const letters = useRef(shuffle([...nameLs, ...extra]).slice(0, 12)).current;
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);

  const answer = (knew: boolean) => {
    if (knew) { setScore(s => s + 1); earn(1); }
    if (idx < letters.length - 1) { setFlipped(false); setTimeout(() => setIdx(i => i + 1), 200); }
    else setFin(true);
  };

  if (fin) return <Win score={score} total={letters.length} msg="You're a letter star!" onDone={onDone} />;
  const l = letters[idx];
  const inName = nameLs.includes(l);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fef9c3,#fef3c7)",padding:20}}>
      <Header title="🃏 Flashcards" left={`${idx + 1}/${letters.length}`} right={`⭐${score}`} onBack={onBack} />
      {inName && <p style={{textAlign:"center",color:"#d97706",fontWeight:700,marginBottom:8,fontSize:14}}>⭐ This letter is in YOUR name!</p>}
      <div onClick={() => setFlipped(true)}
        style={{margin:"0 auto 24px",maxWidth:280,height:280,borderRadius:28,background:flipped?`hsl(${l.charCodeAt(0)*11%360},65%,60%)`:"linear-gradient(135deg,#a78bfa,#ec4899)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 12px 40px rgba(0,0,0,.2)",transition:"all .3s"}}>
        {flipped
          ? <><div style={{fontSize:130,fontWeight:900,color:"white",lineHeight:1}}>{l}</div><div style={{fontSize:52,color:"rgba(255,255,255,.7)"}}>{l.toLowerCase()}</div></>
          : <><div style={{fontSize:52}}>❓</div><div style={{color:"rgba(255,255,255,.85)",fontWeight:700,fontSize:17,marginTop:8}}>Tap to reveal!</div></>}
      </div>
      {flipped ? (
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={() => answer(false)} style={{flex:1,maxWidth:160,padding:13,fontSize:15,fontWeight:800,background:"#f87171",color:"white",border:"none",borderRadius:14,cursor:"pointer"}}>😕 Still Learning</button>
          <button onClick={() => answer(true)} style={{flex:1,maxWidth:160,padding:13,fontSize:15,fontWeight:800,background:"#34d399",color:"white",border:"none",borderRadius:14,cursor:"pointer"}}>🎉 I Know It!</button>
        </div>
      ) : <p style={{textAlign:"center",color:"#78350f",fontWeight:600}}>Look at the card — what letter is it?</p>}
    </div>
  );
}

// ── HuntGame ──────────────────────────────────────────────────────
// Finds ALL unique letters in full name
function HuntGame({ name, earn, onDone, onBack }: {
  name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const nameLs = getNameLetters(name);
  const extra = shuffle(AZ.filter(l => !nameLs.includes(l))).slice(0, 24 - nameLs.length);
  const grid = useRef(shuffle([...nameLs, ...extra])).current;
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const [fin, setFin] = useState(false);

  const tap = (l: string, i: number) => {
    if (found.has(i)) return;
    if (nameLs.includes(l)) {
      const nf = new Set([...found, i]);
      setFound(nf); earn(1);
      const foundUniq = [...new Set([...nf].map(x => grid[x]))];
      if (foundUniq.length >= nameLs.length) setTimeout(() => setFin(true), 400);
    } else { setWrong(i); setTimeout(() => setWrong(null), 550); }
  };

  const foundUniq = [...new Set([...found].map(i => grid[i]))];
  if (fin) return <Win score={nameLs.length} total={nameLs.length} msg={`You found all letters in ${name}!`} onDone={onDone} />;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fce7f3,#fdf4ff)",padding:20}}>
      <Header title="🔍 Letter Hunt" left={`${foundUniq.length}/${nameLs.length}`} right="" onBack={onBack} />
      <div style={{background:"white",borderRadius:16,padding:14,marginBottom:14,boxShadow:"0 3px 10px rgba(0,0,0,.07)"}}>
        <p style={{textAlign:"center",fontWeight:700,color:"#6b7280",fontSize:13,marginBottom:8}}>Find all letters in your name:</p>
        <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
          {nameLs.map(l => {
            const f = foundUniq.includes(l);
            return (
              <div key={l} style={{width:40,height:40,borderRadius:10,background:f?"#34d399":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:900,color:f?"white":"#374151",transition:"all .25s"}}>
                {f ? "✓" : l}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {grid.map((l, i) => {
          const f = found.has(i); const w = wrong === i;
          return (
            <button key={i} onClick={() => tap(l, i)}
              style={{aspectRatio:"1",borderRadius:14,border:"none",fontSize:21,fontWeight:900,cursor:"pointer",background:f?"#34d399":w?"#f87171":"white",color:f||w?"white":"#374151",transform:w?"scale(.88)":f?"scale(1.05)":"scale(1)",transition:"all .15s",boxShadow:`0 3px 8px ${f?"rgba(52,211,153,.4)":w?"rgba(248,113,113,.4)":"rgba(0,0,0,.08)"}`}}>
              {f ? "✓" : l}
            </button>
          );
        })}
      </div>
      <p style={{textAlign:"center",marginTop:14,color:"#9d174d",fontWeight:600,fontSize:13}}>Tap each letter from: <strong>{name}</strong></p>
    </div>
  );
}

// ── TraceGame ─────────────────────────────────────────────────────
// Traces letters of FIRST NAME only
function TraceGame({ name, earn, onDone, onBack }: {
  name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const fname = getFirstName(name);
  const letters = fname.split("");
  const [idx, setIdx] = useState(0);
  const cvs = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const l = letters[idx];

  const getXY = (e: React.TouchEvent | React.MouseEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    const t = (e as any).touches?.[0] || (e as any);
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const guide = () => {
    if (!cvs.current) return;
    const ctx = cvs.current.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, 280, 280);
    ctx.font = "bold 195px Arial"; ctx.fillStyle = "rgba(167,139,250,.18)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(l, 140, 148);
  };
  useEffect(() => { guide(); }, [idx]);

  const sd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); drawing.current = true;
    if (!cvs.current) return;
    const ctx = cvs.current.getContext("2d"); if (!ctx) return;
    const { x, y } = getXY(e, cvs.current);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const d = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); if (!drawing.current || !cvs.current) return;
    const ctx = cvs.current.getContext("2d"); if (!ctx) return;
    const { x, y } = getXY(e, cvs.current);
    ctx.lineTo(x, y); ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.stroke();
  };
  const ed = () => { drawing.current = false; };
  const clear = () => { if (!cvs.current) return; const ctx = cvs.current.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, 280, 280); guide(); };
  const next = () => { earn(1); if (idx < letters.length - 1) setIdx(i => i + 1); else onDone(); };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#ede9fe,#faf5ff)",padding:20}}>
      <Header title={`✏️ Trace: ${l}`} left={`${idx + 1}/${letters.length}`} right="" onBack={onBack} />
      {name !== fname && <p style={{textAlign:"center",fontSize:12,color:"#7c3aed",fontWeight:700,marginBottom:8}}>Tracing first name: <strong>{fname}</strong></p>}
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {letters.map((x, i) => (
          <div key={i} style={{width:44,height:44,borderRadius:10,background:i<idx?"#a78bfa":i===idx?"#7c3aed":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:i<=idx?"white":"#9ca3af",border:i===idx?"3px solid #6d28d9":"3px solid transparent"}}>{x}</div>
        ))}
      </div>
      <p style={{textAlign:"center",color:"#7c3aed",fontWeight:600,marginBottom:12}}>Trace the big letter <strong style={{fontSize:22}}>{l}</strong> with your finger!</p>
      <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
        <canvas ref={cvs} width={280} height={280}
          style={{borderRadius:24,background:"white",boxShadow:"0 8px 28px rgba(124,58,237,.2)",border:"3px solid #c4b5fd",cursor:"crosshair",touchAction:"none"}}
          onMouseDown={sd} onMouseMove={d} onMouseUp={ed} onMouseLeave={ed}
          onTouchStart={sd} onTouchMove={d} onTouchEnd={ed} />
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={clear} style={{padding:"12px 22px",fontSize:15,fontWeight:700,background:"#e5e7eb",color:"#374151",border:"none",borderRadius:14,cursor:"pointer"}}>🗑️ Clear</button>
        <button onClick={next} style={{padding:"12px 26px",fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#a78bfa,#7c3aed)",color:"white",border:"none",borderRadius:14,cursor:"pointer"}}>
          {idx < letters.length - 1 ? "Next Letter →" : "All Done! 🎉"}
        </button>
      </div>
    </div>
  );
}

// ── WriteGame ─────────────────────────────────────────────────────
// Writes FIRST NAME only
function WriteGame({ name, earn, onDone, onBack }: {
  name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const fname = getFirstName(name);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"ok" | "no" | null>(null);

  const check = () => {
    const v = input.trim().toUpperCase().replace(/[^A-Z]/g, "");
    if (v === fname) { setResult("ok"); earn(2); }
    else setResult("no");
  };

  if (result === "ok") return <Win score={2} total={2} msg={`You wrote ${fname} perfectly!`} onDone={onDone} />;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#e0f2fe,#f0f9ff)",padding:20}}>
      <Header title="✍️ Write Your Name" left="" right="" onBack={onBack} />
      {name !== fname && (
        <div style={{background:"#e0f2fe",borderRadius:12,padding:"8px 14px",marginBottom:12,textAlign:"center"}}>
          <p style={{fontSize:12,color:"#0c4a6e",fontWeight:700,margin:0}}>Full name: {name} • Writing first name: <strong>{fname}</strong></p>
        </div>
      )}
      <div style={{background:"white",borderRadius:20,padding:18,marginBottom:14,textAlign:"center",boxShadow:"0 4px 14px rgba(0,0,0,.07)"}}>
        <p style={{color:"#6b7280",fontWeight:600,fontSize:13,marginBottom:10}}>Copy this name:</p>
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          {fname.split("").map((l, i) => (
            <div key={i} style={{width:52,height:60,borderRadius:12,background:`hsl(${i*55+200},60%,58%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 3px 8px rgba(0,0,0,.15)"}}>
              <span style={{fontSize:26,fontWeight:900,color:"white"}}>{l}</span>
              <span style={{fontSize:15,color:"rgba(255,255,255,.75)"}}>{l.toLowerCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"white",borderRadius:20,padding:18,marginBottom:14,boxShadow:"0 4px 14px rgba(0,0,0,.07)"}}>
        <p style={{color:"#0c4a6e",fontWeight:700,marginBottom:10}}>Now write it here:</p>
        <input value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setInput(e.target.value); setResult(null); }}
          maxLength={20} placeholder="Type your name…"
          style={{width:"100%",padding:"14px",fontSize:26,borderRadius:14,border:`3px solid ${result==="no"?"#f87171":result==="ok"?"#34d399":"#bae6fd"}`,outline:"none",fontWeight:800,textAlign:"center",color:"#0c4a6e",boxSizing:"border-box",letterSpacing:6}}
        />
        {result === "no" && <p style={{textAlign:"center",color:"#dc2626",fontWeight:700,marginTop:8,fontSize:14}}>Not quite! Look at the letters above and try again 💪</p>}
      </div>
      <div style={{background:"#e0f2fe",borderRadius:14,padding:12,marginBottom:14}}>
        <p style={{textAlign:"center",color:"#0c4a6e",fontWeight:600,margin:0,fontSize:13}}>💡 Say each letter aloud: {fname.split("").join(" — ")}</p>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <button onClick={() => { setInput(""); setResult(null); }} style={{padding:"12px 22px",fontSize:15,fontWeight:700,background:"#e5e7eb",color:"#374151",border:"none",borderRadius:14,cursor:"pointer"}}>🗑️ Clear</button>
        <button onClick={check} style={{padding:"12px 26px",fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",color:"white",border:"none",borderRadius:14,cursor:"pointer"}}>Check ✓</button>
      </div>
    </div>
  );
}

// ── MemoryGame ────────────────────────────────────────────────────
// Spells FIRST NAME only
function MemoryGame({ name, earn, onDone, onBack }: {
  name: string; earn: (n: number) => Promise<void>; onDone: () => void; onBack: () => void;
}) {
  const fname = getFirstName(name);
  interface Tile { l: string; id: number; }
  interface GameState { tiles: Tile[]; placed: (Tile | null)[]; sel: Tile | null; moves: number; }

  const init = (): GameState => ({
    tiles: shuffle(fname.split("").map((l, i) => ({ l, id: i }))),
    placed: Array(fname.length).fill(null),
    sel: null, moves: 0,
  });

  const [state, setState] = useState<GameState>(init);
  const { tiles, placed, sel, moves } = state;
  const placedIds = placed.filter((p): p is Tile => p !== null).map(p => p.id);
  const available = tiles.filter(t => !placedIds.includes(t.id));

  const tapTile = (t: Tile) => setState(s => ({ ...s, sel: s.sel?.id === t.id ? null : t }));
  const tapSlot = (i: number) => {
    if (!sel || placed[i]) return;
    const np = [...placed]; np[i] = sel;
    const newMoves = moves + 1;
    const won = np.every((p): p is Tile => p !== null) && np.map(p => p.l).join("") === fname;
    setState(s => ({ ...s, placed: np, sel: null, moves: newMoves }));
    if (won) { earn(3); setTimeout(() => onDone(), 400); }
  };
  const removeSlot = (i: number) => setState(s => { const np = [...s.placed]; np[i] = null; return { ...s, placed: np }; });
  const reset = () => setState(init());

  const allPlaced = placed.every((p): p is Tile => p !== null);
  const correct = allPlaced && placed.map(p => p.l).join("") === fname;
  const wrong = allPlaced && !correct;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#d1fae5,#ecfdf5)",padding:20}}>
      <Header title="🎲 Memory Game" left={`Moves: ${moves}`} right="" onBack={onBack} />
      {name !== fname && <p style={{textAlign:"center",fontSize:12,color:"#065f46",fontWeight:700,marginBottom:8}}>Spelling first name: <strong>{fname}</strong></p>}
      <p style={{textAlign:"center",color:"#065f46",fontWeight:600,marginBottom:16,fontSize:14}}>
        {sel ? `Tap a blank slot to place "${sel.l}"` : `Tap a letter tile, then tap a slot. Spell: `}
        <strong>{!sel && fname}</strong>
      </p>
      {wrong && <p style={{textAlign:"center",color:"#dc2626",fontWeight:700,fontSize:14,marginBottom:8}}>Not quite! Try rearranging the letters 🔄</p>}
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {placed.map((tile, i) => (
          <div key={i} onClick={() => tile ? removeSlot(i) : tapSlot(i)}
            style={{width:52,height:58,borderRadius:13,background:tile?(wrong?"#fca5a5":correct?"#34d399":"#34d399"):"white",border:`3px dashed ${tile?(wrong?"#ef4444":"#10b981"):"#86efac"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s",boxShadow:tile?"0 4px 12px rgba(52,211,153,.4)":"none",transform:sel&&!tile?"scale(1.08)":"scale(1)"}}>
            {tile
              ? <><span style={{fontSize:24,fontWeight:900,color:"white"}}>{tile.l}</span><span style={{fontSize:10,color:"rgba(255,255,255,.75)"}}>remove</span></>
              : <span style={{color:"#86efac",fontSize:20}}>+</span>}
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(fname.length, 6)},1fr)`,gap:10,maxWidth:360,margin:"0 auto"}}>
        {available.map(t => {
          const s2 = sel?.id === t.id;
          return (
            <button key={t.id} onClick={() => tapTile(t)}
              style={{aspectRatio:"1",borderRadius:14,border:`3px solid ${s2?"#10b981":"transparent"}`,fontSize:26,fontWeight:900,background:s2?"#a7f3d0":"white",color:s2?"#065f46":"#374151",cursor:"pointer",transform:s2?"scale(1.12)":"scale(1)",transition:"all .15s",boxShadow:`0 4px 12px ${s2?"rgba(16,185,129,.4)":"rgba(0,0,0,.08)"}`}}>
              {t.l}
            </button>
          );
        })}
      </div>
      <button onClick={reset} style={{display:"block",margin:"18px auto 0",padding:"10px 22px",fontSize:13,fontWeight:700,background:"#e5e7eb",color:"#374151",border:"none",borderRadius:12,cursor:"pointer"}}>🔄 Reset</button>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────
function Header({ title, left, right, onBack }: { title: string; left: string; right: string; onBack: () => void }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <button onClick={onBack} style={{background:"rgba(255,255,255,.8)",border:"none",borderRadius:12,padding:"8px 14px",cursor:"pointer",fontWeight:700,fontSize:14}}>← Back</button>
      <h2 style={{fontSize:20,fontWeight:900,color:"#1e1b4b",margin:0}}>{title}</h2>
      <div style={{fontWeight:800,color:"#6b7280",fontSize:14,minWidth:60,textAlign:"right"}}>{left || right}</div>
    </div>
  );
}

function Win({ score, total, msg, onDone }: { score: number; total: number; msg: string; onDone: () => void }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#d1fae5,#fef9c3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}>
      <div style={{fontSize:88,animation:"bounce 1.2s infinite"}}>🎉</div>
      <h2 style={{fontSize:34,fontWeight:900,color:"#065f46",margin:"12px 0 6px"}}>Amazing!</h2>
      <p style={{fontSize:18,color:"#374151",fontWeight:600,marginBottom:6}}>{msg}</p>
      <p style={{fontSize:16,color:"#6b7280",marginBottom:28}}>You earned {score} ⭐ star{score !== 1 ? "s" : ""}!</p>
      <div style={{display:"flex",gap:8,marginBottom:28}}>
        {Array(score).fill(0).map((_, i) => <span key={i} style={{fontSize:36,animation:`bounce 1s ease ${i*.15}s infinite`}}>⭐</span>)}
      </div>
      <button onClick={onDone} style={{padding:"15px 32px",fontSize:18,fontWeight:800,background:"linear-gradient(135deg,#34d399,#059669)",color:"white",border:"none",borderRadius:16,cursor:"pointer",boxShadow:"0 6px 18px rgba(52,211,153,.4)"}}>🏠 Back Home</button>
    </div>
  );
}