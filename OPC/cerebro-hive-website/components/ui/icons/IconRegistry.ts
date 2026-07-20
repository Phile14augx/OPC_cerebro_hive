import { IconMetadata } from './types';

export const iconRegistry: Record<string, IconMetadata> = {
  'CerebroXCore': { id: 'cerebroxcore', category: 'branding', keywords: ['cerebroxcore',
  'NeuralFabric': { id: 'neuralfabric', category: 'branding', keywords: ['neuralfabric',
  'LivingDigitalTwin': { id: 'livingdigitaltwin', category: 'branding', keywords: ['livingdigitaltwin',
  'KnowledgeGalaxy': { id: 'knowledgegalaxy', category: 'branding', keywords: ['knowledgegalaxy',
  'SemanticMemory': { id: 'semanticmemory', category: 'branding', keywords: ['semanticmemory',
  'ReasoningEngine': { id: 'reasoningengine', category: 'branding', keywords: ['reasoningengine',
  'EnterpriseBrain': { id: 'enterprisebrain', category: 'branding', keywords: ['enterprisebrain',
  'AiOperatingSystem': { id: 'aioperatingsystem', category: 'branding', keywords: ['aioperatingsystem',
  'AgentSwarm': { id: 'agentswarm', category: 'branding', keywords: ['agentswarm',
  'CognitivePipeline': { id: 'cognitivepipeline', category: 'branding', keywords: ['cognitivepipeline',
  'HiveShield': { id: 'hiveshield', category: 'branding', keywords: ['hiveshield',
  'CerebroArchive': { id: 'cerebroarchive', category: 'branding', keywords: ['cerebroarchive',
  'CerebroStudio': { id: 'cerebrostudio', category: 'branding', keywords: ['cerebrostudio',
  'CerebroFlow': { id: 'cerebroflow', category: 'branding', keywords: ['cerebroflow',
  'CerebroInsight': { id: 'cerebroinsight', category: 'branding', keywords: ['cerebroinsight',
  'Database': {
    id: 'database',
    category: 'database',
    keywords: ["sql","storage","postgres","mysql"],
    tags: ["backend","storage"],
    aliases: ["db"]
  },
  'Server': {
    id: 'server',
    category: 'infrastructure',
    keywords: ["compute","node","bare-metal"],
    tags: ["backend","compute"],
    aliases: ["host"]
  },
  'Cloud': {
    id: 'cloud',
    category: 'cloud',
    keywords: ["aws","azure","gcp","hosting"],
    tags: ["cloud"],
    aliases: []
  },
  'CloudCompute': {
    id: 'cloud-compute',
    category: 'cloud',
    keywords: ["processing","cloud-function"],
    tags: ["cloud","compute"],
    aliases: []
  },
  'Shield': {
    id: 'shield',
    category: 'security',
    keywords: ["protection","firewall","secure"],
    tags: ["security"],
    aliases: []
  },
  'Lock': {
    id: 'lock',
    category: 'security',
    keywords: ["secure","encryption","private"],
    tags: ["security"],
    aliases: []
  },
  'Workflow': {
    id: 'workflow',
    category: 'workflow',
    keywords: ["pipeline","process","flow"],
    tags: ["automation"],
    aliases: []
  },
  'Settings': {
    id: 'settings',
    category: 'navigation',
    keywords: ["preferences","options","config"],
    tags: ["ui"],
    aliases: ["gear"]
  },
  'Search': {
    id: 'search',
    category: 'navigation',
    keywords: ["find","lookup","query"],
    tags: ["ui"],
    aliases: ["magnifier"]
  },
  'AiBrain': {
    id: 'ai-brain',
    category: 'ai',
    keywords: ["intelligence","neural","smart"],
    tags: ["ai"],
    aliases: ["brain"]
  },
  'Robot': {
    id: 'robot',
    category: 'agents',
    keywords: ["agent","automaton","bot"],
    tags: ["ai","agent"],
    aliases: ["bot"]
  },
  'FileCode': {
    id: 'file-code',
    category: 'files',
    keywords: ["source","script","json"],
    tags: ["developer"],
    aliases: ["code"]
  },
  'FileJson': {
    id: 'file-json',
    category: 'files',
    keywords: ["data","api"],
    tags: ["developer"],
    aliases: ["json"]
  },
  'ChartBar': {
    id: 'chart-bar',
    category: 'analytics',
    keywords: ["graph","data","metrics"],
    tags: ["data"],
    aliases: ["graph"]
  },
  'ChartPie': {
    id: 'chart-pie',
    category: 'analytics',
    keywords: ["graph","data","metrics"],
    tags: ["data"],
    aliases: ["pie"]
  },
  'Home': {
    id: 'home',
    category: 'dashboard',
    keywords: ["main","start","landing"],
    tags: ["ui"],
    aliases: ["house"]
  },
  'User': {
    id: 'user',
    category: 'navigation',
    keywords: ["person","account","profile"],
    tags: ["ui"],
    aliases: ["person"]
  },
  'Users': {
    id: 'users',
    category: 'enterprise',
    keywords: ["team","group","organization"],
    tags: ["ui"],
    aliases: ["team"]
  },
  'Building': {
    id: 'building',
    category: 'enterprise',
    keywords: ["company","office","hq"],
    tags: ["business"],
    aliases: ["company"]
  },
  'CheckCircle': {
    id: 'check-circle',
    category: 'status',
    keywords: ["success","done","complete"],
    tags: ["status"],
    aliases: ["success"]
  },
  'AlertCircle': {
    id: 'alert-circle',
    category: 'status',
    keywords: ["warning","error","danger"],
    tags: ["status"],
    aliases: ["warning"]
  },
  'Loader': {
    id: 'loader',
    category: 'status',
    keywords: ["spinner","loading","wait"],
    tags: ["status"],
    aliases: ["loading"]
  },
  'Terminal': {
    id: 'terminal',
    category: 'developer',
    keywords: ["cli","console","prompt"],
    tags: ["developer"],
    aliases: ["console"]
  },
  'Api': {
    id: 'api',
    category: 'developer',
    keywords: ["endpoint","integration","rest"],
    tags: ["developer"],
    aliases: ["webhook"]
  }
};
