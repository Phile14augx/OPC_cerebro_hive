"use client";

import React from "react";
import { motion } from "framer-motion";
import { MetricCard } from "@/components/platform/hiveops/MetricCard";
import { GlobeVisualizer } from "@/components/platform/hiveops/GlobeVisualizer";
import { Timeline } from "@/components/platform/hiveops/Timeline";
import { Recommendations } from "@/components/platform/hiveops/Recommendations";
import { 
  Activity,
  Server, 
  Cpu, 
  Zap, 
  CheckCircle, 
  ShieldAlert, 
  Leaf, 
  DollarSign, 
  TrendingDown
} from "lucide-react";

export default function HiveOpsMissionControl() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-100 tracking-tight"
        >
          Mission Control
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400"
        >
          Enterprise Operations Control Plane. All systems nominal.
        </motion.p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Infrastructure Health" 
          value="99.99%" 
          subtitle="All regions operational"
          icon={Activity} 
          color="emerald"
          delay={0.1}
        />
        <MetricCard 
          title="GPU Utilization" 
          value="87%" 
          trend={{ value: 5, isPositive: true }}
          icon={Cpu} 
          color="cyan"
          delay={0.2}
        />
        <MetricCard 
          title="Running Models" 
          value="24" 
          subtitle="across 6 clusters"
          icon={Zap} 
          color="purple"
          delay={0.3}
        />
        <MetricCard 
          title="Pipeline Success" 
          value="98.2%" 
          trend={{ value: 1.2, isPositive: true }}
          icon={CheckCircle} 
          color="emerald"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Infrastructure Topology */}
        <div className="lg:col-span-2 space-y-6">
          <GlobeVisualizer />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard 
              title="Monthly Cost" 
              value="$142,500" 
              trend={{ value: 3.4, isPositive: false }}
              icon={DollarSign} 
              color="amber"
              delay={0.5}
            />
            <MetricCard 
              title="Estimated Savings" 
              value="$18,400" 
              subtitle="Optimizations available"
              icon={TrendingDown} 
              color="emerald"
              delay={0.6}
            />
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="flex-1">
            <Recommendations />
          </div>
          <div className="flex-1">
            <Timeline />
          </div>
        </div>
      </div>
      
      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <MetricCard 
          title="Security Score" 
          value="A+" 
          subtitle="No critical vulnerabilities"
          icon={ShieldAlert} 
          color="emerald"
          delay={0.7}
        />
        <MetricCard 
          title="Active Clusters" 
          value="45" 
          trend={{ value: 2, isPositive: true }}
          icon={Server} 
          color="cyan"
          delay={0.8}
        />
        <MetricCard 
          title="Carbon Footprint" 
          value="2.4t" 
          trend={{ value: 12, isPositive: true, label: "reduction from last month" }}
          icon={Leaf} 
          color="emerald"
          delay={0.9}
        />
      </div>
    </div>
  );
}


