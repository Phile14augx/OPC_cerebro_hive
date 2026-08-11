'use client';

import { useMemo, useState } from 'react';
import { factoryTwin } from '../modules/demo-factory/factory-definition';
import { simulateFactoryTick } from '../modules/demo-factory/factory-simulator';
import { IndustryGenerator } from './industry-generator';

const tabs = ['Overview', 'Live state', 'Graph', 'Events', 'Scenarios', 'Ask twin'];

export function CommandCenter() {
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('Overview');
  const [scenario, setScenario] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const data = useMemo(() => simulateFactoryTick(tick, new Date()), [tick]);
  const risk = data.alert ? 82 : Math.round(18 + tick * 11);
  return <main className="shell">
    <aside className="rail"><div className="brand">CH<span>/TWIN</span></div><nav>{['Overview','Digital twins','Live operations','Knowledge graph','Events','Models','Simulations','Governance'].map((item, i)=><a className={i===1?'active':''} key={item} href="#">{item}</a>)}</nav><p className="railNote">MVP CONTROL PLANE<br/>LOCAL ADAPTERS</p></aside>
    <section className="workspace">
      <header className="top"><div><p className="eyebrow">Digital twin / Smart factory</p><h1>{factoryTwin.name}</h1></div><div className="topMeta"><span className="sim">SIMULATED</span><span><b>{data.alert ? 'DEGRADED' : 'LIVE'}</b><small>operational state</small></span><span><b>{100-risk}%</b><small>health score</small></span></div></header>
      <div className="tabs" role="tablist">{tabs.map(t=><button key={t} aria-selected={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</div>
      <div className="studioAction"><button onClick={()=>setShowGenerator(true)}>Create industry twin</button></div>
      {showGenerator&&<IndustryGenerator twinId={factoryTwin.id} onClose={()=>setShowGenerator(false)}/>} 
      <section className="hero">
        <div className="signal"><span>VIBRATION TRACE</span>{[1,2,3,4,5,6,7,8].map((n)=><i key={n} style={{height:`${12+n*(tick+2)}px`}}/>)}<strong>{data.vibration.toFixed(1)}<small> mm/s</small></strong></div>
        <div className="brief"><p className="eyebrow">Observed system state</p><h2>{data.alert ? 'Motor‑07 is moving outside its normal envelope.' : 'Factory Alpha is operating within its expected envelope.'}</h2><p>{data.alert ? 'Vibration and temperature are rising together on Production Line A. The evidence matches an early bearing-failure pattern.' : 'Advance the deterministic simulator to observe live telemetry, rules, alerts, and scenario analysis.'}</p><div className="actions"><button className="primary" onClick={()=>setTick(v=>Math.min(v+1,8))}>Advance simulation</button><button onClick={()=>setScenario(true)}>Simulate Motor‑07 failure</button></div></div>
      </section>
      <section className="grid">
        <article><label>Motor‑07 / Temperature</label><strong>{data.temperature.toFixed(1)}°C</strong><small>effective now · simulated</small></article>
        <article><label>Failure risk</label><strong>{risk}%</strong><small>deterministic demo model</small></article>
        <article><label>Production rate</label><strong>{scenario ? '71' : '94'}%</strong><small>{scenario ? 'scenario fork' : 'live state'}</small></article>
        <article><label>Open alerts</label><strong>{data.alert ? '01' : '00'}</strong><small>rule evaluation complete</small></article>
      </section>
      <section className="lower"><article className="entity"><div className="sectionHead"><div><p className="eyebrow">Entity graph</p><h3>Production Line A</h3></div><span>2 connected entities</span></div><div className="graph"><div className="node line">LINE A</div><div className="edge"/><div className={`node motor ${data.alert?'danger':''}`}>MOTOR‑07<small>{data.alert?'ANOMALY':'NORMAL'}</small></div></div></article>
      <article className="evidence"><p className="eyebrow">Ask your twin</p><h3>What is happening?</h3><p>{data.alert ? 'Motor‑07 has an increased bearing-failure risk. Vibration reached '+data.vibration.toFixed(1)+' mm/s while temperature rose to '+data.temperature.toFixed(1)+'°C.' : 'No active anomaly. Advance the simulation to generate a traceable event.'}</p><dl><div><dt>Source</dt><dd>factory-simulator</dd></div><div><dt>Classification</dt><dd>SIMULATED</dd></div><div><dt>Confidence</dt><dd>{data.alert?'82%':'—'}</dd></div><div><dt>Action</dt><dd>{data.alert?'Inspect within 72h':'Monitor'}</dd></div></dl></article></section>
      {scenario && <section className="scenario"><button aria-label="Close scenario" onClick={()=>setScenario(false)}>×</button><p className="eyebrow">Scenario fork · No live mutation</p><h3>Motor‑07 failure impact</h3><div><strong>−23%</strong><span>Production throughput</span><strong>4.5 h</strong><span>Estimated downtime</span><strong>Inspect</strong><span>Recommended action</span></div></section>}
    </section>
  </main>;
}
