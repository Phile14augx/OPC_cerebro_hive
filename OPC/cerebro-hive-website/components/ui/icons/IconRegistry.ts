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
    aliases: ["db"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Server': {
    id: 'server',
    category: 'infrastructure',
    keywords: ["compute","node","bare-metal"],
    tags: ["backend","compute"],
    aliases: ["host"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Cloud': {
    id: 'cloud',
    category: 'cloud',
    keywords: ["aws","azure","gcp","hosting"],
    tags: ["cloud"],
    aliases: [],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'CloudCompute': {
    id: 'cloud-compute',
    category: 'cloud',
    keywords: ["processing","cloud-function"],
    tags: ["cloud","compute"],
    aliases: [],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Shield': {
    id: 'shield',
    category: 'security',
    keywords: ["protection","firewall","secure"],
    tags: ["security"],
    aliases: [],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Lock': {
    id: 'lock',
    category: 'security',
    keywords: ["secure","encryption","private"],
    tags: ["security"],
    aliases: [],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Workflow': {
    id: 'workflow',
    category: 'workflow',
    keywords: ["pipeline","process","flow"],
    tags: ["automation"],
    aliases: [],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Settings': {
    id: 'settings',
    category: 'navigation',
    keywords: ["preferences","options","config"],
    tags: ["ui"],
    aliases: ["gear"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Search': {
    id: 'search',
    category: 'navigation',
    keywords: ["find","lookup","query"],
    tags: ["ui"],
    aliases: ["magnifier"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'AiBrain': {
    id: 'ai-brain',
    category: 'ai',
    keywords: ["intelligence","neural","smart"],
    tags: ["ai"],
    aliases: ["brain"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Robot': {
    id: 'robot',
    category: 'agents',
    keywords: ["agent","automaton","bot"],
    tags: ["ai","agent"],
    aliases: ["bot"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'FileCode': {
    id: 'file-code',
    category: 'files',
    keywords: ["source","script","json"],
    tags: ["developer"],
    aliases: ["code"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'FileJson': {
    id: 'file-json',
    category: 'files',
    keywords: ["data","api"],
    tags: ["developer"],
    aliases: ["json"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'ChartBar': {
    id: 'chart-bar',
    category: 'analytics',
    keywords: ["graph","data","metrics"],
    tags: ["data"],
    aliases: ["graph"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'ChartPie': {
    id: 'chart-pie',
    category: 'analytics',
    keywords: ["graph","data","metrics"],
    tags: ["data"],
    aliases: ["pie"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Home': {
    id: 'home',
    category: 'dashboard',
    keywords: ["main","start","landing"],
    tags: ["ui"],
    aliases: ["house"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'User': {
    id: 'user',
    category: 'navigation',
    keywords: ["person","account","profile"],
    tags: ["ui"],
    aliases: ["person"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Users': {
    id: 'users',
    category: 'enterprise',
    keywords: ["team","group","organization"],
    tags: ["ui"],
    aliases: ["team"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Building': {
    id: 'building',
    category: 'enterprise',
    keywords: ["company","office","hq"],
    tags: ["business"],
    aliases: ["company"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'CheckCircle': {
    id: 'check-circle',
    category: 'status',
    keywords: ["success","done","complete"],
    tags: ["status"],
    aliases: ["success"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'AlertCircle': {
    id: 'alert-circle',
    category: 'status',
    keywords: ["warning","error","danger"],
    tags: ["status"],
    aliases: ["warning"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Loader': {
    id: 'loader',
    category: 'status',
    keywords: ["spinner","loading","wait"],
    tags: ["status"],
    aliases: ["loading"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Terminal': {
    id: 'terminal',
    category: 'developer',
    keywords: ["cli","console","prompt"],
    tags: ["developer"],
    aliases: ["console"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  },
  'Api': {
    id: 'api',
    category: 'developer',
    keywords: ["endpoint","integration","rest"],
    tags: ["developer"],
    aliases: ["webhook"],
    version: '1.0.0',
    introduced: '1.0.0',
    stability: 'stable'
  }
};
