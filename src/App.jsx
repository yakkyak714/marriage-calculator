import { useState, useEffect } from "react";

const STORAGE_KEY = "marriage_v1";
const DENOMS = [{label:"¢25",val:.25},{label:"¢50",val:.5},{label:"$1",val:1},{label:"$5",val:5}];
const uid = () => Math.random().toString(36).slice(2,9);

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}
function loadData() {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : null; } catch(e) { return null; }
}

function calcDeltas(winnerId, seenList, unseenIds) {
  const Mw = seenList.find(p => p.id === winnerId)?.maal ?? 0;
  const seen = seenList.filter(p => p.id !== winnerId);
  const nU = unseenIds.length;
  const d = {};
  let wd = nU * (10 + Mw);
  seen.forEach(s => { wd += 3 + Mw - s.maal; });
  d[winnerId] = wd;
  seen.forEach(si => {
    let x = nU * si.maal + (si.maal - Mw - 3);
    seen.forEach(sj => { if (sj.id !== si.id) x += si.maal - sj.maal; });
    d[si.id] = x;
  });
  const sm = seen.reduce((s, p) => s + p.maal, 0);
  unseenIds.forEach(id => { d[id] = -(10 + Mw + sm); });
  return d;
}

export default function App() {
  const [screen, setScreen] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [savedNames, setSavedNames] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [totals, setTotals] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setSavedNames(saved.savedNames || []);
      if (saved.screen === "game" && saved.players?.length) {
        setPlayers(saved.players);
        setRounds(saved.rounds || []);
        setTotals(saved.totals || {});
        setScreen("game");
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveData({ screen, players, savedNames, rounds, totals });
  }, [screen, players, savedNames, rounds, totals, loaded]);

  const startGame = (newPlayers) => {
    const t = {};
    newPlayers.forEach(p => t[p.id] = 0);
    setPlayers(newPlayers);
    setSavedNames(newPlayers.map(p => p.name));
    setRounds([]);
    setTotals(t);
    setScreen("game");
  };

  const addRound = (round, deltas) => {
    setRounds(prev => [...prev, round]);
    setTotals(prev => {
      const next = {...prev};
      Object.entries(deltas).forEach(([id, d]) => { next[id] = (next[id] || 0) + d; });
      return next;
    });
    setScreen("game");
  };

  const endGame = () => {
    setPlayers([]); setRounds([]); setTotals({});
    setScreen("setup");
  };

  if (!loaded) return <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:32}}>🃏</span></div>;
  if (screen === "setup") return <Setup savedNames={savedNames} onStart={startGame} />;
  if (screen === "round") return <Round players={players} roundNum={rounds.length + 1} onConfirm={addRound} onBack={() => setScreen("game")} />;
  return <Game players={players} rounds={rounds} totals={totals} onNewRound={() => setScreen("round")} onEnd={endGame} />;
}

/* ── SETUP ─────────────────────────────────────── */
function Setup({ savedNames, onStart }) {
  const [count, setCount] = useState(Math.min(5, Math.max(3, savedNames.length || 3)));
  const [names, setNames] = useState(Array(5).fill("").map((_, i) => savedNames[i] || ""));

  const handleStart = () => {
    const ps = names.slice(0, count).map((n, i) => ({ id: uid(), name: n.trim() || `Player ${i+1}` }));
    onStart(ps);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:8}}>🃏</div>
          <div style={{fontSize:28,fontWeight:700,color:"#f59e0b",letterSpacing:1}}>Marriage</div>
          <div style={{color:"#64748b",fontSize:14,marginTop:4}}>Score Calculator</div>
        </div>
        <div style={{background:"#1e293b",borderRadius:20,padding:24,boxShadow:"0 25px 50px rgba(0,0,0,.5)"}}>
          <div style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Number of players</div>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {[3,4,5].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:count===n?"#f59e0b":"#334155",color:count===n?"#0f172a":"#94a3b8"}}>
                {n} Players
              </button>
            ))}
          </div>
          <div style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Player names</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#334155",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#64748b",flexShrink:0}}>{i+1}</div>
                <input value={names[i]} onChange={e => { const n=[...names]; n[i]=e.target.value; setNames(n); }}
                  placeholder={`Player ${i+1}`}
                  style={{flex:1,background:"#334155",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:14,outline:"none"}}
                  onFocus={e => e.target.style.boxShadow="0 0 0 2px #f59e0b"}
                  onBlur={e => e.target.style.boxShadow="none"} />
              </div>
            ))}
          </div>
          <button onClick={handleStart} style={{width:"100%",background:"#f59e0b",border:"none",borderRadius:14,padding:"14px 0",color:"#0f172a",fontWeight:800,fontSize:16,cursor:"pointer"}}>
            Start Calculator
          </button>
          {savedNames.length > 0 && <div style={{textAlign:"center",color:"#475569",fontSize:12,marginTop:12}}>Names remembered from last session</div>}
        </div>
      </div>
    </div>
  );
}

