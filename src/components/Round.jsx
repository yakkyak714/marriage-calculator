import { useState }   from "react";
import { uid }        from "../utils/constants";
import { calcDeltas } from "../utils/scoring";

export default function Round({ players, roundNum, onConfirm, onBack }) {
  const [step,          setStep]          = useState(1);
  const [winnerId,      setWinnerId]      = useState(null);
  const [isWinnerDubli, setIsWinnerDubli] = useState(false);
  const [statuses,      setStatuses]      = useState(
    () => Object.fromEntries(players.map(p => [p.id, "unseen"]))
  );
  const [maals,   setMaals]   = useState(
    () => Object.fromEntries(players.map(p => [p.id, ""]))
  );
  const [preview, setPreview] = useState(null);

  // ── Derived ──────────────────────────────────────────────────
  const seenList  = players.filter(p =>
    p.id === winnerId || statuses[p.id] === "seen" || statuses[p.id] === "dubli"
  );
  const unseenIds = players
    .filter(p => p.id !== winnerId && statuses[p.id] === "unseen")
    .map(p => p.id);
  const maalsFilled = seenList.every(p => maals[p.id] !== "");

  // ── Handlers ─────────────────────────────────────────────────
  const selectWinner = (id) => {
    setWinnerId(id);
    setIsWinnerDubli(false);
    setStatuses(prev => {
      const next = { ...prev };
      players.forEach(p => {
        if (p.id === id)            next[p.id] = "winner";
        else if (next[p.id] === "winner") next[p.id] = "unseen";
      });
      return next;
    });
  };

  const setStatus = (playerId, newStatus) => {
    setStatuses(prev => ({ ...prev, [playerId]: newStatus }));
  };

  const buildSeenList = () =>
    seenList.map(p => ({
      id:      p.id,
      maal:    parseInt(maals[p.id]) || 0,
      isDubli: statuses[p.id] === "dubli",
    }));

  const goPreview = () => {
    setPreview(calcDeltas(winnerId, buildSeenList(), unseenIds, isWinnerDubli));
    setStep(3);
  };

  const confirm = () => {
    const deltas = calcDeltas(winnerId, buildSeenList(), unseenIds, isWinnerDubli);
    onConfirm({
      id: uid(), number: roundNum, winnerId,
      isDubliWin: isWinnerDubli,
      seenIds:  seenList.map(p => p.id),
      unseenIds,
      maals: Object.fromEntries(seenList.map(p => [p.id, parseInt(maals[p.id]) || 0])),
      deltas,
    }, deltas);
  };

  // ── Shared styles ─────────────────────────────────────────────
  const S = {
    screen:   { minHeight:"100vh", background:"#0f172a", color:"#fff", display:"flex", flexDirection:"column" },
    header:   { background:"#1e293b", borderBottom:"1px solid #334155", padding:"12px 16px", display:"flex", alignItems:"center", gap:12 },
    content:  { flex:1, overflowY:"auto", padding:16 },
    hint:     { color:"#94a3b8", fontSize:14, marginBottom:4 },
    hintSub:  { color:"#475569", fontSize:12, marginBottom:16 },
    list:     { display:"flex", flexDirection:"column", gap:10, marginBottom:20 },
    card:     (isW) => ({ background: isW?"rgba(245,158,11,.1)":"#1e293b", border:`1px solid ${isW?"rgba(245,158,11,.35)":"transparent"}`, borderRadius:14, padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }),
    nameRow:  { display:"flex", alignItems:"center", gap:12 },
    avatar:   (isW) => ({ width:40, height:40, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, cursor:"pointer", background:isW?"#f59e0b":"#334155", color:isW?"#0f172a":"#94a3b8" }),
    btnRow:   { display:"flex", gap:6 },
    statusBtn:(active, type) => ({
      flex:1, padding:"8px 0", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", border:"none",
      background: active ? (type==="unseen"?"rgba(100,116,139,.3)":type==="seen"?"rgba(59,130,246,.15)":"rgba(139,92,246,.15)") : "#334155",
      color:      active ? (type==="unseen"?"#cbd5e1":type==="seen"?"#60a5fa":"#a78bfa") : "#475569",
      boxShadow:  active ? (type==="unseen"?"0 0 0 1.5px rgba(148,163,184,.6)":type==="seen"?"0 0 0 1.5px rgba(59,130,246,.5)":"0 0 0 1.5px rgba(139,92,246,.5)") : "none",
    }),
    btnPrimary: (on) => ({ width:"100%", padding:"14px 0", borderRadius:14, border:"none", fontWeight:800, fontSize:16, cursor:on?"pointer":"not-allowed", background:on?"#f59e0b":"#1e293b", color:on?"#0f172a":"#334155" }),
    btnGhost:   { flex:1, background:"#334155", border:"none", borderRadius:14, padding:"13px 0", color:"#fff", fontWeight:600, cursor:"pointer", fontSize:15 },
    btnSuccess: { flex:2, background:"#22c55e", border:"none", borderRadius:14, padding:"13px 0", color:"#fff", fontWeight:800, cursor:"pointer", fontSize:15 },
    twoBtn:     { display:"flex", gap:10 },
    dot:  (on) => ({ height:4, width:24, borderRadius:4, background:on?"#f59e0b":"#334155" }),
  };

  return (
    <div style={S.screen}>

      {/* Header */}
      <div style={S.header}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,padding:0}}>✕</button>
        <div style={{flex:1}}>
          <div style={{color:"#f59e0b",fontWeight:700,fontSize:16}}>Round {roundNum}</div>
          <div style={{color:"#475569",fontSize:12}}>{["","Select roles","Enter Maal","Confirm"][step]}</div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[1,2,3].map(n => <div key={n} style={S.dot(step>=n)}/>)}
        </div>
      </div>

      <div style={S.content}>

        {/* ══ STEP 1 — Roles ══════════════════════════════════ */}
        {step === 1 && (
          <div>
            <p style={S.hint}>Tap the <span style={{color:"#f59e0b"}}>avatar</span> to set winner, then pick each player's status.</p>
            <p style={S.hintSub}>Dubli = went seen via 7 pairs</p>

            <div style={S.list}>
              {players.map(p => {
                const isW = p.id === winnerId;
                const st  = statuses[p.id];
                return (
                  <div key={p.id} style={S.card(isW)}>

                    {/* Avatar + name — only avatar is clickable for winner selection */}
                    <div style={S.nameRow}>
                      <div style={S.avatar(isW)} onClick={() => selectWinner(p.id)}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,fontSize:15}}>{p.name}</div>
                        <div style={{fontSize:11,marginTop:2,color:isW?"#f59e0b":"#64748b"}}>
                          {isW ? "Winner 🏆" : "Tap avatar to set as winner"}
                        </div>
                      </div>
                    </div>

                    {/* Non-winner: Unseen / Seen / Dubli buttons */}
                    {!isW && (
                      <div style={S.btnRow}>
                        <button style={S.statusBtn(st==="unseen","unseen")} onClick={() => setStatus(p.id,"unseen")}>
                          {st==="unseen"?"✓ ":""}Unseen
                        </button>
                        <button style={S.statusBtn(st==="seen","seen")} onClick={() => setStatus(p.id,"seen")}>
                          {st==="seen"?"✓ ":""}Seen
                        </button>
                        <button style={S.statusBtn(st==="dubli","dubli")} onClick={() => setStatus(p.id,"dubli")}>
                          {st==="dubli"?"✓ ":""}Dubli
                        </button>
                      </div>
                    )}

                    {/* Winner: Dubli Win toggle */}
                    {isW && (
                      <div style={S.btnRow}>
                        <button style={S.statusBtn(isWinnerDubli,"dubli")} onClick={() => setIsWinnerDubli(v=>!v)}>
                          {isWinnerDubli?"✓ ":""} Dubli Win
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            <button style={S.btnPrimary(!!winnerId)} disabled={!winnerId} onClick={() => setStep(2)}>
              Next → Enter Maal
            </button>
          </div>
        )}

        {/* ══ STEP 2 — Maal ═══════════════════════════════════ */}
        {step === 2 && (
          <div>
            <p style={S.hint}>Enter <span style={{color:"#f59e0b"}}>Maal</span> for winner and seen players.</p>
            <p style={S.hintSub}>Enter 0 if no maal collected.</p>

            <div style={S.list}>
              {seenList.map(p => {
                const isW = p.id === winnerId;
                return (
                  <div key={p.id} style={S.card(isW)}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={S.nameRow}>
                        <div style={{...S.avatar(isW), cursor:"default", background:isW?"#f59e0b":statuses[p.id]==="dubli"?"rgba(139,92,246,.2)":"rgba(59,130,246,.2)", color:isW?"#0f172a":statuses[p.id]==="dubli"?"#a78bfa":"#60a5fa"}}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                          <div style={{fontSize:11,marginTop:2,color:isW?"#f59e0b":statuses[p.id]==="dubli"?"#a78bfa":"#60a5fa"}}>
                            {isW?"Winner":statuses[p.id]==="dubli"?"Dubli":"Seen"}
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:"#475569",fontSize:13}}>Maal</span>
                        <input
                          type="number" inputMode="numeric" min="0"
                          value={maals[p.id]} placeholder="0"
                          onChange={e => setMaals(m=>({...m,[p.id]:e.target.value}))}
                          style={{width:72,background:"#334155",border:"none",borderRadius:10,padding:"8px 10px",color:"#fff",fontSize:15,fontWeight:700,textAlign:"right",outline:"none"}}
                          onFocus={e=>e.target.style.boxShadow="0 0 0 2px #f59e0b"}
                          onBlur={e=>e.target.style.boxShadow="none"}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {unseenIds.length > 0 && (
                <div style={{background:"rgba(15,23,42,.6)",borderRadius:14,padding:"12px 16px"}}>
                  <div style={{color:"#334155",fontSize:12,fontWeight:600,marginBottom:8}}>UNSEEN — no maal</div>
                  {players.filter(p=>unseenIds.includes(p.id)).map(p=>(
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                      <span style={{color:"#475569",fontSize:13}}>{p.name}</span>
                      <span style={{color:"#334155"}}>—</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={S.twoBtn}>
              <button style={S.btnGhost} onClick={()=>setStep(1)}>← Back</button>
              <button style={{...S.btnPrimary(maalsFilled),flex:2}} disabled={!maalsFilled} onClick={goPreview}>
                Preview Points →
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Preview ════════════════════════════════ */}
        {step === 3 && preview && (
          <div>
            <p style={S.hint}>Review point changes before confirming.</p>
            {isWinnerDubli && (
              <div style={{background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.3)",borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#a78bfa"}}>
                ✓ Dubli Win — extra 5 points from every player included
              </div>
            )}

            <div style={S.list}>
              {players.map(p => {
                const delta = preview[p.id] ?? 0;
                const isW   = p.id === winnerId;
                const isU   = unseenIds.includes(p.id);
                const isDub = statuses[p.id] === "dubli";
                const roleColor = isW?"#f59e0b":isDub?"#a78bfa":isU?"#475569":"#60a5fa";
                const roleLabel = isW?"Winner":isDub?"Dubli":isU?"Unseen":"Seen";
                return (
                  <div key={p.id} style={S.card(isW)}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={S.nameRow}>
                        <div style={{...S.avatar(isW), cursor:"default", background:isW?"#f59e0b":isU?"#334155":isDub?"rgba(139,92,246,.2)":"rgba(59,130,246,.2)", color:isW?"#0f172a":isU?"#64748b":isDub?"#a78bfa":"#60a5fa"}}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{p.name}</div>
                          <div style={{fontSize:11,marginTop:2,color:roleColor}}>
                            {roleLabel}{!isU&&maals[p.id]!==""?` · ${maals[p.id]} maal`:""}
                          </div>
                        </div>
                      </div>
                      <div style={{fontSize:24,fontWeight:800,color:delta>0?"#4ade80":delta<0?"#f87171":"#475569"}}>
                        {delta>0?"+":""}{delta}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.twoBtn}>
              <button style={S.btnGhost} onClick={()=>setStep(2)}>← Back</button>
              <button style={S.btnSuccess} onClick={confirm}>Confirm Round ✓</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}