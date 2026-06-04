// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE PORTFOLIO — React + Inline Styles + CSS-in-JS
// Breakpoints: mobile (<640px), tablet (640–900px), desktop (>900px)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["About","Skills","Projects","Experience","Contact"];
const SKILLS = [
  { name:"React / Next.js", level:95, cat:"Frontend", color:"#6C63FF" },
  { name:"TypeScript",       level:90, cat:"Frontend", color:"#00D4AA" },
  { name:"Node.js",          level:88, cat:"Backend",  color:"#6C63FF" },
  { name:"GraphQL",          level:82, cat:"Backend",  color:"#00D4AA" },
  { name:"PostgreSQL",       level:85, cat:"Database", color:"#6C63FF" },
  { name:"Docker / K8s",     level:78, cat:"DevOps",   color:"#00D4AA" },
  { name:"AWS / GCP",        level:80, cat:"Cloud",    color:"#6C63FF" },
  { name:"System Design",    level:92, cat:"Architecture", color:"#00D4AA" },
];
const PROJECTS = [
  { title:"Nebula AI Platform",  desc:"Real-time ML inference platform serving 10M+ predictions/day. Built with React, FastAPI, Redis, and Kubernetes.", tags:["React","Python","K8s","ML"], color:"#6C63FF", icon:"🌌", year:"2024" },
  { title:"FlowSync Dashboard",  desc:"Enterprise analytics dashboard with live data streaming, custom viz engine, and role-based access control.",       tags:["Next.js","D3.js","WebSocket","PostgreSQL"], color:"#00D4AA", icon:"📊", year:"2023" },
  { title:"Vault — Secure Collab",desc:"End-to-end encrypted team workspace with zero-knowledge architecture and sub-100ms sync latency.",               tags:["TypeScript","CRDTs","WebRTC","Rust"], color:"#FF6B6B", icon:"🔐", year:"2023" },
  { title:"Orbit Design System", desc:"Component library used by 40+ teams. Full a11y support, dark/light theming, Figma token sync.",                   tags:["React","Storybook","Figma API","CSS"], color:"#FFB347", icon:"🎨", year:"2022" },
];
const EXPERIENCE = [
  { role:"Software Developer Intern",           company:"Felix It's", period:"May 2024 – Oct 2024 ", desc:"Software developer, with building scalable and efficient software systems ." },
  { role:"Full Stack Developer Intern", company:"Dreams International",         period:"Dec 2024 – Jun 2025",    desc:"Core contributor to the deploy pipeline UI. Shipped features used by 2M+ developers worldwide." },
];
const WORK_TYPES = ["Full-time Role","Contract / Freelance","Consulting","Open Source Collab"];
const BUDGETS    = ["< $5k / mo","$5k–$10k / mo","$10k–$20k / mo","$20k+ / mo","Let's discuss"];

const A="#6C63FF", A2="#00D4AA";

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 900, isDesktop: w >= 900, w };
}

function useIntersect(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 24 }) {
  const [ref, vis] = useIntersect();
  return (
    <div ref={ref} style={{ opacity: vis?1:0, transform: vis?"translateY(0)":`translateY(${y}px)`,
      transition:`opacity .7s ease ${delay}ms,transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function AnimBar({ level, color, delay }) {
  const [ref, vis] = useIntersect(0.1);
  return (
    <div ref={ref} style={{ background:"#1a1a2e", borderRadius:99, height:6, overflow:"hidden" }}>
      <div style={{ height:"100%", width:vis?`${level}%`:"0%",
        background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:99,
        transition:`width 1.2s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        boxShadow:`0 0 12px ${color}88` }} />
    </div>
  );
}

