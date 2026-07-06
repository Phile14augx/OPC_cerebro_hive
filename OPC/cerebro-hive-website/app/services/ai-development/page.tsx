"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Zap, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Play, 
  Terminal, 
  RefreshCw,
  Database,
  SlidersHorizontal
} from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageContext";

// Offerings config matching translations.ts keys
const offeringsKeys = [1, 2, 3, 4, 5, 6];

// Processes config
const processes = [
  { step: "01", key: "process1" },
  { step: "02", key: "process2" },
  { step: "03", key: "process3" },
  { step: "04", key: "process4" },
];

export default function AIDevelopmentPage() {
  const { t } = useLanguage();

  // Simulator Inputs
  const [baseModel, setBaseModel] = useState("Llama-3-8B");
  const [epochs, setEpochs] = useState(3);
  const [learningRate, setLearningRate] = useState(5e-5);
  const [datasetSize, setDatasetSize] = useState(15000);

  // Simulator Active Training State
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [lossHistory, setLossHistory] = useState<number[]>(() => {
    const initialPoints: number[] = [];
    const minLoss = 0.85;
    for (let i = 0; i < 20; i++) {
      initialPoints.push(2.2 * Math.exp(-i * 0.1) + minLoss);
    }
    return initialPoints;
  });

  // Simulator Results State
  const [simResults, setSimResults] = useState({
    loss: 2.10,
    time: "0m 0s",
    accImprovement: "+0.0% (to 82.0%)",
    vram: "14.2 GB"
  });

  const trainingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulator Math calculations
  const calculateFinalMetrics = () => {
    // VRAM calc
    let baseVram = 16.5;
    if (baseModel === "Mistral-7B") baseVram = 14.8;
    if (baseModel === "Llama-3-70B") baseVram = 142.0;

    const vramFootprint = `${baseVram.toFixed(1)} GB`;

    // Time calc: totalMinutes = (epochs * datasetSize * coeff) / 500
    let coeff = 1.0;
    if (baseModel === "Mistral-7B") coeff = 0.85;
    if (baseModel === "Llama-3-70B") coeff = 7.5;

    const totalMinutes = (epochs * datasetSize * coeff) / 500;
    let timeStr = "";
    if (totalMinutes >= 60) {
      const hrs = Math.floor(totalMinutes / 60);
      const mins = Math.round(totalMinutes % 60);
      timeStr = `${hrs}h ${mins}m`;
    } else {
      timeStr = `${Math.round(totalMinutes)}m`;
    }

    // Loss calc: starts at ~2.5, decays based on epochs and learning rate
    // lr scale: 5e-5 is baseline. 1e-4 reduces faster but plateaus. 1e-5 reduces slower.
    const lrFactor = learningRate * 18000; // e.g. 5e-5 * 18000 = 0.9
    const lossMin = 0.08 + (25000 / datasetSize) * 0.04;
    const finalLossVal = Math.max(
      lossMin, 
      2.5 * Math.exp(-epochs * lrFactor * 0.5) + lossMin
    );

    // Accuracy calc: base 82%, increases based on epochs, dataset size, and lr alignment
    const baseAcc = 82.0;
    const lrDiff = Math.abs(learningRate - 5e-5) * 4000; // 0 if optimal, 0.2 if off
    const lrQuality = Math.max(0.6, 1.2 - lrDiff);
    const datasetFactor = 1 - Math.exp(-datasetSize / 15000);
    const epochFactor = 1 - Math.exp(-0.35 * epochs);

    const improvement = 16.8 * epochFactor * datasetFactor * lrQuality;
    const finalAcc = Math.min(99.8, baseAcc + improvement);
    const accStr = `+${improvement.toFixed(1)}% (to ${finalAcc.toFixed(1)}%)`;

    return {
      loss: Number(finalLossVal.toFixed(3)),
      time: timeStr,
      accImprovement: accStr,
      vram: vramFootprint
    };
  };

  // Run training simulation
  const startSimulation = () => {
    if (isTraining) return;

    setIsTraining(true);
    setProgress(0);
    setCurrentEpoch(0);
    setTerminalLogs([]);

    const targetMetrics = calculateFinalMetrics();
    const totalSteps = 20;
    let step = 0;

    // Generate dynamic loss curve points
    const activeLossHistory: number[] = [];
    const minLoss = 0.08 + (25000 / datasetSize) * 0.04;
    const startLoss = 2.45;
    const lrFactor = learningRate * 18000;

    for (let i = 0; i < totalSteps; i++) {
      const stepProgress = i / (totalSteps - 1);
      const stepLoss = Math.max(
        minLoss,
        startLoss * Math.exp(-stepProgress * epochs * lrFactor * 0.5) + 
        minLoss + 
        (i > 0 && i < totalSteps - 1 ? (Math.random() - 0.5) * 0.08 : 0) // Add realistic noise
      );
      activeLossHistory.push(Number(stepLoss.toFixed(3)));
    }

    setLossHistory(activeLossHistory);

    setTerminalLogs([
      `[INFO] Initializing parameter configuration...`,
      `[INFO] Base model loaded: ${baseModel}`,
      `[INFO] Hyperparameters: epochs=${epochs}, lr=${learningRate.toExponential(1)}, dataset=${datasetSize.toLocaleString()}`,
      `[INFO] VRAM allocated: ${targetMetrics.vram}`,
      `[SYS] Loading instruction-tuning corpus into GPU memory...`,
    ]);

    trainingInterval.current = setInterval(() => {
      step += 1;
      const percent = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(percent);

      const epochIndex = Math.min(epochs, Math.ceil((step / totalSteps) * epochs));
      setCurrentEpoch(epochIndex);

      // Add training log entry
      const currentLoss = activeLossHistory[Math.min(step, totalSteps - 1)];
      const epochLogs = [
        `[EPOCH ${epochIndex}/${epochs}] Step ${step * 50}/${totalSteps * 50} - loss: ${currentLoss.toFixed(3)} - throughput: ${Math.round(450 - step * 5)} tokens/sec`,
      ];

      if (step === 3) {
        epochLogs.unshift(`[SYS] Optimization loop initialized (AdamW optimizer).`);
      }
      if (step === 7) {
        epochLogs.unshift(`[INFO] Learning rate warmup complete. Scaling active gradients.`);
      }
      if (step === 13) {
        epochLogs.unshift(`[SYS] Hallucination evaluation baseline: groundedness_score=94.2%`);
      }
      if (step === 17) {
        epochLogs.unshift(`[INFO] Alignment optimization step (DPO phase active)...`);
      }

      setTerminalLogs(prev => [...prev, ...epochLogs]);

      // Count up metric estimation mid-flight
      setSimResults(() => {
        const flightProgress = step / totalSteps;
        const currentMins = (epochs * datasetSize * (baseModel === "Llama-3-70B" ? 7.5 : baseModel === "Mistral-7B" ? 0.85 : 1.0)) / 500;
        const currentFlightMins = Math.round(currentMins * flightProgress);
        const flightTime = currentFlightMins >= 60 
          ? `${Math.floor(currentFlightMins / 60)}h ${Math.round(currentFlightMins % 60)}m` 
          : `${currentFlightMins}m`;

        return {
          loss: Number(currentLoss.toFixed(3)),
          time: flightTime,
          accImprovement: `+${(Number(targetMetrics.accImprovement.split("%")[0].substring(1)) * flightProgress).toFixed(1)}%`,
          vram: targetMetrics.vram
        };
      });

      if (step >= totalSteps) {
        if (trainingInterval.current) clearInterval(trainingInterval.current);
        setIsTraining(false);
        setSimResults(targetMetrics);
        setTerminalLogs(prev => [
          ...prev,
          `[SYS] Fine-tuning complete. Quantizing model weights (AWQ 4-bit config).`,
          `[INFO] Serializing model output to local storage.`,
          `[SUCCESS] Custom model fine-tuning successfully verified! Final loss: ${targetMetrics.loss.toFixed(3)}.`
        ]);
      }
    }, 80);
  };

  // Cleanup training interval on unmount
  useEffect(() => {
    return () => {
      if (trainingInterval.current) clearInterval(trainingInterval.current);
    };
  }, []);

  // Generate SVG Line Chart Path
  const getSvgPath = () => {
    if (lossHistory.length === 0) return "";
    
    // Scale mapping for viewBox="0 0 300 150"
    // X goes from 20 to 280
    // Y goes from 130 (high loss 2.5) to 20 (low loss 0.0)
    const paddingX = 20;
    const paddingY = 20;
    const width = 260;
    const height = 110;
    
    const visiblePoints = isTraining 
      ? Math.max(1, Math.ceil((progress / 100) * lossHistory.length))
      : lossHistory.length;

    let path = "";
    for (let i = 0; i < visiblePoints; i++) {
      const val = lossHistory[i];
      const x = paddingX + (i / (lossHistory.length - 1)) * width;
      // Clamp loss valuation mapping
      const normalizedLoss = Math.min(2.5, Math.max(0.0, val));
      const y = paddingY + height - (normalizedLoss / 2.5) * height;

      if (i === 0) {
        path += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
    return path;
  };

  return (
    <>
      {/* Hero Section */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,46,209,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <ArrowLeft size={14} /> {t("services_detail.development.back")}
          </Link>
          
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px", color: "var(--hot-pink)", background: "rgba(255,46,209,0.06)", borderColor: "rgba(255,46,209,0.2)" }}>
            <Cpu size={11} style={{ marginRight: "4px" }} /> {t("services_detail.development.hero_label")}
          </div>
          
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            {t("services_detail.development.hero_title").split(" & ")[0]} <span className="gradient-text-full" style={{ background: "linear-gradient(135deg, var(--text-primary) 30%, var(--hot-pink) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("services_detail.development.hero_title").split(" & ")[1] || "Development"}</span>
          </h1>
          
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
            {t("services_detail.development.hero_desc")}
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            
            <div className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hot-pink)", marginBottom: "6px" }}>
                {t("services_detail.development.stat1_val")}
              </div>
              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {t("services_detail.development.stat1_lbl")}
              </div>
            </div>

            <div className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hot-pink)", marginBottom: "6px" }}>
                {t("services_detail.development.stat2_val")}
              </div>
              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {t("services_detail.development.stat2_lbl")}
              </div>
            </div>

            <div className="card-glass" style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--hot-pink)", marginBottom: "6px" }}>
                {t("services_detail.development.stat3_val")}
              </div>
              <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {t("services_detail.development.stat3_lbl")}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: "32px" }}>
            {t("services_detail.development.process_title")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", position: "relative" }}>
            {/* Connector Line */}
            <div style={{ position: "absolute", top: "28px", left: "calc(12.5% + 10px)", right: "calc(12.5% + 10px)", height: "1px", background: "linear-gradient(90deg, var(--hot-pink), var(--violet), var(--neural-blue), transparent)", opacity: 0.3, zIndex: 0 }} />
            
            {processes.map((p, i) => (
              <div key={p.step} style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `rgba(255,46,209,${0.08 + i * 0.02})`, border: `1px solid rgba(255,46,209,${0.2 + i * 0.1})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.75rem", fontWeight: 800, color: "var(--hot-pink)" }}>{p.step}</span>
                </div>
                <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, marginBottom: "8px" }}>
                  {t(`services_detail.development.${p.key}_title`)}
                </h4>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {t(`services_detail.development.${p.key}_desc`)}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Core Showcase & CTA Panel */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "start" }}>
            
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px" }}>
                {t("services_detail.development.showcase_header")}
              </h2>
              <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
                {t("services_detail.development.showcase_desc")}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckCircle size={15} color="var(--hot-pink)" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      {t(`services_detail.development.bullets.${index}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Panel Card */}
            <div className="card-glass" style={{ padding: "40px", border: "1px solid rgba(255, 46, 209, 0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Zap size={18} color="var(--hot-pink)" />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--hot-pink)" }}>
                  {t("services_detail.development.sim_cta").split(" with ")[0]}
                </h3>
              </div>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                Get custom engineering expertise. Partner with our AI core developers to evaluate fine-tuning workloads, custom hardware quantization, and deployment latency benchmarks.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {[
                  "NDA-protected, secure corporate evaluations",
                  "Receive an initial code scoping plan",
                  "Direct consulting with Senior AI Architects"
                ].map((b, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                    <CheckCircle size={13} color="var(--hot-pink)" style={{ flexShrink: 0, marginTop: "2px" }} /> {b}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", background: "var(--hot-pink)", borderColor: "var(--hot-pink)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 46, 209, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.boxShadow = "none";
                }}>
                {t("services_detail.development.sim_cta")} <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Model Fine-Tuning Parameter Simulator */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "48px", border: "1px solid rgba(255, 46, 209, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <SlidersHorizontal size={20} color="var(--hot-pink)" />
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.4rem", fontWeight: 700 }}>
                {t("services_detail.development.simulator_title")}
              </h2>
            </div>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "40px" }}>
              {t("services_detail.development.simulator_desc")}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "60px", alignItems: "start" }}>
              
              {/* Simulator Input Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                
                {/* Base Model Dropdown */}
                <div>
                  <label style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", display: "block", marginBottom: "10px" }}>
                    {t("services_detail.development.sim_param_model")}
                  </label>
                  <select 
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                    disabled={isTraining}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(8, 11, 20, 0.7)",
                      border: "1px solid rgba(255, 46, 209, 0.25)",
                      color: "var(--text-primary)",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "0.85rem",
                      cursor: isTraining ? "not-allowed" : "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="Llama-3-8B">Llama 3 (8B weights)</option>
                    <option value="Mistral-7B">Mistral (7B weights)</option>
                    <option value="Llama-3-70B">Llama 3 (70B weights)</option>
                  </select>
                </div>

                {/* Training Epochs Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {t("services_detail.development.sim_param_epochs")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--hot-pink)", fontWeight: 700 }}>
                      {epochs}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1" 
                    value={epochs}
                    disabled={isTraining}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--hot-pink)", cursor: isTraining ? "not-allowed" : "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>1 epoch</span><span>5 epochs</span><span>10 epochs</span>
                  </div>
                </div>

                {/* Learning Rate Selection */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {t("services_detail.development.sim_param_lr")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--hot-pink)", fontWeight: 700 }}>
                      {learningRate.toExponential(1)}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {([1e-5, 5e-5, 1e-4] as const).map((rate) => (
                      <button 
                        key={rate} 
                        onClick={() => setLearningRate(rate)}
                        disabled={isTraining}
                        style={{
                          padding: "10px", 
                          borderRadius: "8px", 
                          cursor: isTraining ? "not-allowed" : "pointer", 
                          fontFamily: "Orbitron, sans-serif", 
                          fontSize: "0.7rem", 
                          fontWeight: 700, 
                          transition: "all 0.2s",
                          background: learningRate === rate ? "rgba(255,46,209,0.1)" : "rgba(255,255,255,0.03)",
                          border: learningRate === rate ? "1px solid var(--hot-pink)" : "1px solid rgba(255,255,255,0.06)",
                          color: learningRate === rate ? "var(--hot-pink)" : "var(--text-muted)",
                        }}
                      >
                        {rate.toExponential(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dataset Volume Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {t("services_detail.development.sim_param_dataset")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", color: "var(--hot-pink)", fontWeight: 700 }}>
                      {datasetSize.toLocaleString()} rows
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="50000" 
                    step="1000" 
                    value={datasetSize}
                    disabled={isTraining}
                    onChange={(e) => setDatasetSize(Number(e.target.value))}
                    style={{ width: "100%", height: "4px", accentColor: "var(--hot-pink)", cursor: isTraining ? "not-allowed" : "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    <span>1,000 rows</span><span>25,000 rows</span><span>50,000 rows</span>
                  </div>
                </div>

                {/* Trigger Button */}
                <button
                  onClick={startSimulation}
                  disabled={isTraining}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "8px",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: isTraining ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.2s",
                    background: isTraining ? "rgba(255, 46, 209, 0.2)" : "var(--hot-pink)",
                    border: "1px solid var(--hot-pink)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isTraining) {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 46, 209, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isTraining ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      {t("services_detail.development.sim_btn_running")} ({progress}%)
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      {t("services_detail.development.sim_btn")}
                    </>
                  )}
                </button>

              </div>

              {/* Simulator Output Panel & Live Graph */}
              <div className="card-glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* SVG Graph */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {t("services_detail.development.sim_loss_history")}
                    </span>
                    {isTraining && (
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", color: "var(--hot-pink)", fontWeight: 700 }}>
                        Epoch {currentEpoch}/{epochs}
                      </span>
                    )}
                  </div>
                  
                  {/* Graph Canvas */}
                  <div style={{ position: "relative", width: "100%", height: "160px", background: "rgba(8, 11, 20, 0.6)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <svg viewBox="0 0 300 150" style={{ width: "100%", height: "100%" }}>
                      {/* Grid Lines */}
                      <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="20" y1="56" x2="280" y2="56" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="20" y1="93" x2="280" y2="93" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="20" y1="130" x2="280" y2="130" stroke="rgba(255,255,255,0.06)" />
                      
                      <line x1="20" y1="20" x2="20" y2="130" stroke="rgba(255,255,255,0.06)" />
                      <line x1="150" y1="20" x2="150" y2="130" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="280" y1="20" x2="280" y2="130" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />

                      {/* Loss Value labels */}
                      <text x="5" y="24" fill="var(--text-dim)" fontSize="8" fontFamily="Orbitron">2.5</text>
                      <text x="5" y="78" fill="var(--text-dim)" fontSize="8" fontFamily="Orbitron">1.2</text>
                      <text x="5" y="133" fill="var(--text-dim)" fontSize="8" fontFamily="Orbitron">0.0</text>

                      {/* Training curve path */}
                      <path 
                        d={getSvgPath()} 
                        fill="none" 
                        stroke="var(--hot-pink)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: "drop-shadow(0px 0px 4px rgba(255, 46, 209, 0.4))" }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Simulated Results metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "18px" }}>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      {t("services_detail.development.sim_metric_loss")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {simResults.loss.toFixed(3)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      {t("services_detail.development.sim_metric_time")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {simResults.time}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      {t("services_detail.development.sim_metric_acc")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--hot-pink)" }}>
                      {simResults.accImprovement}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      {t("services_detail.development.sim_metric_vram")}
                    </span>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {simResults.vram}
                    </span>
                  </div>
                </div>

                {/* Live Output Terminal logs */}
                <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Terminal size={12} color="var(--text-muted)" />
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Live Console Output
                    </span>
                  </div>
                  <div 
                    style={{ 
                      height: "100px", 
                      background: "rgba(0, 0, 0, 0.4)", 
                      borderRadius: "6px", 
                      padding: "10px", 
                      overflowY: "auto", 
                      fontFamily: "Courier New, Courier, monospace", 
                      fontSize: "0.7rem", 
                      lineHeight: 1.4,
                      color: "#39FF14" // Classic green screen terminal
                    }}
                  >
                    {terminalLogs.length === 0 ? (
                      <div style={{ color: "var(--text-dim)" }}>Console idle. Click Run Simulation to begin training weights.</div>
                    ) : (
                      terminalLogs.map((log, idx) => (
                        <div key={idx} style={{ 
                          color: log.startsWith("[SUCCESS]") ? "#00E5FF" : log.startsWith("[SYS]") ? "#FFD60A" : log.startsWith("[EPOCH") ? "#FF2ED1" : "#39FF14"
                        }}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px" }}>
            {t("services_detail.development.offering_header")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {offeringsKeys.map((idx) => {
              // Custom colors for development offerings cards
              const cardColors = ["#FF2ED1", "#00E5FF", "#7B61FF", "#FF8A00", "#FF2ED1", "#00E5FF"];
              const color = cardColors[idx - 1];

              return (
                <div key={idx} className="card-glass" style={{ padding: "28px 24px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    {idx === 1 && <Sliders size={18} color={color} />}
                    {idx === 2 && <Database size={18} color={color} />}
                    {idx === 3 && <Cpu size={18} color={color} />}
                    {idx === 4 && <TrendingUp size={18} color={color} />}
                    {idx === 5 && <ShieldCheck size={18} color={color} />}
                    {idx === 6 && <Zap size={18} color={color} />}
                  </div>
                  <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.88rem", fontWeight: 700, marginBottom: "8px" }}>
                    {t(`services_detail.development.offering${idx}_title`)}
                  </h4>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {t(`services_detail.development.offering${idx}_desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
