import { useState, useRef, useEffect } from "react";

const TW_HOLIDAYS = {
  "2026-01-01":{n:"元旦"},"2026-02-17":{n:"春節初一"},"2026-02-18":{n:"春節初二"},
  "2026-02-19":{n:"春節初三"},"2026-02-28":{n:"228紀念日"},"2026-04-04":{n:"兒童節"},
  "2026-04-05":{n:"清明節"},"2026-05-01":{n:"勞動節"},"2026-06-19":{n:"端午節"},
  "2026-09-25":{n:"中秋節"},"2026-10-10":{n:"國慶日"},
};

const SERVICE_TYPES = ["安親寄宿","到府照顧","陪伴散步","到府美容/洗澡"];
const SERVICE_ICONS = {"安親寄宿":"🏠","到府照顧":"🐾","陪伴散步":"🦮","到府美容/洗澡":"🛁"};
const PET_TYPES = ["狗","貓","兔子","鳥","其他"];
const PET_EMOJI = {狗:"🐕",貓:"🐈",兔子:"🐇",鳥:"🐦",其他:"🐾"};
const WEEKDAYS = ["日","一","二","三","四","五","六"];
const TIME_OF_DAY = ["早上","白天","傍晚","晚上","全天"];
const STATUS_MAP = {
  confirmed:{label:"已確認",color:"#A07850"},
  pending:  {label:"待確認",color:"#C8845A"},
  completed:{label:"已完成",color:"#7A9E7E"},
  cancelled:{label:"已取消",color:"#B07878"},
};

const C = {
  bg:"#FAF6F0",surface:"#F5EFE6",card:"#FFFFFF",card2:"#FDF8F2",
  border:"#E8DDD0",border2:"#D4C4B0",
  accent:"#9B7553",accent2:"#C19A6B",soft:"#E8D5BC",
  text:"#4A3728",muted:"#8B7355",dim:"#B8A898",
  green:"#7A9E7E",orange:"#C8845A",red:"#B07878",
  holiday:"#C96A60",holidayBg:"#FEF2F0",
};

const pill = (color) => ({
  display:"inline-flex",alignItems:"center",
  background:color+"18",color,border:`1px solid ${color}44`,
  borderRadius:20,padding:"3px 11px",fontSize:11.5,fontWeight:600,
});
const cardSt = {
  background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,
  boxShadow:"0 2px 12px rgba(154,117,83,.08)",
};
const inp = {
  width:"100%",boxSizing:"border-box",background:C.surface,
  border:`1px solid ${C.border}`,borderRadius:10,color:C.text,
  padding:"9px 13px",fontSize:14,outline:"none",fontFamily:"inherit",
};
const lbl = {fontSize:12,color:C.muted,marginBottom:5,display:"block",letterSpacing:".4px"};
const btnP = {
  fontFamily:"inherit",cursor:"pointer",
  background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
  color:"#fff",border:"none",borderRadius:12,padding:"10px 18px",fontWeight:600,fontSize:14,
};
const btnG = {
  fontFamily:"inherit",cursor:"pointer",background:C.surface,color:C.muted,
  border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 18px",fontWeight:500,fontSize:14,
};
const btnD = {
  fontFamily:"inherit",cursor:"pointer",background:"#FDF0EE",color:C.red,
  border:`1px solid ${C.red}44`,borderRadius:12,padding:"10px 18px",fontWeight:500,fontSize:14,
};

// ══════════════════════════════════════
// API 呼叫
// ══════════════════════════════════════
const api = {
  getBookings: () => fetch("/api/bookings").then(r => r.json()),
  createBooking: (b) => fetch("/api/bookings", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(b) }).then(r => r.json()),
  updateBooking: (b) => fetch("/api/bookings", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(b) }).then(r => r.json()),
  deleteBooking: (id) => fetch("/api/bookings", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) }).then(r => r.json()),
  getVisitForms: () => fetch("/api/visit-forms").then(r => r.json()),
  saveVisitForm: (f) => f.id
    ? fetch("/api/visit-forms", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) }).then(r => r.json())
    : fetch("/api/visit-forms", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(f) }).then(r => r.json()),
};