function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  useEffect(() => {
    let rx=0,ry=0;
    const move = e => { if(dot.current){dot.current.style.left=e.clientX+"px";dot.current.style.top=e.clientY+"px";} };
    const raf = () => {
      if(ring.current){
        const tx=parseFloat(dot.current?.style.left)||0,ty=parseFloat(dot.current?.style.top)||0;
        rx+=(tx-rx)*.15;ry+=(ty-ry)*.15;
        ring.current.style.left=rx+"px";ring.current.style.top=ry+"px";
      }
      requestAnimationFrame(raf);
    };
    window.addEventListener("mousemove",move);
    requestAnimationFrame(raf);
    return ()=>window.removeEventListener("mousemove",move);
  }, []);
  return (
    <>
      <div ref={dot} style={{ position:"fixed",width:8,height:8,background:A,borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)" }} />
      <div ref={ring} style={{ position:"fixed",width:36,height:36,border:`1.5px solid ${A}55`,borderRadius:"50%",pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)" }} />
    </>
  );
}

// ─── HIRE ME MODAL ───────────────────────────────────────────────────────────
function HireMeModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name:"",email:"",company:"",workType:"",budget:"",timeline:"",message:"" });
  const { isMobile } = useBreakpoint();

  useEffect(() => { if(open){ setStep(1);setErrors({});setSending(false); } }, [open]);
  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  }, [onClose]);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); };
  const v1 = () => {
    const e={};
    if(!form.name.trim()) e.name="Name is required";
    if(!form.email.trim()) e.email="Email is required";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Enter a valid email";
    setErrors(e); return !Object.keys(e).length;
  };
  const v2 = () => {
    const e={};
    if(!form.workType) e.workType="Please select a work type";
    if(!form.message.trim()) e.message="Tell me about the project";
    setErrors(e); return !Object.keys(e).length;
  };

  if(!open) return null;

  const inp = err => ({
    width:"100%",background:"#0a0a1e",border:`1px solid ${err?"#FF6B6B66":"#ffffff14"}`,
    borderRadius:10,padding:"11px 13px",color:"#e8e8f0",fontSize:14,fontFamily:"'Sora',sans-serif",
    outline:"none",transition:"border-color .2s",boxShadow:err?"0 0 0 3px #FF6B6B18":"none",
  });

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{
      position:"fixed",inset:0,zIndex:1000,background:"rgba(2,2,16,.88)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"modal-bg-in .25s ease",
    }}>
      <div style={{
        background:"#0d0d22",border:"1px solid #ffffff14",borderRadius:20,width:"100%",maxWidth:500,
        maxHeight:"90vh",overflowY:"auto",boxShadow:`0 40px 120px #00000099,0 0 0 1px ${A}22`,
        animation:"modal-in .35s cubic-bezier(.22,1,.36,1)",
      }}>
        {/* top bar */}
        <div style={{ height:3,background:`linear-gradient(90deg,${A},${A2},${A})`,backgroundSize:"200% 100%",animation:"gradient-shift 3s linear infinite",borderRadius:"20px 20px 0 0" }} />

        {/* header */}
        <div style={{ padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            {step<3 && <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:A,letterSpacing:".1em",marginBottom:4 }}>
              STEP {step} OF 2 — {step===1?"YOUR INFO":"PROJECT DETAILS"}</div>}
            <h2 style={{ fontSize:isMobile?18:21,fontWeight:800,letterSpacing:"-.03em" }}>
              {step===1&&"Let's work together"}{step===2&&"Tell me about it"}{step===3&&"Message Sent! 🎉"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background:"#ffffff0d",border:"1px solid #ffffff14",color:"#8888aa",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12 }}>✕</button>
        </div>

        {/* progress */}
        {step<3 && <div style={{ margin:"14px 22px 0",height:4,background:"#1a1a2e",borderRadius:2 }}>
          <div style={{ height:"100%",width:step===1?"50%":"100%",background:`linear-gradient(90deg,${A},${A2})`,borderRadius:2,transition:"width .5s cubic-bezier(.22,1,.36,1)",boxShadow:`0 0 10px ${A}88` }} />
        </div>}

        <div style={{ padding:"20px 22px 26px" }}>
          {/* ── Step 1 ── */}
          {step===1 && (
            <div style={{ display:"flex",flexDirection:"column",gap:14,animation:"slide-in .3s ease" }}>
              <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:6,textTransform:"uppercase" }}>Full Name *</label>
                  <input placeholder="Alex Rivera" value={form.name} onChange={e=>set("name",e.target.value)} style={inp(!!errors.name)} />
                  {errors.name&&<div style={{ color:"#FF6B6B",fontSize:11,marginTop:4 }}>⚠ {errors.name}</div>}
                </div>
                <div>
                  <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:6,textTransform:"uppercase" }}>Email *</label>
                  <input placeholder="alex@company.com" value={form.email} onChange={e=>set("email",e.target.value)} style={inp(!!errors.email)} />
                  {errors.email&&<div style={{ color:"#FF6B6B",fontSize:11,marginTop:4 }}>⚠ {errors.email}</div>}
                </div>
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:6,textTransform:"uppercase" }}>Company / Project</label>
                <input placeholder="Acme Inc. (optional)" value={form.company} onChange={e=>set("company",e.target.value)} style={inp(false)} />
              </div>
              <p style={{ fontSize:12,color:"#555577",lineHeight:1.6 }}>✦ Your info is private and only used to reply to you.</p>
              <button onClick={()=>{if(v1())setStep(2);}}
                style={{ width:"100%",padding:"13px",borderRadius:10,background:`linear-gradient(135deg,${A},#8B5CF6)`,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"transform .2s,box-shadow .2s",marginTop:4 }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${A}55`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step===2 && (
            <div style={{ display:"flex",flexDirection:"column",gap:14,animation:"slide-in .3s ease" }}>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:8,textTransform:"uppercase" }}>Type of engagement *</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {WORK_TYPES.map(t=>(
                    <button key={t} onClick={()=>set("workType",t)} style={{ padding:"8px 13px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif",fontWeight:500,background:form.workType===t?`${A}22`:"#ffffff08",border:`1px solid ${form.workType===t?A:"#ffffff14"}`,color:form.workType===t?A:"#8888aa",transition:"all .15s" }}>{t}</button>
                  ))}
                </div>
                {errors.workType&&<div style={{ color:"#FF6B6B",fontSize:11,marginTop:4 }}>⚠ {errors.workType}</div>}
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:8,textTransform:"uppercase" }}>Budget range</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                  {BUDGETS.map(b=>(
                    <button key={b} onClick={()=>set("budget",b)} style={{ padding:"7px 11px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",background:form.budget===b?`${A2}22`:"#ffffff08",border:`1px solid ${form.budget===b?A2:"#ffffff14"}`,color:form.budget===b?A2:"#8888aa",transition:"all .15s" }}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:6,textTransform:"uppercase" }}>Timeline</label>
                <input placeholder="e.g. Starting ASAP, Q3 2026…" value={form.timeline} onChange={e=>set("timeline",e.target.value)} style={inp(false)} />
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:600,color:"#8888aa",letterSpacing:".06em",marginBottom:6,textTransform:"uppercase" }}>Describe your project *</label>
                <textarea placeholder="What are you building? The more detail, the better…" value={form.message} onChange={e=>set("message",e.target.value)} rows={4}
                  style={{ ...inp(!!errors.message),resize:"vertical",lineHeight:1.6 }} />
                {errors.message&&<div style={{ color:"#FF6B6B",fontSize:11,marginTop:4 }}>⚠ {errors.message}</div>}
              </div>
              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={()=>setStep(1)} style={{ padding:"13px 16px",borderRadius:10,background:"transparent",border:"1px solid #ffffff18",color:"#8888aa",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all .2s",flexShrink:0 }}>← Back</button>
                <button disabled={sending} onClick={async()=>{
                  if(!v2())return;
                  setSending(true);
                  await new Promise(r=>setTimeout(r,1800));
                  setSending(false);setStep(3);
                }} style={{ flex:1,padding:"13px",borderRadius:10,background:sending?"#333355":`linear-gradient(135deg,${A},#8B5CF6)`,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:sending?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif",transition:"transform .2s,box-shadow .2s" }}
                  onMouseEnter={e=>{if(!sending){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${A}55`;}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                  {sending?<span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><span style={{ width:15,height:15,border:"2px solid #ffffff44",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin-slow .7s linear infinite" }} />Sending…</span>:"Send Message ✉"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step===3 && (
            <div style={{ textAlign:"center",padding:"12px 0 8px",animation:"slide-in .4s ease" }}>
              <div style={{ fontSize:58,marginBottom:18,animation:"float 3s ease-in-out infinite" }}>🚀</div>
              <h3 style={{ fontSize:19,fontWeight:800,marginBottom:10 }}>Thanks, {form.name.split(" ")[0]}!</h3>
              <p style={{ color:"#777799",fontSize:14,lineHeight:1.7,marginBottom:8 }}>Message received! I'll get back to <span style={{ color:A2 }}>{form.email}</span> within 24 hours.</p>
              <p style={{ color:"#555577",fontSize:12,marginBottom:26 }}>While you wait — check out my latest projects 👇</p>
              <button onClick={onClose} style={{ padding:"12px 28px",borderRadius:10,background:`linear-gradient(135deg,${A},#8B5CF6)`,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"transform .2s,box-shadow .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${A}55`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                Back to Portfolio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const { isMobile, isTablet, isDesktop, w } = useBreakpoint();
  const [scrolled, setScrolled]     = useState(false);
  const [activeSection, setActive]  = useState("About");
  const [menuOpen, setMenuOpen]     = useState(false);
  const [hoveredProj, setHovProj]   = useState(null);
  const [hireMeOpen, setHireMeOpen] = useState(false);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  useEffect(()=>{ document.body.style.overflow=hireMeOpen?"hidden":""; return()=>{document.body.style.overflow="";};}, [hireMeOpen]);
  // Close mobile menu on resize to desktop
  useEffect(()=>{ if(isDesktop) setMenuOpen(false); },[isDesktop]);

  const openHire = useCallback(()=>{ setMenuOpen(false);setHireMeOpen(true); },[]);
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({behavior:"smooth"});setMenuOpen(false); };

  const px = isMobile?"5vw":"5vw";

  return (
    <div style={{ background:"#050510",color:"#e8e8f0",fontFamily:"'Sora',sans-serif",minHeight:"100vh",overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#6C63FF55;border-radius:2px;}
        input,textarea{font-family:'Sora',sans-serif;}
        input:focus,textarea:focus{border-color:${A}!important;box-shadow:0 0 0 3px ${A}22!important;outline:none;}
        .nav-lnk{position:relative;color:#8888aa;font-size:14px;font-weight:500;letter-spacing:.05em;cursor:pointer;padding:6px 0;background:none;border:none;font-family:'Sora',sans-serif;transition:color .2s;}
        .nav-lnk::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:${A};transition:width .3s;}
        .nav-lnk:hover,.nav-lnk.active{color:#e8e8f0;}.nav-lnk:hover::after,.nav-lnk.active::after{width:100%;}
        .btn-h{background:linear-gradient(135deg,${A},#8B5CF6);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;letter-spacing:.05em;transition:transform .2s,box-shadow .2s;animation:btn-pulse 2.5s ease-in-out infinite;}
        .btn-h:hover{transform:translateY(-2px);box-shadow:0 8px 28px #6C63FF66;}
        .pcard{background:#0d0d1f;border:1px solid #ffffff0d;border-radius:16px;padding:22px;cursor:pointer;transition:transform .3s cubic-bezier(.22,1,.36,1),border-color .3s,box-shadow .3s;}
        .pcard:hover{transform:translateY(-6px);box-shadow:0 20px 60px #00000088;}
        .tag{background:#ffffff08;border:1px solid #ffffff14;border-radius:6px;padding:4px 9px;font-size:11px;font-family:'JetBrains Mono',monospace;color:#8888aa;}
        .xcard{padding:20px 20px 20px 22px;border-left:2px solid #6C63FF33;position:relative;transition:border-color .3s;}
        .xcard:hover{border-color:${A};}.xcard::before{content:'';position:absolute;left:-6px;top:26px;width:10px;height:10px;background:${A};border-radius:50%;box-shadow:0 0 14px ${A};}
        .slink{display:flex;align-items:center;gap:8px;color:#8888aa;font-size:13px;cursor:pointer;padding:10px 14px;border-radius:8px;border:1px solid #ffffff0d;transition:all .2s;text-decoration:none;}
        .slink:hover{background:#6C63FF11;border-color:#6C63FF44;color:#e8e8f0;}
        .ham span{display:block;width:22px;height:2px;background:#e8e8f0;border-radius:2px;transition:all .3s;}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.2);opacity:0}}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes gradient-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes modal-bg-in{from{opacity:0}to{opacity:1}}
        @keyframes modal-in{from{opacity:0;transform:scale(.94) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slide-in{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes btn-pulse{0%,100%{box-shadow:0 0 0 0 #6C63FF44}50%{box-shadow:0 0 0 8px #6C63FF00}}
        @media(hover:none){#cursor-dot,#cursor-ring{display:none;}}
      `}</style>

      <Cursor />
      <HireMeModal open={hireMeOpen} onClose={()=>setHireMeOpen(false)} />

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5vw",background:scrolled?"#050510ee":"transparent",backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?"1px solid #ffffff0a":"none",transition:"all .3s" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,letterSpacing:"-.02em" }}>
          <span style={{ color:A }}>A</span>dev<span style={{ color:A2 }}>.</span>
        </div>
        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display:"flex",gap:isTablet?20:28,alignItems:"center" }}>
            {NAV_LINKS.map(l=>(
              <button key={l} className={`nav-lnk${activeSection===l?" active":""}`} onClick={()=>{setActive(l);scrollTo(l.toLowerCase());}}>{l}</button>
            ))}
          </div>
        )}
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          {!isMobile && <button className="btn-h" style={{ padding:"10px 20px",fontSize:13 }} onClick={openHire}>✦ Hire Me</button>}
          {isMobile && (
            <button className="ham" onClick={()=>setMenuOpen(o=>!o)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",gap:5,padding:6 }} aria-label="Menu">
              <span style={{ transform:menuOpen?"translateY(7px) rotate(45deg)":"none" }} />
              <span style={{ opacity:menuOpen?0:1 }} />
              <span style={{ transform:menuOpen?"translateY(-7px) rotate(-45deg)":"none" }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{ position:"fixed",top:64,left:0,right:0,background:"#07071aee",backdropFilter:"blur(20px)",borderBottom:"1px solid #ffffff0a",padding:"16px 5vw 24px",zIndex:190,transform:menuOpen?"translateY(0)":"translateY(-110%)",opacity:menuOpen?1:0,transition:"transform .35s cubic-bezier(.22,1,.36,1),opacity .25s",display:"flex",flexDirection:"column",gap:4 }}>
          {NAV_LINKS.map(l=>(
            <button key={l} className="nav-lnk" style={{ fontSize:16,padding:"13px 0",borderBottom:"1px solid #ffffff08",textAlign:"left" }} onClick={()=>{setActive(l);scrollTo(l.toLowerCase());}}>{l}</button>
          ))}
          <button className="btn-h" style={{ marginTop:14,padding:14,fontSize:14 }} onClick={openHire}>✦ Hire Me</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="about" style={{ minHeight:"100vh",display:"flex",alignItems:"center",padding:`0 ${px}`,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(#ffffff05 1px,transparent 1px),linear-gradient(90deg,#ffffff05 1px,transparent 1px)",backgroundSize:"60px 60px",maskImage:"radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"20%",left:"60%",width:400,height:400,background:`radial-gradient(circle,${A}22 0%,transparent 70%)`,pointerEvents:"none" }} />
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",paddingTop:80,gap:32,flexWrap:isDesktop?"nowrap":"wrap" }}>
          {/* Text */}
          <div style={{ flex:1,minWidth:0,maxWidth:620,position:"relative",zIndex:1 }}>
            <div style={{ display:"inline-block",padding:"6px 16px",background:"#6C63FF18",border:"1px solid #6C63FF44",borderRadius:99,fontSize:12,color:A,fontFamily:"'JetBrains Mono',monospace",marginBottom:20,animation:"float 6s ease-in-out infinite" }}>
              ✦ Available for work · Remote-friendly
            </div>
            <h1 style={{ fontSize:`clamp(${isMobile?"32px":"40px"},6vw,76px)`,fontWeight:800,lineHeight:1.05,letterSpacing:"-.03em",marginBottom:18 }}>
              Saurabh Kamane<br />
              <span style={{ background:`linear-gradient(135deg,${A},${A2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Junior Full Stack developer</span>
            </h1>
            <p style={{ fontSize:isMobile?15:17,lineHeight:1.7,color:"#9999bb",maxWidth:500,marginBottom:32 }}>
              I build fast, scalable, and delightful digital products. 1 years turning complex problems into elegant software at startups and top-tier tech companies.
            </p>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              <button style={{ background:A,color:"#fff",border:"none",padding:"13px 26px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"transform .2s,box-shadow .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 28px ${A}55`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
                onClick={()=>scrollTo("projects")}>View Projects →</button>
              <button className="btn-h" style={{ padding:"13px 26px",fontSize:14 }} onClick={openHire}>✦ Hire Me</button>
            </div>
            <div style={{ display:"flex",gap:isMobile?24:36,marginTop:44,paddingTop:32,borderTop:"1px solid #ffffff0d",flexWrap:"wrap" }}>
              {[["1+","Years Exp."],["20+","Projects"],["200+","OSS Stars"]].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontSize:isMobile?24:30,fontWeight:800,color:"#fff",letterSpacing:"-.04em",fontFamily:"'JetBrains Mono',monospace" }}>{n}</div>
                  <div style={{ fontSize:12,color:"#666688",marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Avatar — hide on small mobile */}
          {w >= 640 && (
            <div style={{ flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",animation:"float 7s ease-in-out infinite",position:isDesktop?"absolute":"relative",right:isDesktop?"8vw":"auto",top:isDesktop?"50%":"auto",transform:isDesktop?"translateY(-50%)":"none" }}>
              <div style={{ width:isTablet?180:220,height:isTablet?180:220,borderRadius:"50%",background:`conic-gradient(${A},${A2},${A})`,padding:3,animation:"spin-slow 8s linear infinite",position:"relative" }}>
                <div style={{ width:"100%",height:"100%",borderRadius:"50%",background:"#0a0a1f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isTablet?64:80 }}>👨‍💻</div>
              </div>
              <div style={{ position:"absolute",inset:-1,borderRadius:"50%",border:`1px solid ${A}33`,animation:"pulse-ring 2s ease-out infinite" }} />
            </div>
          )}
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ padding:isMobile?"64px 5vw":"80px 5vw" }}>
        <div style={{ maxWidth:860,margin:"0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:A,letterSpacing:".1em",marginBottom:14 }}>02 / SKILLS</div>
            <h2 style={{ fontSize:`clamp(26px,4vw,44px)`,fontWeight:800,letterSpacing:"-.03em",marginBottom:8 }}>What I bring to the table</h2>
            <p style={{ color:"#666688",fontSize:15,marginBottom:40 }}>Deep expertise across the full stack — from pixel-perfect UIs to distributed systems.</p>
          </FadeIn>
          {SKILLS.map((s,i)=>(
            <FadeIn key={s.name} delay={i*55}>
              <div style={{ display:"grid",gridTemplateColumns:isMobile?"100px 1fr 32px":"130px 1fr 38px",alignItems:"center",gap:isMobile?10:14,padding:"11px 0",borderBottom:"1px solid #ffffff08" }}>
                <div>
                  <div style={{ fontSize:isMobile?12:13,fontWeight:600 }}>{s.name}</div>
                  <div style={{ fontSize:11,color:"#555577",marginTop:2 }}>{s.cat}</div>
                </div>
                <AnimBar level={s.level} color={s.color} delay={i*80} />
                <div style={{ fontSize:isMobile?11:12,fontFamily:"'JetBrains Mono',monospace",color:A,textAlign:"right" }}>{s.level}%</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding:isMobile?"64px 5vw":"80px 5vw",background:"#07071a" }}>
        <div style={{ maxWidth:1080,margin:"0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:A,letterSpacing:".1em",marginBottom:14 }}>03 / PROJECTS</div>
            <h2 style={{ fontSize:`clamp(26px,4vw,44px)`,fontWeight:800,letterSpacing:"-.03em",marginBottom:8 }}>Things I've built</h2>
            <p style={{ color:"#666688",fontSize:15,marginBottom:40 }}>From startup MVPs to enterprise platforms at scale.</p>
          </FadeIn>
          <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(2,1fr)",gap:16 }}>
            {PROJECTS.map((p,i)=>(
              <FadeIn key={p.title} delay={i*70}>
                <div className="pcard" onMouseEnter={()=>setHovProj(i)} onMouseLeave={()=>setHovProj(null)} style={{ borderColor:hoveredProj===i?`${p.color}44`:"#ffffff0d",height:"100%" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                    <span style={{ fontSize:32 }}>{p.icon}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#555577" }}>{p.year}</span>
                  </div>
                  <h3 style={{ fontSize:17,fontWeight:700,marginBottom:8,letterSpacing:"-.02em" }}>{p.title}</h3>
                  <p style={{ fontSize:13,color:"#777799",lineHeight:1.65,marginBottom:14 }}>{p.desc}</p>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{p.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                  <div style={{ marginTop:16,height:2,background:`linear-gradient(90deg,${p.color},transparent)`,borderRadius:1,opacity:hoveredProj===i?1:0,transition:"opacity .3s" }} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ padding:isMobile?"64px 5vw":"80px 5vw" }}>
        <div style={{ maxWidth:720,margin:"0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:A,letterSpacing:".1em",marginBottom:14 }}>04 / EXPERIENCE</div>
            <h2 style={{ fontSize:`clamp(26px,4vw,44px)`,fontWeight:800,letterSpacing:"-.03em",marginBottom:36 }}>Where I've worked</h2>
          </FadeIn>
          <div style={{ paddingLeft:18 }}>
            {EXPERIENCE.map((e,i)=>(
              <FadeIn key={e.company} delay={i*90}>
                <div className="xcard" style={{ marginBottom:i<EXPERIENCE.length-1?20:0 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6,flexWrap:isMobile?"wrap":"nowrap" }}>
                    <div>
                      <div style={{ fontWeight:700,fontSize:16 }}>{e.role}</div>
                      <div style={{ color:A2,fontSize:13,marginTop:2,fontWeight:500 }}>{e.company}</div>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#555577",whiteSpace:"nowrap" }}>{e.period}</div>
                  </div>
                  <p style={{ color:"#777799",fontSize:13,lineHeight:1.65,marginTop:8 }}>{e.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding:isMobile?"64px 5vw 60px":"80px 5vw",background:"#07071a",position:"relative",overflow:"hidden",textAlign:"center" }}>
        <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse 60% 50% at 50% 100%,${A}18 0%,transparent 70%)`,pointerEvents:"none" }} />
        <div style={{ maxWidth:600,margin:"0 auto",position:"relative",zIndex:1 }}>
          <FadeIn>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:A,letterSpacing:".1em",marginBottom:14 }}>05 / CONTACT</div>
            <h2 style={{ fontSize:`clamp(26px,5vw,52px)`,fontWeight:800,letterSpacing:"-.03em",marginBottom:14 }}>Let's build something remarkable</h2>
            <p style={{ color:"#666688",fontSize:isMobile?14:15,lineHeight:1.7,marginBottom:32 }}>
              Open to senior / staff roles, consulting, and interesting open-source collaborations. Response within 24h.
            </p>
            <button className="btn-h" style={{ fontSize:15,padding:"15px 36px",marginBottom:36 }} onClick={openHire}>✦ Start a Conversation</button>
            <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
              {[["GitHub","https://github.com/saurabhack"],["LinkedIn","https://www.linkedin.com/in/saurabh-kamane-3ba95331b/"],["Twitter","@arivera_dev"],["Dribbble","dribbble.com/arivera"]].map(([n,h])=>(
                <a key={n} className="slink" href={h}>
                  <strong style={{ fontSize:13 }}>{n}</strong>
                  <span style={{ color:"#444466",fontSize:11 }}> {h}   </span>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"18px 5vw",borderTop:"1px solid #ffffff0a",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#444466" }}>© 2026 Alex Rivera · Built with ♥ in React</span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#444466" }}>Design / Code / Ship</span>
      </footer>
    </div>
  );
}