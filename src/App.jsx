import { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════
// 2026 完整國定假日（依人事行政總處公告）
// ══════════════════════════════════════
const TW_HOLIDAYS = {
  // 元旦
  "2026-01-01":{n:"元旦",t:"假"},
  // 春節（2/14小年夜～2/22，共9天）
  "2026-02-14":{n:"小年夜",t:"假"},
  "2026-02-15":{n:"除夕",t:"假"},
  "2026-02-16":{n:"除夕連假",t:"假"},
  "2026-02-17":{n:"初一",t:"假"},
  "2026-02-18":{n:"初二",t:"假"},
  "2026-02-19":{n:"初三",t:"假"},
  "2026-02-20":{n:"春節補假",t:"補"},
  "2026-02-21":{n:"春節連假",t:"假"},
  "2026-02-22":{n:"春節連假",t:"假"},
  // 228（2/27-3/1）
  "2026-02-27":{n:"228連假",t:"補"},
  "2026-02-28":{n:"228紀念日",t:"假"},
  "2026-03-01":{n:"228連假",t:"補"},
  // 兒童節+清明（4/3-4/6）
  "2026-04-03":{n:"兒童節補假",t:"補"},
  "2026-04-04":{n:"兒童節",t:"假"},
  "2026-04-05":{n:"清明節",t:"假"},
  "2026-04-06":{n:"清明補假",t:"補"},
  // 勞動節（5/1-5/3）
  "2026-05-01":{n:"勞動節",t:"假"},
  "2026-05-02":{n:"勞動節連假",t:"補"},
  "2026-05-03":{n:"勞動節連假",t:"補"},
  // 端午（6/19-6/21）
  "2026-06-19":{n:"端午節",t:"假"},
  "2026-06-20":{n:"端午連假",t:"補"},
  "2026-06-21":{n:"端午連假",t:"補"},
  // 中秋+教師節（9/25-9/28）
  "2026-09-25":{n:"中秋節",t:"假"},
  "2026-09-26":{n:"中秋連假",t:"補"},
  "2026-09-27":{n:"中秋連假",t:"補"},
  "2026-09-28":{n:"教師節",t:"假"},
  // 國慶（10/9-10/11）
  "2026-10-09":{n:"國慶連假",t:"補"},
  "2026-10-10":{n:"國慶日",t:"假"},
  "2026-10-11":{n:"國慶連假",t:"補"},
  // 台灣光復（10/24-10/26）
  "2026-10-24":{n:"光復節連假",t:"補"},
  "2026-10-25":{n:"台灣光復節",t:"假"},
  "2026-10-26":{n:"光復節補假",t:"補"},
  // 行憲紀念日（12/25-12/27）
  "2026-12-25":{n:"行憲紀念日",t:"假"},
  "2026-12-26":{n:"行憲連假",t:"補"},
  "2026-12-27":{n:"行憲連假",t:"補"},
};

const COURSES=[
  {title:"旺喵星人是家中好成員",tag:"🐕🐈 綜合",desc:"了解貓狗情緒、如何親近互動、照顧準備事項",url:"https://elearning.taipei/mpage/"},
  {title:"快樂狗兒的身心健康教養法",tag:"🐕 狗狗",desc:"狗兒身心需求、獎勵教學、日常互動管理",url:"https://elearning.taipei/mpage/"},
  {title:"安排狗狗戶外活動",tag:"🐕 狗狗",desc:"戶外活動規劃、社交化、運動需求滿足方法",url:"https://elearning.taipei/mpage/"},
  {title:"如何與狗狗快樂玩玩具",tag:"🐕 狗狗",desc:"玩具選擇與互動技巧，強化人狗信任關係",url:"https://elearning.taipei/mpage/"},
  {title:"狗狗互動管理",tag:"🐕 狗狗",desc:"讀懂狗狗肢體語言、解決行為問題的方法",url:"https://elearning.taipei/mpage/"},
  {title:"如何教養完美喵星人",tag:"🐈 貓咪",desc:"林子軒獸醫師主講，貓咪特性與玩具、貓砂介紹",url:"https://elearning.taipei/mpage/"},
  {title:"貓蘿紀：尋找真命天貓",tag:"🐈 貓咪",desc:"貓咪基本個性介紹，學習與貓星人愉快相處",url:"https://elearning.taipei/mpage/"},
  {title:"寵物行為糾正",tag:"🐕🐈 綜合",desc:"常見不良行為成因分析與科學正確糾正方法",url:"https://elearning.taipei/mpage/"},
  {title:"特殊寵物照護（鼠兔鳥）",tag:"🐇🐦 特殊",desc:"不萊梅&亞馬森特寵獸醫師主講，特殊寵物飼養密技",url:"https://elearning.taipei/mpage/"},
];

const SERVICE_TYPES=["安親寄宿","到府照顧","陪伴散步","到府美容/洗澡"];
const SERVICE_ICONS={"安親寄宿":"🏠","到府照顧":"🐾","陪伴散步":"🦮","到府美容/洗澡":"🛁"};
const PET_TYPES=["狗","貓","兔子","鳥","其他"];
const PET_EMOJI={狗:"🐕",貓:"🐈",兔子:"🐇",鳥:"🐦",其他:"🐾"};
const WEEKDAYS=["日","一","二","三","四","五","六"];
const TIME_OF_DAY=["早上","白天","傍晚","晚上","全天"];
const STATUS_MAP={
  confirmed:{label:"已確認",color:"#A07850"},
  pending:{label:"待確認",color:"#C8845A"},
  completed:{label:"已完成",color:"#7A9E7E"},
  cancelled:{label:"已取消",color:"#B07878"},
};

const VISIT_FORMS={
  "安親寄宿":[
    {title:"🐾 基本健康資訊",fields:[
      {key:"vaccine",label:"是否定期施打疫苗及驅蟲？"},
      {key:"neutered",label:"是否結紮？"},
      {key:"withPets",label:"是否可與其他寵物相處？"},
      {key:"withKids",label:"是否有跟小孩相處的經驗？"},
      {key:"snack",label:"是否可以吃零食？有食物過敏？"},
      {key:"mealHabit",label:"用餐習慣？（飼料/罐罐/幾餐）"},
      {key:"mealNote",label:"用餐時的情況？"},
    ]},
    {title:"🚗 外出行為",fields:[
      {key:"carReact",label:"對車輛的反應？是否曾吃地上東西？"},
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
      {key:"special",label:"其他特別需要注意的地方？",type:"textarea"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人：",type:"textarea"},
    ]},
  ],
  "到府照顧":[
    {title:"📋 基本資訊",fields:[
      {key:"timeSlot",label:"有指定到府時段嗎？"},
      {key:"contact",label:"飼主聯絡電話與緊急聯絡人：",type:"textarea"},
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
    ]},
    {title:"🦮 出門相關資訊",fields:[
      {key:"dogReact",label:"對陌生狗狗的反應？"},
      {key:"humanReact",label:"對陌生人的反應？"},
      {key:"carReact",label:"對行進車輛的反應？"},
      {key:"walkRoute",label:"指定遛狗路線？"},
      {key:"special",label:"散步時的特殊要求？",type:"textarea"},
      {key:"comfort",label:"特定安撫方式？"},
    ]},
    {title:"🔑 安全與交接",fields:[
      {key:"keyHandover",label:"鑰匙如何交付比較方便？"},
      {key:"camera",label:"需要租借寵物攝影機嗎？"},
    ]},
    {title:"🏥 緊急資訊",fields:[
      {key:"vet",label:"常去的動物醫院："},
      {key:"insurance",label:"是否有寵物保險？"},
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

const VISIT_GUIDES={
  "安親寄宿":{intro:"免費家訪：為避免毛孩來保姆家時不適應，強烈建議預約家訪！",prep:["預習功課 — 先預習毛爸媽傳給你的毛孩資料"],steps:[{n:"01",t:"認識毛爸媽",c:"#9B7553",s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，確認平常的照顧方式。」"},{n:"02",t:"認識毛小孩",c:"#C19A6B",s:"「請問OO媽媽，他會怕陌生人嗎？有食物過敏嗎？我有些小零食，可以給他互相認識！」"},{n:"03",t:"填寫家訪表",c:"#7A9E7E",s:"「這邊是關於照顧OO的一些問題，包含緊急聯絡資訊、常用動物醫院、習性等，麻煩您幫我填一下。」"},{n:"04",t:"確認細節",c:"#C8845A",s:"確認：服務含國泰保險保障、全程照片回報，是否需要Google Maps紀錄路線。"},{n:"05",t:"試安親",c:"#B07878",s:"在飼主不在的情況下簡單試安親，了解毛孩適應情況。\n\n⚠️ 若不合適，可取消訂單。"}],extra:"📝 強烈建議在執行服務前與飼主簽署照顧合約，保障雙方權益。"},
  "到府照顧":{intro:"免費家訪：可於正式服務前先到飼主家認識環境，強烈建議先約家訪！",prep:["預習功課","必備物品 — 手部消毒噴霧、口罩、家訪表","加分物品 — 室內拖鞋、小零食/肉泥"],steps:[{n:"01",t:"認識毛爸媽",c:"#9B7553",s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，確認照顧方式和細節。」"},{n:"02",t:"認識毛小孩",c:"#C19A6B",s:"「請問OO媽媽，他會怕陌生人嗎？我有帶些小零食，可以給他互相認識！」"},{n:"03",t:"填寫家訪表",c:"#7A9E7E",s:"「這邊是關於照顧OO的一些問題，麻煩您幫我填一下喔。」"},{n:"04",t:"確認細節",c:"#C8845A",s:"確認：服務含國泰保險保障、全程照片回報，攝影機需求與鑰匙交付，並提醒完成付款。"}]},
  "陪伴散步":{intro:"免費家訪：付款前先約家訪！先到飼主家認識環境與毛孩，若不合適可取消訂單。",prep:["預習功課","必備物品 — 手部消毒噴霧、口罩、狗狗零食、便便袋、水瓶","加分物品 — 室內拖鞋、Airtag"],steps:[{n:"01",t:"認識毛爸媽",c:"#9B7553",s:"「OO媽媽您好，我是保姆XXX，今天主要是來多認識毛孩，也會試遛他一次。」"},{n:"02",t:"認識毛小孩",c:"#C19A6B",s:"「請問OO媽媽，他會怕陌生人嗎？我有帶些小零食，可以給他互相認識！」"},{n:"03",t:"填寫家訪表",c:"#7A9E7E",s:"「這邊是關於照顧OO的一些問題，麻煩您幫我填一下喔。」"},{n:"04",t:"確認細節",c:"#C8845A",s:"確認：服務含國泰保險保障、全程照片回報，確認Google Maps路線、攝影機需求、鑰匙交付，並提醒完成付款。"},{n:"05",t:"試遛狗",c:"#B07878",s:"試穿牽繩和背套，在飼主不在的情況下簡單試遛五分鐘。"}]},
  "到府美容/洗澡":{intro:"到府美容前，務必與飼主確認毛孩個性與洗澡細節，保障雙方安全。",prep:["保姆需自備相關工具，洗毛精可與飼主協調由誰提供"],steps:[{n:"01",t:"事前確認",c:"#9B7553",s:"去執行服務前一定要跟飼主確認毛孩個性與洗澡細節（是否有攻擊性、皮膚過敏、是否自備洗毛精等）。"},{n:"02",t:"建立信任",c:"#C19A6B",s:"先與毛孩玩耍、給零食培養感情，蒐集美容前的對比照！"},{n:"03",t:"執行美容",c:"#7A9E7E",s:"洗澡時需幫毛孩清耳朵、清眼屎、擠肛門腺。可依需求提供剪指甲、修腳底毛等附加服務。\n\n⚠️ 若毛孩太兇無法執行，可取消訂單。"},{n:"04",t:"注意事項",c:"#C8845A",s:"發現皮膚異常需回報飼主。剪指甲流血可使用止血粉。"},{n:"05",t:"完成收尾",c:"#B07878",s:"美容完給毛孩零食獎勵！蒐集美容後的對比照。清理地上毛髮，消毒自己的工具。"}]},
};

const SERVICE_FLOWS={
  "安親寄宿":{steps:[{icon:"📸",t:"拍照回報",d:"時時刻刻傳照片給飼主，回報毛孩「吃喝拉撒睡」。餵食拍碗、陪伴玩耍、休息睡覺都可以拍照傳！"},{icon:"🛡️",t:"保護自家環境",d:"自家環境物品需自行保護，避免毛孩誤食就醫或破壞物品。"},{icon:"📱",t:"保障自己",d:"隨時拍毛孩的照片傳給飼主並告知狀況，可保障自己權益。"}],checklist:["🍚 吃吃喝喝","💩 大便尿尿","😴 睡覺休息","📝 飼主交代事項"]},
  "到府照顧":{steps:[{icon:"📸",t:"到府拍照通知",d:"進門時拍照告知飼主已進門，可預告前往時間讓飼主準備。"},{icon:"📲",t:"時時照片回報",d:"餵食拍碗、清貓砂拍照、陪伴玩耍都盡量拍照傳給飼主。"},{icon:"💝",t:"貼心附加服務",d:"打掃貓砂盆附近、噴除臭噴霧、澆花…讓飼主下次更想預訂您！"},{icon:"🚪",t:"離開拍照告別",d:"離開時拍照、告知飼主毛孩情況，保障自身權益。"}],checklist:["🍚 吃吃喝喝","💩 大便尿尿","😴 睡覺休息","📝 飼主交代事項","⏰ 準時進出門"]},
  "陪伴散步":{steps:[{icon:"🔗",t:"確認牽繩再開門",d:"確認繫好牽繩再開門，避免毛孩爆衝。若飼主不在，接毛孩時拍照告知已帶毛孩出門。"},{icon:"📲",t:"時時照片回報",d:"毛孩便便後回報健康度、尿尿次數；陪伴玩耍都可以拍照傳給飼主！"},{icon:"💝",t:"貼心小動作",d:"自備小零食/小玩具增進感情、便便後幫擦屁屁、帶回家時幫擦腳…"},{icon:"🏠",t:"安全回家",d:"結束散步帶毛孩回家時，確認關好門再解開牽繩。若飼主不在，拍照告知毛孩平安回到家。"}],checklist:["💩 大便尿尿","💧 喝水休息","📝 飼主交代事項","⏰ 準時接送"]},
  "到府美容/洗澡":{steps:[{icon:"📋",t:"事前確認",d:"去執行服務前一定要跟飼主確認毛孩個性與洗澡細節。"},{icon:"🛁",t:"執行美容",d:"清耳朵、清眼屎、擠肛門腺；依需求提供剪指甲、修腳底毛等附加服務。"},{icon:"⚠️",t:"異常回報",d:"發現皮膚有異常情形需回報飼主。剪指甲流血可使用止血粉。"},{icon:"🧹",t:"清理收尾",d:"服務結束清理地上毛髮，清理、消毒自己的工具。"}],checklist:["🛁 完成洗澡","✂️ 美容服務","🎁 零食獎勵","📸 前後對比照","🧹 清潔環境"]},
};

// ══════════════════════════════════════
// 色彩
// ══════════════════════════════════════
const C={
  bg:"#FAF6F0",surface:"#F5EFE6",card:"#FFFFFF",card2:"#FDF8F2",
  border:"#E8DDD0",border2:"#D4C4B0",
  accent:"#9B7553",accent2:"#C19A6B",soft:"#E8D5BC",
  text:"#4A3728",muted:"#8B7355",dim:"#B8A898",
  green:"#7A9E7E",orange:"#C8845A",red:"#B07878",
  holiday:"#C96A60",holidayBg:"#FEF2F0",
  makeup:"#9B7BAF",makeupBg:"#F5F0FA",
};

const pill=(color)=>({display:"inline-flex",alignItems:"center",background:color+"18",color,border:`1px solid ${color}44`,borderRadius:20,padding:"3px 11px",fontSize:11.5,fontWeight:600});
const cardSt={background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16,boxShadow:"0 2px 12px rgba(154,117,83,.08)"};
const inp={width:"100%",boxSizing:"border-box",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 13px",fontSize:15,outline:"none",fontFamily:"inherit"};
const lbl={fontSize:12,color:C.muted,marginBottom:5,display:"block",letterSpacing:".4px"};
const btnP={fontFamily:"inherit",cursor:"pointer",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,color:"#fff",border:"none",borderRadius:12,padding:"12px 18px",fontWeight:600,fontSize:15};
const btnG={fontFamily:"inherit",cursor:"pointer",background:C.surface,color:C.muted,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 18px",fontWeight:500,fontSize:15};
const btnD={fontFamily:"inherit",cursor:"pointer",background:"#FDF0EE",color:C.red,border:`1px solid ${C.red}44`,borderRadius:12,padding:"12px 18px",fontWeight:500,fontSize:15};

// ══════════════════════════════════════
// API
// ══════════════════════════════════════
const api={
  getBookings:()=>fetch("/api/bookings").then(r=>r.json()),
  createBooking:(b)=>fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()),
  updateBooking:(b)=>fetch("/api/bookings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).then(r=>r.json()),
  deleteBooking:(id)=>fetch("/api/bookings",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}).then(r=>r.json()),
  getVisitForms:()=>fetch("/api/visit-forms").then(r=>r.json()),
  saveVisitForm:(f)=>f.id
    ?fetch("/api/visit-forms",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}).then(r=>r.json())
    :fetch("/api/visit-forms",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}).then(r=>r.json()),
};

// ══════════════════════════════════════
// UI 元件
// ══════════════════════════════════════
function Modal({open,onClose,children,wide}){
  if(!open)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(74,55,40,.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",border:`1px solid ${C.border}`,boxShadow:"0 -8px 40px rgba(74,55,40,.18)"}}>
        {children}
      </div>
    </div>
  );
}
function ModalWide({open,onClose,children}){
  if(!open)return null;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(74,55,40,.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",width:"100%",maxWidth:680,maxHeight:"95vh",overflowY:"auto",border:`1px solid ${C.border}`,boxShadow:"0 -8px 40px rgba(74,55,40,.18)"}}>
        {children}
      </div>
    </div>
  );
}
function Toast({message,show,error}){
  if(!show)return null;
  return <div style={{position:"fixed",bottom:36,left:"50%",transform:"translateX(-50%)",zIndex:3000,background:error?C.red:C.green,color:"#fff",borderRadius:12,padding:"12px 24px",fontSize:15,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,.2)",fontFamily:"inherit",whiteSpace:"nowrap"}}>{error?"❌":"✅"} {message}</div>;
}
function ConfirmDialog({open,message,onConfirm,onCancel}){
  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(74,55,40,.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.card,borderRadius:20,padding:28,width:"100%",maxWidth:340,border:`1px solid ${C.border}`,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,color:C.text,marginBottom:20,lineHeight:1.6}}>{message}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onConfirm} style={{...btnD,flex:1,padding:"12px 0"}}>確定刪除</button>
          <button onClick={onCancel} style={{...btnG,flex:1,padding:"12px 0"}}>取消</button>
        </div>
      </div>
    </div>
  );
}

function DatePicker({selected,onChange}){
  const [viewMo,setViewMo]=useState(()=>{
    if(selected&&selected.length>0)return new Date(selected[0]+"T00:00:00");
    return new Date();
  });
  const yr=viewMo.getFullYear(),mo=viewMo.getMonth();
  const firstDay=new Date(yr,mo,1).getDay();
  const days=new Date(yr,mo+1,0).getDate();
  const cells=Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  while(cells.length%7)cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const toggle=d=>{const s=ds(d);onChange(selected.includes(s)?selected.filter(x=>x!==s):[...selected,s].sort());};
  return(
    <div style={{background:C.surface,borderRadius:12,padding:12,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <button type="button" onClick={()=>setViewMo(new Date(yr,mo-1,1))} style={{...btnG,padding:"6px 14px",fontSize:16}}>‹</button>
        <span style={{fontSize:14,fontWeight:600,color:C.text}}>{yr}/{mo+1}</span>
        <button type="button" onClick={()=>setViewMo(new Date(yr,mo+1,1))} style={{...btnG,padding:"6px 14px",fontSize:16}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {WEEKDAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:11,color:i===0?C.holiday:C.dim}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return <div key={i}/>;
          const s=ds(d),isSel=selected.includes(s),h=TW_HOLIDAYS[s];
          return <div key={i} onClick={()=>toggle(d)} style={{height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,background:isSel?C.accent:h?"#FEF0EE":"transparent",color:isSel?"#fff":h?C.holiday:C.text,border:isSel?`1px solid ${C.accent}`:`1px solid transparent`}}>{d}</div>;
        })}
      </div>
      {selected.length>0&&<div style={{marginTop:8,fontSize:12,color:C.muted}}>已選：{selected.map(d=>d.slice(5).replace("-","/")).join("、")}</div>}
    </div>
  );
}

// ══════════════════════════════════════
// BookingForm（手機優化：單欄）
// ══════════════════════════════════════
function BookingForm({initial,onSave,onCancel,loading}){
  const blank={pets:[{name:"",type:"狗"}],ownerName:"",ownerPhone:"",dates:[],timeOfDay:"白天",appointmentTime:"",serviceType:"安親寄宿",duration:60,status:"pending",price:"",paid:false,notes:"",address:""};
  const [f,setF]=useState(initial?{...initial,pets:initial.pets&&initial.pets.length>0?initial.pets:[{name:"",type:"狗"}]}:blank);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const setPet=(i,k,v)=>setF(p=>{const pets=p.pets.map((pet,idx)=>idx===i?{...pet,[k]:v}:pet);return{...p,pets};});
  const addPet=()=>setF(p=>({...p,pets:[...p.pets,{name:"",type:"狗"}]}));
  const removePet=i=>setF(p=>({...p,pets:p.pets.filter((_,idx)=>idx!==i)}));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:18,margin:0}}>{initial?"✏️ 編輯預約":"➕ 新增預約"}</h2>
        <button onClick={onCancel} style={{...btnG,padding:"8px 14px",fontSize:14}}>✕</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={lbl}>飼主姓名 *</label><ClearableInput value={f.ownerName} onChange={e=>set("ownerName",e.target.value)} placeholder="例：王小明"/></div>
        <div><label style={lbl}>飼主電話</label><ClearableInput value={f.ownerPhone} onChange={e=>set("ownerPhone",e.target.value)} placeholder="0912-345-678" type="tel"/></div>
        <div>
          <label style={lbl}>🐾 寵物資訊 *</label>
          {f.pets.map((pet,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input style={{...inp,flex:2}} value={pet.name} onChange={e=>setPet(i,"name",e.target.value)} placeholder={`寵物${i+1}名稱`}/>
              <select style={{...inp,flex:1,padding:"10px 8px"}} value={pet.type} onChange={e=>setPet(i,"type",e.target.value)}>
                {PET_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              {f.pets.length>1&&<button type="button" onClick={()=>removePet(i)} style={{...btnD,padding:"10px 12px",fontSize:15,flexShrink:0}}>✕</button>}
            </div>
          ))}
          <button type="button" onClick={addPet} style={{...btnG,padding:"8px 14px",fontSize:14}}>+ 新增寵物</button>
        </div>
        <div><label style={lbl}>服務日期 *（可多選）</label><DatePicker selected={f.dates||[]} onChange={v=>set("dates",v)}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={lbl}>時段</label>
            <select style={{...inp,padding:"10px 8px"}} value={f.timeOfDay} onChange={e=>set("timeOfDay",e.target.value)}>
              {TIME_OF_DAY.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={lbl}>指定時間</label><input style={inp} type="time" value={f.appointmentTime} onChange={e=>set("appointmentTime",e.target.value)}/></div>
        </div>
        <div><label style={lbl}>服務類型</label>
          <select style={inp} value={f.serviceType} onChange={e=>set("serviceType",e.target.value)}>
            {SERVICE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={lbl}>時長（分鐘）</label><input style={inp} type="number" value={f.duration} onChange={e=>set("duration",+e.target.value)}/></div>
          <div><label style={lbl}>服務金額（元）</label><input style={inp} type="number" value={f.price} onChange={e=>set("price",+e.target.value)} placeholder="1500"/></div>
        </div>
        <div>
          <label style={lbl}>付款狀態</label>
          <div style={{display:"flex",gap:8}}>
            {[{v:false,l:"⏳ 未付款"},{v:true,l:"✅ 已付款"}].map(opt=>(
              <button key={String(opt.v)} type="button" onClick={()=>set("paid",opt.v)} style={{fontFamily:"inherit",cursor:"pointer",flex:1,padding:"12px 0",fontSize:14,fontWeight:600,borderRadius:10,border:`1px solid ${f.paid===opt.v?C.accent:C.border}`,background:f.paid===opt.v?`${C.accent}18`:C.surface,color:f.paid===opt.v?C.accent:C.muted}}>{opt.l}</button>
            ))}
          </div>
        </div>
        <div><label style={lbl}>預約狀態</label>
          <select style={inp} value={f.status} onChange={e=>set("status",e.target.value)}>
            {Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div><label style={lbl}>服務地址</label><ClearableInput value={f.address} onChange={e=>set("address",e.target.value)} placeholder="台北市..."/></div>
        <div><label style={lbl}>備註</label><ClearableTextarea value={f.notes} onChange={e=>set("notes",e.target.value)} placeholder="飲食習慣、特殊行為、藥物需求..."/></div>
        <button onClick={()=>{
          if(!f.ownerName||!f.dates||f.dates.length===0||!f.pets[0]?.name){alert("請填飼主姓名、至少一隻寵物名稱，並選擇日期");return;}
          onSave({...f,title:`${f.pets.map(p=>p.name).join("＆")} — ${f.serviceType}`});
        }} style={{...btnP,width:"100%"}} disabled={loading}>{loading?"⏳ 儲存中...":"💾 儲存"}</button>
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
  while(cells.length%7)cells.push(null);
  const ds=d=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const today=new Date().toISOString().slice(0,10);
  return(
    <div style={cardSt}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setView(new Date(yr,mo-1,1))} style={{...btnG,padding:"8px 16px",fontSize:20}}>‹</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:17,fontWeight:700,color:C.text}}>{yr} 年 {mo+1} 月</div>
        </div>
        <button onClick={()=>setView(new Date(yr,mo+1,1))} style={{...btnG,padding:"8px 16px",fontSize:20}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {WEEKDAYS.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,padding:"3px 0",color:i===0?C.holiday:i===6?C.orange:C.muted}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((d,i)=>{
          if(!d)return <div key={i}/>;
          const dateStr=ds(d),bs=bookings.filter(b=>(b.dates||[]).includes(dateStr));
          const h=TW_HOLIDAYS[dateStr];
          const isHol=h&&h.t==="假",isMakeup=h&&h.t==="補";
          const isToday=dateStr===today,isSel=dateStr===selectedDate,dow=new Date(yr,mo,d).getDay();
          return(
            <div key={i} onClick={()=>onSelectDate(dateStr)} style={{minHeight:52,borderRadius:8,padding:"3px 4px",cursor:"pointer",background:isSel?`${C.accent}18`:isHol?C.holidayBg:isMakeup?C.makeupBg:isToday?`${C.accent2}10`:"transparent",border:isSel?`2px solid ${C.accent}`:isToday?`1px solid ${C.accent2}66`:`1px solid transparent`,transition:"all .13s"}}>
              <div style={{fontSize:13,fontWeight:isToday||isSel?700:400,lineHeight:1,marginBottom:1,color:isHol?C.holiday:isMakeup?C.makeup:isSel?C.accent:isToday?C.accent:dow===0?C.holiday:dow===6?C.orange:C.text}}>{d}</div>
              {h&&<div style={{fontSize:7,lineHeight:1.2,color:isHol?C.holiday:C.makeup,fontWeight:600}}>{h.n.slice(0,4)}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:1}}>
                {bs.slice(0,3).map(b=><div key={b.id} style={{width:6,height:6,borderRadius:"50%",background:STATUS_MAP[b.status]?.color||C.muted}}/>)}
                {bs.length>3&&<span style={{fontSize:8,color:C.dim}}>+{bs.length-3}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:C.muted}}><div style={{width:9,height:9,borderRadius:2,background:C.holidayBg,border:`1px solid ${C.holiday}55`}}/>假日</div>
        <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:C.muted}}><div style={{width:9,height:9,borderRadius:2,background:C.makeupBg,border:`1px solid ${C.makeup}55`}}/>補假</div>
        {Object.entries(STATUS_MAP).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:C.muted}}><div style={{width:7,height:7,borderRadius:"50%",background:v.color}}/>{v.label}</div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// BookingCard（手機優化）
// ══════════════════════════════════════
function BookingCard({booking,onClick}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  return(
    <div onClick={()=>onClick(booking)} style={{...cardSt,cursor:"pointer",padding:"14px 14px",borderLeft:`4px solid ${STATUS_MAP[booking.status]?.color||C.muted}`,transition:"box-shadow .15s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>{petStr}</div>
          <div style={{fontSize:12,color:C.muted}}>{booking.ownerName} · {SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0,marginLeft:8}}>
          <span style={pill(STATUS_MAP[booking.status]?.color||C.muted)}>{STATUS_MAP[booking.status]?.label}</span>
          <span style={{fontSize:11,color:booking.paid?C.green:C.orange,fontWeight:600}}>{booking.paid?"✅ 已付款":"⏳ 未付款"}</span>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,fontSize:12,color:C.muted}}>
        <span>📅 {(booking.dates||[]).length>1?`${booking.dates[0]} 等${booking.dates.length}天`:booking.dates?.[0]||""}</span>
        <span>🌤 {booking.timeOfDay}{booking.appointmentTime?` ${booking.appointmentTime}`:""}</span>
        {booking.price?<span style={{color:C.accent,fontWeight:600}}>NT${booking.price.toLocaleString()}</span>:null}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// DetailView
// ══════════════════════════════════════
function DetailView({booking,hasSavedForm,onClose,onEdit,onDelete,onVisitForm}){
  const petStr=(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・");
  const row=(l,v,color)=>v!=null&&v!==""?(<div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}><span style={{color:C.muted,flexShrink:0,marginRight:12}}>{l}</span><span style={{color:color||C.text,fontWeight:500,textAlign:"right"}}>{v}</span></div>):null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:28}}>{(booking.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
        <button onClick={onClose} style={{...btnG,padding:"8px 14px",fontSize:14}}>✕</button>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>{petStr}</div>
        <div style={{fontSize:13,color:C.accent}}>{SERVICE_ICONS[booking.serviceType]} {booking.serviceType}</div>
        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={pill(STATUS_MAP[booking.status]?.color||C.muted)}>{STATUS_MAP[booking.status]?.label}</span>
          <span style={pill(booking.paid?C.green:C.orange)}>{booking.paid?"✅ 已付款":"⏳ 未付款"}</span>
        </div>
      </div>
      {row("飼主",booking.ownerName)}
      {row("電話",booking.ownerPhone)}
      {row("日期",(booking.dates||[]).join("、"))}
      {row("時段",`${booking.timeOfDay}${booking.appointmentTime?` ${booking.appointmentTime}`:""}`)}
      {row("時長",`${booking.duration} 分鐘`)}
      {row("金額",booking.price?`NT$ ${booking.price?.toLocaleString()}`:null)}
      {row("地址",booking.address)}
      {booking.notes&&<div style={{marginTop:12,padding:"12px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`}}><div style={{fontSize:11,color:C.accent,marginBottom:4}}>📝 注意事項</div><div style={{fontSize:14,color:C.text,lineHeight:1.7}}>{booking.notes}</div></div>}
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
        <button onClick={onVisitForm} style={{...btnP,width:"100%"}}>📋 {hasSavedForm?"查看家訪表 ✓":"填寫家訪表"}</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onEdit} style={{...btnG,flex:1}}>✏️ 編輯</button>
          <button onClick={onDelete} style={{...btnD,flex:1}}>🗑 刪除</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 清除按鈕輸入框元件
// ══════════════════════════════════════
function ClearableInput({value,onChange,placeholder,type,style}){
  return(
    <div style={{position:"relative",display:"flex",alignItems:"center"}}>
      <input
        type={type||"text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{...inp,...style,paddingRight:value?38:13}}
      />
      {value&&(
        <button
          type="button"
          onClick={()=>onChange({target:{value:""}})}
          style={{position:"absolute",right:8,background:"none",border:"none",cursor:"pointer",
            color:C.dim,fontSize:18,lineHeight:1,padding:"2px 4px",borderRadius:4,fontFamily:"inherit",
            display:"flex",alignItems:"center",justifyContent:"center"}}
        >×</button>
      )}
    </div>
  );
}

function ClearableTextarea({value,onChange,placeholder,style}){
  return(
    <div style={{position:"relative"}}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{...inp,minHeight:70,resize:"vertical",paddingRight:value?36:13,...style}}
      />
      {value&&(
        <button
          type="button"
          onClick={()=>onChange({target:{value:""}})}
          style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",
            color:C.dim,fontSize:18,lineHeight:1,padding:"2px 4px",borderRadius:4,fontFamily:"inherit"}}
        >×</button>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// VisitForm（Cloudinary unsigned + 清除按鈕）
// ══════════════════════════════════════
function VisitForm({booking,savedData,onSave,onClose,loading}){
  const [form,setForm]=useState(savedData||{});
  const metaKeys=["id","bookingId","title","飼主姓名","飼主電話","寵物名稱","寵物種類","服務類型","done"];
  const [editing,setEditing]=useState(!savedData||Object.keys(savedData).filter(k=>!metaKeys.includes(k)).length===0);
  const [images,setImages]=useState(()=>{
    const saved=savedData?.imageUrls;
    if(!saved)return[];
    return saved.split(',').filter(Boolean).map(url=>({url,uploading:false}));
  });
  const [uploadingCount,setUploadingCount]=useState(0);
  const [uploadError,setUploadError]=useState("");
  const fileRef=useRef();
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sections=VISIT_FORMS[booking.serviceType]||VISIT_FORMS["到府照顧"];

  const handleImageUpload=async(e)=>{
    const files=[...e.target.files];
    if(!files.length)return;
    setUploadError("");

    for(let i=0;i<files.length;i++){
      const file=files[i];
      const tempId=`uploading-${Date.now()}-${i}`;
      // 加入上傳中 placeholder
      setImages(prev=>[...prev,{url:"",uploading:true,tempId}]);
      setUploadingCount(c=>c+1);
      try{
        const base64=await new Promise((resolve,reject)=>{
          const reader=new FileReader();
          reader.onload=ev=>resolve(ev.target.result);
          reader.onerror=reject;
          reader.readAsDataURL(file);
        });
        const resp=await fetch('/api/upload-image',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({data:base64}),
        });
        const result=await resp.json();
        if(result.url){
          setImages(prev=>prev.map(img=>img.tempId===tempId?{url:result.url,uploading:false}:img));
        } else {
          setImages(prev=>prev.filter(img=>img.tempId!==tempId));
          setUploadError(`上傳失敗：${result.error||"請重試"}`);
        }
      }catch(err){
        setImages(prev=>prev.filter(img=>img.tempId!==tempId));
        setUploadError("上傳失敗，請檢查網路連線");
      }finally{
        setUploadingCount(c=>c-1);
      }
    }
    e.target.value='';
  };

  const removeImage=i=>setImages(prev=>prev.filter((_,idx)=>idx!==i));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:17,margin:"0 0 4px"}}>📋 家訪表 — {booking.serviceType}</h2>
          <div style={{color:C.muted,fontSize:12}}>{(booking.pets||[]).map(p=>`${PET_EMOJI[p.type]||"🐾"} ${p.name}`).join("・")} · {booking.ownerName}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {!editing&&<button onClick={()=>setEditing(true)} style={{...btnG,padding:"8px 12px",fontSize:13}}>✏️ 編輯</button>}
          <button onClick={onClose} style={{...btnG,padding:"8px 12px"}}>✕</button>
        </div>
      </div>
      {!editing&&<div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.green}}>👁️ 查看模式 — 點「編輯」可修改內容</div>}

      {/* 家訪問題 — 編輯時加上清除按鈕 */}
      {sections.map(sec=>(
        <div key={sec.title} style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:8,paddingBottom:5,borderBottom:`1px solid ${C.border}`}}>{sec.title}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sec.fields.map(fld=>(
              <div key={fld.key}>
                <label style={{...lbl,fontSize:12}}>{fld.label}</label>
                {editing
                  ? fld.type==="textarea"
                    ? <ClearableTextarea value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)} placeholder="請填寫..."/>
                    : <ClearableInput value={form[fld.key]||""} onChange={e=>set(fld.key,e.target.value)} placeholder="請填寫..."/>
                  : <div style={{padding:"10px 13px",background:C.surface,borderRadius:10,fontSize:14,color:form[fld.key]?C.text:C.dim,border:`1px solid ${C.border}`,minHeight:42,lineHeight:1.6}}>{form[fld.key]||"（未填寫）"}</div>
                }
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 📷 家訪照片 */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:8,paddingBottom:5,borderBottom:`1px solid ${C.border}`}}>📷 家訪照片</div>
        {images.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
            {images.map((img,i)=>(
              <div key={i} style={{position:"relative",borderRadius:8,overflow:"hidden",aspectRatio:"1",background:C.surface,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {img.uploading
                  ?<div style={{fontSize:11,color:C.dim,textAlign:"center",padding:8}}>⏳<br/>上傳中</div>
                  :<img src={img.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onClick={()=>window.open(img.url,'_blank')}/>
                }
                {!img.uploading&&(
                  <button onClick={()=>removeImage(i)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.55)",color:"#fff",border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
                )}
              </div>
            ))}
          </div>
        )}
        {uploadError&&<div style={{color:C.red,fontSize:12,marginBottom:8}}>⚠️ {uploadError}</div>}
        {images.length===0&&!editing&&<div style={{color:C.dim,fontSize:13,marginBottom:8}}>尚未上傳照片</div>}
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleImageUpload}/>
        <button onClick={()=>{setUploadError("");fileRef.current.click();}} style={{...btnG,fontSize:13,padding:"10px 16px"}} disabled={uploadingCount>0}>
          {uploadingCount>0?`⏳ 上傳中 (${uploadingCount})...`:"📷 上傳照片"}
        </button>
      </div>

      {editing&&(
        <button onClick={()=>{
          if(uploadingCount>0)return;
          const validUrls=images.filter(img=>!img.uploading&&img.url).map(img=>img.url);
          onSave({
            ...form,
            id:savedData?.id,
            title:`${(booking.pets||[]).map(p=>p.name).join("＆")} 家訪表`,
            飼主姓名:booking.ownerName,
            飼主電話:booking.ownerPhone,
            寵物名稱:(booking.pets||[]).map(p=>p.name).join("、"),
            寵物種類:booking.pets?.[0]?.type||"其他",
            服務類型:booking.serviceType,
            bookingId:booking.id,
            imageUrls:validUrls.join(','),
          });
        }} style={{...btnP,width:"100%",opacity:uploadingCount>0?0.6:1}} disabled={loading||uploadingCount>0}>
          {loading?"⏳ 儲存中...":uploadingCount>0?"⏳ 等待圖片上傳...":"💾 儲存到 Notion"}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// 服務指南
// ══════════════════════════════════════
function ServiceGuide({onClose}){
  const [tab,setTab]=useState("visit");
  const [svcType,setSvcType]=useState("安親寄宿");
  const [courseTag,setCourseTag]=useState("全部");
  const tags=["全部","🐕 狗狗","🐈 貓咪","🐕🐈 綜合","🐇🐦 特殊"];
  const filteredCourses=COURSES.filter(c=>courseTag==="全部"||c.tag===courseTag);
  const tabBtn=(id,label)=>(
    <button onClick={()=>setTab(id)} style={{fontFamily:"inherit",cursor:"pointer",flex:1,background:tab===id?`linear-gradient(135deg,${C.accent},${C.accent2})`:C.surface,color:tab===id?"#fff":C.muted,border:`1px solid ${tab===id?C.accent:C.border}`,borderRadius:10,padding:"10px 8px",fontWeight:600,fontSize:13}}>{label}</button>
  );
  const guide=VISIT_GUIDES[svcType]||VISIT_GUIDES["到府照顧"];
  const flow=SERVICE_FLOWS[svcType]||SERVICE_FLOWS["到府照顧"];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:C.text,fontFamily:"'Noto Serif TC',serif",fontSize:18,margin:0}}>📖 保姆服務指南</h2>
        <button onClick={onClose} style={{...btnG,padding:"8px 12px"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>{tabBtn("visit","🏠 家訪")}{tabBtn("service","🐾 服務")}{tabBtn("course","🎓 課程")}</div>
      {(tab==="visit"||tab==="service")&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {SERVICE_TYPES.map(t=>(
            <button key={t} onClick={()=>setSvcType(t)} style={{fontFamily:"inherit",cursor:"pointer",background:svcType===t?C.soft:C.surface,color:svcType===t?C.accent:C.muted,border:`1px solid ${svcType===t?C.accent2:C.border}`,borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:svcType===t?700:400}}>{SERVICE_ICONS[t]} {t}</button>
          ))}
        </div>
      )}
      {tab==="visit"&&(
        <div>
          <div style={{background:"#FEF6F0",border:"1px solid #E8C4A8",borderRadius:12,padding:"12px",marginBottom:14,fontSize:13,color:C.muted,lineHeight:1.7}}>🌸 {guide.intro}</div>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:8}}>🎒 家訪前準備</div>
          {guide.prep.map((p,i)=><div key={i} style={{background:C.surface,borderRadius:10,padding:"10px 12px",marginBottom:6,fontSize:13,color:C.muted,lineHeight:1.6}}>{p}</div>)}
          <div style={{fontSize:13,fontWeight:700,color:C.accent,margin:"14px 0 8px"}}>📍 家訪步驟</div>
          {guide.steps.map(vs=>(
            <div key={vs.n} style={{borderRadius:12,padding:"12px",marginBottom:8,background:C.card2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${vs.c}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                <span style={{background:vs.c,color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>STEP {vs.n}</span>
                <span style={{fontWeight:700,color:C.text,fontSize:14}}>{vs.t}</span>
              </div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.7,whiteSpace:"pre-line"}}>{vs.s}</div>
            </div>
          ))}
          {guide.extra&&<div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"12px",fontSize:13,color:C.muted,lineHeight:1.7}}>{guide.extra}</div>}
        </div>
      )}
      {tab==="service"&&(
        <div>
          {flow.steps.map((sf,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:C.card2,borderRadius:12,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:22,flexShrink:0}}>{sf.icon}</div>
              <div><div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:3}}>{sf.t}</div><div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{sf.d}</div></div>
            </div>
          ))}
          <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"14px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:8}}>✅ 合格保姆清單</div>
            {flow.checklist.map(c=>(
              <div key={c} style={{display:"flex",gap:8,alignItems:"center",background:C.card,borderRadius:8,padding:"8px 12px",border:`1px solid ${C.border}`,marginBottom:6}}>
                <span style={{fontSize:16}}>{c.slice(0,2)}</span><span style={{fontSize:13,color:C.text}}>{c.slice(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="course"&&(
        <div>
          <div style={{background:"#F0F7F2",border:"1px solid #BFD9C8",borderRadius:12,padding:"12px",marginBottom:14}}>
            <div style={{fontWeight:700,color:C.green,fontSize:14,marginBottom:4}}>🎓 臺北e大免費寵物課程</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>完全免費！只需註冊台北通或e大會員帳號即可學習。</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {tags.map(t=><button key={t} onClick={()=>setCourseTag(t)} style={{fontFamily:"inherit",cursor:"pointer",background:courseTag===t?C.accent:C.surface,color:courseTag===t?"#fff":C.muted,border:`1px solid ${courseTag===t?C.accent:C.border}`,borderRadius:20,padding:"6px 12px",fontSize:12}}>{t}</button>)}
          </div>
          {filteredCourses.map((c,i)=>(
            <a key={i} href={c.url} target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block",...cardSt,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:700,color:C.text,fontSize:14,flex:1}}>{c.title}</div>
                <span style={{...pill(C.accent2),fontSize:10,marginLeft:8}}>{c.tag}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:4}}>{c.desc}</div>
              <div style={{fontSize:12,color:C.accent,fontWeight:600}}>前往台北e大 →</div>
            </a>
          ))}
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
  const [showGuide,setShowGuide]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [search,setSearch]=useState("");
  const [toast,setToast]=useState({show:false,msg:"",error:false});
  // ➂ 收入篩選
  const [incomeRange,setIncomeRange]=useState("month"); // month | all | custom
  const [customStart,setCustomStart]=useState("");
  const [customEnd,setCustomEnd]=useState("");
  const [showIncomeFilter,setShowIncomeFilter]=useState(false);

  const showToast=(msg,error=false)=>{setToast({show:true,msg,error});setTimeout(()=>setToast({show:false,msg:"",error:false}),3000);};

  useEffect(()=>{
    Promise.all([api.getBookings(),api.getVisitForms()])
      .then(([bs,vfs])=>{
        setBookings(Array.isArray(bs)?bs:[]);
        const vfMap={};
        (Array.isArray(vfs)?vfs:[]).forEach(vf=>{if(vf.bookingId)vfMap[vf.bookingId]=vf;});
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
      }else{
        const created=await api.createBooking(f);
        setBookings(bs=>[created,...bs]);
        showToast("預約已新增！");
      }
      setShowForm(false);setEditTarget(null);setViewTarget(null);
    }catch{showToast("儲存失敗，請再試一次",true);}
    finally{setSaving(false);}
  };

  const doDelete=async()=>{
    setSaving(true);
    try{
      await api.deleteBooking(confirmDelete.id);
      setBookings(bs=>bs.filter(b=>b.id!==confirmDelete.id));
      showToast("預約已刪除");
    }catch{showToast("刪除失敗",true);}
    finally{setSaving(false);setConfirmDelete(null);}
  };

  const saveVisitForm=async(formData)=>{
    setSaving(true);
    try{
      const saved=await api.saveVisitForm(formData);
      if(formData.bookingId)setVisitForms(p=>({...p,[formData.bookingId]:saved}));
      showToast("家訪表已儲存到 Notion！");
      setVisitTarget(null);
    }catch{showToast("家訪表儲存失敗",true);}
    finally{setSaving(false);}
  };

  // ➂ 收入計算
  const today=new Date().toISOString().slice(0,10);
  const thisMonth=today.slice(0,7);
  const calcIncome=(bs)=>bs.filter(b=>b.status==="completed"&&b.paid&&b.price).reduce((s,b)=>s+(b.price||0),0);
  const incomeBookings=bookings.filter(b=>{
    if(!b.status==="completed"||!b.paid||!b.price)return false;
    const d=b.dates?.[0]||"";
    if(incomeRange==="month")return d.startsWith(thisMonth);
    if(incomeRange==="custom")return(!customStart||d>=customStart)&&(!customEnd||d<=customEnd);
    return true; // all
  });
  const completedIncome=calcIncome(incomeRange==="all"?bookings:incomeRange==="month"?bookings.filter(b=>(b.dates?.[0]||"").startsWith(thisMonth)):bookings.filter(b=>{const d=b.dates?.[0]||"";return(!customStart||d>=customStart)&&(!customEnd||d<=customEnd);}));

  const dayBookings=selectedDate?bookings.filter(b=>(b.dates||[]).includes(selectedDate)):[];
  const listBookings=bookings
    .filter(b=>statusFilter==="all"||b.status===statusFilter)
    .filter(b=>!search||b.pets?.some(p=>p.name.includes(search))||b.ownerName?.includes(search))
    .sort((a,b)=>(a.dates?.[0]||"").localeCompare(b.dates?.[0]||""));

  const upcomingHolidays=Object.entries(TW_HOLIDAYS).filter(([d])=>d>=today).slice(0,3);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Noto Sans TC','PingFang TC',sans-serif",maxWidth:600,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}select option{background:#FDF8F2;color:#4A3728;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.soft};border-radius:3px;}input[type=date],input[type=time]{color-scheme:light;}body{margin:0;}`}</style>

      <Toast message={toast.msg} show={toast.show} error={toast.error}/>
      <ConfirmDialog open={!!confirmDelete} message={`確定要刪除「${confirmDelete?.pets?.[0]?.name||""}」的預約嗎？`} onConfirm={doDelete} onCancel={()=>setConfirmDelete(null)}/>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 14px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:20}}>🐾</span>
              <span style={{fontFamily:"'Noto Serif TC',serif",fontSize:17,fontWeight:700,color:C.text}}>寵物保姆管理系統</span>
            </div>
            <div style={{fontSize:10,color:C.dim,marginLeft:26}}>即時同步 Notion 🌿</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {loading&&<div style={{fontSize:11,color:C.dim}}>⏳</div>}
            <button onClick={()=>setShowGuide(true)} style={{...btnG,fontSize:13,padding:"8px 12px"}}>📖</button>
          </div>
        </div>

        {/* Stats — ➃ 固定字型大小 */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[
            {label:"總預約",val:String(bookings.length),c:C.accent},
            {label:"今日",val:String(bookings.filter(b=>(b.dates||[]).includes(today)).length),c:C.green},
            {label:"待確認",val:String(bookings.filter(b=>b.status==="pending").length),c:C.orange},
            {label:incomeRange==="month"?`${thisMonth.slice(5)}月收入`:"累積收入",val:`$${completedIncome.toLocaleString()}`,c:C.green,tap:true},
          ].map((s,idx)=>(
            <div key={s.label} onClick={s.tap?()=>setShowIncomeFilter(!showIncomeFilter):undefined}
              style={{flex:1,textAlign:"center",background:C.card,border:`1px solid ${s.tap&&showIncomeFilter?C.accent:C.border}`,borderRadius:12,padding:"8px 4px",cursor:s.tap?"pointer":"default"}}>
              <div style={{fontSize:14,fontWeight:700,color:s.c,lineHeight:1.3,letterSpacing:"-0.3px"}}>{s.val}</div>
              <div style={{fontSize:10,color:C.dim,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ➂ 收入篩選器 */}
        {showIncomeFilter&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",marginBottom:12}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:8}}>查看收入範圍</div>
            <div style={{display:"flex",gap:6,marginBottom:incomeRange==="custom"?10:0}}>
              {[{v:"month",l:"本月"},{v:"all",l:"全部"},{v:"custom",l:"自訂"}].map(o=>(
                <button key={o.v} onClick={()=>setIncomeRange(o.v)} style={{fontFamily:"inherit",cursor:"pointer",flex:1,padding:"8px 0",fontSize:13,fontWeight:600,borderRadius:8,border:`1px solid ${incomeRange===o.v?C.accent:C.border}`,background:incomeRange===o.v?`${C.accent}18`:C.surface,color:incomeRange===o.v?C.accent:C.muted}}>{o.l}</button>
              ))}
            </div>
            {incomeRange==="custom"&&(
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} style={{...inp,flex:1,fontSize:13,padding:"8px 10px"}}/>
                <span style={{color:C.muted,fontSize:13}}>～</span>
                <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} style={{...inp,flex:1,fontSize:13,padding:"8px 10px"}}/>
              </div>
            )}
          </div>
        )}

        {/* 假日快訊 */}
        {upcomingHolidays.length>0&&(
          <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
            {upcomingHolidays.map(([d,h])=>(
              <div key={d} style={{display:"flex",alignItems:"center",gap:4,background:h.t==="補"?C.makeupBg:C.holidayBg,border:`1px solid ${h.t==="補"?C.makeup+"33":C.holiday+"33"}`,borderRadius:20,padding:"4px 10px",whiteSpace:"nowrap",fontSize:11,color:h.t==="補"?C.makeup:C.holiday,flexShrink:0}}>
                {h.t==="補"?"🔄":"🎉"} {d.slice(5).replace("-","/")} {h.n}
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",gap:4}}>
          {[{id:"calendar",label:"📅 月曆"},{id:"list",label:"📋 清單"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{fontFamily:"inherit",cursor:"pointer",border:`1px solid ${tab===t.id?C.border2:"transparent"}`,borderBottom:tab===t.id?`1px solid ${C.card}`:`1px solid transparent`,borderRadius:"10px 10px 0 0",padding:"8px 16px",fontWeight:tab===t.id?700:400,fontSize:14,background:tab===t.id?C.card:"transparent",color:tab===t.id?C.accent:C.muted,marginBottom:tab===t.id?-1:0}}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"14px 14px 80px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}>
            <div style={{fontSize:44,marginBottom:10}}>🐾</div>
            <div style={{fontSize:14}}>從 Notion 載入資料中...</div>
          </div>
        ):tab==="calendar"?(
          <div>
            <Calendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
            {selectedDate&&(
              <div style={{marginTop:12,...cardSt}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div>
                    <span style={{fontWeight:700,color:C.text,fontSize:14}}>{selectedDate.slice(5).replace("-","/")} 的預約</span>
                    <span style={{...pill(C.accent),marginLeft:8,fontSize:11}}>{dayBookings.length} 筆</span>
                    {TW_HOLIDAYS[selectedDate]&&<div style={{fontSize:11,color:TW_HOLIDAYS[selectedDate].t==="補"?C.makeup:C.holiday,marginTop:2}}>{TW_HOLIDAYS[selectedDate].t==="補"?"🔄":"🎉"} {TW_HOLIDAYS[selectedDate].n}</div>}
                  </div>
                  <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,padding:"8px 14px",fontSize:13}}>+ 新增</button>
                </div>
                {dayBookings.length===0
                  ?<div style={{textAlign:"center",padding:"24px 0",color:C.dim,fontSize:13}}>當日無預約 🌙</div>
                  :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {dayBookings.sort((a,b)=>(a.appointmentTime||"").localeCompare(b.appointmentTime||"")).map(b=>(
                      <div key={b.id} onClick={()=>setViewTarget(b)} style={{display:"flex",gap:10,alignItems:"center",background:C.surface,borderRadius:12,padding:"10px 12px",cursor:"pointer",border:`1px solid ${C.border}`,borderLeft:`3px solid ${STATUS_MAP[b.status]?.color||C.muted}`}}>
                        <div style={{fontSize:20}}>{(b.pets||[]).map(p=>PET_EMOJI[p.type]||"🐾").join("")}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,color:C.text,fontSize:14}}>{(b.pets||[]).map(p=>p.name).join("・")}</div>
                          <div style={{fontSize:11,color:C.muted}}>{b.ownerName} · {SERVICE_ICONS[b.serviceType]} {b.serviceType}</div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.accent}}>{b.timeOfDay}</div>
                          {b.appointmentTime&&<div style={{fontSize:11,color:C.accent2}}>{b.appointmentTime}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}
            {!selectedDate&&<div style={{textAlign:"center",marginTop:12,color:C.dim,fontSize:13}}>點選日期查看當日預約 📅</div>}
          </div>
        ):(
          <div>
            <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:12,paddingBottom:2}}>
              {[{key:"all",label:"全部",count:bookings.length},{key:"pending",label:"待確認",count:bookings.filter(b=>b.status==="pending").length},{key:"confirmed",label:"已確認",count:bookings.filter(b=>b.status==="confirmed").length},{key:"completed",label:"已完成",count:bookings.filter(b=>b.status==="completed").length},{key:"cancelled",label:"已取消",count:bookings.filter(b=>b.status==="cancelled").length}].map(t=>(
                <button key={t.key} onClick={()=>setStatusFilter(t.key)} style={{fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",background:statusFilter===t.key?`linear-gradient(135deg,${C.accent},${C.accent2})`:C.card,color:statusFilter===t.key?"#fff":C.muted,border:`1px solid ${statusFilter===t.key?"transparent":C.border}`,borderRadius:20,padding:"7px 12px",fontSize:13,fontWeight:600,flexShrink:0}}>
                  {t.label} <span style={{background:"rgba(255,255,255,.25)",borderRadius:10,padding:"1px 5px",fontSize:11}}>{t.count}</span>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 搜尋寵物或飼主..." style={{...inp,flex:1,fontSize:14}}/>
              <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,whiteSpace:"nowrap",padding:"10px 14px",fontSize:14}}>+ 新增</button>
            </div>
            {listBookings.length===0
              ?<div style={{textAlign:"center",padding:"60px 20px",color:C.dim}}><div style={{fontSize:44,marginBottom:10}}>🐾</div><div>沒有符合的預約</div></div>
              :<div style={{display:"flex",flexDirection:"column",gap:10}}>{listBookings.map(b=><BookingCard key={b.id} booking={b} onClick={setViewTarget}/>)}</div>
            }
          </div>
        )}
      </div>

      {/* 底部新增按鈕（手機用） */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:600,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"10px 14px",display:"flex",gap:10,zIndex:50}}>
        <button onClick={()=>setTab("calendar")} style={{fontFamily:"inherit",flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${tab==="calendar"?C.accent:C.border}`,background:tab==="calendar"?`${C.accent}18`:C.card,color:tab==="calendar"?C.accent:C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>📅 月曆</button>
        <button onClick={()=>{setEditTarget(null);setShowForm(true);}} style={{...btnP,flex:2,padding:"10px 0",fontSize:14}}>＋ 新增預約</button>
        <button onClick={()=>setTab("list")} style={{fontFamily:"inherit",flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${tab==="list"?C.accent:C.border}`,background:tab==="list"?`${C.accent}18`:C.card,color:tab==="list"?C.accent:C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>📋 清單</button>
      </div>

      {/* Modals */}
      <Modal open={showForm} onClose={()=>{if(!saving){setShowForm(false);setEditTarget(null);}}}>
        <BookingForm initial={editTarget} onSave={saveBooking} onCancel={()=>{setShowForm(false);setEditTarget(null);}} loading={saving}/>
      </Modal>
      <Modal open={!!viewTarget&&!showForm&&!visitTarget} onClose={()=>setViewTarget(null)}>
        {viewTarget&&<DetailView booking={viewTarget} hasSavedForm={!!visitForms[viewTarget.id]} onClose={()=>setViewTarget(null)} onEdit={()=>{setEditTarget(viewTarget);setShowForm(true);}} onDelete={()=>{setViewTarget(null);setConfirmDelete(viewTarget);}} onVisitForm={()=>setVisitTarget(viewTarget)}/>}
      </Modal>
      <ModalWide open={!!visitTarget} onClose={()=>{if(!saving)setVisitTarget(null);}}>
        {visitTarget&&<VisitForm booking={visitTarget} savedData={visitForms[visitTarget.id]||null} onSave={saveVisitForm} onClose={()=>setVisitTarget(null)} loading={saving}/>}
      </ModalWide>
      <ModalWide open={showGuide} onClose={()=>setShowGuide(false)}>
        <ServiceGuide onClose={()=>setShowGuide(false)}/>
      </ModalWide>
    </div>
  );
}
