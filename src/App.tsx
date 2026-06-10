import { useState } from "react";
import { HERO_IMG } from "./images";

const G = "#C9A84C";
const G2 = "rgba(201,168,76,0.15)";
const GB = "rgba(201,168,76,0.3)";
const W = "#fff";
const W6 = "rgba(255,255,255,0.6)";
const W2 = "rgba(255,255,255,0.12)";
const BG = "#080c18";
const BG2 = "#0d1220";
const INP = "rgba(255,255,255,0.07)";
const INB = "rgba(255,255,255,0.15)";

type FormState = { name:string; affiliation:string; phone:string; session:string; injury:string; notes:string; done:boolean };
type Submission = { id:string; name:string; affiliation:string; phone:string; session:string; injury:string; notes:string; at:string };
const empty:FormState = { name:"", affiliation:"", phone:"", session:"", injury:"", notes:"", done:false };
const sLabel = (v:string) => v==="first"?"7월 4일":v;
const iLabel = (v:string) => v==="none"?"없음":v==="minor"?"경미":v==="major"?"치료중":"-";

function useLocalSubs(): [Submission[], (fn: (p: Submission[]) => Submission[]) => void] {
  const [subs, setSubs] = useState<Submission[]>(() => {
    try { return JSON.parse(localStorage.getItem("subs") || "[]"); } catch { return []; }
  });
  const update = (fn: (p: Submission[]) => Submission[]) => {
    setSubs(prev => {
      const next = fn(prev);
      localStorage.setItem("subs", JSON.stringify(next));
      return next;
    });
  };
  return [subs, update];
}

function Field({label,req,children}:{label:string;req?:boolean;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>
        {label}{req&&<span style={{color:"#e05c5c",marginLeft:3}}>*</span>}
      </div>
      {children}
    </div>
  );
}

function Inp({value,onChange,placeholder,type="text"}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}) {
  return (
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:INP,border:"1px solid "+INB,borderRadius:8,padding:"13px 16px",color:W,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color 0.2s"}}
      onFocus={e=>(e.target.style.borderColor=G)} onBlur={e=>(e.target.style.borderColor=INB)}
    />
  );
}

function Chips({value,onChange,opts}:{value:string;onChange:(v:string)=>void;opts:{id:string;label:string}[]}) {
  return (
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      {opts.map(o=>{
        const on=value===o.id;
        return <button key={o.id} onClick={()=>onChange(o.id)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid "+(on?G:INB),background:on?G2:INP,color:on?G:W6,fontWeight:on?700:400,fontSize:14,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{o.label}</button>;
      })}
    </div>
  );
}

function Txt({value,onChange,placeholder}:{value:string;onChange:(v:string)=>void;placeholder?:string}) {
  return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3}
      style={{width:"100%",background:INP,border:"1px solid "+INB,borderRadius:8,padding:"13px 16px",color:W,fontSize:14,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6}}
      onFocus={e=>(e.target.style.borderColor=G)} onBlur={e=>(e.target.style.borderColor=INB)}
    />
  );
}

function PrivacyConsent({agreed,onChange}:{agreed:boolean;onChange:(v:boolean)=>void}) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:11,fontWeight:700,color:G,letterSpacing:"0.1em",marginBottom:8,textTransform:"uppercase"}}>
        개인정보 수집·이용 동의<span style={{color:"#e05c5c",marginLeft:3}}>*</span>
      </div>
      <div style={{background:INP,border:"1px solid "+INB,borderRadius:8,padding:"14px 16px",marginBottom:12}}>
        <div style={{color:W6,fontSize:11,lineHeight:1.75}}>
          <div style={{color:W,fontSize:12,fontWeight:700,marginBottom:8}}>수집·이용 안내</div>
          <div style={{marginBottom:4}}><span style={{color:W,fontWeight:600}}>수집 항목</span> · 이름, 소속, 전화번호, 부상 여부, 기타 신청 시 기재 내용</div>
          <div style={{marginBottom:4}}><span style={{color:W,fontWeight:600}}>이용 목적</span> · 세미나 신청 접수, 참가 안내, 입금 확인 및 문의 응대</div>
          <div style={{marginBottom:4}}><span style={{color:W,fontWeight:600}}>보유 기간</span> · 세미나 종료 후 1년 (이후 지체 없이 파기)</div>
          <div style={{marginBottom:4}}><span style={{color:W,fontWeight:600}}>수집 주체</span> · 스텝업 트레이닝 (STEP UP TRAINING)</div>
          <div><span style={{color:W,fontWeight:600}}>문의</span> · 010-6637-6811</div>
          <div style={{marginTop:8,color:"rgba(255,255,255,0.45)",fontSize:10}}>동의를 거부하실 수 있으나, 거부 시 세미나 신청이 제한됩니다.</div>
        </div>
      </div>
      <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
        <input type="checkbox" checked={agreed} onChange={e=>onChange(e.target.checked)}
          style={{width:18,height:18,marginTop:2,accentColor:G,flexShrink:0,cursor:"pointer"}} />
        <span style={{color:W,fontSize:13,lineHeight:1.5}}>위 내용을 확인하였으며, 개인정보 수집·이용에 동의합니다.</span>
      </label>
    </div>
  );
}

