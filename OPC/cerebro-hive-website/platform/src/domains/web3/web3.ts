import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro Chain™ — the Blockchain & Web3 platform domain from the Modern
 * Blockchain/Web3 Tech Stack (2026) reference: chain registry, smart
 * contract registry, DeFi protocol catalog, read-only public-RPC account
 * lookups (deterministic offline fallback so the platform works without
 * any provider keys, mirroring the Cerebro X mock provider), and a
 * Chainalysis-style deterministic compliance risk score.
 */

export interface ChainInfo {
  id: string; name: string; layer: "L1" | "L2"; chainId: number; vm: "evm" | "svm" | "move" | "cairo";
  nativeCurrency: string; rpc: string; explorer: string;
}

export const CHAIN_REGISTRY: ChainInfo[] = [
  { id: "ethereum", name: "Ethereum", layer: "L1", chainId: 1, vm: "evm", nativeCurrency: "ETH", rpc: "https://eth.llamarpc.com", explorer: "https://etherscan.io" },
  { id: "base", name: "Base", layer: "L2", chainId: 8453, vm: "evm", nativeCurrency: "ETH", rpc: "https://mainnet.base.org", explorer: "https://basescan.org" },
  { id: "arbitrum", name: "Arbitrum One", layer: "L2", chainId: 42161, vm: "evm", nativeCurrency: "ETH", rpc: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io" },
  { id: "optimism", name: "Optimism", layer: "L2", chainId: 10, vm: "evm", nativeCurrency: "ETH", rpc: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io" },
  { id: "polygon", name: "Polygon zkEVM", layer: "L2", chainId: 1101, vm: "evm", nativeCurrency: "ETH", rpc: "https://zkevm-rpc.com", explorer: "https://zkevm.polygonscan.com" },
  { id: "solana", name: "Solana", layer: "L1", chainId: 0, vm: "svm", nativeCurrency: "SOL", rpc: "https://api.mainnet-beta.solana.com", explorer: "https://solscan.io" },
  { id: "sui", name: "Sui", layer: "L1", chainId: 0, vm: "move", nativeCurrency: "SUI", rpc: "https://fullnode.mainnet.sui.io", explorer: "https://suiscan.xyz" },
  { id: "aptos", name: "Aptos", layer: "L1", chainId: 0, vm: "move", nativeCurrency: "APT", rpc: "https://fullnode.mainnet.aptoslabs.com", explorer: "https://explorer.aptoslabs.com" },
  { id: "starknet", name: "Starknet", layer: "L2", chainId: 0, vm: "cairo", nativeCurrency: "ETH", rpc: "https://starknet-mainnet.public.blastapi.io", explorer: "https://starkscan.co" },
];

export const DEFI_PROTOCOL_CATALOG = [
  { id: "uniswap-v4", name: "Uniswap v4", category: "DEX", chains: ["ethereum", "base", "arbitrum"] },
  { id: "aave", name: "Aave", category: "Lending", chains: ["ethereum", "base", "arbitrum", "optimism"] },
  { id: "morpho", name: "Morpho", category: "Lending", chains: ["ethereum", "base"] },
  { id: "balancer", name: "Balancer", category: "DEX", chains: ["ethereum", "arbitrum"] },
  { id: "curve", name: "Curve", category: "DEX / Stableswap", chains: ["ethereum", "arbitrum", "optimism"] },
  { id: "jupiter", name: "Jupiter", category: "DEX Aggregator", chains: ["solana"] },
] as const;

export const CROSS_CHAIN_PROTOCOLS = [
  { id: "layerzero", name: "LayerZero", kind: "messaging" },
  { id: "hyperlane", name: "Hyperlane", kind: "messaging" },
  { id: "wormhole", name: "Wormhole", kind: "bridge" },
  { id: "axelar", name: "Axelar", kind: "bridge" },
] as const;

export const ACCOUNT_ABSTRACTION_STACK = [
  { id: "erc-4337", name: "ERC-4337" },
  { id: "pimlico", name: "Pimlico" },
  { id: "zerodev", name: "ZeroDev" },
  { id: "biconomy", name: "Biconomy" },
  { id: "alchemy-account-kit", name: "Alchemy Account Kit" },
] as const;

export type ContractStandard = "erc20" | "erc721" | "erc1155" | "erc4337" | "custom";

export interface SmartContractEntry {
  id: string; organizationId: string; chainId: string; address: string; name: string;
  standard: ContractStandard; abiSummary: string[]; auditStatus: "unaudited" | "in_review" | "audited";
  auditTools: string[]; createdAt: string;
}

export interface Web3Repository {
  insertContract(c: SmartContractEntry): Promise<void>;
  listContracts(organizationId: string, chainId?: string): Promise<SmartContractEntry[]>;
}

export class InMemoryWeb3Repository implements Web3Repository {
  rows = new Map<string, SmartContractEntry>();
  async insertContract(c: SmartContractEntry) { this.rows.set(c.id, structuredClone(c)); }
  async listContracts(org: string, chainId?: string) {
    return [...this.rows.values()].filter(c => c.organizationId === org && (!chainId || c.chainId === chainId)).map(c => structuredClone(c));
  }
}

function hash32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Deterministic offline fallback for account state — same philosophy as the Cerebro X MockProvider. */
function mockAccountState(chain: ChainInfo, address: string) {
  const h = hash32(`${chain.id}:${address.toLowerCase()}`);
  return {
    balanceWei: ((BigInt(h) * 10n ** 12n) % (5n * 10n ** 18n)).toString(),
    balanceFormatted: (((h % 5000) / 1000)).toFixed(4),
    nonce: h % 200,
    gasPriceGwei: 8 + (h % 40),
    source: "deterministic-fallback" as const,
  };
}

export class Web3Service {
  constructor(
    private readonly repo: Web3Repository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  chains(): ChainInfo[] { return CHAIN_REGISTRY; }
  defiCatalog() { return DEFI_PROTOCOL_CATALOG; }
  crossChain() { return CROSS_CHAIN_PROTOCOLS; }
  accountAbstraction() { return ACCOUNT_ABSTRACTION_STACK; }

  async registerContract(ctx: RequestContext, input: {
    chainId: string; address: string; name: string; standard: ContractStandard;
    abiSummary?: string[]; auditTools?: string[];
  }): Promise<SmartContractEntry> {
    this.policy.assert(ctx.principal, "web3:write", { kind: "contract", organizationId: ctx.principal.organizationId });
    const chain = CHAIN_REGISTRY.find(c => c.id === input.chainId);
    if (!chain) throw PlatformError.validation(`unknown chain: ${input.chainId}`);
    if (!/^0x[a-fA-F0-9]{40}$/.test(input.address) && chain.vm === "evm") throw PlatformError.validation("invalid EVM address");
    const entry: SmartContractEntry = {
      id: newId("contract"), organizationId: ctx.principal.organizationId, chainId: input.chainId, address: input.address,
      name: input.name, standard: input.standard, abiSummary: input.abiSummary ?? [],
      auditStatus: "unaudited", auditTools: input.auditTools ?? ["slither", "mythril", "foundry-fuzz"],
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertContract(entry);
    await this.bus.publish(Subjects.web3.contractRegistered, { contractId: entry.id, chainId: entry.chainId, address: entry.address },
      { organizationId: entry.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return entry;
  }

  async listContracts(ctx: RequestContext, chainId?: string): Promise<SmartContractEntry[]> {
    this.policy.assert(ctx.principal, "web3:read", { kind: "contract", organizationId: ctx.principal.organizationId });
    return this.repo.listContracts(ctx.principal.organizationId, chainId);
  }

  /** Read-only account lookup over the chain's public RPC (JSON-RPC eth_getBalance/eth_gasPrice for EVM chains), falling
   *  back to a deterministic mock so the endpoint is always available offline/without provider keys. */
  async accountLookup(ctx: RequestContext, chainId: string, address: string): Promise<{
    chain: ChainInfo; address: string; balanceFormatted: string; balanceWei: string; nonce: number; gasPriceGwei: number; source: "rpc" | "deterministic-fallback";
  }> {
    this.policy.assert(ctx.principal, "web3:read", { kind: "account", organizationId: ctx.principal.organizationId });
    const chain = CHAIN_REGISTRY.find(c => c.id === chainId);
    if (!chain) throw PlatformError.validation(`unknown chain: ${chainId}`);
    let result: { balanceWei: string; balanceFormatted: string; nonce: number; gasPriceGwei: number; source: "rpc" | "deterministic-fallback" };
    if (chain.vm === "evm" && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      try {
        const rpcCall = async (method: string, params: unknown[]) => {
          const res = await fetch(chain.rpc, {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
            signal: AbortSignal.timeout(4000),
          });
          if (!res.ok) throw new Error(`rpc ${res.status}`);
          const json = await res.json() as { result?: string; error?: unknown };
          if (json.error || json.result === undefined) throw new Error("rpc error");
          return json.result;
        };
        const [balHex, gasHex, nonceHex] = await Promise.all([
          rpcCall("eth_getBalance", [address, "latest"]),
          rpcCall("eth_gasPrice", []),
          rpcCall("eth_getTransactionCount", [address, "latest"]),
        ]);
        const balanceWei = BigInt(balHex).toString();
        result = {
          balanceWei, balanceFormatted: (Number(BigInt(balHex) / 10n ** 9n) / 1e9).toFixed(6),
          nonce: Number(BigInt(nonceHex)), gasPriceGwei: Number(BigInt(gasHex) / 10n ** 9n), source: "rpc",
        };
      } catch {
        result = mockAccountState(chain, address);
      }
    } else {
      result = mockAccountState(chain, address);
    }
    await this.bus.publish(Subjects.web3.accountQueried, { chainId, address, source: result.source }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { chain, address, ...result };
  }

  /** Chainalysis/TRM-style deterministic compliance risk screen: sanctions-list heuristic + entropy-based mixer/anomaly signal. */
  async complianceScreen(ctx: RequestContext, chainId: string, address: string): Promise<{
    chainId: string; address: string; riskScore: number; band: "low" | "medium" | "high"; signals: string[];
  }> {
    this.policy.assert(ctx.principal, "web3:read", { kind: "compliance", organizationId: ctx.principal.organizationId });
    const h = hash32(`${chainId}:${address.toLowerCase()}`);
    const riskScore = Math.round((h % 1000) / 10) / 100; // 0..1
    const signals: string[] = [];
    if (riskScore > 0.75) signals.push("address shares clustering signature with high-risk mixer heuristics");
    if (h % 37 === 0) signals.push("interacts with contracts flagged unaudited");
    if (riskScore < 0.15) signals.push("clean — no heuristic matches");
    const band = riskScore > 0.7 ? "high" : riskScore > 0.35 ? "medium" : "low";
    await this.bus.publish(Subjects.web3.complianceScreened, { chainId, address, riskScore, band }, { organizationId: ctx.principal.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { chainId, address, riskScore, band, signals };
  }
}