// ══════════════════════════════════════
// Modal & Toast & Confirm
// ══════════════════════════════════════
function Modal({open,onClose,children,wide}){
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(74,55,40,.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:20,padding:28,width:"100%",maxWidth:wide?700:540,maxHeight:"93vh",overflowY:"auto",border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(74,55,40,.2)"}}>{children}</div>
    </div>
  );
}

function Toast({message,show,error}){
  if(!show) return null;
  return (
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:3000,background:error?C.red:C.green,color:"#fff",borderRadius:12,padding:"10px 22px",fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,.2)",fontFamily:"inherit",whiteSpace:"nowrap"}}>
      {error?"❌":"✅"} {message}
    </div>
  );
}

function ConfirmDialog({open,message,onConfirm,onCancel}){
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(74,55,40,.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.card,borderRadius:20,padding:28,width:"100%",maxWidth:360,border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(74,55,40,.25)",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,color:C.text,marginBottom:20,lineHeight:1.6}}>{message}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onConfirm} style={{...btnD,flex:1}}>確定刪除</button>
          <button onClick={onCancel} style={{...btnG,flex:1}}>取消</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// DatePicker 多選
// ══════════════════════════════════════
function DatePicker({selected,onChange}){
  const [viewMo,setViewMo]=useState(new Date());
  const yr=viewMo.getFullYear(), mo=viewMo.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const days=new Date(yr,mo+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  while(cells.length%7) cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const toggle=d=>{const s=ds(d);onChange(selected.includes(s)?selected.filter(x=>x!==s):[...selected,s].sort());};
  return (
    <div style={{background:C.surface,borderRadius:12,padding:12,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button type="button" onClick={()=>setViewMo(new Date(yr,mo-1,1))} style={{...btnG,padding:"3px 10px",fontSize:14}}>‹</button>
        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{yr}/{mo+1}</span>
        <button type="button" onClick={()=>setViewMo(new Date(yr,mo+1,1))} style={{...btnG,padding:"3px 10px",fontSize:14}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {WEEKDAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:10,color:i===0?C.holiday:C.dim}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const s=ds(d),isSel=selected.includes(s),h=TW_HOLIDAYS[s];
          return <div key={i} onClick={()=>toggle(d)} style={{height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11.5,background:isSel?C.accent:h?"#FEF0EE":"transparent",color:isSel?"#fff":h?C.holiday:C.text,border:isSel?`1px solid ${C.accent}`:`1px solid transparent`}}>{d}</div>;
        })}
      </div>
      {selected.length>0&&<div style={{marginTop:8,fontSize:12,color:C.muted}}>已選：{selected.map(d=>d.slice(5).replace("-","/")).join("、")}</div>}
    </div>
  );
}

// ══════════════════════════════════════
// BookingForm
// ══════════════════════════════════════
function BookingForm({initial,onSave,onCancel,loading}){
  const blank={pets:[{name:"",type:"狗"}],ownerName:"",ownerPhone:"",dates:[],timeOfDay:"白天",appointmentTime:"",serviceType:"安親寄宿",duration:60,status:"pending",price:"",paid:false,notes:"",address:""};
  const [f,setF]=useState(initial?{...initial,pets:initial.pets||[{name:"",type:"狗"}]}:blank);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setPet=(i,k,v)=>setF(p=>{const pets=[...p.pets];pets[i]={...pets[i],[k]:v};return{...p,pets};});
  const addPet=()=>setF(p=>({...p,pets:[...p.pets,{name:"",type:"狗"}]}));
  const removePet=i=>setF(p=>({...p,pets:p.pets.filter((_,idx)=>idx!==i)}));
  const field=(l,el,full)=>(<div style={full?{gridColumn:"1/-1"}:{}}><label style={lbl}>{l}</label>{el}</div>);
  return (
    <div>
      <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",marginBottom:22,fontSize:19}}>{initial?"✏️ 編輯預約":"➕ 新增預約"}</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {field("飼主姓名 *",<input style={inp} value={f.ownerName} onChange={e=>set("ownerName",e.target.value)} placeholder="例：王小明"/>)}
        {field("飼主電話",<input style={inp} value={f.ownerPhone} onChange={e=>set("ownerPhone",e.target.value)} placeholder="0912-345-678"/>)}
        <div style={{gridColumn:"1/-1"}}>
          <label style={lbl}>🐾 寵物資訊 *</label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {f.pets.map((pet,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                <input style={{...inp,flex:2}} value={pet.name} onChange={e=>setPet(i,"name",e.target.value)} placeholder={`寵物${i+1}名稱`}/>
                <select style={{...inp,flex:1}} value={pet.type} onChange={e=>setPet(i,"type",e.target.value)}>{PET_TYPES.map(t=><option key={t}>{t}</option>)}</select>
                {f.pets.length>1&&<button type="button" onClick={()=>removePet(i)} style={{...btnD,padding:"9px 12px",fontSize:13,flexShrink:0}}>✕</button>}
              </div>
            ))}
            <button type="button" onClick={addPet} style={{...btnG,padding:"7px 14px",fontSize:13,alignSelf:"flex-start"}}>+ 新增寵物</button>
          </div>
        </div>
        {field("服務日期 * （可多選）",<DatePicker selected={f.dates} onChange={v=>set("dates",v)}/>,true)}
        {field("時段",<select style={{...inp,height:40,padding:"0 13px"}} value={f.timeOfDay} onChange={e=>set("timeOfDay",e.target.value)}>{TIME_OF_DAY.map(t=><option key={t}>{t}</option>)}</select>)}
        {field("指定服務時間",<input style={{...inp,height:40,padding:"0 13px"}} type="time" value={f.appointmentTime} onChange={e=>set("appointmentTime",e.target.value)}/>)}
        {field("服務類型",<select style={inp} value={f.serviceType} onChange={e=>set("serviceType",e.target.value)}>{SERVICE_TYPES.map(t=><option key={t}>{t}</option>)}</select>)}
        {field("時長（分鐘）",<input style={inp} type="number" value={f.duration} onChange={e=>set("duration",+e.target.value)}/>)}
        {field("服務金額（元）",<input style={inp} type="number" value={f.price} onChange={e=>set("price",+e.target.value)} placeholder="例：1500"/>)}
        {field("付款狀態",<div style={{display:"flex",gap:8,marginTop:2}}>{[{v:false,l:"⏳ 未付款"},{v:true,l:"✅ 已付款"}].map(opt=><button key={String(opt.v)} type="button" onClick={()=>set("paid",opt.v)} style={{fontFamily:"inherit",cursor:"pointer",flex:1,padding:"9px 0",fontSize:13,fontWeight:600,borderRadius:10,border:`1px solid ${f.paid===opt.v?C.accent:C.border}`,background:f.paid===opt.v?`${C.accent}18`:C.surface,color:f.paid===opt.v?C.accent:C.muted}}>{opt.l}</button>)}</div>)}
        {field("預約狀態",<select style={inp} value={f.status} onChange={e=>set("status",e.target.value)}>{Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>)}
        {field("服務地址",<input style={inp} value={f.address} onChange={e=>set("address",e.target.value)} placeholder="台北市..."/>)}
        {field("備註",<textarea style={{...inp,minHeight:80,resize:"vertical"}} value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="飲食習慣、特殊行為、藥物需求..."/>,true)}
      </div>
      <div style={{display:"flex",gap:10,marginTop:22}}>
        <button onClick={()=>{
          if(!f.ownerName||f.dates.length===0||!f.pets[0]?.name){alert("請填飼主姓名、至少一隻寵物名稱，並選擇日期");return;}
          const title=`${f.pets.map(p=>p.name).join("＆")} — ${f.serviceType}`;
          onSave({...f,title});
        }} style={{...btnP,flex:1}} disabled={loading}>{loading?"⏳ 儲存中...":"💾 儲存"}</button>
        <button onClick={onCancel} style={{...btnG,flex:1}} disabled={loading}>取消</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 月曆
// ══════════════════════════════════════
function Calendar({bookings,onSelectDate,selectedDate}){
  const [view,setView]=useState(new Date());
  const yr=view.getFullYear(),mo=view.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const days=new Date(yr,mo+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  while(cells.length%7) cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today=new Date().toISOString().slice(0,10);
  return (
    <div style={cardSt}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button onClick={()=>setView(new Date(yr,mo-1,1))} style={{...btnG,padding:"6px 14px",fontSize:18}}>‹</button>
        <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:18,fontWeight:700,color:C.text}}>{yr} 年 {mo+1} 月</div>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} style={{...btnG,padding:"6px 14px",fontSize:18}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:5}}>
        {WEEKDAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,padding:"4px 0",color:i===0?C.holiday:i===6?C.orange:C.muted}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=ds(d),bs=bookings.filter(b=>(b.dates||[]).includes(dateStr)),h=TW_HOLIDAYS[dateStr];
          const isToday=dateStr===today,isSel=dateStr===selectedDate,dow=new Date(yr,mo,d).getDay();
          return (
            <div key={i} onClick={()=>onSelectDate(dateStr)} style={{minHeight:58,borderRadius:10,padding:"4px 5px",cursor:"pointer",background:isSel?`${C.accent}18`:h?C.holidayBg:isToday?`${C.accent2}10`:"transparent",border:isSel?`1.5px solid ${C.accent}`:isToday?`1px solid ${C.accent2}66`:`1px solid transparent`,transition:"all .13s"}}>
              <div style={{fontSize:13,fontWeight:isToday||isSel?700:400,lineHeight:1,marginBottom:2,color:h?C.holiday:isSel?C.accent:isToday?C.accent:dow===0?C.holiday:dow===6?C.orange:C.text}}>{d}</div>
              {h&&<div style={{fontSize:8.5,color:C.holiday,lineHeight:1.2,marginBottom:2}}>{h.n.slice(0,5)}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                {bs.slice(0,4).map(b=><div key={b.id} style={{width:6,height:6,borderRadius:"50%",background:STATUS_MAP[b.status]?.color||C.muted}}/>)}
                {bs.length>4&&<span style={{fontSize:8,color:C.dim}}>+{bs.length-4}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// BookingCard
// ══════════════════════════════════════
function BookingCard({booking,onClick}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  return (
    <div onClick={()=>onClick(booking)} style={{...cardSt,cursor:"pointer",padding:"16px 18px",borderLeft:`4px solid ${STATUS_MAP[booking.status]?.color||C.muted}`,transition:"box-shadow .15s,transform .15s"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(154,117,83,.18)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(154,117,83,.08)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:16,fontWeight:700,color:C.text,marginBottom:2}}>{petStr}</div>
          <div style={{fontSize:12,color:C.muted}}>{booking.ownerName} · {SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={pill(STATUS_MAP[booking.status]?.color||C.muted)}>{STATUS_MAP[booking.status]?.label||booking.status}</span>
          <span style={{fontSize:11.5,color:booking.paid?C.green:C.orange,fontWeight:600}}>{booking.price?`NT$${booking.price?.toLocaleString()} `:""}{booking.paid?"✅ 已付款":"⏳ 未付款"}</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:12.5,color:C.muted}}>
        <span>📅 {(booking.dates||[]).length>1?`${booking.dates[0]} 等${booking.dates.length}天`:booking.dates?.[0]||""}</span>
        <span>🌤 {booking.timeOfDay}{booking.appointmentTime?` ${booking.appointmentTime}`:""}</span>
      </div>
      {booking.notes&&<div style={{marginTop:10,padding:"8px 11px",background:C.surface,borderRadius:8,fontSize:12,color:C.muted,borderLeft:`2px solid ${C.soft}`}}>📝 {booking.notes.slice(0,70)}{booking.notes.length>70?"…":""}</div>}
    </div>
  );
}

// ══════════════════════════════════════
// DetailView
// ══════════════════════════════════════
function DetailView({booking,hasSavedForm,onClose,onEdit,onDelete,onVisitForm}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  const row=(l,v,color)=>v!=null&&v!==""?(<div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border}`,fontSize:13.5}}><span style={{color:C.muted}}>{l}</span><span style={{color:color||C.text,fontWeight:500,textAlign:"right",maxWidth:"65%"}}>{v}</span></div>):null;
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:36,marginBottom:6}}>{(booking.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
        <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:20,fontWeight:700,color:C.text}}>{petStr}</div>
        <div style={{fontSize:14,color:C.accent,marginTop:2}}>{SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        <div style={{marginTop:8,display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          <span style={pill(STATUS_MAP[booking.status]?.color||C.muted)}>{STATUS_MAP[booking.status]?.label}</span>
          <span style={pill(booking.paid?C.green:C.orange)}>{booking.paid?"✅ 已付款":"⏳ 未付款"}</span>
        </div>
      </div>
      {row("飼主",booking.ownerName)}
      {row("聯絡電話",booking.ownerPhone)}
      {row("服務日期",(booking.dates||[]).join("、"))}
      {row("時段",`${booking.timeOfDay}${booking.appointmentTime?` ${booking.appointmentTime}`:""}`)}
      {row("服務時長",`${booking.duration} 分鐘`)}
      {row("服務金額",booking.price?`NT$ ${booking.price?.toLocaleString()}`:null)}
      {row("地址",booking.address)}
      {booking.notes&&<div style={{marginTop:14,padding:"12px 14px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`}}><div style={{fontSize:11,color:C.accent,marginBottom:5}}>📝 注意事項</div><div style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>{booking.notes}</div></div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:20}}>
        <button onClick={onVisitForm} style={{...btnP,gridColumn:"1/-1"}}>📋 {hasSavedForm?"查看家訪表 ✓":"填寫家訪表"}</button>
        <button onClick={onEdit} style={btnG}>✏️ 編輯</button>
        <button onClick={onDelete} style={btnD}>🗑 刪除</button>
      </div>
      <button onClick={onClose} style={{...btnG,width:"100%",marginTop:8}}>關閉</button>
    </div>
  );
}

// ══════════════════════════════════════
// VisitForm（簡化版）
// ══════════════════════════════════════
function VisitForm({booking,savedData,onSave,onClose,loading}){
  const [form,setForm]=useState(savedData||{});
  const [editing,setEditing]=useState(!savedData||Object.keys(savedData).filter(k=>k!=="id").length===0);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fields=[
    {key:"vaccine",label:"是否定期施打疫苗及驅蟲？"},
    {key:"neutered",label:"是否結紮？"},
    {key:"withPets",label:"是否可與其他寵物相處？"},
    {key:"snack",label:"食物過敏 / 可吃零食嗎？"},
    {key:"mealHabit",label:"用餐習慣？（飼料/罐罐/幾餐）"},
    {key:"personality",label:"毛孩個性描述"},
    {key:"health",label:"健康狀況 / 需服藥"},
    {key:"anxiety",label:"是否有分離焦慮？"},
    {key:"aggressive",label:"是否有攻擊性？"},
    {key:"special",label:"特殊注意事項",type:"textarea"},
    {key:"vet",label:"常去的動物醫院"},
    {key:"contact",label:"緊急聯絡人資訊",type:"textarea"},
    {key:"keyHandover",label:"鑰匙交付方式"},
  ];
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:19,margin:"0 0 4px"}}>📋 家訪表</h2>
          <div style={{color:C.muted,fontSize:13}}>{(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・")} · {booking.ownerName}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {!editing&&<button onClick={()=>setEditing(true)} style={{...btnG,padding:"7px 14px",fontSize:13}}>✏️ 編輯</button>}
          <button onClick={onClose} style={{...btnG,padding:"7px 12px"}}>✕</button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {fields.map(fld=>(
          <div key={fld.key}>
            <label style={{...lbl,fontSize:12}}>{fld.label}</label>
            {editing
              ? fld.type==="textarea"
                ? <textarea style={{...inp,minHeight:60,resize:"vertical"}} value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)}/>
                : <input style={inp} value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)}/>
              : <div style={{padding:"9px 13px",background:C.surface,borderRadius:10,fontSize:14,color:form[fld.key]?C.text:C.dim,border:`1px solid ${C.border}`,minHeight:38}}>{form[fld.key]||"（未填寫）"}</div>
            }
          </div>
        ))}
      </div>
      {editing&&(
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onSave({
            ...form,
            id: savedData?.id,
            title:`${(booking.pets||[]).map(p=>p.name).join("＆")} 家訪表`,
            飼主姓名: booking.ownerName,
            飼主電話: booking.ownerPhone,
            寵物名稱: (booking.pets||[]).map(p=>p.name).join("、"),
            寵物種類: booking.pets?.[0]?.type||"其他",
            服務類型: booking.serviceType,
            bookingId: booking.id,
          })} style={{...btnP,flex:1}} disabled={loading}>{loading?"⏳ 儲存中...":"💾 儲存到 Notion"}</button>
          {savedData?.id&&<button onClick={()=>setEditing(false)} style={btnG}>取消</button>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// App
// ══════════════════════════════════════
export default function App(){
  const [bookings,setBookings]=useState([]);
  const [visitForms,setVisitForms]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("calendar");
  const [statusFilter,setStatusFilter]=useState("all");
  const [selectedDate,setSelectedDate]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [viewTarget,setViewTarget]=useState(null);
  const [visitTarget,setVisitTarget]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [search,setSearch]=useState("");
  const [toast,setToast]=useState({show:false,msg:"",error:false});

  const showToast=(msg,error=false)=>{setToast({show:true,msg,error});setTimeout(()=>setToast({show:false,msg:"",error:false}),3000);};

  // 初始載入
  useEffect(()=>{
    Promise.all([api.getBookings(), api.getVisitForms()])
      .then(([bs,vfs])=>{
        setBookings(Array.isArray(bs)?bs:[]);
        const vfMap={};
        (Array.isArray(vfs)?vfs:[]).forEach(vf=>{if(vf.bookingId) vfMap[vf.bookingId]=vf;});
        setVisitForms(vfMap);
      })
      .catch(()=>showToast("載入資料失敗，請重新整理",true))
      .finally(()=>setLoading(false));
  },[]);

  const saveBooking=async(f)=>{
    setSaving(true);
    try{
      if(editTarget){
        const updated=await api.updateBooking({...f,id:editTarget.id});
        setBookings(bs=>bs.map(b=>b.id===editTarget.id?updated:b));
        showToast("預約已更新！");
      } else {
        const created=await api.createBooking(f);
        setBookings(bs=>[created,...bs]);
        showToast("預約已新增！");
      }
      setShowForm(false);setEditTarget(null);setViewTarget(null);
    } catch{showToast("儲存失敗，請再試一次",true);}
    finally{setSaving(false);}
  };

  const doDelete=async()=>{
    setSaving(true);
    try{
      await api.deleteBooking(confirmDelete.id);
      setBookings(bs=>bs.filter(b=>b.id!==confirmDelete.id));
      showToast("預約已刪除");
    } catch{showToast("刪除失敗",true);}
    finally{setSaving(false);setConfirmDelete(null);}
  };

  const saveVisitForm=async(formData)=>{
    setSaving(true);
    try{
      const saved=await api.saveVisitForm(formData);
      if(formData.bookingId) setVisitForms(p=>({...p,[formData.bookingId]:saved}));
      showToast("家訪表已儲存到 Notion！");
      setVisitTarget(null);
    } catch{showToast("家訪表儲存失敗",true);}
    finally{setSaving(false);}
  };

  const today=new Date().toISOString().slice(0,10);
  const dayBookings=selectedDate?bookings.filter(b=>(b.dates||[]).includes(selectedDate)):[];
  const listBookings=bookings
    .filter(b=>statusFilter==="all"||b.status===statusFilter)
    .filter(b=>!search||b.pets?.some(p=>p.name.includes(search))||b.ownerName?.includes(search))
    .sort((a,b)=>(a.dates?.[0]||"").localeCompare(b.dates?.[0]||""));

  const completedIncome=bookings.filter(b=>b.status==="completed"&&b.paid&&b.price).reduce((s,b)=>s+(b.price||0),0);

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Noto Sans TC','PingFang TC',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`select option{background:#FDF8F2;color:#4A3728;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:${C.soft};border-radius:3px;}*{-webkit-tap-highlight-color:transparent;}input[type=date],input[type=time]{color-scheme:light;}`}</style>

      <Toast message={toast.msg} show={toast.show} error={toast.error}/>
      <ConfirmDialog open={!!confirmDelete} message={`確定要刪除「${confirmDelete?.pets?.[0]?.name||""}」的預約嗎？`} onConfirm={doDelete} onCancel={()=>setConfirmDelete(null)}/>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 18px 0"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:22}}>🐾</span>
                <span style={{fontFamily:"'Noto Serif TC',serif",fontSize:20,fontWeight:700,color:C.text}}>寵物保姆管理系統</span>
              </div>
              <div style={{fontSize:11,color:C.dim,marginLeft:30}}>資料即時同步至 Notion 🌿</div>
            </div>
            {loading&&<div style={{fontSize:13,color:C.dim}}>⏳ 載入中...</div>}
          </div>

          {/* Stats */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[
              {label:"總預約",val:bookings.length,c:C.accent},
              {label:"今日服務",val:bookings.filter(b=>(b.dates||[]).includes(today)).length,c:C.green},
              {label:"待確認",val:bookings.filter(b=>b.status==="pending").length,c:C.orange},
              {label:"完成收入",val:`$${completedIncome.toLocaleString()}`,c:C.green},
            ].map(s=>(
              <div key={s.label} style={{flex:1,textAlign:"center",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 4px",boxShadow:"0 1px 6px rgba(154,117,83,.07)"}}>
                <div style={{fontSize:String(s.val).length>5?13:22,fontWeight:700,color:s.c,lineHeight:1.2}}>{s.val}</div>
                <div style={{fontSize:10.5,color:C.dim,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:4}}>
            {[{id:"calendar",label:"📅 月曆"},{id:"list",label:"📋 預約清單"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontFamily:"inherit",cursor:"pointer",border:`1px solid ${tab===t.id?C.border2:"transparent"}`,borderBottom:tab===t.id?`1px solid ${C.card}`:`1px solid transparent`,borderRadius:"10px 10px 0 0",padding:"8px 18px",fontWeight:tab===t.id?700:400,fontSize:13,background:tab===t.id?C.card:"transparent",color:tab===t.id?C.accent:C.muted,marginBottom:tab===t.id?-1:0}}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"18px 14px 48px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}>
            <div style={{fontSize:44,marginBottom:10}}>🐾</div>
            <div>從 Notion 載入資料中...</div>
          </div>
        ):tab==="calendar"?(
          <div>
            <Calendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
            {selectedDate&&(
              <div style={{marginTop:14,...cardSt}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <span style={{fontWeight:700,color:C.text,fontSize:15}}>{selectedDate.slice(5).replace("-","/")} 的預約
                    <span style={{...pill(C.accent),marginLeft:8}}>{dayBookings.length} 筆</span>
                  </span>
                  <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,padding:"7px 14px",fontSize:13}}>+ 新增</button>
                </div>
                {dayBookings.length===0
                  ?<div style={{textAlign:"center",padding:"28px 0",color:C.dim,fontSize:14}}>當日無預約 🌙</div>
                  :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {dayBookings.sort((a,b)=>(a.appointmentTime||"").localeCompare(b.appointmentTime||"")).map(b=>(
                      <div key={b.id} onClick={()=>setViewTarget(b)} style={{display:"flex",gap:12,alignItems:"center",background:C.surface,borderRadius:12,padding:"11px 14px",cursor:"pointer",border:`1px solid ${C.border}`,borderLeft:`3px solid ${STATUS_MAP[b.status]?.color||C.muted}`}}>
                        <div style={{fontSize:22}}>{(b.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,color:C.text,fontSize:14}}>{(b.pets||[]).map(p=>p.name).join("・")}</div>
                          <div style={{fontSize:12,color:C.muted}}>{b.ownerName} · {SERVICE_ICONS[b.serviceType]} {b.serviceType}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.accent}}>{b.timeOfDay}</div>
                          {b.appointmentTime&&<div style={{fontSize:12,color:C.accent2}}>{b.appointmentTime}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}
            {!selectedDate&&<div style={{textAlign:"center",marginTop:14,color:C.dim,fontSize:13}}>點選日期查看當日預約 📅</div>}
          </div>
        ):(
          <div>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
              {[{key:"all",label:"全部",count:bookings.length},{key:"pending",label:"待確認",count:bookings.filter(b=>b.status==="pending").length},{key:"confirmed",label:"已確認",count:bookings.filter(b=>b.status==="confirmed").length},{key:"completed",label:"已完成",count:bookings.filter(b=>b.status==="completed").length},{key:"cancelled",label:"已取消",count:bookings.filter(b=>b.status==="cancelled").length}].map(t=>(
                <button key={t.key} onClick={()=>setStatusFilter(t.key)} style={{fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",background:statusFilter===t.key?`linear-gradient(135deg,${C.accent},${C.accent2})`:C.card,color:statusFilter===t.key?"#fff":C.muted,border:`1px solid ${statusFilter===t.key?"transparent":C.border}`,borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:600,transition:"all .15s"}}>
                  {t.label} <span style={{marginLeft:5,background:"rgba(255,255,255,.25)",borderRadius:10,padding:"1px 6px",fontSize:11}}>{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 搜尋寵物或飼主名稱..." style={{...inp,flex:1}}/>
              <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,whiteSpace:"nowrap"}}>+ 新增</button>
            </div>
            {listBookings.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}><div style={{fontSize:44,marginBottom:10}}>🐾</div><div>沒有符合的預約</div></div>
              :<div style={{display:"flex",flexDirection:"column",gap:10}}>{listBookings.map(b=><BookingCard key={b.id} booking={b} onClick={setViewTarget}/>)}</div>
            }
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showForm} onClose={()=>{if(!saving){setShowForm(false);setEditTarget(null);}}}>
        <BookingForm initial={editTarget} onSave={saveBooking} onCancel={()=>{setShowForm(false);setEditTarget(null);}} loading={saving}/>
      </Modal>
      <Modal open={!!viewTarget&&!showForm&&!visitTarget} onClose={()=>setViewTarget(null)}>
        {viewTarget&&<DetailView booking={viewTarget} hasSavedForm={!!visitForms[viewTarget.id]} onClose={()=>setViewTarget(null)} onEdit={()=>{setEditTarget(viewTarget);setShowForm(true);}} onDelete={()=>{setViewTarget(null);setConfirmDelete(viewTarget);}} onVisitForm={()=>setVisitTarget(viewTarget)}/>}
      </Modal>
      <Modal open={!!visitTarget} onClose={()=>{if(!saving)setVisitTarget(null);}} wide>
        {visitTarget&&<VisitForm booking={visitTarget} savedData={visitForms[visitTarget.id]||null} onSave={saveVisitForm} onClose={()=>setVisitTarget(null)} loading={saving}/>}
      </Modal>
    </div>
  );
}