/* ── GAME ───────────────────────────────────────── */
function Game({ players, rounds, totals, onNewRound, onEnd }) {
  const [tab, setTab] = useState("score");
  const [denom, setDenom] = useState(0.25);
  const [custom, setCustom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const effDenom = custom ? (parseFloat(custom) || 0) : denom;
  const sorted = [...players].sort((a, b) => (totals[b.id]||0) - (totals[a.id]||0));

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",color:"#fff",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#1e293b",borderBottom:"1px solid #334155",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#f59e0b",fontWeight:700,fontSize:18}}>Marriage 🃏</div>
          <div style={{color:"#475569",fontSize:12,marginTop:2}}>{rounds.length} round{rounds.length!==1?"s":""} · {players.length} players</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onNewRound} style={{background:"#f59e0b",border:"none",borderRadius:10,padding:"8px 16px",color:"#0f172a",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ Round</button>
          <button onClick={() => setConfirm(true)} style={{background:"#334155",border:"none",borderRadius:10,padding:"8px 12px",color:"#94a3b8",fontSize:14,cursor:"pointer"}}>End</button>
        </div>
      </div>

      <div style={{background:"#1e293b",display:"flex",borderBottom:"1px solid #334155"}}>
        {[["score","Scoreboard"],["history","History"],["money","Money 💵"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{flex:1,padding:"12px 0",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
            color:tab===k?"#f59e0b":"#64748b",borderBottom:tab===k?"2px solid #f59e0b":"2px solid transparent"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:16}}>
        {tab==="score"   && <ScoreTab   players={players} totals={totals} rounds={rounds} />}
        {tab==="history" && <HistoryTab players={players} rounds={rounds} />}
        {tab==="money"   && <MoneyTab   players={sorted}  totals={totals} rounds={rounds} effDenom={effDenom} denom={denom} setDenom={setDenom} custom={custom} setCustom={setCustom} />}
      </div>

      {confirm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:16,zIndex:50}}>
          <div style={{background:"#1e293b",borderRadius:20,padding:24,width:"100%",maxWidth:380,marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:18,marginBottom:6}}>End Calculator?</div>
            <div style={{color:"#94a3b8",fontSize:14,marginBottom:20}}>All scores cleared. Player names will be remembered.</div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={() => setConfirm(false)} style={{flex:1,background:"#334155",border:"none",borderRadius:12,padding:"13px 0",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:15}}>Cancel</button>
              <button onClick={onEnd} style={{flex:1,background:"#ef4444",border:"none",borderRadius:12,padding:"13px 0",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:15}}>End Game</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SCOREBOARD TAB ─────────────────────────────── */
function ScoreTab({ players, totals, rounds }) {
  if (!rounds.length) return (
    <div style={{textAlign:"center",padding:"48px 0",color:"#475569"}}>
      <div style={{fontSize:48,marginBottom:12}}>🃏</div>
      <div style={{fontSize:15}}>No rounds yet</div>
      <div style={{fontSize:13,marginTop:4}}>Tap <span style={{color:"#f59e0b"}}>+ Round</span> to begin</div>
    </div>
  );

  const thStyle = { padding:"10px 8px", textAlign:"center", color:"#64748b", fontSize:11, fontWeight:600, borderBottom:"1px solid #334155", whiteSpace:"nowrap" };
  const tdStyle = { padding:"10px 8px", textAlign:"center", verticalAlign:"top", borderTop:"1px solid #0f172a" };

  return (
    <div style={{overflowX:"auto",borderRadius:16,background:"#1e293b"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:players.length*90+80}}>
        <thead>
          <tr>
            <th style={{...thStyle, textAlign:"left", paddingLeft:14, width:70}}>Round</th>
            {players.map(p => (
              <th key={p.id} style={{...thStyle}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#334155",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#94a3b8",margin:"0 auto 4px"}}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, i) => {
            const winner = players.find(p => p.id === r.winnerId);
            return (
              <tr key={r.id}>
                <td style={{...tdStyle, textAlign:"left", paddingLeft:14}}>
                  <div style={{fontWeight:700, fontSize:13, color:"#94a3b8"}}>R{i+1}</div>
                  <div style={{fontSize:10, color:"#f59e0b", marginTop:2}}>🏆 {winner?.name.slice(0,6)}</div>
                </td>
                {players.map(p => {
                  const isW  = p.id === r.winnerId;
                  const isU  = (r.unseenIds||[]).includes(p.id);
                  const delta = r.deltas?.[p.id] ?? 0;
                  const maal  = r.maals?.[p.id];
                  const roleLabel = isW ? "W" : isU ? "U" : "S";
                  const roleColor = isW ? "#f59e0b" : isU ? "#475569" : "#60a5fa";
                  const roleBg    = isW ? "rgba(245,158,11,.15)" : isU ? "rgba(51,65,85,.5)" : "rgba(59,130,246,.12)";
                  return (
                    <td key={p.id} style={{...tdStyle}}>
                      <div style={{fontSize:16, fontWeight:800, color:delta>0?"#4ade80":delta<0?"#f87171":"#475569"}}>
                        {delta>0?"+":""}{delta}
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:20,background:roleBg,color:roleColor}}>{roleLabel}</span>
                        {!isU && maal !== undefined && <span style={{fontSize:10,color:"#475569"}}>{maal}m</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{borderTop:"2px solid #334155", background:"rgba(245,158,11,.05)"}}>
            <td style={{padding:"12px 8px 12px 14px", color:"#f59e0b", fontSize:12, fontWeight:700}}>TOTAL</td>
            {players.map(p => {
              const t = totals[p.id] || 0;
              return (
                <td key={p.id} style={{padding:"12px 8px", textAlign:"center"}}>
                  <div style={{fontSize:18, fontWeight:800, color:t>0?"#4ade80":t<0?"#f87171":"#475569"}}>
                    {t>0?"+":""}{t}
                  </div>
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── HISTORY TAB ────────────────────────────────── */
function HistoryTab({ rounds, players }) {
  const [exp, setExp] = useState(null);
  const pMap = Object.fromEntries(players.map(p => [p.id, p]));
  if (!rounds.length) return <div style={{textAlign:"center",padding:"48px 0",color:"#475569"}}>Round history will appear here</div>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[...rounds].reverse().map((r, ri) => {
        const n = rounds.length - ri;
        const winner = pMap[r.winnerId];
        const isExp = exp === r.id;
        return (
          <div key={r.id} style={{background:"#1e293b",borderRadius:14,overflow:"hidden"}}>
            <button onClick={() => setExp(isExp ? null : r.id)} style={{width:"100%",background:"none",border:"none",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:"#fff",textAlign:"left"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{background:"#334155",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#64748b",flexShrink:0}}>{n}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>🏆 {winner?.name}</div>
                  <div style={{color:"#475569",fontSize:12,marginTop:2}}>{(r.seenIds||[]).filter(id=>id!==r.winnerId).length} seen · {(r.unseenIds||[]).length} unseen</div>
                </div>
              </div>
              <span style={{color:"#475569",fontSize:12}}>{isExp?"▲":"▼"}</span>
            </button>
            {isExp && (
              <div style={{borderTop:"1px solid rgba(51,65,85,.6)",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {players.map(p => {
                  const delta = r.deltas?.[p.id] ?? 0;
                  const isW = p.id === r.winnerId;
                  const isU = (r.unseenIds||[]).includes(p.id);
                  const maal = r.maals?.[p.id];
                  return (
                    <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,
                          background:isW?"rgba(245,158,11,.15)":isU?"rgba(51,65,85,.8)":"rgba(59,130,246,.15)",
                          color:isW?"#f59e0b":isU?"#475569":"#60a5fa"}}>
                          {isW?"Winner":isU?"Unseen":"Seen"}
                        </span>
                        <span style={{fontSize:14,color:"#cbd5e1"}}>{p.name}</span>
                        {!isU && maal!==undefined && <span style={{fontSize:11,color:"#475569"}}>({maal} maal)</span>}
                      </div>
                      <span style={{fontWeight:700,fontSize:15,color:delta>0?"#4ade80":delta<0?"#f87171":"#475569"}}>
                        {delta>0?"+":""}{delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── MONEY TAB ──────────────────────────────────── */
function MoneyTab({ players, totals, rounds, effDenom, denom, setDenom, custom, setCustom }) {
  const fmt = n => { const a = Math.abs(n*effDenom).toFixed(2); return n>0?`+$${a}`:n<0?`-$${a}`:`$0.00`; };
  const col = { padding:"10px 8px", textAlign:"right" };
  const hdr = { padding:"10px 8px", textAlign:"right", color:"#64748b", fontSize:11, fontWeight:600, borderBottom:"1px solid #334155", whiteSpace:"nowrap" };

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>1 point equals</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {DENOMS.map(d => (
            <button key={d.val} onClick={() => { setDenom(d.val); setCustom(""); }}
              style={{padding:"8px 14px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
                background:denom===d.val&&!custom?"#f59e0b":"#334155",color:denom===d.val&&!custom?"#0f172a":"#94a3b8"}}>
              {d.label}
            </button>
          ))}
          <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Custom $" type="number" step="0.01" min="0"
            style={{flex:1,minWidth:80,background:"#334155",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:13,outline:"none"}}
            onFocus={e => e.target.style.boxShadow="0 0 0 2px #f59e0b"}
            onBlur={e => e.target.style.boxShadow="none"} />
        </div>
      </div>

      {!rounds.length ? (
        <div style={{textAlign:"center",padding:"32px 0",color:"#475569"}}>No rounds yet</div>
      ) : (
        <div style={{overflowX:"auto",borderRadius:16,background:"#1e293b"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:players.length*80+64}}>
            <thead>
              <tr>
                <th style={{...hdr,textAlign:"left",paddingLeft:14,width:60}}>Rnd</th>
                {players.map(p => <th key={p.id} style={{...hdr}}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => {
                const winner = players.find(p => p.id === r.winnerId);
                return (
                  <tr key={r.id} style={{borderTop:"1px solid #0f172a"}}>
                    <td style={{...col,textAlign:"left",paddingLeft:14}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#94a3b8"}}>R{i+1}</div>
                      <div style={{fontSize:10,color:"#f59e0b",marginTop:1}}>{winner?.name.slice(0,6)}</div>
                    </td>
                    {players.map(p => {
                      const d = r.deltas?.[p.id] ?? 0;
                      return (
                        <td key={p.id} style={{...col,fontSize:13,fontWeight:600,color:d>0?"#4ade80":d<0?"#f87171":"#475569"}}>
                          {fmt(d)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:"2px solid #334155"}}>
                <td style={{...col,textAlign:"left",paddingLeft:14,color:"#f59e0b",fontSize:12,fontWeight:700}}>TOTAL</td>
                {players.map(p => {
                  const t = totals[p.id] || 0;
                  return (
                    <td key={p.id} style={{...col,fontSize:17,fontWeight:800,paddingTop:12,paddingBottom:12,color:t>0?"#4ade80":t<0?"#f87171":"#475569"}}>
                      {fmt(t)}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── ROUND ENTRY ────────────────────────────────── */
function Round({ players, roundNum, onConfirm, onBack }) {
  const [step, setStep] = useState(1);
  const [winnerId, setWinnerId] = useState(null);
  const [statuses, setStatuses] = useState(() => Object.fromEntries(players.map(p => [p.id,"unseen"])));
  const [maals, setMaals] = useState(() => Object.fromEntries(players.map(p => [p.id,""])));
  const [preview, setPreview] = useState(null);

  const selectWinner = id => {
    setWinnerId(id);
    setStatuses(s => {
      const ns = {...s};
      players.forEach(p => { ns[p.id] = p.id===id ? "winner" : ns[p.id]==="winner" ? "unseen" : ns[p.id]; });
      return ns;
    });
  };
  const toggleStatus = id => { if (id===winnerId) return; setStatuses(s => ({...s,[id]:s[id]==="seen"?"unseen":"seen"})); };

  const seenList  = players.filter(p => statuses[p.id]==="seen" || p.id===winnerId);
  const unseenIds = players.filter(p => statuses[p.id]==="unseen").map(p => p.id);
  const maalsFilled = seenList.every(p => maals[p.id] !== "");

  const getDeltas = () => calcDeltas(winnerId, seenList.map(p => ({id:p.id, maal:parseInt(maals[p.id])||0})), unseenIds);

  const handleConfirm = () => {
    const deltas = getDeltas();
    const round = {
      id: uid(), number: roundNum, winnerId,
      seenIds: seenList.map(p => p.id), unseenIds,
      maals: Object.fromEntries(seenList.map(p => [p.id, parseInt(maals[p.id])||0])),
      deltas
    };
    onConfirm(round, deltas);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a",color:"#fff",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#1e293b",borderBottom:"1px solid #334155",padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,padding:0}}>✕</button>
        <div style={{flex:1}}>
          <div style={{color:"#f59e0b",fontWeight:700,fontSize:16}}>Round {roundNum}</div>
          <div style={{color:"#475569",fontSize:12}}>{["","Select roles","Enter maal","Confirm"][step]}</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[1,2,3].map(n => <div key={n} style={{height:4,width:24,borderRadius:4,background:step>=n?"#f59e0b":"#334155"}}/>)}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:16}}>
        {step===1 && (
          <div>
            <div style={{color:"#94a3b8",fontSize:14,marginBottom:4}}>Tap a name to set as <span style={{color:"#f59e0b"}}>winner</span>, then toggle Seen / Unseen.</div>
            <div style={{color:"#475569",fontSize:12,marginBottom:16}}>Seen = looked at the Joker card</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {players.map(p => {
                const isW = p.id===winnerId;
                const status = statuses[p.id];
                return (
                  <div key={p.id} style={{background:isW?"rgba(245,158,11,.1)":"#1e293b",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,border:isW?"1px solid rgba(245,158,11,.35)":"1px solid transparent"}}>
                    <button onClick={() => selectWinner(p.id)} style={{display:"flex",alignItems:"center",gap:12,flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left",color:"#fff",padding:0,minWidth:0}}>
                      <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0,background:isW?"#f59e0b":"#334155",color:isW?"#0f172a":"#94a3b8"}}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                        {isW && <div style={{color:"#f59e0b",fontSize:11,marginTop:2}}>Winner 🏆</div>}
                      </div>
                    </button>
                    {!isW && (
                      <button onClick={() => toggleStatus(p.id)} style={{flexShrink:0,padding:"7px 14px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
                        background:status==="seen"?"rgba(59,130,246,.15)":"#334155",color:status==="seen"?"#60a5fa":"#64748b",
                        boxShadow:status==="seen"?"0 0 0 1px rgba(59,130,246,.4)":"none"}}>
                        {status==="seen"?"Seen ✓":"Unseen"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => winnerId && setStep(2)} disabled={!winnerId} style={{width:"100%",padding:"14px 0",borderRadius:14,border:"none",fontWeight:800,fontSize:16,cursor:winnerId?"pointer":"not-allowed",background:winnerId?"#f59e0b":"#1e293b",color:winnerId?"#0f172a":"#334155"}}>
              Next → Enter Maal
            </button>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{color:"#94a3b8",fontSize:14,marginBottom:4}}>Enter <span style={{color:"#f59e0b"}}>Maal</span> for winner and seen players.</div>
            <div style={{color:"#475569",fontSize:12,marginBottom:16}}>Enter 0 if no maal.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {seenList.map(p => {
                const isW = p.id===winnerId;
                return (
                  <div key={p.id} style={{background:isW?"rgba(245,158,11,.08)":"#1e293b",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",border:isW?"1px solid rgba(245,158,11,.25)":"1px solid transparent"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,background:isW?"#f59e0b":"rgba(59,130,246,.2)",color:isW?"#0f172a":"#60a5fa"}}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                        <div style={{fontSize:11,marginTop:2,color:isW?"#f59e0b":"#60a5fa"}}>{isW?"Winner":"Seen"}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{color:"#475569",fontSize:13}}>Maal</span>
                      <input type="number" inputMode="numeric" min="0" value={maals[p.id]}
                        onChange={e => setMaals(m => ({...m,[p.id]:e.target.value}))} placeholder="0"
                        style={{width:72,background:"#334155",border:"none",borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:15,fontWeight:700,textAlign:"right",outline:"none"}}
                        onFocus={e => e.target.style.boxShadow="0 0 0 2px #f59e0b"}
                        onBlur={e => e.target.style.boxShadow="none"} />
                    </div>
                  </div>
                );
              })}
              {unseenIds.length > 0 && (
                <div style={{background:"rgba(15,23,42,.6)",borderRadius:14,padding:"12px 16px"}}>
                  <div style={{color:"#334155",fontSize:12,fontWeight:600,marginBottom:8}}>UNSEEN — no maal</div>
                  {players.filter(p => unseenIds.includes(p.id)).map(p => (
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                      <span style={{color:"#475569",fontSize:13}}>{p.name}</span>
                      <span style={{color:"#334155",fontSize:13}}>—</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => setStep(1)} style={{flex:1,background:"#334155",border:"none",borderRadius:14,padding:"13px 0",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:15}}>← Back</button>
              <button onClick={() => { setPreview(getDeltas()); setStep(3); }} disabled={!maalsFilled}
                style={{flex:2,border:"none",borderRadius:14,padding:"13px 0",fontWeight:800,fontSize:15,cursor:maalsFilled?"pointer":"not-allowed",background:maalsFilled?"#f59e0b":"#1e293b",color:maalsFilled?"#0f172a":"#334155"}}>
                Preview Points →
              </button>
            </div>
          </div>
        )}

        {step===3 && preview && (
          <div>
            <div style={{color:"#94a3b8",fontSize:14,marginBottom:16}}>Review point changes before confirming.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {players.map(p => {
                const delta = preview[p.id] ?? 0;
                const isW = p.id===winnerId;
                const isU = unseenIds.includes(p.id);
                const maal = maals[p.id];
                return (
                  <div key={p.id} style={{background:isW?"rgba(245,158,11,.08)":"#1e293b",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",border:isW?"1px solid rgba(245,158,11,.25)":"1px solid transparent"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,background:isW?"#f59e0b":isU?"#334155":"rgba(59,130,246,.2)",color:isW?"#0f172a":isU?"#64748b":"#60a5fa"}}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                        <div style={{fontSize:11,marginTop:2,color:isW?"#f59e0b":isU?"#475569":"#60a5fa"}}>
                          {isW?"Winner":isU?"Unseen":"Seen"}{!isU&&maal!==""?` · ${maal} maal`:""}
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize:24,fontWeight:800,color:delta>0?"#4ade80":delta<0?"#f87171":"#475569"}}>{delta>0?"+":""}{delta}</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={() => setStep(2)} style={{flex:1,background:"#334155",border:"none",borderRadius:14,padding:"13px 0",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:15}}>← Back</button>
              <button onClick={handleConfirm} style={{flex:2,background:"#22c55e",border:"none",borderRadius:14,padding:"13px 0",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:15}}>Confirm Round ✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}