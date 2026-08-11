"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, Server, Wrench, Briefcase, Shield } from "lucide-react";

// Icons
import {
  SiGithub,
  SiGitlab,
  SiDocker,
  SiKubernetes,
  SiGooglecloud,
  SiSap,
  SiSnowflake,
  SiTerraform,
  SiGrafana,
  SiPrometheus,
  SiZoom,
  SiNotion,
  SiConfluence,
  SiBitbucket,
  SiGooglebigquery,
  SiDatabricks,
  SiMongodb,
  SiPostgresql,
  SiOkta,
  SiVault,
  SiSplunk,
} from "react-icons/si";

import {
  FaAws,
  FaMicrosoft,
  FaSlack,
  FaSalesforce,
  FaGoogle,
} from "react-icons/fa6";

import { VscAzure } from "react-icons/vsc";
import { BiLogoMicrosoftTeams } from "react-icons/bi";

type Integration = {
  name: string;
  icon: any;
  category: string;
  features: string[];
  color: string;
};

const categories = [
  "Productivity",
  "Cloud",
  "Development",
  "Data",
  "Enterprise",
  "Security",
];

const integrations: Integration[] = [
  // Productivity
  { name: "Microsoft 365", icon: FaMicrosoft, category: "Productivity", features: ["SSO", "Sync", "Drive"], color: "#D83B01" },
  { name: "Google Workspace", icon: FaGoogle, category: "Productivity", features: ["OAuth", "Docs", "Drive"], color: "#4285F4" },
  { name: "Slack", icon: FaSlack, category: "Productivity", features: ["Alerts", "Commands", "Workflows"], color: "#4A154B" },
  { name: "Teams", icon: BiLogoMicrosoftTeams, category: "Productivity", features: ["Notifications", "Bots", "Meetings"], color: "#6264A7" },
  { name: "Zoom", icon: SiZoom, category: "Productivity", features: ["Meetings", "Transcripts", "Bots"], color: "#2D8CFF" },
  { name: "Notion", icon: SiNotion, category: "Productivity", features: ["Pages", "Databases", "Sync"], color: "#000000" },
  { name: "Confluence", icon: SiConfluence, category: "Productivity", features: ["Wikis", "Docs", "Jira"], color: "#172B4D" },

  // Cloud
  { name: "AWS", icon: FaAws, category: "Cloud", features: ["EC2", "S3", "IAM", "VPC"], color: "#FF9900" },
  { name: "Azure", icon: VscAzure, category: "Cloud", features: ["VMs", "Blob", "Entra", "AKS"], color: "#0078D4" },
  { name: "GCP", icon: SiGooglecloud, category: "Cloud", features: ["Compute", "Storage", "GKE"], color: "#4285F4" },
  { name: "Oracle Cloud", icon: Database, category: "Cloud", features: ["Compute", "DB", "Network"], color: "#F80000" },
  { name: "IBM Cloud", icon: Server, category: "Cloud", features: ["Bare Metal", "VPC", "Watson"], color: "#052FAD" },

  // Development
  { name: "GitHub", icon: SiGithub, category: "Development", features: ["OAuth", "Webhooks", "Actions"], color: "#181717" },
  { name: "GitLab", icon: SiGitlab, category: "Development", features: ["Pipelines", "Repos", "Issues"], color: "#FC6D26" },
  { name: "Bitbucket", icon: SiBitbucket, category: "Development", features: ["Pipelines", "Jira Sync", "Repos"], color: "#0052CC" },
  { name: "Docker", icon: SiDocker, category: "Development", features: ["Images", "Registries", "Builds"], color: "#2496ED" },
  { name: "Kubernetes", icon: SiKubernetes, category: "Development", features: ["Clusters", "Deployments", "Pods"], color: "#326CE5" },
  { name: "Terraform", icon: SiTerraform, category: "Development", features: ["State", "Plans", "Modules"], color: "#844FBA" },

  // Data
  { name: "Snowflake", icon: SiSnowflake, category: "Data", features: ["Data Warehouse", "Query", "Share"], color: "#29B5E8" },
  { name: "BigQuery", icon: SiGooglebigquery, category: "Data", features: ["Analytics", "ML", "Export"], color: "#669DF6" },
  { name: "Redshift", icon: Database, category: "Data", features: ["Warehouse", "Spectrum", "ETL"], color: "#8C4FFF" },
  { name: "Databricks", icon: SiDatabricks, category: "Data", features: ["Lakehouse", "Spark", "MLflow"], color: "#FF3621" },
  { name: "MongoDB", icon: SiMongodb, category: "Data", features: ["Collections", "Queries", "Atlas"], color: "#47A248" },
  { name: "PostgreSQL", icon: SiPostgresql, category: "Data", features: ["Relational", "JSONB", "Extensions"], color: "#4169E1" },

  // Enterprise
  { name: "SAP", icon: SiSap, category: "Enterprise", features: ["ERP", "HANA", "OData"], color: "#0FAAFF" },
  { name: "Salesforce", icon: FaSalesforce, category: "Enterprise", features: ["CRM", "Apex", "Flows"], color: "#00A1E0" },
  { name: "ServiceNow", icon: Wrench, category: "Enterprise", features: ["ITSM", "CMDB", "Workflows"], color: "#81B5A1" },
  { name: "Workday", icon: Briefcase, category: "Enterprise", features: ["HCM", "Financials", "API"], color: "#005CB9" },
  { name: "Dynamics 365", icon: FaMicrosoft, category: "Enterprise", features: ["CRM", "ERP", "Dataverse"], color: "#002050" },

  // Security
  { name: "Okta", icon: SiOkta, category: "Security", features: ["SSO", "MFA", "SCIM"], color: "#007DC1" },
  { name: "Azure AD", icon: VscAzure, category: "Security", features: ["SSO", "SAML", "OIDC"], color: "#0078D4" },
  { name: "Vault", icon: SiVault, category: "Security", features: ["Secrets", "Encryption", "Tokens"], color: "#000000" },
  { name: "CrowdStrike", icon: Shield, category: "Security", features: ["EDR", "Threats", "Alerts"], color: "#FF0000" },
  { name: "Splunk", icon: SiSplunk, category: "Security", features: ["SIEM", "Logs", "Dashboards"], color: "#000000" },
  { name: "Prometheus", icon: SiPrometheus, category: "Security", features: ["Metrics", "Alerts", "TSDB"], color: "#E6522C" },
  { name: "Grafana", icon: SiGrafana, category: "Security", features: ["Dashboards", "Alerts", "Panels"], color: "#F46800" },
];

