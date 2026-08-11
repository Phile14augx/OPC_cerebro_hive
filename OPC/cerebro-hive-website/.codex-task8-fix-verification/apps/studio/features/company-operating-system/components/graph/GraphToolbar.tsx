"use client";

import { Crosshair, Expand, Eye, EyeOff, Maximize2, Minus, Plus } from "lucide-react";

export interface GraphToolbarProps {
  edgesVisible: boolean;
  fullscreen: boolean;
  labelsVisible: boolean;
  onCenter: () => void;
  onFit: () => void;
  onFullscreen: () => void;
  onLabelsVisible: (visible: boolean) => void;
  onEdgesVisible: (visible: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function GraphToolbar(props: GraphToolbarProps) {
  const actionClass = "grid size-8 place-items-center border border-[var(--company-os-border)] bg-[var(--company-os-panel)] hover:border-[var(--company-os-border-focus)]";
  return <div aria-label="Graph controls" className="flex flex-wrap gap-1">
    <button aria-label="Zoom in" className={actionClass} onClick={props.onZoomIn} type="button"><Plus size={14} /></button>
    <button aria-label="Zoom out" className={actionClass} onClick={props.onZoomOut} type="button"><Minus size={14} /></button>
    <button aria-label="Fit graph" className={actionClass} onClick={props.onFit} type="button"><Expand size={14} /></button>
    <button aria-label="Center graph" className={actionClass} onClick={props.onCenter} type="button"><Crosshair size={14} /></button>
    <button aria-label={props.fullscreen ? "Exit fullscreen" : "Fullscreen"} className={actionClass} onClick={props.onFullscreen} type="button"><Maximize2 size={14} /></button>
    <button aria-label={props.labelsVisible ? "Hide labels" : "Show labels"} className={actionClass} onClick={() => props.onLabelsVisible(!props.labelsVisible)} type="button">{props.labelsVisible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
    <button aria-label={props.edgesVisible ? "Hide edges" : "Show edges"} className={actionClass} onClick={() => props.onEdgesVisible(!props.edgesVisible)} type="button">{props.edgesVisible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
  </div>;
}
