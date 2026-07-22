module.exports=[952109,a=>{"use strict";let b=(0,a.i(700600).default)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);a.s(["Users",0,b],952109)},531186,a=>{"use strict";let b=(0,a.i(700600).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);a.s(["Sparkles",0,b],531186)},970776,a=>{"use strict";let b=(0,a.i(700600).default)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);a.s(["Shield",0,b],970776)},88820,a=>{"use strict";let b=(0,a.i(700600).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);a.s(["CheckCircle",0,b],88820)},100559,a=>{"use strict";let b=(0,a.i(700600).default)("circle-question-mark",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);a.s(["HelpCircle",0,b],100559)},662321,a=>{"use strict";let b=(0,a.i(700600).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);a.s(["Mail",0,b],662321)},78434,a=>{"use strict";let b=(0,a.i(700600).default)("bookmark",[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]]);a.s(["Bookmark",0,b],78434)},617596,a=>{"use strict";var b=a.i(388922),c=a.i(753247),d=a.i(531186),e=a.i(131722),f=a.i(700600);let g=(0,f.default)("square-check-big",[["path",{d:"M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344",key:"2acyp4"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]),h=(0,f.default)("list",[["path",{d:"M3 5h.01",key:"18ugdj"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 19h.01",key:"noohij"}],["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 19h13",key:"m83p4d"}]]);var i=a.i(78434),j=a.i(952109),k=a.i(100559),l=a.i(724004),m=a.i(3225),n=a.i(662321),o=a.i(970776),p=a.i(88820);function q({title:a,onClose:d,onSuccess:e}){let[f,g]=(0,c.useState)({name:"",email:"",company:""}),[h,i]=(0,c.useState)(!1),j=async b=>{if(b.preventDefault(),f.name&&f.email&&f.company){i(!0);try{await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:f.name,email:f.email,company:f.company,type:"gated-download",target:a})})}catch(a){console.error("Failed to log gated download lead:",a)}setTimeout(()=>{e(f.email)},1e3)}};return(0,b.jsx)("div",{style:{position:"fixed",inset:0,zIndex:1e4,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(8, 11, 20, 0.8)",backdropFilter:"blur(8px)",padding:"20px"},children:(0,b.jsxs)("div",{className:"card-glass",style:{maxWidth:"480px",width:"100%",padding:"36px",boxShadow:"0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(0, 229, 255, 0.1)",border:"1px solid rgba(0, 229, 255, 0.25)",position:"relative",animation:"fadeIn 0.2s ease-out"},children:[(0,b.jsx)("button",{onClick:d,style:{position:"absolute",top:"20px",right:"20px",background:"transparent",border:"none",color:"var(--text-muted)",cursor:"pointer",padding:"4px"},children:(0,b.jsx)(m.X,{size:20})}),h?(0,b.jsxs)("div",{style:{textAlign:"center",padding:"20px 0"},children:[(0,b.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",background:"rgba(0, 229, 255, 0.1)",border:"1px solid rgba(0, 229, 255, 0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"},children:(0,b.jsx)(p.CheckCircle,{size:28,color:"var(--neural-blue)"})}),(0,b.jsx)("h3",{style:{fontFamily:"Orbitron, sans-serif",fontSize:"1.15rem",fontWeight:700,color:"var(--neural-blue)",marginBottom:"12px"},children:"Request Approved!"}),(0,b.jsxs)("p",{style:{fontFamily:"Exo 2, sans-serif",fontSize:"0.875rem",color:"var(--text-muted)",lineHeight:1.6,marginBottom:"20px"},children:["Thank you. The whitepaper ",(0,b.jsxs)("strong",{children:['"',a,'"']})," has been unlocked."]}),(0,b.jsxs)("a",{href:`/whitepapers/${a.toLowerCase().replace(/\s+/g,"-")}.pdf`,download:!0,className:"btn-primary",style:{width:"100%",justifyContent:"center"},children:[(0,b.jsx)(l.Download,{size:16}),"Download PDF Now"]})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("div",{className:"section-label",style:{display:"inline-flex",marginBottom:"16px"},children:[(0,b.jsx)(o.Shield,{size:11})," Gated Research"]}),(0,b.jsx)("h3",{style:{fontFamily:"Orbitron, sans-serif",fontSize:"1.2rem",fontWeight:700,lineHeight:1.35,marginBottom:"10px"},children:"Download Whitepaper"}),(0,b.jsxs)("p",{style:{fontFamily:"Exo 2, sans-serif",fontSize:"0.85rem",color:"var(--text-muted)",marginBottom:"24px",lineHeight:1.5},children:["Enter your details below to unlock ",(0,b.jsxs)("strong",{children:['"',a,'"']})," and join our weekly executive briefing."]}),(0,b.jsxs)("form",{onSubmit:j,style:{display:"flex",flexDirection:"column",gap:"16px"},children:[[{id:"name",label:"Full Name",placeholder:"Alex Mercer",type:"text"},{id:"email",label:"Work Email",placeholder:"alex@company.com",type:"email"},{id:"company",label:"Company",placeholder:"Cerebro Industries",type:"text"}].map(a=>(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{style:{display:"block",fontFamily:"Orbitron, sans-serif",fontSize:"0.625rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--neural-blue)",marginBottom:"6px"},children:a.label}),(0,b.jsx)("input",{type:a.type,required:!0,placeholder:a.placeholder,value:f[a.id],onChange:b=>g({...f,[a.id]:b.target.value}),style:{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"10px 14px",fontFamily:"Exo 2, sans-serif",fontSize:"0.85rem",color:"var(--text-primary)",outline:"none"},onFocus:a=>a.target.style.borderColor="rgba(0, 229, 255, 0.3)",onBlur:a=>a.target.style.borderColor="rgba(255,255,255,0.08)"})]},a.id)),(0,b.jsxs)("div",{style:{display:"flex",gap:"8px",alignItems:"flex-start",marginTop:"4px"},children:[(0,b.jsx)(n.Mail,{size:14,color:"var(--neural-blue)",style:{flexShrink:0,marginTop:"2px"}}),(0,b.jsx)("span",{style:{fontSize:"0.675rem",color:"var(--text-muted)",lineHeight:1.4},children:"We respect your privacy. By submitting, you agree to receive technical whitepapers and marketing emails from CerebroHive. Unsubscribe anytime."})]}),(0,b.jsx)("button",{type:"submit",className:"btn-primary",style:{width:"100%",justifyContent:"center",padding:"12px",marginTop:"8px"},children:"Request Access →"})]})]})]})})}let r=[{id:"strategy",title:"AI Strategy Template",description:"A comprehensive Word/PDF structure to map corporate AI objectives, business alignment, and 90-day execution milestones.",icon:e.FileText,fileName:"CerebroHive_AI_Strategy_Template.txt",fileContent:`
=========================================================
          CEREBROHIVE — CORPORATE AI STRATEGY TEMPLATE
=========================================================

1. EXECUTIVE SUMMARY & BUSINESS CONTEXT
   - Define organizational vision for AI transformation.
   - Map key objectives (efficiency, cost reduction, client satisfaction).

2. OPERATIONAL AUDIT & BOTTLENECK IDENTIFICATION
   - Document manual queues, ticket backlogs, and data entry silos.
   - List key applications to connect (CRM, ERP, DBs).

3. 90-DAY TRANSFORMATION ROADMAP
   - Phase 1 (Days 1-30): Ingest databases, setup n8n orchestrations.
   - Phase 2 (Days 31-60): Deploy custom RAG nodes and Slack routing assistants.
   - Phase 3 (Days 61-90): Team up-skilling bootcamps & certification audits.

4. BUDGET & ROI FORECAST
   - Initial pilot budgets vs projected full-scale operational savings.
=========================================================
    `},{id:"readiness",title:"AI Readiness Assessment Worksheet",description:"Scoring metrics and audit questions evaluating organizational readiness across infrastructure, data structures, and leadership alignment.",icon:k.HelpCircle,fileName:"CerebroHive_AI_Readiness_Worksheet.txt",fileContent:`
=========================================================
          CEREBROHIVE — AI READINESS WORKSHEET
=========================================================

Audit your company by scoring 1 (Low) to 5 (High) on:
1. DATA STRUCTURES:
   [ ] Silos only (1)
   [ ] Shared drives (3)
   [ ] central warehouse (5)

2. API GATEWAYS:
   [ ] Manual work (1)
   [ ] Standard endpoints (3)
   [ ] Event webhooks (5)

3. TALENT CAPABILITY:
   [ ] Unaware of AI (1)
   [ ] Basic prompt users (3)
   [ ] Custom agent builders (5)

Total scores below 10 need foundational assessments before building pipelines.
=========================================================
    `},{id:"prompt-lib",title:"Executive Business Prompt Library",description:"Over 100+ production-vetted system prompts for operations, outbound marketing sequences, ticket parsing, and CRM data mappings.",icon:i.Bookmark,fileName:"CerebroHive_Executive_Prompt_Library.txt",fileContent:`
=========================================================
          CEREBROHIVE — EXECUTIVE PROMPT LIBRARY
=========================================================

1. REVENUE OUTBOUND PROMPT:
   "You are an expert SDR. Analyze the following lead profile and draft a short, 3-sentence personalized introductory pitch emphasizing their main logistics bottlenecks..."

2. CLASSIFICATION PROMPT:
   "You are a triage model. Categorize the shipping support email below into 'Tracking', 'Invoice Dispute', 'Onboarding', or 'Emergency'..."

3. DATA SYNTHESIS PROMPT:
   "Parse the unstructured ledger lines below, extract transaction date, account name, and total debit amount, and return in a strict JSON array..."
=========================================================
    `},{id:"workflow",title:"Automation Workflow Checklist",description:"Detailed flowchart mapping steps, API authentications, backup fail-safes, and testing checklists for deploying n8n/LangGraph agents.",icon:g,fileName:"CerebroHive_Automation_Workflow_Checklist.txt",fileContent:`
=========================================================
          CEREBROHIVE — AUTOMATION PIPELINE CHECKLIST
=========================================================

[ ] Validate OAuth token rate-limits for CRM applications.
[ ] Define error routing nodes in n8n pipelines (failover triggers).
[ ] Map human-in-the-loop Slack validation nodes for client approvals.
[ ] Enforce API proxy proxies isolating database keys.
[ ] Implement rate-limiting loops for LLM API triggers.
[ ] Deploy backup cache systems to prevent data loss on API disconnects.
=========================================================
    `},{id:"playbook",title:"Enterprise AI Playbook (Abbreviated)",description:"Operational guidelines for setting up an internal AI Center of Excellence, securing proxy gates, and auditing employee token logs.",icon:j.Users,fileName:"CerebroHive_Enterprise_AI_Playbook.txt",fileContent:`
=========================================================
          CEREBROHIVE — ENTERPRISE AI PLAYBOOK
=========================================================

1. ESTABLISHING COOPERATIVE SECURITY GATEWAYS
   - Direct all employee LLM calls through a central, PII-sanitized gateway.
   - Maintain active log records auditing API payload content.

2. COHORT-BASED TRAINING PATHS
   - Standardize certificate assessments across development teams.
   - Enforce developer certification standards before project commits.
=========================================================
    `},{id:"matrix",title:"AI Vendor Evaluation Matrix",description:"A structured spreadsheet checklist assessing vendor compliance, pricing structures, API latencies, and service level agreements (SLAs).",icon:h,fileName:"CerebroHive_AI_Vendor_Matrix.txt",fileContent:`
=========================================================
          CEREBROHIVE — AI VENDOR EVALUATION MATRIX
=========================================================

Checklist criteria to score prospective AI models:
- LATENCY BUDGET: Average response times < 2.5 seconds (Yes/No)
- DATA RETENTION: Zero data training clauses in SLA (Yes/No)
- TOKEN RATINGS: Access to long-context model windows (Yes/No)
- API SECURE GATEWAYS: Compliance with ISO/SOC2 standards (Yes/No)
=========================================================
    `}];a.s(["default",0,function(){let[a,e]=(0,c.useState)(null);return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("section",{style:{paddingTop:"60px",paddingBottom:"50px",position:"relative",overflow:"hidden"},children:[(0,b.jsx)("div",{style:{position:"absolute",inset:0,background:"radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)",pointerEvents:"none"}}),(0,b.jsxs)("div",{className:"container-wide",style:{position:"relative"},children:[(0,b.jsxs)("div",{className:"section-label",style:{display:"inline-flex",marginBottom:"20px"},children:[(0,b.jsx)(d.Sparkles,{size:11,style:{marginRight:"4px"}})," Reusable Assets"]}),(0,b.jsxs)("h1",{style:{fontSize:"clamp(2.5rem, 5vw, 3.5rem)",marginBottom:"20px"},children:["Resource ",(0,b.jsx)("span",{className:"gradient-text-full",children:"Templates"})]}),(0,b.jsx)("p",{style:{fontFamily:"Exo 2, sans-serif",fontSize:"1.1rem",color:"var(--text-muted)",maxWidth:"600px",lineHeight:1.7},children:"Download free checklists, worksheets, and strategic playbooks to streamline your team's AI initiatives."})]})]}),(0,b.jsx)("section",{style:{paddingBottom:"100px"},children:(0,b.jsx)("div",{className:"container-wide",children:(0,b.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:"24px"},children:r.map(a=>{let c=a.icon;return(0,b.jsxs)("div",{className:"card-glass",style:{padding:"36px 30px",display:"flex",flexDirection:"column",height:"100%"},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{width:44,height:44,borderRadius:"10px",background:"rgba(0,229,255,0.08)",border:"1px solid rgba(0,229,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--neural-blue)",marginBottom:"24px"},children:(0,b.jsx)(c,{size:20})}),(0,b.jsx)("h3",{style:{fontFamily:"Orbitron, sans-serif",fontSize:"1.05rem",fontWeight:700,color:"var(--text-primary)",marginBottom:"12px",lineHeight:1.4},children:a.title}),(0,b.jsx)("p",{style:{fontFamily:"Exo 2, sans-serif",fontSize:"0.875rem",color:"var(--text-muted)",lineHeight:1.6,marginBottom:"28px"},children:a.description})]}),(0,b.jsxs)("button",{onClick:()=>e(a),className:"btn-primary",style:{width:"100%",justifyContent:"center",display:"inline-flex",gap:"6px",cursor:"pointer",marginTop:"auto"},children:[(0,b.jsx)(l.Download,{size:14})," Download Template"]})]},a.id)})})})}),a&&(0,b.jsx)(q,{title:a.title,onClose:()=>e(null),onSuccess:()=>{if(!a)return;let b=new Blob([a.fileContent.trim()],{type:"text/plain"}),c=URL.createObjectURL(b),d=document.createElement("a");d.href=c,d.download=a.fileName,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(c),e(null)}})]})}],617596)}];

//# sourceMappingURL=_0426-q2._.js.map