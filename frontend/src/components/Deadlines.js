import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const N="#1e4080";
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getDaysInMonth(year,month){return new Date(year,month+1,0).getDate();}
function getFirstDayOfMonth(year,month){return new Date(year,month,1).getDay();}

export default function Deadlines() {
  const navigate=useNavigate();
  const [items,setItems]=useState([]);
  const [loading,setLoad]=useState(true);
  const today=new Date();
  const [calYear,setCalYear]=useState(today.getFullYear());
  const [calMonth,setCalMonth]=useState(today.getMonth());
  const [selectedDay,setSelectedDay]=useState(null);
  const [view,setView]=useState("list"); // "list" | "calendar"

  useEffect(()=>{
    fetch("http://localhost:5000/deadlines")
      .then(r=>r.json())
      .then(d=>{setItems(Array.isArray(d)?d:[]);setLoad(false);})
      .catch(()=>setLoad(false));
  },[]);

  const getUrg=(daysLeft)=>{
    if(daysLeft===null)return{c:"#8098be",bg:"#f4f7ff",label:"Unknown",border:"#dde5f5"};
    if(daysLeft<=0)    return{c:"#dc2626",bg:"#fef2f2",label:"Expired", border:"#fecaca"};
    if(daysLeft<=7)    return{c:"#dc2626",bg:"#fef2f2",label:"Critical",border:"#fecaca"};
    if(daysLeft<=14)   return{c:"#d97706",bg:"#fffbeb",label:"Soon",    border:"#fde68a"};
    if(daysLeft<=30)   return{c:N,        bg:"#f4f7ff",label:"Open",    border:"#dde5f5"};
    return                   {c:"#16a34a",bg:"#f0fdf4",label:"Future",  border:"#bbf7d0"};
  };

  // Map deadlines by date string for calendar dots
  const deadlineMap={};
  items.forEach(it=>{
    if(it.deadline){
      const d=new Date(it.deadline);
      if(!isNaN(d)){
        const key=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if(!deadlineMap[key])deadlineMap[key]=[];
        deadlineMap[key].push(it);
      }
    }
  });

  // Calendar helpers
  const daysInMonth=getDaysInMonth(calYear,calMonth);
  const firstDay=getFirstDayOfMonth(calYear,calMonth);
  const todayKey=`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const selectedKey=selectedDay?`${calYear}-${calMonth}-${selectedDay}`:null;
  const selectedEvents=selectedKey?deadlineMap[selectedKey]||[]:[];

  const prevMonth=()=>{if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11);}else setCalMonth(m=>m-1);setSelectedDay(null);};
  const nextMonth=()=>{if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0);}else setCalMonth(m=>m+1);setSelectedDay(null);};

  return(
    <div style={{minHeight:"calc(100vh - 66px)",background:"#f4f7ff",padding:"40px 24px 80px"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:16}}>
          <div>
            <p style={{fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:N,margin:"0 0 6px"}}>Deadlines</p>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:34,color:"#050d1f",letterSpacing:"-0.03em",margin:"0 0 6px"}}>Track Your Deadlines</h1>
            <p style={{fontSize:15,color:"#4a6490",margin:0}}>Calendar and list view — never miss an application deadline.</p>
          </div>
          {/* View toggle */}
          <div style={{display:"flex",gap:4,background:"#fff",border:"1px solid #dde5f5",borderRadius:10,padding:4}}>
            {[["list","📋 List"],["calendar","📅 Calendar"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"8px 18px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,background:view===v?`linear-gradient(135deg,${N},#102244)`:"transparent",color:view===v?"#fff":"#4a6490",transition:"all 0.2s"}}>{l}</button>
            ))}
          </div>
        </div>

        {/* CALENDAR VIEW */}
        {view==="calendar"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}} className="cal-grid">
            <div style={{background:"#fff",border:"1px solid #dde5f5",borderRadius:22,overflow:"hidden",boxShadow:"0 2px 16px rgba(5,13,31,0.06)"}}>
              {/* Calendar header */}
              <div style={{background:`linear-gradient(135deg,${N},#102244)`,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <button onClick={prevMonth} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",transition:"background 0.2s"}}
                  onMouseEnter={e=>e.target.style.background="rgba(255,255,255,0.25)"}
                  onMouseLeave={e=>e.target.style.background="rgba(255,255,255,0.15)"}>‹</button>
                <div style={{textAlign:"center"}}>
                  <p style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#fff",margin:0}}>{MONTHS[calMonth]}</p>
                  <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",margin:0}}>{calYear}</p>
                </div>
                <button onClick={nextMonth} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:34,height:34,color:"#fff",fontSize:16,cursor:"pointer",transition:"background 0.2s"}}
                  onMouseEnter={e=>e.target.style.background="rgba(255,255,255,0.25)"}
                  onMouseLeave={e=>e.target.style.background="rgba(255,255,255,0.15)"}>›</button>
              </div>
              {/* Weekday headers */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#f4f7ff",borderBottom:"1px solid #dde5f5"}}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
                  <div key={d} style={{textAlign:"center",padding:"10px 0",fontSize:11,fontWeight:700,color:"#8098be",textTransform:"uppercase",letterSpacing:"0.05em"}}>{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"8px"}}>
                {/* Empty cells */}
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} style={{height:52}}/>)}
                {/* Day cells */}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const day=i+1;
                  const key=`${calYear}-${calMonth}-${day}`;
                  const hasDeadlines=!!deadlineMap[key];
                  const isToday=key===todayKey;
                  const isSelected=selectedDay===day;
                  const dayDeadlines=deadlineMap[key]||[];
                  const hasCritical=dayDeadlines.some(d=>{const dl=Math.ceil((new Date(d.deadline)-new Date())/86400000);return dl<=7&&dl>=0;});
                  const hasSoon=dayDeadlines.some(d=>{const dl=Math.ceil((new Date(d.deadline)-new Date())/86400000);return dl>7&&dl<=14;});
                  return(
                    <div key={day} onClick={()=>setSelectedDay(isSelected?null:day)}
                      style={{height:52,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,borderRadius:10,cursor:hasDeadlines?"pointer":"default",transition:"all 0.15s",
                        background:isSelected?`linear-gradient(135deg,${N},#102244)`:isToday?"rgba(30,64,128,0.08)":"transparent",
                        border:isToday&&!isSelected?`1.5px solid rgba(30,64,128,0.3)`:"1.5px solid transparent"}}
                      onMouseEnter={e=>{if(!isSelected&&!isToday)e.currentTarget.style.background="#f4f7ff";}}
                      onMouseLeave={e=>{if(!isSelected&&!isToday)e.currentTarget.style.background="transparent";}}>
                      <span style={{fontSize:14,fontWeight:isToday||isSelected?800:500,color:isSelected?"#fff":isToday?N:"#050d1f",lineHeight:1}}>{day}</span>
                      {hasDeadlines&&(
                        <div style={{display:"flex",gap:2}}>
                          {dayDeadlines.slice(0,3).map((_,di)=>(
                            <span key={di} style={{width:5,height:5,borderRadius:"50%",background:isSelected?"rgba(255,255,255,0.8)":hasCritical?"#dc2626":hasSoon?"#d97706":N}}/>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{padding:"12px 20px",borderTop:"1px solid #eef3fc",display:"flex",gap:16,flexWrap:"wrap"}}>
                {[{c:"#dc2626",l:"Critical (≤7 days)"},{c:"#d97706",l:"Soon (≤14 days)"},{c:N,l:"Open (≤30 days)"}].map(x=>(
                  <div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:x.c,display:"inline-block"}}/>
                    <span style={{fontSize:11,color:"#4a6490",fontWeight:500}}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day panel */}
            <div style={{background:"#fff",border:"1px solid #dde5f5",borderRadius:18,padding:22,boxShadow:"0 2px 12px rgba(5,13,31,0.05)"}}>
              {selectedDay?(
                <>
                  <p style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#050d1f",margin:"0 0 4px"}}>{SHORT_MONTHS[calMonth]} {selectedDay}, {calYear}</p>
                  <p style={{fontSize:13,color:"#8098be",margin:"0 0 16px"}}>{selectedEvents.length>0?`${selectedEvents.length} deadline${selectedEvents.length>1?"s":""}`:"No deadlines"}</p>
                  {selectedEvents.length>0?(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {selectedEvents.map((it,i)=>{
                        const days=Math.ceil((new Date(it.deadline)-new Date())/86400000);
                        const urg=getUrg(days);
                        return(
                          <div key={i} style={{padding:"12px 14px",background:"#f4f7ff",border:`1px solid ${urg.border}`,borderLeft:`3px solid ${urg.c}`,borderRadius:10}}>
                            <p style={{fontWeight:700,fontSize:13,color:"#050d1f",margin:"0 0 3px"}}>{it.title}</p>
                            <p style={{fontSize:12,color:"#8098be",margin:"0 0 6px"}}>{it.org}</p>
                            <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",background:urg.bg,color:urg.c,borderRadius:6}}>{urg.label}{days>0?` · ${days}d left`:""}</span>
                          </div>
                        );
                      })}
                    </div>
                  ):(
                    <div style={{textAlign:"center",padding:"24px 0",color:"#8098be"}}>
                      <p style={{fontSize:28,marginBottom:8}}>✓</p>
                      <p style={{fontSize:14,margin:0}}>No deadlines on this day</p>
                    </div>
                  )}
                </>
              ):(
                <div style={{textAlign:"center",padding:"32px 0",color:"#8098be"}}>
                  <p style={{fontSize:36,marginBottom:12}}>📅</p>
                  <p style={{fontWeight:700,color:"#050d1f",margin:"0 0 6px",fontSize:16}}>Select a Day</p>
                  <p style={{fontSize:13,margin:0,lineHeight:1.6}}>Click any date with a colored dot to see its deadlines</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view==="list"&&(
          loading?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[0,1,2,3].map(i=><div key={i} style={{height:88,borderRadius:16,background:"linear-gradient(90deg,#eef3fc 25%,#dde5f5 50%,#eef3fc 75%)",backgroundSize:"800px 100%",animation:"shimmer 1.6s infinite",border:"1px solid #dde5f5"}}/>)}
            </div>
          ):items.length===0?(
            <div style={{textAlign:"center",padding:"60px 24px",background:"#fff",border:"2px dashed #dde5f5",borderRadius:20}}>
              <p style={{fontSize:36,marginBottom:12}}>📅</p>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:"#050d1f",margin:"0 0 10px"}}>No Deadlines Yet</h3>
              <p style={{fontSize:14,color:"#4a6490",margin:"0 0 20px"}}>Build your profile to see matched opportunity deadlines.</p>
              <button onClick={()=>navigate("/profile")} style={{padding:"11px 24px",background:`linear-gradient(135deg,${N},#102244)`,color:"#fff",borderRadius:10,border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Build Profile →</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {items.map((item,i)=>{
                const days=item.daysLeft??Math.ceil((new Date(item.deadline)-new Date())/86400000);
                const urg=getUrg(days);
                return(
                  <div key={i} style={{background:"#fff",border:`1px solid ${urg.border}`,borderLeft:`4px solid ${urg.c}`,borderRadius:14,padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(5,13,31,0.04)",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateX(3px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(5,13,31,0.08)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 1px 4px rgba(5,13,31,0.04)";}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        {item.type&&<span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",padding:"2px 8px",background:urg.bg,border:`1px solid ${urg.border}`,color:urg.c,borderRadius:5}}>{item.type}</span>}
                        <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",background:urg.bg,color:urg.c,borderRadius:5}}>{urg.label}</span>
                        {item.city&&<span style={{fontSize:11,color:"#8098be"}}>📍{item.city}</span>}
                      </div>
                      <p style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#050d1f",margin:"0 0 2px"}}>{item.title}</p>
                      <p style={{fontSize:13,color:"#8098be",margin:0}}>{item.org}</p>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:urg.c,margin:0}}>
                        {days===null?"–":days<=0?"Expired":`${days}d`}
                      </p>
                      <p style={{fontSize:12,color:"#8098be",margin:0}}>{item.deadline||"No deadline"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      <style>{`
        @media(max-width:760px){.cal-grid{grid-template-columns:1fr!important}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes calFadeIn{from{opacity:0;transform:scale(0.96) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
    </div>
  );
}