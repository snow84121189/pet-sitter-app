import { useState, useRef } from "react";

// ══════════════════════════════════════
// 台灣 2026 國定假日
// ══════════════════════════════════════
const TW_HOLIDAYS = {
  "2026-01-01":{n:"元旦"},"2026-02-14":{n:"春節連假"},"2026-02-15":{n:"小年夜"},
  "2026-02-16":{n:"除夕"},"2026-02-17":{n:"初一"},"2026-02-18":{n:"初二"},
  "2026-02-19":{n:"初三"},"2026-02-20":{n:"春節補假"},"2026-02-21":{n:"春節假期"},
  "2026-02-22":{n:"春節假期"},"2026-02-27":{n:"228連假"},"2026-02-28":{n:"228紀念日"},
  "2026-03-01":{n:"228連假"},"2026-04-03":{n:"兒童節補假"},"2026-04-04":{n:"兒童節"},
  "2026-04-05":{n:"清明節"},"2026-04-06":{n:"清明補假"},"2026-05-01":{n:"勞動節"},
  "2026-05-02":{n:"勞動節連假"},"2026-05-03":{n:"勞動節連假"},"2026-06-19":{n:"端午節"},
  "2026-06-20":{n:"端午連假"},"2026-06-21":{n:"端午連假"},"2026-09-25":{n:"中秋節"},
  "2026-09-26":{n:"中秋連假"},"2026-09-27":{n:"中秋連假"},"2026-09-28":{n:"教師節"},
  "2026-10-09":{n:"國慶連假"},"2026-10-10":{n:"國慶日"},"2026-10-11":{n:"國慶連假"},
  "2026-10-25":{n:"台灣光復節"},"2026-10-26":{n:"光復節補假"},
  "2026-12-25":{n:"行憲紀念日"},"2026-12-26":{n:"行憲連假"},"2026-12-27":{n:"行憲連假"},
};

// ══════════════════════════════════════
// 台北e大課程
// ══════════════════════════════════════
const ETAIPEI = "https://elearning.taipei/mpage/";
const COURSES = [
  {title:"旺喵星人是家中好成員",tag:"🐕🐈 綜合",desc:"了解貓狗情緒、如何親近互動、照顧準備事項",url:ETAIPEI},
  {title:"快樂狗兒的身心健康教養法",tag:"🐕 狗狗",desc:"狗兒身心需求、獎勵教學、日常互動管理",url:ETAIPEI},
  {title:"安排狗狗戶外活動",tag:"🐕 狗狗",desc:"戶外活動規劃、社交化、運動需求滿足方法",url:ETAIPEI},
  {title:"如何與狗狗快樂玩玩具",tag:"🐕 狗狗",desc:"玩具選擇與互動技巧，強化人狗信任關係",url:ETAIPEI},
  {title:"狗狗互動管理",tag:"🐕 狗狗",desc:"讀懂狗狗肢體語言、解決行為問題的方法",url:ETAIPEI},
  {title:"如何教養完美喵星人",tag:"🐈 貓咪",desc:"林子軒獸醫師主講，貓咪特性與玩具、貓砂介紹",url:ETAIPEI},
  {title:"貓蘿紀：尋找真命天貓",tag:"🐈 貓咪",desc:"貓咪基本個性介紹，學習與貓星人愉快相處",url:ETAIPEI},
  {title:"寵物行為糾正",tag:"🐕🐈 綜合",desc:"常見不良行為成因分析與科學正確糾正方法",url:ETAIPEI},
  {title:"特殊寵物照護（鼠兔鳥）",tag:"🐇🐦 特殊",desc:"不萊梅&亞馬森特寵獸醫師主講，特殊寵物飼養密技",url:ETAIPEI},
];

// ══════════════════════════════════════
// 常數
// ══════════════════════════════════════
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

const BLANK_PET = {name:"",type:"狗"};

const INITIAL_BOOKINGS = [
  {id:1,pets:[{name:"球球",type:"狗"}],ownerName:"王小明",ownerPhone:"0912-345-678",
   dates:["2026-03-28","2026-03-29"],timeOfDay:"白天",appointmentTime:"10:00",
   serviceType:"安親寄宿",duration:1440,status:"completed",price:2000,paid:true,
   address:"台北市大安區仁愛路三段100號",notes:"球球怕陌生人，請先蹲下讓牠聞手。"},
  {id:2,pets:[{name:"咪咪",type:"貓"}],ownerName:"李美玲",ownerPhone:"0923-456-789",
   dates:["2026-03-29"],timeOfDay:"白天",appointmentTime:"14:30",
   serviceType:"到府照顧",duration:60,status:"pending",price:500,paid:false,
   address:"台北市信義區松仁路200號",notes:"咪咪只吃濕食，冰箱內有準備。"},
  {id:3,pets:[{name:"豆豆",type:"狗"},{name:"花花",type:"貓"}],ownerName:"張大華",ownerPhone:"0934-567-890",
   dates:["2026-03-25"],timeOfDay:"早上",appointmentTime:"09:00",
   serviceType:"陪伴散步",duration:45,status:"confirmed",price:800,paid:true,
   address:"台北市中山區民生東路一段5號",notes:"豆豆需要牽繩，不可放繩。"},
];

// ══════════════════════════════════════
// 色彩（溫柔奶茶）
// ══════════════════════════════════════
const C = {
  bg:"#FAF6F0",surface:"#F5EFE6",card:"#FFFFFF",card2:"#FDF8F2",
  border:"#E8DDD0",border2:"#D4C4B0",
  accent:"#9B7553",accent2:"#C19A6B",soft:"#E8D5BC",
  text:"#4A3728",muted:"#8B7355",dim:"#B8A898",
  green:"#7A9E7E",orange:"#C8845A",red:"#B07878",
  holiday:"#C96A60",holidayBg:"#FEF2F0",
};

// ══════════════════════════════════════
// 樣式工具
// ══════════════════════════════════════
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
// Modal
// ══════════════════════════════════════
function Modal({open,onClose,children,wide}){
  if(!open) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:1000,
      background:"rgba(74,55,40,.45)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:C.card,borderRadius:20,padding:28,
        width:"100%",maxWidth:wide?700:540,maxHeight:"93vh",overflowY:"auto",
        border:`1px solid ${C.border}`,boxShadow:"0 20px 60px rgba(74,55,40,.2)",
      }}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════
// 確認對話框
// ══════════════════════════════════════
function ConfirmDialog({open,message,onConfirm,onCancel}){
  if(!open) return null;
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:2000,
      background:"rgba(74,55,40,.5)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:24,
    }}>
      <div style={{
        background:C.card,borderRadius:20,padding:28,
        width:"100%",maxWidth:360,border:`1px solid ${C.border}`,
        boxShadow:"0 20px 60px rgba(74,55,40,.25)",textAlign:"center",
      }}>
        <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,color:C.text,marginBottom:20,lineHeight:1.6}}>{message}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onConfirm} style={{...btnD,flex:1,fontSize:14}}>確定刪除</button>
          <button onClick={onCancel} style={{...btnG,flex:1,fontSize:14}}>取消</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Toast 提示
// ══════════════════════════════════════
function Toast({message,show}){
  if(!show) return null;
  return (
    <div style={{
      position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:3000,
      background:C.green,color:"#fff",borderRadius:12,padding:"10px 22px",
      fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,.2)",
      fontFamily:"inherit",whiteSpace:"nowrap",
    }}>
      ✅ {message}
    </div>
  );
}