function Admin({subs,onBack,onDel}:{subs:Submission[];onBack:()=>void;onDel:(id:string)=>void}) {
  const [filter,setFilter]=useState<string>("all");
  const [exp,setExp]=useState<string>("");
  const list=filter==="all"?subs:subs.filter(s=>s.session===filter);
  const cnt=(k:string)=>k==="all"?subs.length:subs.filter(s=>s.session===k).length;
  return (
    <div style={{minHeight:"100vh",background:"#0d1117",fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif",paddingBottom:60}}>
      <div style={{background:"#161b22",borderBottom:"1px solid "+GB,padding:"20px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.2em",marginBottom:4}}>ADMIN DASHBOARD</div>
          <div style={{color:W,fontSize:17,fontWeight:900}}>신청 현황 관리</div>
        </div>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid "+W2,color:W6,padding:"8px 14px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>&#x2190; 신청 페이지</button>
      </div>
      <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
          {[{l:"전체",k:"all"},{l:"7월 4일",k:"first"}].map(s=>(
            <button key={s.k} onClick={()=>setFilter(s.k)} style={{background:filter===s.k?G2:"rgba(255,255,255,0.03)",border:"1px solid "+(filter===s.k?GB:"rgba(255,255,255,0.08)"),borderRadius:10,padding:"14px 8px",textAlign:"center",cursor:"pointer",fontFamily:"inherit"}}>
              <div style={{color:filter===s.k?G:W6,fontSize:10,marginBottom:6,letterSpacing:"0.05em"}}>{s.l}</div>
              <div style={{color:filter===s.k?G:W,fontSize:28,fontWeight:900}}>{cnt(s.k)}</div>
            </button>
          ))}
        </div>
        {list.length===0
          ?<div style={{textAlign:"center",color:W6,fontSize:14,padding:"60px 0"}}>신청자가 없습니다.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {list.map((s,i)=>{
              const open=exp===s.id;
              return (
                <div key={s.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+(open?GB:"rgba(255,255,255,0.08)"),borderRadius:10,overflow:"hidden"}}>
                  <div onClick={()=>setExp(open?"":s.id)} style={{display:"grid",gridTemplateColumns:"24px 1fr auto auto",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}}>
                    <span style={{color:W6,fontSize:12}}>{i+1}</span>
                    <div>
                      <div style={{color:W,fontSize:14,fontWeight:700}}>{s.name}</div>
                      <div style={{color:W6,fontSize:12,marginTop:2}}>{s.affiliation}</div>
                    </div>
                    <span style={{background:G2,color:G,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20}}>{sLabel(s.session)}</span>
                    <span style={{color:W6,fontSize:13}}>{open?"접기":"펼기"}</span>
                  </div>
                  {open&&(
                    <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"16px",background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 20px",marginBottom:12}}>
                        {[["전화번호",s.phone],["신청일시",s.at],["부상여부",iLabel(s.injury)]].map(([k,v])=>(
                          <div key={k}><span style={{color:G,fontSize:11,marginRight:6}}>{k}</span><span style={{color:W,fontSize:13}}>{v}</span></div>
                        ))}
                      </div>
                      {s.notes&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                        <div style={{color:G,fontSize:10,marginBottom:4,letterSpacing:"0.1em"}}>TRAINER MEMO</div>
                        <div style={{color:W6,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{s.notes}</div>
                      </div>}
                      <button onClick={()=>onDel(s.id)} style={{background:"rgba(224,92,92,0.1)",border:"1px solid rgba(224,92,92,0.3)",color:"#e05c5c",padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>삭제</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}

function AdminLogin({onBack,onSuccess}:{onBack:()=>void;onSuccess:()=>void}) {
  const [pw,setPw]=useState<string>("");
  const [err,setErr]=useState<boolean>(false);
  const login=()=>{ if(pw==="stepup0626"){onSuccess();setPw("");}else setErr(true); };
  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif",padding:24}}>
      <div style={{width:"100%",maxWidth:360,textAlign:"center"}}>
        <div style={{color:G,fontSize:11,fontWeight:700,letterSpacing:"0.2em",marginBottom:24}}>ADMIN ACCESS</div>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="관리자 비밀번호"
          style={{width:"100%",background:INP,border:"1px solid "+(err?"#e05c5c":INB),borderRadius:8,padding:"14px 16px",color:W,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:8}}
        />
        {err&&<div style={{color:"#e05c5c",fontSize:12,marginBottom:12}}>비밀번호가 맞지 않습니다.</div>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={onBack} style={{flex:1,padding:"13px",borderRadius:8,border:"1px solid "+W2,background:"transparent",color:W6,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>취소</button>
          <button onClick={login} style={{flex:2,padding:"13px",borderRadius:8,border:"none",background:G,color:BG,fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>로그인</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [form,setForm]=useState<FormState>(empty);
  const [privacyAgreed,setPrivacyAgreed]=useState(false);
  const [subs,setSubs]=useLocalSubs();
  const [view,setView]=useState<string>("landing");

  const set=(k:keyof FormState)=>(v:string)=>setForm(p=>({...p,[k]:v}));
  const ok=form.name.trim()&&form.affiliation.trim()&&form.phone.trim()&&form.session&&privacyAgreed;

  const submit=()=>{
    if(!ok)return;
    const now=new Date();
    const at=`${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setSubs(p=>[...p,{id:Date.now().toString(),at,...form}]);
    setForm({...empty,done:true});
  };

  if(view==="admin") return <Admin subs={subs} onBack={()=>setView("landing")} onDel={id=>setSubs(p=>p.filter(s=>s.id!==id))} />;
  if(view==="adminLogin") return <AdminLogin onBack={()=>setView("landing")} onSuccess={()=>setView("admin")} />;

  if(form.done) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:G2,border:"2px solid "+G,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:28,color:G}}>&#10003;</div>
        <div style={{color:W,fontSize:22,fontWeight:900,marginBottom:10}}>신청 완료!</div>
        <div style={{color:W6,fontSize:14,lineHeight:1.8,marginBottom:8}}>신청이 접수되었습니다.</div>
        <div style={{color:W6,fontSize:14,lineHeight:1.8,marginBottom:32}}>담당자 확인 후 <span style={{color:G,fontWeight:700}}>입금 안내 연락</span>을 드릴 예정입니다.</div>
        <button onClick={()=>{setForm(empty);setPrivacyAgreed(false);}} style={{background:"transparent",border:"1px solid "+GB,color:G,padding:"12px 32px",borderRadius:8,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>추가 신청하기</button>
      </div>
    </div>
  );

  const scrollToForm=()=>{ document.getElementById("reg-form")?.scrollIntoView({behavior:"smooth"}); };

  return (
    <div style={{background:BG,fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif",position:"relative",margin:0,paddingTop:0,paddingBottom:80}}>

      <div style={{position:"relative",minHeight:260,overflow:"hidden",display:"flex",alignItems:"flex-start",marginTop:0}}>
        <img src={HERO_IMG} alt="" loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",mixBlendMode:"luminosity",opacity:0.45}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(8,12,24,0.1) 0%, rgba(8,12,24,0.6) 70%, "+BG+" 100%)"}} />
        <div style={{position:"relative",width:"100%",padding:"28px 20px 28px",maxWidth:480,margin:"0 auto",boxSizing:"border-box"}}>
          <div style={{display:"inline-block",background:G2,border:"1px solid "+GB,borderRadius:20,padding:"5px 14px",marginBottom:16}}>
            <span style={{color:G,fontSize:11,fontWeight:700,letterSpacing:"0.12em"}}>PERFORMANCE SEMINAR</span>
          </div>
          <div style={{color:W,fontSize:28,fontWeight:900,lineHeight:1.2,letterSpacing:"-0.02em",marginBottom:8}}>
            배드민턴 선수<br />원데이 파워트레이닝
          </div>
          <div style={{color:W,fontSize:20,fontWeight:800,lineHeight:1.3,marginBottom:12}}>
            스매시 파워와 점프력을<br />높이는 트레이닝 전략
          </div>
          <div style={{color:W6,fontSize:14,lineHeight:1.6}}>선수 개개인의 움직임을 직접 평가하는<br />소수정예 실습 세미나</div>
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>
        <div style={{background:BG2,border:"1px solid "+W2,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"auto auto auto",gap:12}}>
          <div>
            <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>대상</div>
            <div style={{color:W,fontSize:13,fontWeight:600}}>현역 대학·성인 배드민턴 선수</div>
          </div>
          <div style={{gridRow:"1 / 4"}}>
            <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>장소</div>
            <div style={{color:W,fontSize:13,fontWeight:600}}>스텝업 트레이닝</div>
            <div style={{color:W6,fontSize:11,lineHeight:1.5,marginTop:2,whiteSpace:"pre-line"}}>{"동탄감배산로 143\n유림노르웨이숲\nC동 203-204호"}</div>
          </div>
          <div>
            <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>모집인원</div>
            <div style={{color:W,fontSize:13,fontWeight:600}}>소수정예 6명 한정</div>
          </div>
          <div>
            <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>일시</div>
            <div style={{color:W,fontSize:13,fontWeight:600}}>2026년 7월 4일 (토)</div>
            <div style={{color:W6,fontSize:11,lineHeight:1.5,marginTop:2}}>14~16시</div>
          </div>
        </div>

        <div style={{background:"linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))",border:"1px solid rgba(212,175,55,0.4)",borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{color:W6,fontSize:13,fontWeight:500}}>참가비</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <div style={{color:G,fontSize:22,fontWeight:900,letterSpacing:"-0.02em"}}>40,000</div>
            <div style={{color:G,fontSize:13,fontWeight:600}}>원</div>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.15em",marginBottom:12}}>PROGRAM</div>
          {[
            {n:"01",title:"내 몸의 약점 찾기",desc:"개인별 약점·제한점 분석"},
            {n:"02",title:"스매시 파워 향상 전략",desc:"스매시에 연결되는 파워 전략"},
            {n:"03",title:"점프력·폭발력 트레이닝",desc:"스포츠 특이적 점프·폭발력 훈련"},
            {n:"04",title:"경기력으로 연결되는 트레이닝",desc:"경기력 향상으로 이어지는 트레이닝 처방"},
          ].map(p=>(
            <div key={p.n} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
              <div style={{color:G,fontSize:11,fontWeight:900,lineHeight:"22px",flexShrink:0,letterSpacing:"0.05em",opacity:0.7}}>{p.n}</div>
              <div style={{flex:1,borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:10}}>
                <div style={{color:W,fontSize:14,fontWeight:700,marginBottom:3}}>{p.title}</div>
                <div style={{color:W6,fontSize:12,lineHeight:1.5}}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div id="reg-form" style={{marginBottom:12}}>
          <div style={{color:W,fontSize:18,fontWeight:900,marginBottom:4}}>세미나 신청</div>
          <div style={{color:W6,fontSize:13,marginBottom:24}}>아래 정보를 입력하고 신청을 완료해 주세요.</div>

          <Field label="이름" req><Inp value={form.name} onChange={set("name")} placeholder="홍길동" /></Field>
          <Field label="소속" req><Inp value={form.affiliation} onChange={set("affiliation")} placeholder="OO대학교 / OO실업팀" /></Field>
          <Field label="전화번호" req><Inp value={form.phone} onChange={set("phone")} placeholder="010-0000-0000" type="tel" /></Field>
          <Field label="참가 회차" req><Chips value={form.session} onChange={set("session")} opts={[{id:"first",label:"7월 4일"}]} /></Field>

          <div style={{height:1,background:W2,margin:"6px 0 14px"}} />
          <div style={{color:W6,fontSize:11,marginBottom:20,letterSpacing:"0.03em"}}>아래 항목은 선택 사항 입니다. 트레이너가 더 잘 준비할 수 있도록 도움이 됩니다.</div>

          <Field label="부상 여부"><Chips value={form.injury} onChange={set("injury")} opts={[{id:"none",label:"없음"},{id:"minor",label:"경미한 부상"},{id:"major",label:"치료 중"}]} /></Field>
          <Field label="트레이너에게 알려줄 사항"><Txt value={form.notes} onChange={set("notes")} placeholder="특이사항, 부상 부위, 트레이닝 이력 등" /></Field>

          <div style={{height:1,background:W2,margin:"6px 0 14px"}} />
          <PrivacyConsent agreed={privacyAgreed} onChange={setPrivacyAgreed} />
        </div>

        <div style={{marginBottom:8}}>
          <div style={{height:1,background:W2,marginBottom:20}} />
          <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.15em",marginBottom:6}}>CONTACT</div>
          <div style={{color:W6,fontSize:13,marginBottom:20}}>궁금한 점은 아래 연락처로 문의해 주세요.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <a href="tel:01066376811" style={{textDecoration:"none"}}>
              <div style={{background:BG2,border:"1px solid "+W2,borderRadius:12,padding:"16px",textAlign:"center",cursor:"pointer"}}>
                <div style={{fontSize:22,marginBottom:8}}>&#128222;</div>
                <div style={{color:G,fontSize:11,fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>전화 문의</div>
                <div style={{color:W,fontSize:13,fontWeight:600}}>010-6637-6811</div>
              </div>
            </a>
            <a href="https://qr.kakao.com/talk/hO0DKRbB382_nnnu1L9GTxt2sdI-" target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
              <div style={{background:"rgba(254,229,0,0.06)",border:"1px solid rgba(254,229,0,0.2)",borderRadius:12,padding:"16px",textAlign:"center",cursor:"pointer"}}>
                <div style={{fontSize:28,marginBottom:8}}>&#128172;</div>
                <div style={{color:"#FAE100",fontSize:13,fontWeight:700,marginBottom:4}}>카카오톡 stepup.training</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>탭하여 바로 연결</div>
              </div>
            </a>
          </div>
        </div>

        <div style={{marginTop:8,marginBottom:8}}>
          <div style={{height:1,background:W2,marginBottom:20}} />
          <div style={{color:G,fontSize:10,fontWeight:700,letterSpacing:"0.15em",marginBottom:6}}>LOCATION</div>
          <div style={{color:W6,fontSize:13,marginBottom:16}}>오시는 길</div>
          <a href="https://map.kakao.com/?q=동탄감배산로+143+유림노르웨이숲+C동" target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block"}}>
            <div style={{background:BG2,border:"1px solid "+W2,borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"#1a2235",padding:"36px 20px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:4}}>&#128205;</div>
                <div style={{color:W,fontSize:13,fontWeight:700,marginBottom:4}}>STEP UP TRAINING CENTER</div>
                <div style={{color:W6,fontSize:12,lineHeight:1.6}}>동탄감배산로 143<br />유림노르웨이숲 C동 203-204호</div>
              </div>
              <div style={{background:"rgba(201,168,76,0.08)",borderTop:"1px solid "+W2,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{color:G,fontSize:12,fontWeight:700}}>카카오맵으로 보기</span>
                <span style={{color:G,fontSize:12}}>→</span>
              </div>
            </div>
          </a>
        </div>

        <div style={{textAlign:"center",paddingTop:24,paddingBottom:24}}>
          <button onClick={()=>setView("adminLogin")} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.15)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>관리자</button>
        </div>
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,padding:"12px 16px",background:"rgba(8,12,24,0.92)",backdropFilter:"blur(16px)",borderTop:"1px solid "+W2}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <button onClick={ok?submit:scrollToForm}
            style={{width:"100%",padding:"16px",borderRadius:12,border:"none",background:ok?G:"rgba(201,168,76,0.9)",color:BG,fontSize:16,fontWeight:900,cursor:"pointer",letterSpacing:"0.04em",fontFamily:"inherit",transition:"opacity 0.2s"}}>
            {ok?"신청 완료하기 →":"세미나 신청하기 ↓"}
          </button>
        </div>
      </div>

    </div>
  );
}