function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = integration.icon;
  
  return (
    <motion.div
      whileHover="hover"
      initial="initial"
      className="group relative flex flex-col p-6 bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-accent hover:shadow-[0_8px_30px_rgba(0,245,122,0.12)] cursor-pointer"
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-start justify-between mb-8">
        <div className="flex flex-col">
          <h3 className="font-space font-bold text-lg text-text-primary mb-1 group-hover:text-primary-accent transition-colors">
            {integration.name}
          </h3>
          <span className="text-xs text-text-muted uppercase tracking-wider font-bold">
            {integration.category}
          </span>
        </div>
        <motion.div 
          variants={{
            initial: { scale: 1, rotate: 0, color: "var(--text-secondary)" },
            hover: { scale: 1.1, rotate: 5, color: integration.color }
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary-accent/30 shadow-sm transition-colors"
        >
          <Icon size={24} />
        </motion.div>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          Native Integration
        </div>
        <ul className="space-y-2 mb-6">
          {integration.features.map((feature, idx) => (
            <motion.li 
              key={idx}
              variants={{
                initial: { opacity: 0.6, x: 0 },
                hover: { opacity: 1, x: 5 }
              }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 text-sm text-text-secondary group-hover:text-text-primary transition-colors"
            >
              <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary-accent transition-colors" />
              {feature}
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-accent opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
          Explore Docs <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

export function EnterpriseIntegrations() {
  return (
    <div className="w-full flex flex-col gap-12 text-left">
      {categories.map((category) => {
        const categoryIntegrations = integrations.filter(i => i.category === category);
        if (categoryIntegrations.length === 0) return null;

        return (
          <div key={category} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-space font-bold text-text-primary">{category}</h3>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {categoryIntegrations.map((integration) => (
                <IntegrationCard key={integration.name} integration={integration} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