// ══════════════════════════════════════
// 月曆
// ══════════════════════════════════════
function Calendar({bookings,onSelectDate,selectedDate}){
  const [view,setView]=useState(new Date());
  const yr=view.getFullYear(), mo=view.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const days=new Date(yr,mo+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  while(cells.length%7) cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const booksOn=d=>d?bookings.filter(b=>(b.dates||[]).includes(ds(d))):[];
  const today=new Date().toISOString().slice(0,10);
  const holCount=Object.keys(TW_HOLIDAYS).filter(k=>k.startsWith(`${yr}-${String(mo+1).padStart(2,"0")}`)).length;

  return (
    <div style={cardSt}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button onClick={()=>setView(new Date(yr,mo-1,1))} style={{...btnG,padding:"6px 14px",fontSize:18}}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:18,fontWeight:700,color:C.text}}>{yr} 年 {mo+1} 月</div>
          {holCount>0&&<div style={{fontSize:11,color:C.dim,marginTop:1}}>🎉 本月有 {holCount} 個假日</div>}
        </div>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} style={{...btnG,padding:"6px 14px",fontSize:18}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:5}}>
        {WEEKDAYS.map((d,i)=>(
          <div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,padding:"4px 0",
            color:i===0?C.holiday:i===6?C.orange:C.muted}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=ds(d);
          const bs=booksOn(d);
          const h=TW_HOLIDAYS[dateStr];
          const isToday=dateStr===today, isSel=dateStr===selectedDate;
          const dow=new Date(yr,mo,d).getDay();
          return (
            <div key={i} onClick={()=>onSelectDate(dateStr)} style={{
              minHeight:58,borderRadius:10,padding:"4px 5px",cursor:"pointer",
              background:isSel?`${C.accent}18`:h?C.holidayBg:isToday?`${C.accent2}10`:"transparent",
              border:isSel?`1.5px solid ${C.accent}`:isToday?`1px solid ${C.accent2}66`:`1px solid transparent`,
              transition:"all .13s",
            }}>
              <div style={{fontSize:13,fontWeight:isToday||isSel?700:400,lineHeight:1,marginBottom:2,
                color:h?C.holiday:isSel?C.accent:isToday?C.accent:dow===0?C.holiday:dow===6?C.orange:C.text}}>
                {d}
              </div>
              {h&&<div style={{fontSize:8.5,color:C.holiday,lineHeight:1.2,marginBottom:2}}>{h.n.slice(0,5)}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                {bs.slice(0,4).map(b=>(
                  <div key={b.id} style={{width:6,height:6,borderRadius:"50%",background:STATUS_MAP[b.status].color}}/>
                ))}
                {bs.length>4&&<span style={{fontSize:8,color:C.dim}}>+{bs.length-4}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:C.muted}}>
          <div style={{width:10,height:10,borderRadius:2,background:C.holidayBg,border:`1px solid ${C.holiday}55`}}/>國定假日
        </div>
        {Object.entries(STATUS_MAP).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:C.muted}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:v.color}}/>{v.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 日期多選
// ══════════════════════════════════════
function DatePicker({selected,onChange}){
  const [viewMo,setViewMo]=useState(new Date());
  const yr=viewMo.getFullYear(), mo=viewMo.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const days=new Date(yr,mo+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  while(cells.length%7) cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const toggle=d=>{const s=ds(d); onChange(selected.includes(s)?selected.filter(x=>x!==s):[...selected,s].sort());};

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
          const dateStr=ds(d);
          const isSel=selected.includes(dateStr);
          const h=TW_HOLIDAYS[dateStr];
          return (
            <div key={i} onClick={()=>toggle(d)} style={{
              height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",fontSize:11.5,
              background:isSel?C.accent:h?"#FEF0EE":"transparent",
              color:isSel?"#fff":h?C.holiday:C.text,
              border:isSel?`1px solid ${C.accent}`:`1px solid transparent`,
            }}>{d}</div>
          );
        })}
      </div>
      {selected.length>0&&(
        <div style={{marginTop:8,fontSize:12,color:C.muted}}>
          已選：{selected.map(d=>d.slice(5).replace("-","/")).join("、")}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 預約表單（含多寵物、金額、付款）
// ══════════════════════════════════════
function BookingForm({initial,onSave,onCancel}){
  const blank={
    pets:[{name:"",type:"狗"}],ownerName:"",ownerPhone:"",
    dates:[],timeOfDay:"白天",appointmentTime:"",
    serviceType:"安親寄宿",duration:60,status:"pending",
    price:"",paid:false,notes:"",address:"",
  };
  const [f,setF]=useState(initial
    ? {...initial, pets: initial.pets||[{name:initial.petName||"",type:initial.petType||"狗"}]}
    : blank);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  // 多寵物
  const setPet=(i,k,v)=>setF(p=>{const pets=[...p.pets];pets[i]={...pets[i],[k]:v};return{...p,pets};});
  const addPet=()=>setF(p=>({...p,pets:[...p.pets,{name:"",type:"狗"}]}));
  const removePet=i=>setF(p=>({...p,pets:p.pets.filter((_,idx)=>idx!==i)}));

  const field=(l,el,full)=>(
    <div style={full?{gridColumn:"1/-1"}:{}}><label style={lbl}>{l}</label>{el}</div>
  );

  return (
    <div>
      <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",marginBottom:22,fontSize:19}}>
        {initial?"✏️ 編輯預約":"➕ 新增預約"}
      </h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

        {/* 飼主資訊 */}
        {field("飼主姓名 *",<input style={inp} value={f.ownerName} onChange={e=>set("ownerName",e.target.value)} placeholder="例：王小明"/>)}
        {field("飼主電話",<input style={inp} value={f.ownerPhone} onChange={e=>set("ownerPhone",e.target.value)} placeholder="0912-345-678"/>)}

        {/* 寵物（多寵） */}
        <div style={{gridColumn:"1/-1"}}>
          <label style={lbl}>🐾 寵物資訊 *</label>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {f.pets.map((pet,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                <input style={{...inp,flex:2}} value={pet.name}
                  onChange={e=>setPet(i,"name",e.target.value)} placeholder={`寵物${i+1}名稱`}/>
                <select style={{...inp,flex:1}} value={pet.type} onChange={e=>setPet(i,"type",e.target.value)}>
                  {PET_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                {f.pets.length>1&&(
                  <button type="button" onClick={()=>removePet(i)}
                    style={{...btnD,padding:"9px 12px",fontSize:13,flexShrink:0}}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPet}
              style={{...btnG,padding:"7px 14px",fontSize:13,alignSelf:"flex-start"}}>
              + 新增寵物
            </button>
          </div>
        </div>

        {/* 日期 */}
        {field("服務日期 * （可多選）",<DatePicker selected={f.dates} onChange={v=>set("dates",v)}/>,true)}

        {/* 時段 & 時間 */}
        {field("時段",<select style={{...inp, height:40, padding:"0 13px"}} value={f.timeOfDay} onChange={e=>set("timeOfDay",e.target.value)}>
          {TIME_OF_DAY.map(t=><option key={t}>{t}</option>)}
        </select>)}
        {field("指定服務時間",<input style={{...inp, height:40, padding:"0 13px"}} type="time" value={f.appointmentTime} onChange={e=>set("appointmentTime",e.target.value)}/>)}

        {/* 服務類型 & 時長 */}
        {field("服務類型",<select style={inp} value={f.serviceType} onChange={e=>set("serviceType",e.target.value)}>
          {SERVICE_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>)}
        {field("時長（分鐘）",<input style={inp} type="number" value={f.duration} onChange={e=>set("duration",+e.target.value)}/>)}

        {/* 金額 & 付款 */}
        {field("服務金額（元）",<input style={inp} type="number" value={f.price} onChange={e=>set("price",+e.target.value)} placeholder="例：1500"/>)}
        {field("付款狀態",
          <div style={{display:"flex",gap:8,marginTop:2}}>
            {[{v:false,l:"未付款"},{v:true,l:"已付款"}].map(opt=>(
              <button key={String(opt.v)} type="button" onClick={()=>set("paid",opt.v)} style={{
                fontFamily:"inherit",cursor:"pointer",flex:1,padding:"9px 0",fontSize:13,fontWeight:600,
                borderRadius:10,border:`1px solid ${f.paid===opt.v?C.accent:C.border}`,
                background:f.paid===opt.v?`${C.accent}18`:C.surface,
                color:f.paid===opt.v?C.accent:C.muted,
              }}>{opt.v?"✅ 已付款":"⏳ 未付款"}</button>
            ))}
          </div>
        )}

        {/* 狀態 & 地址 */}
        {field("預約狀態",<select style={inp} value={f.status} onChange={e=>set("status",e.target.value)}>
          {Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>)}
        {field("服務地址",<input style={inp} value={f.address} onChange={e=>set("address",e.target.value)} placeholder="台北市..."/>)}

        {/* 備註 */}
        {field("備註 / 注意事項",
          <textarea style={{...inp,minHeight:80,resize:"vertical"}}
            value={f.notes} onChange={e=>set("notes",e.target.value)}
            placeholder="飲食習慣、特殊行為、藥物需求..."/>,true
        )}
      </div>

      <div style={{display:"flex",gap:10,marginTop:22}}>
        <button onClick={()=>{
          if(!f.ownerName||f.dates.length===0||!f.pets[0]?.name){
            alert("請填飼主姓名、至少一隻寵物名稱，並選擇日期");return;
          }
          onSave(f);
        }} style={{...btnP,flex:1}}>💾 儲存</button>
        <button onClick={onCancel} style={{...btnG,flex:1}}>取消</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 家訪表定義
// ══════════════════════════════════════
const VISIT_FORMS = {
  "安親寄宿":[
    {title:"🐾 基本健康資訊",fields:[
      {key:"vaccine",label:"是否有定期施打疫苗及使用驅蟲藥？"},
      {key:"neutered",label:"是否結紮？"},
      {key:"withPets",label:"是否可與其他寵物相處？（家訪時會實際評估）"},
      {key:"withKids",label:"是否有跟小孩相處的經驗？"},
      {key:"snack",label:"是否可以吃零食？有食物過敏？"},
      {key:"mealHabit",label:"用餐習慣？（飼料？飼料+罐罐？一天幾餐？）"},
      {key:"mealNote",label:"用餐時的情況？（愛吃不吃？吃很快需注意？）"},
    ]},
    {title:"🚗 外出行為",fields:[
      {key:"carReact",label:"對車輛的反應？是否曾吃過地上東西？"},
      {key:"dogReact",label:"對路邊狗狗的反應？"},
      {key:"streetReact",label:"對路邊東西的反應？"},
    ]},
    {title:"🌙 生活習慣",fields:[
      {key:"sleepHabit",label:"晚上睡覺的習慣？"},
      {key:"personality",label:"毛孩的個性？"},
      {key:"health",label:"健康狀況？（慢性病、需服藥等）"},
    ]},
    {title:"⚠️ 行為注意",fields:[
      {key:"aggressive",label:"是否有攻擊性？"},
      {key:"destructive",label:"是否有拆家的行為？"},
      {key:"anxiety",label:"是否有分離焦慮？"},
      {key:"special",label:"是否有其他特別需要注意的地方？",type:"textarea"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人資訊：",type:"textarea"},
    ]},
  ],
  "到府照顧":[
    {title:"📋 基本資訊",fields:[
      {key:"timeSlot",label:"有指定到府時段嗎？"},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人資訊：",type:"textarea"},
    ]},
    {title:"🐾 毛孩基本狀況",fields:[
      {key:"personality",label:"毛孩的個性？"},
      {key:"health",label:"健康狀況？（慢性病、需服藥等）"},
      {key:"snack",label:"是否可以吃零食？有食物過敏嗎？"},
      {key:"mealHabit",label:"用餐習慣？"},
      {key:"mealNote",label:"用餐情況？"},
    ]},
    {title:"🏠 家中環境",fields:[
      {key:"multiPet",label:"與家中其他毛孩的相處情形？",type:"textarea"},
      {key:"restArea",label:"毛孩指定的休息區域？"},
      {key:"cleanArea",label:"需要幫毛孩清理特定區域？"},
      {key:"catLitter",label:"（貓咪）貓砂是沖馬桶還是丟垃圾桶？"},
    ]},
    {title:"✨ 特殊需求",fields:[
      {key:"special",label:"特別需要注意的地方？",type:"textarea"},
      {key:"comfort",label:"特定安撫方式？"},
      {key:"extraService",label:"是否需要其他特殊服務？"},
    ]},
    {title:"🔑 安全與交接",fields:[
      {key:"keyHandover",label:"鑰匙如何交付比較方便？"},
      {key:"camera",label:"需要租借寵物攝影機嗎？"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"insurance",label:"是否有寵物保險？",type:"textarea"},
    ]},
  ],
  "陪伴散步":[
    {title:"📋 基本資訊",fields:[
      {key:"timeSlot",label:"有指定散步時段嗎？"},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人：",type:"textarea"},
    ]},
    {title:"🐾 毛孩基本狀況",fields:[
      {key:"personality",label:"毛孩的個性？"},
      {key:"health",label:"健康狀況？"},
      {key:"snack",label:"是否可以吃零食？有食物過敏嗎？"},
      {key:"mealHabit",label:"用餐習慣？"},
      {key:"mealNote",label:"用餐情況？"},
    ]},
    {title:"🦮 出門相關資訊",fields:[
      {key:"dogReact",label:"對陌生狗狗的反應？"},
      {key:"humanReact",label:"對陌生人的反應？小孩？"},
      {key:"carReact",label:"對行進車輛的反應？"},
      {key:"walkRoute",label:"指定遛狗路線？"},
      {key:"walkSpec",label:"散步時的特殊要求？"},
      {key:"special",label:"特別需要注意的地方？",type:"textarea"},
      {key:"comfort",label:"特定安撫方式？"},
      {key:"multiPet",label:"（多寵）與家中其他毛孩的相處情形？"},
    ]},
    {title:"🔑 安全與交接",fields:[
      {key:"keyHandover",label:"鑰匙如何交付比較方便？"},
      {key:"camera",label:"需要租借寵物攝影機嗎？"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"insurance",label:"是否有寵物保險？",type:"textarea"},
    ]},
  ],
  "到府美容/洗澡":[
    {title:"🛁 美容前確認",fields:[
      {key:"aggressive",label:"毛孩是否有攻擊性？"},
      {key:"skinAllergy",label:"是否有皮膚過敏？"},
      {key:"shampoo",label:"洗毛精由誰提供？"},
      {key:"snack",label:"是否可以吃零食？有食物過敏嗎？"},
    ]},
    {title:"✂️ 美容需求",fields:[
      {key:"nailTrim",label:"是否需要剪指甲？"},
      {key:"pawTrim",label:"是否需要修腳底毛？"},
      {key:"buttTrim",label:"是否需要修屁股毛？"},
      {key:"extraService",label:"其他附加服務需求？"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人：",type:"textarea"},
    ]},
  ],
};

// ══════════════════════════════════════
// 家訪表元件（查看 / 編輯模式 + 照片）
// ══════════════════════════════════════
function VisitForm({booking,savedData,onSave,onClose}){
  const [form,setForm]=useState(savedData||{});
  const [editing,setEditing]=useState(!savedData||Object.keys(savedData).length===0);
  const [photos,setPhotos]=useState(savedData?._photos||[]);
  const [toast,setToast]=useState(false);
  const fileRef=useRef();
  const sections=VISIT_FORMS[booking.serviceType]||VISIT_FORMS["到府照顧"];
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave=()=>{
    onSave(booking.id,{...form,_photos:photos});
    setEditing(false);
    setToast(true);
    setTimeout(()=>setToast(false),2500);
  };

  const handlePhotos=e=>{
    const files=[...e.target.files];
    files.forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>setPhotos(p=>[...p,{url:ev.target.result,name:file.name}]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto=i=>setPhotos(p=>p.filter((_,idx)=>idx!==i));

  const hasData=Object.entries(form).filter(([k,v])=>k!=="_photos"&&v).length>0;

  return (
    <div>
      <Toast message="家訪表已儲存！" show={toast}/>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:19,margin:"0 0 4px"}}>
            📋 家訪表 — {booking.serviceType}
          </h2>
          <div style={{color:C.muted,fontSize:13}}>
            {(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・")} · {booking.ownerName}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!editing&&(
            <button onClick={()=>setEditing(true)} style={{...btnG,padding:"7px 14px",fontSize:13}}>✏️ 編輯</button>
          )}
          <button onClick={onClose} style={{...btnG,padding:"7px 12px"}}>✕</button>
        </div>
      </div>

      {/* Mode banner */}
      {!editing&&(
        <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:10,
          padding:"9px 14px",marginBottom:16,fontSize:13,color:C.green,
          display:"flex",alignItems:"center",gap:8}}>
          👁️ 查看模式 — 點右上角「編輯」可修改內容
        </div>
      )}

      {/* Sections */}
      {sections.map(sec=>(
        <div key={sec.title} style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:10,
            paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{sec.title}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sec.fields.map(fld=>(
              <div key={fld.key}>
                <label style={{...lbl,fontSize:12}}>{fld.label}</label>
                {editing
                  ? fld.type==="textarea"
                    ? <textarea style={{...inp,minHeight:60,resize:"vertical"}}
                        value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)}/>
                    : <input style={inp} value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)}/>
                  : <div style={{
                      padding:"9px 13px",background:C.surface,borderRadius:10,
                      fontSize:14,color:form[fld.key]?C.text:C.dim,
                      border:`1px solid ${C.border}`,minHeight:38,
                    }}>
                      {form[fld.key]||"（未填寫）"}
                    </div>
                }
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 照片區 */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:10,
          paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>📷 家訪照片</div>
        {photos.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
            {photos.map((p,i)=>(
              <div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1",background:C.surface}}>
                <img src={p.url} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                {editing&&(
                  <button onClick={()=>removePhoto(i)} style={{
                    position:"absolute",top:4,right:4,background:"rgba(0,0,0,.5)",
                    color:"#fff",border:"none",borderRadius:"50%",width:22,height:22,
                    cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",
                  }}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
        {editing&&(
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handlePhotos}/>
            <button onClick={()=>fileRef.current.click()} style={{...btnG,fontSize:13,padding:"8px 16px"}}>
              📷 上傳照片
            </button>
          </>
        )}
        {!editing&&photos.length===0&&(
          <div style={{color:C.dim,fontSize:13}}>尚未上傳照片</div>
        )}
      </div>

      {/* Actions */}
      {editing&&(
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={handleSave} style={{...btnP,flex:1}}>💾 儲存家訪表</button>
          {hasData&&<button onClick={()=>setEditing(false)} style={btnG}>取消編輯</button>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 服務指南
// ══════════════════════════════════════
const VISIT_GUIDES={
  "安親寄宿":{
    intro:"免費家訪：為避免毛孩來保姆家時不適應環境或攻擊保姆、家中成員，強烈建議預約家訪！",
    prep:["預習功課 — 先預習毛爸媽傳給你的毛孩資料，了解名字、個性、基本照顧注意事項"],
    steps:[
      {n:"01",t:"認識毛爸媽",c:C.accent,s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，確認平常的照顧方式和確認細節，也會照您們習慣試著相處看看」"},
      {n:"02",t:"認識毛小孩",c:C.accent2,s:"「請問OO媽媽，他會怕陌生人或陌生環境嗎？有食物過敏嗎？我有些小零食，可以給他互相認識一下！」"},
      {n:"03",t:"邀請填寫家訪表",c:C.green,s:"「這邊是關於照顧OO的一些問題，包含緊急聯絡資訊、常用動物醫院、習性、健康狀況等等，麻煩您幫我填一下喔」"},
      {n:"04",t:"確認細節・安全",c:C.orange,s:"「填完了嗎？我們來確認一下您剛剛填的內容喔」\n\n提醒：服務含國泰保險保障、全程照片回報，確認是否需要Google Maps紀錄路線。"},
      {n:"05",t:"試安親 30分鐘～6小時",c:C.red,s:"在飼主不在的情況下簡單試安親，了解毛孩適應情況。\n\n⚠️ 若您或飼主覺得不合適，可取消訂單。"},
    ],
    extra:"📝 強烈建議在執行服務前與飼主簽署照顧合約，保障雙方權益。",
  },
  "到府照顧":{
    intro:"免費家訪：可於正式服務前先到飼主家認識環境、與毛孩相處，記錄照顧細節於家訪表，強烈建議先約家訪！",
    prep:["預習功課 — 先預習毛孩資料","必備物品 — 手部消毒清潔噴霧、口罩、家訪表","加分物品 — 室內拖鞋、小零食/肉泥"],
    steps:[
      {n:"01",t:"認識毛爸媽",c:C.accent,s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，確認你們平常的照顧方式和確認細節。」"},
      {n:"02",t:"認識毛小孩",c:C.accent2,s:"「請問OO媽媽，他會怕陌生人嗎？有食物過敏嗎？我有帶些小零食，可以給他互相認識一下！」\n\n💡 膽小毛孩請仔細觀察，不要強硬靠近。"},
      {n:"03",t:"邀請填寫家訪表",c:C.green,s:"「這邊是關於照顧OO的一些問題，麻煩您幫我填一下喔」"},
      {n:"04",t:"確認細節・安全・付款",c:C.orange,s:"「填完了嗎？我們來確認一下您剛剛填的內容喔」\n\n確認：服務含國泰保險保障、全程照片回報，確認攝影機需求與鑰匙交付，並提醒完成付款。"},
    ],
  },
  "陪伴散步":{
    intro:"免費家訪：付款前先約家訪！先到飼主家認識環境、與毛孩相處、了解毛孩在外表現，若不合適可取消訂單。",
    prep:["預習功課 — 先預習毛孩資料","必備物品 — 手部消毒噴霧、口罩、狗狗零食、便便袋、水瓶、狗狗濕紙巾、家訪表","加分物品 — 室內拖鞋、Airtag掛在狗狗上"],
    steps:[
      {n:"01",t:"認識毛爸媽",c:C.accent,s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，也會照您們習慣試遛他一次」"},
      {n:"02",t:"認識毛小孩",c:C.accent2,s:"「請問OO媽媽，他會怕陌生人嗎？我有帶些小零食，可以給他互相認識！」\n\n💡 膽小毛孩時刻仔細觀察（不要對眼），不用強硬靠近。"},
      {n:"03",t:"邀請填寫家訪表",c:C.green,s:"「這邊是關於照顧OO的一些問題，麻煩您幫我填一下喔」"},
      {n:"04",t:"確認細節・安全・付款",c:C.orange,s:"確認：服務含國泰保險保障、全程照片回報，確認Google Maps路線、攝影機需求、鑰匙交付，並提醒完成付款。"},
      {n:"05",t:"試遛狗五分鐘",c:C.red,s:"試穿牽繩和背套，在飼主不在的情況下簡單試遛五分鐘。"},
    ],
  },
  "到府美容/洗澡":{
    intro:"到府美容前，務必與飼主確認毛孩個性與洗澡細節，做好準備保障雙方安全。",
    prep:["保姆需自備相關工具，洗毛精可與飼主協調由誰提供"],
    steps:[
      {n:"01",t:"事前確認",c:C.accent,s:"去執行服務前一定要跟飼主確認毛孩個性與洗澡細節（是否有攻擊性、皮膚過敏、是否自備洗毛精等）。"},
      {n:"02",t:"建立信任",c:C.accent2,s:"先與毛孩玩耍、給零食培養感情，讓毛孩不會太緊張，同時蒐集美容前的對比照！"},
      {n:"03",t:"執行美容",c:C.green,s:"洗澡時需幫毛孩清耳朵、清眼屎、擠肛門腺。可依需求提供剪指甲、修腳底毛、修屁股毛等附加服務。\n\n⚠️ 若毛孩太兇無法執行，可取消訂單，平台會全額退費。"},
      {n:"04",t:"注意事項",c:C.orange,s:"發現皮膚異常需回報飼主。剪指甲流血可使用止血粉；若指甲過長，要先提醒飼主可能流血。"},
      {n:"05",t:"完成收尾",c:C.red,s:"美容完給毛孩零食獎勵！蒐集美容後的對比照。服務結束清理地上毛髮，清理、消毒自己的工具。"},
    ],
  },
};

const SERVICE_FLOWS={
  "安親寄宿":{
    steps:[
      {icon:"📸",t:"拍照回報",d:"時時刻刻傳照片給飼主，回報毛孩「吃喝拉撒睡」。餵食拍碗、清貓砂拍照、散步拍便便，陪伴玩耍、休息睡覺都可以拍照傳！"},
      {icon:"🛡️",t:"保護自家環境",d:"自家環境物品需自行保護，避免毛孩誤食就醫或破壞物品。"},
      {icon:"📱",t:"保障自己",d:"隨時拍毛孩的照片傳給飼主並告知狀況，可保障自己權益。"},
    ],
    checklist:["🍚 吃吃喝喝","💩 大便尿尿","😴 睡覺休息","📝 飼主交代事項"],
  },
  "到府照顧":{
    steps:[
      {icon:"📸",t:"到府拍照通知",d:"進門時拍照告知飼主已進門，可預告前往時間讓飼主準備。"},
      {icon:"📲",t:"時時照片回報",d:"餵食拍碗、清貓砂拍照、陪伴玩耍、休息睡覺都盡量拍照傳給飼主。"},
      {icon:"💝",t:"貼心附加服務",d:"打掃貓砂盆附近、噴除臭噴霧、澆花、剪指甲…讓飼主下次更想預訂您！"},
      {icon:"🚪",t:"離開拍照告別",d:"離開時拍照、告知飼主毛孩情況，保障自身權益。"},
    ],
    checklist:["🍚 吃吃喝喝","💩 大便尿尿","😴 睡覺休息","📝 飼主交代事項","⏰ 準時進出門"],
  },
  "陪伴散步":{
    steps:[
      {icon:"🔗",t:"確認牽繩再開門",d:"確認繫好牽繩再開門，避免毛孩爆衝。若飼主不在，接毛孩時拍照告知已帶毛孩出門。"},
      {icon:"📲",t:"時時照片回報",d:"毛孩便便後回報健康度、尿尿次數；陪伴玩耍、休息都可以拍照傳給飼主！"},
      {icon:"💝",t:"貼心小動作",d:"自備小零食/小玩具增進感情、便便後幫擦屁屁、帶回家時幫擦腳、擦拭全身…"},
      {icon:"🏠",t:"安全回家",d:"結束散步帶毛孩回家時，確認關好門再解開牽繩。若飼主不在，拍照告知毛孩平安回到家。"},
    ],
    checklist:["💩 大便尿尿","💧 喝水休息","📝 飼主交代事項","⏰ 準時接送"],
  },
  "到府美容/洗澡":{
    steps:[
      {icon:"📋",t:"事前確認",d:"去執行服務前一定要跟飼主確認毛孩個性與洗澡細節。"},
      {icon:"🛁",t:"執行美容",d:"清耳朵、清眼屎、擠肛門腺；依需求提供剪指甲、修腳底毛等附加服務。"},
      {icon:"⚠️",t:"異常回報",d:"發現皮膚有異常情形需回報飼主。剪指甲流血可使用止血粉。"},
      {icon:"🧹",t:"清理收尾",d:"服務結束清理地上毛髮，清理、消毒自己的工具，為下一個服務做準備。"},
    ],
    checklist:["🛁 完成洗澡","✂️ 美容服務","🎁 零食獎勵","📸 前後對比照","🧹 清潔環境"],
  },
};

function ServiceGuide({onClose}){
  const [tab,setTab]=useState("visit");
  const [svcType,setSvcType]=useState("安親寄宿");
  const [courseTag,setCourseTag]=useState("全部");
  const tags=["全部","🐕 狗狗","🐈 貓咪","🐕🐈 綜合","🐇🐦 特殊"];
  const filteredCourses=COURSES.filter(c=>courseTag==="全部"||c.tag===courseTag);
  const tabBtn=(id,label)=>(
    <button onClick={()=>setTab(id)} style={{
      fontFamily:"inherit",cursor:"pointer",
      background:tab===id?`linear-gradient(135deg,${C.accent},${C.accent2})`:C.surface,
      color:tab===id?"#fff":C.muted,border:`1px solid ${tab===id?C.accent:C.border}`,
      borderRadius:10,padding:"8px 16px",fontWeight:600,fontSize:13,
    }}>{label}</button>
  );
  const guide=VISIT_GUIDES[svcType]||VISIT_GUIDES["到府照顧"];
  const flow=SERVICE_FLOWS[svcType]||SERVICE_FLOWS["到府照顧"];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:20,margin:0}}>📖 保姆服務指南</h2>
        <button onClick={onClose} style={{...btnG,padding:"6px 12px"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {tabBtn("visit","🏠 家訪流程")}
        {tabBtn("service","🐾 服務流程")}
        {tabBtn("course","🎓 進修課程")}
      </div>
      {(tab==="visit"||tab==="service")&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
          {SERVICE_TYPES.map(t=>(
            <button key={t} onClick={()=>setSvcType(t)} style={{
              fontFamily:"inherit",cursor:"pointer",
              background:svcType===t?C.soft:C.surface,
              color:svcType===t?C.accent:C.muted,
              border:`1px solid ${svcType===t?C.accent2:C.border}`,
              borderRadius:20,padding:"5px 14px",fontSize:12.5,fontWeight:svcType===t?700:400,
            }}>{SERVICE_ICONS[t]} {t}</button>
          ))}
        </div>
      )}
      {tab==="visit"&&(
        <div>
          <div style={{background:"#FEF6F0",border:"1px solid #E8C4A8",borderRadius:12,
            padding:"13px 15px",marginBottom:18,fontSize:13.5,color:C.muted,lineHeight:1.7}}>
            🌸 <strong style={{color:C.text}}>免費家訪</strong>：{guide.intro}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:10}}>🎒 家訪前準備</div>
          {guide.prep.map((p,i)=>(
            <div key={i} style={{background:C.surface,borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,color:C.muted,lineHeight:1.6}}>{p}</div>
          ))}
          <div style={{fontSize:13,fontWeight:700,color:C.accent,margin:"18px 0 10px"}}>📍 家訪步驟</div>
          {guide.steps.map(vs=>(
            <div key={vs.n} style={{borderRadius:12,padding:"13px 15px",marginBottom:10,
              background:C.card2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${vs.c}`}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                <span style={{background:vs.c,color:"#fff",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:700}}>STEP {vs.n}</span>
                <span style={{fontWeight:700,color:C.text,fontSize:14}}>{vs.t}</span>
              </div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.75,whiteSpace:"pre-line"}}>{vs.s}</div>
            </div>
          ))}
          {guide.extra&&(
            <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"12px 14px",marginTop:8,fontSize:13,color:C.muted,lineHeight:1.7}}>
              {guide.extra}
            </div>
          )}
        </div>
      )}
      {tab==="service"&&(
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
            {flow.steps.map((sf,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",background:C.card2,borderRadius:12,padding:"12px 16px"}}>
                <div style={{fontSize:24,flexShrink:0}}>{sf.icon}</div>
                <div>
                  <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:3}}>{sf.t}</div>
                  <div style={{fontSize:12.5,color:C.muted,lineHeight:1.65}}>{sf.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>✅ 合格保姆清單</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {flow.checklist.map(c=>(
                <div key={c} style={{display:"flex",gap:8,alignItems:"center",background:C.card,borderRadius:8,padding:"8px 12px",border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:16}}>{c.slice(0,2)}</span>
                  <span style={{fontSize:13,color:C.text}}>{c.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==="course"&&(
        <div>
          <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
            <div style={{fontWeight:700,color:C.green,fontSize:14,marginBottom:5}}>🎓 臺北e大免費寵物課程</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>完全免費！只需註冊台北通或e大會員帳號，即可開始學習。點擊課程卡片直接前往報名頁面。</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {tags.map(t=>(
              <button key={t} onClick={()=>setCourseTag(t)} style={{
                fontFamily:"inherit",cursor:"pointer",
                background:courseTag===t?C.accent:C.surface,color:courseTag===t?"#fff":C.muted,
                border:`1px solid ${courseTag===t?C.accent:C.border}`,borderRadius:20,padding:"5px 14px",fontSize:12.5,
              }}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {filteredCourses.map((c,i)=>(
              <a key={i} href={c.url} target="_blank" rel="noreferrer"
                style={{textDecoration:"none",display:"block",...cardSt,padding:"14px 16px",transition:"box-shadow .15s",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(154,117,83,.18)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(154,117,83,.08)"}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div style={{fontWeight:700,color:C.text,fontSize:14}}>{c.title}</div>
                  <span style={pill(C.accent2)}>{c.tag}</span>
                </div>
                <div style={{fontSize:12.5,color:C.muted,lineHeight:1.6,marginBottom:6}}>{c.desc}</div>
                <div style={{fontSize:12,color:C.accent,fontWeight:600}}>前往台北e大報名 →</div>
              </a>
            ))}
          </div>
          <div style={{...cardSt,background:C.surface}}>
            <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:12}}>📌 台北e大報名步驟</div>
            {["前往 elearning.taipei/mpage/，選擇台北通或e大會員註冊",
              "點入「選課中心」→「分類列表」",
              "課程名稱輸入：寵物 → 送出查詢",
              "將有興趣的課程放入「選課口袋」→「全部報名」",
              "進入「我的課程」→「學習記錄」開始上課！"
            ].map((step,i)=>(
              <div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                  background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{i+1}</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.65,paddingTop:2}}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 預約卡片
// ══════════════════════════════════════
function BookingCard({booking,onClick}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  const firstHoliday=(booking.dates||[]).find(d=>TW_HOLIDAYS[d]);
  return (
    <div onClick={()=>onClick(booking)} style={{
      ...cardSt,cursor:"pointer",padding:"16px 18px",
      borderLeft:`4px solid ${STATUS_MAP[booking.status].color}`,
      transition:"box-shadow .15s, transform .15s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(154,117,83,.18)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(154,117,83,.08)";e.currentTarget.style.transform="translateY(0)";}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:16,fontWeight:700,color:C.text,marginBottom:2}}>{petStr}</div>
          <div style={{fontSize:12,color:C.muted}}>{booking.ownerName} · {SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={pill(STATUS_MAP[booking.status].color)}>{STATUS_MAP[booking.status].label}</span>
          <span style={{fontSize:11.5,color:booking.paid?C.green:C.orange,fontWeight:600}}>
            {booking.price?`NT$${booking.price?.toLocaleString()} `:""}
            {booking.paid?"✅ 已付款":"⏳ 未付款"}
          </span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:12.5,color:C.muted}}>
        <span>📅 {(booking.dates||[]).length>1?`${booking.dates[0]} 等${booking.dates.length}天`:booking.dates?.[0]||""}</span>
        <span>🌤 {booking.timeOfDay}{booking.appointmentTime?` ${booking.appointmentTime}`:""}</span>
        <span>⏱ {booking.duration} 分鐘</span>
        {booking.address&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {booking.address}</span>}
      </div>
      {firstHoliday&&<div style={{marginTop:8,fontSize:11.5,color:C.holiday}}>🎉 {TW_HOLIDAYS[firstHoliday].n}（假日）</div>}
      {booking.notes&&(
        <div style={{marginTop:10,padding:"8px 11px",background:C.surface,borderRadius:8,
          fontSize:12,color:C.muted,borderLeft:`2px solid ${C.soft}`}}>
          📝 {booking.notes.slice(0,70)}{booking.notes.length>70?"…":""}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 詳細 Modal
// ══════════════════════════════════════
function DetailView({booking,hasSavedForm,onClose,onEdit,onDelete,onVisitForm}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  const holidays=(booking.dates||[]).filter(d=>TW_HOLIDAYS[d]);
  const row=(l,v,color)=>v!=null&&v!==""?(
    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
      borderBottom:`1px solid ${C.border}`,fontSize:13.5}}>
      <span style={{color:C.muted}}>{l}</span>
      <span style={{color:color||C.text,fontWeight:500,textAlign:"right",maxWidth:"65%"}}>{v}</span>
    </div>
  ):null;
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:36,marginBottom:6}}>{(booking.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
        <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:20,fontWeight:700,color:C.text}}>{petStr}</div>
        <div style={{fontSize:14,color:C.accent,marginTop:2}}>{SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        <div style={{marginTop:8,display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          <span style={pill(STATUS_MAP[booking.status].color)}>{STATUS_MAP[booking.status].label}</span>
          <span style={pill(booking.paid?C.green:C.orange)}>{booking.paid?"✅ 已付款":"⏳ 未付款"}</span>
        </div>
        {holidays.length>0&&<div style={{marginTop:6,fontSize:12,color:C.holiday}}>🎉 含假日：{holidays.map(d=>TW_HOLIDAYS[d].n).join("、")}</div>}
      </div>
      {row("飼主",booking.ownerName)}
      {row("聯絡電話",booking.ownerPhone)}
      {row("服務日期",(booking.dates||[]).join("、"))}
      {row("時段",`${booking.timeOfDay}${booking.appointmentTime?` ${booking.appointmentTime}`:""}`)}
      {row("服務時長",`${booking.duration} 分鐘`)}
      {row("服務金額",booking.price?`NT$ ${booking.price?.toLocaleString()}`:null)}
      {row("付款狀態",booking.paid?"✅ 已付款":"⏳ 未付款",booking.paid?C.green:C.orange)}
      {row("地址",booking.address)}
      {booking.notes&&(
        <div style={{marginTop:14,padding:"12px 14px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.accent,marginBottom:5,letterSpacing:".5px"}}>📝 注意事項</div>
          <div style={{fontSize:13.5,color:C.text,lineHeight:1.7}}>{booking.notes}</div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:20}}>
        <button onClick={onVisitForm} style={{...btnP,gridColumn:"1/-1"}}>
          📋 {hasSavedForm?"查看家訪表 ✓":"填寫家訪表"}
        </button>
        <button onClick={onEdit} style={btnG}>✏️ 編輯</button>
        <button onClick={onDelete} style={btnD}>🗑 刪除</button>
      </div>
      <button onClick={onClose} style={{...btnG,width:"100%",marginTop:8}}>關閉</button>
    </div>
  );
}

// ══════════════════════════════════════
// App
// ══════════════════════════════════════
export default function App(){
  const [bookings,setBookings]=useState(INITIAL_BOOKINGS);
  const [visitForms,setVisitForms]=useState({});
  const [tab,setTab]=useState("calendar");
  const [statusFilter,setStatusFilter]=useState("all");
  const [selectedDate,setSelectedDate]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [viewTarget,setViewTarget]=useState(null);
  const [visitTarget,setVisitTarget]=useState(null);
  const [showGuide,setShowGuide]=useState(false);
  const [search,setSearch]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(null); // booking to delete
  const [toast,setToast]=useState({show:false,msg:""});

  const showToast=(msg)=>{setToast({show:true,msg});setTimeout(()=>setToast({show:false,msg:""}),2500);};

  const saveVisitForm=(bookingId,data)=>{
    setVisitForms(prev=>({...prev,[bookingId]:data}));
    showToast("家訪表已儲存！");
  };

  const today=new Date().toISOString().slice(0,10);
  const dayBookings=selectedDate?bookings.filter(b=>(b.dates||[]).includes(selectedDate)):[];
  const listBookings=bookings
    .filter(b=>(statusFilter==="all"||b.status===statusFilter))
    .filter(b=>!search||b.pets?.some(p=>p.name.includes(search))||b.ownerName.includes(search))
    .sort((a,b)=>(a.dates?.[0]||"").localeCompare(b.dates?.[0]||"")||(a.appointmentTime||"").localeCompare(b.appointmentTime||""));

  const saveBooking=f=>{
    if(editTarget) setBookings(bs=>bs.map(b=>b.id===editTarget.id?{...f,id:b.id}:b));
    else setBookings(bs=>[...bs,{...f,id:Date.now()}]);
    setShowForm(false); setEditTarget(null); setViewTarget(null);
    showToast("預約已儲存！");
  };

  // 修正：刪除用確認對話框，不用 confirm()
  const requestDelete=(booking)=>{ setViewTarget(null); setConfirmDelete(booking); };
  const doDelete=()=>{
    setBookings(bs=>bs.filter(b=>b.id!==confirmDelete.id));
    setConfirmDelete(null);
    showToast("預約已刪除");
  };

  // 收入統計：已完成 & 已付款
  const completedIncome=bookings
    .filter(b=>b.status==="completed"&&b.paid&&b.price)
    .reduce((s,b)=>s+(b.price||0),0);

  const upcomingHolidays=Object.entries(TW_HOLIDAYS)
    .filter(([d])=>d>=today)
    .slice(0,3);

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Noto Sans TC','PingFang TC',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        select option{background:#FDF8F2;color:#4A3728;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.soft};border-radius:3px;}
        *{-webkit-tap-highlight-color:transparent;}
        input[type=date],input[type=time]{color-scheme:light;}
        a{transition:opacity .15s;} a:hover{opacity:.8;}
      `}</style>

      <Toast message={toast.msg} show={toast.show}/>

      <ConfirmDialog
        open={!!confirmDelete}
        message={`確定要刪除「${confirmDelete?.pets?.[0]?.name||""}」的預約嗎？\n此操作無法復原。`}
        onConfirm={doDelete}
        onCancel={()=>setConfirmDelete(null)}
      />

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"16px 18px 0"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:22}}>🐾</span>
                <span style={{fontFamily:"'Noto Serif TC',serif",fontSize:20,fontWeight:700,color:C.text}}>寵物保姆管理系統</span>
              </div>
              <div style={{fontSize:11.5,color:C.dim,marginLeft:30}}>Pet Sitter Pro · 溫柔照顧每一個毛孩 🌿</div>
            </div>
            <button onClick={()=>setShowGuide(true)} style={{...btnG,fontSize:13,padding:"8px 14px"}}>📖 服務指南</button>
          </div>

          {/* Stats — 新增完成收入欄 */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[
              {label:"總預約",val:bookings.length,c:C.accent},
              {label:"今日服務",val:bookings.filter(b=>(b.dates||[]).includes(today)).length,c:C.green},
              {label:"待確認",val:bookings.filter(b=>b.status==="pending").length,c:C.orange},
              {label:"完成收入",val:`$${completedIncome.toLocaleString()}`,c:C.green},
            ].map(s=>(
              <div key={s.label} style={{flex:1,textAlign:"center",background:C.card,
                border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 4px",
                boxShadow:"0 1px 6px rgba(154,117,83,.07)"}}>
                <div style={{
                  fontSize: String(s.val).length > 5 ? 13 : 22,
                  fontWeight:700,color:s.c,lineHeight:1.2,
                  letterSpacing: String(s.val).length > 5 ? "-0.3px" : "normal",
                }}>{s.val}</div>
                <div style={{fontSize:10.5,color:C.dim,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 假日快訊 */}
          {upcomingHolidays.length>0&&(
            <div style={{display:"flex",gap:8,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
              {upcomingHolidays.map(([d,h])=>(
                <div key={d} style={{display:"flex",alignItems:"center",gap:5,
                  background:C.holidayBg,border:`1px solid ${C.holiday}33`,
                  borderRadius:20,padding:"4px 12px",whiteSpace:"nowrap",fontSize:11.5,color:C.holiday}}>
                  🎉 {d.slice(5).replace("-","/")} {h.n}
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{display:"flex",gap:4}}>
            {[{id:"calendar",label:"📅 月曆"},{id:"list",label:"📋 預約清單"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                fontFamily:"inherit",cursor:"pointer",
                border:`1px solid ${tab===t.id?C.border2:"transparent"}`,
                borderBottom:tab===t.id?`1px solid ${C.card}`:`1px solid transparent`,
                borderRadius:"10px 10px 0 0",padding:"8px 18px",
                fontWeight:tab===t.id?700:400,fontSize:13,
                background:tab===t.id?C.card:"transparent",
                color:tab===t.id?C.accent:C.muted,marginBottom:tab===t.id?-1:0,
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"18px 14px 48px"}}>
        {tab==="calendar"&&(
          <div>
            <Calendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
            {selectedDate&&(
              <div style={{marginTop:14,...cardSt}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <span style={{fontWeight:700,color:C.text,fontSize:15}}>
                      {selectedDate.slice(5).replace("-","/")} 的預約
                    </span>
                    <span style={{...pill(C.accent),marginLeft:8}}>{dayBookings.length} 筆</span>
                    {TW_HOLIDAYS[selectedDate]&&(
                      <div style={{fontSize:12,color:C.holiday,marginTop:2}}>🎉 {TW_HOLIDAYS[selectedDate].n}</div>
                    )}
                  </div>
                  <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,padding:"7px 14px",fontSize:13}}>+ 新增</button>
                </div>
                {dayBookings.length===0
                  ?<div style={{textAlign:"center",padding:"28px 0",color:C.dim,fontSize:14}}>當日無預約 🌙</div>
                  :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {dayBookings.sort((a,b)=>(a.appointmentTime||"").localeCompare(b.appointmentTime||"")).map(b=>(
                      <div key={b.id} onClick={()=>setViewTarget(b)}
                        style={{display:"flex",gap:12,alignItems:"center",background:C.surface,
                          borderRadius:12,padding:"11px 14px",cursor:"pointer",
                          border:`1px solid ${C.border}`,borderLeft:`3px solid ${STATUS_MAP[b.status].color}`,
                          transition:"background .14s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.soft+"44"}
                        onMouseLeave={e=>e.currentTarget.style.background=C.surface}
                      >
                        <div style={{fontSize:22}}>{(b.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,color:C.text,fontSize:14}}>{(b.pets||[]).map(p=>p.name).join("・")}</div>
                          <div style={{fontSize:12,color:C.muted}}>{b.ownerName} · {SERVICE_ICONS[b.serviceType]} {b.serviceType}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.accent}}>{b.timeOfDay}</div>
                          {b.appointmentTime&&<div style={{fontSize:12,color:C.accent2}}>{b.appointmentTime}</div>}
                          <div style={{fontSize:11,color:b.paid?C.green:C.orange,fontWeight:600}}>
                            {b.paid?"✅ 已付":"⏳ 未付"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}
            {!selectedDate&&<div style={{textAlign:"center",marginTop:14,color:C.dim,fontSize:13}}>點選日期查看當日預約 📅</div>}
          </div>
        )}

        {tab==="list"&&(
          <div>
            {/* 狀態分頁標籤 */}
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
              {[
                {key:"all",   label:"全部",    count:bookings.length},
                {key:"pending",   label:"待確認", count:bookings.filter(b=>b.status==="pending").length},
                {key:"confirmed", label:"已確認", count:bookings.filter(b=>b.status==="confirmed").length},
                {key:"completed", label:"已完成", count:bookings.filter(b=>b.status==="completed").length},
                {key:"cancelled", label:"已取消", count:bookings.filter(b=>b.status==="cancelled").length},
              ].map(t=>(
                <button key={t.key} onClick={()=>setStatusFilter(t.key)} style={{
                  fontFamily:"inherit", cursor:"pointer", whiteSpace:"nowrap",
                  background: statusFilter===t.key
                    ? (t.key==="all" ? `linear-gradient(135deg,${C.accent},${C.accent2})` : STATUS_MAP[t.key]?.color||C.accent)
                    : C.card,
                  color: statusFilter===t.key ? "#fff" : C.muted,
                  border: `1px solid ${statusFilter===t.key ? "transparent" : C.border}`,
                  borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600,
                  boxShadow: statusFilter===t.key ? "0 2px 8px rgba(154,117,83,.2)" : "none",
                  transition: "all .15s",
                }}>
                  {t.key!=="all" && STATUS_MAP[t.key] ? "" : ""}{t.label}
                  <span style={{
                    marginLeft:5, background:"rgba(255,255,255,.25)",
                    borderRadius:10, padding:"1px 6px", fontSize:11,
                  }}>{t.count}</span>
                </button>
              ))}
            </div>

            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 搜尋寵物或飼主名稱..."
                style={{...inp,flex:1}}/>
              <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,whiteSpace:"nowrap"}}>+ 新增</button>
            </div>
            {listBookings.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}>
                  <div style={{fontSize:44,marginBottom:10}}>🐾</div>
                  <div>沒有符合的預約</div>
                </div>
              :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {listBookings.map(b=><BookingCard key={b.id} booking={b} onClick={setViewTarget}/>)}
                </div>
            }
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditTarget(null);}}>
        <BookingForm initial={editTarget} onSave={saveBooking} onCancel={()=>{setShowForm(false);setEditTarget(null);}}/>
      </Modal>

      <Modal open={!!viewTarget&&!showForm&&!visitTarget} onClose={()=>setViewTarget(null)}>
        {viewTarget&&!visitTarget&&(
          <DetailView booking={viewTarget}
            hasSavedForm={!!(visitForms[viewTarget.id]&&Object.keys(visitForms[viewTarget.id]).filter(k=>k!=="_photos").some(k=>visitForms[viewTarget.id][k]))}
            onClose={()=>setViewTarget(null)}
            onEdit={()=>{setEditTarget(viewTarget);setShowForm(true);}}
            onDelete={()=>requestDelete(viewTarget)}
            onVisitForm={()=>setVisitTarget(viewTarget)}
          />
        )}
      </Modal>

      <Modal open={!!visitTarget} onClose={()=>setVisitTarget(null)} wide>
        {visitTarget&&(
          <VisitForm
            booking={visitTarget}
            savedData={visitForms[visitTarget.id]||null}
            onSave={saveVisitForm}
            onClose={()=>setVisitTarget(null)}
          />
        )}
      </Modal>

      <Modal open={showGuide} onClose={()=>setShowGuide(false)} wide>
        <ServiceGuide onClose={()=>setShowGuide(false)}/>
      </Modal>
    </div>
  );
}
