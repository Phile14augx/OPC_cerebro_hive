"use client";

import { useCallback, useEffect, useState } from "react";
import { api, checkOnline, KEY } from "../lib";
import { PillarShell } from "../PillarShell";

interface Chain { id: string; name: string; layer: string; nativeCurrency: string }
interface DefiProtocol { id: string; name: string; category: string; chains: string[] }
interface AccountLookup { chain: { id: string; name: string }; address: string; balanceFormatted: string; nonce: number; gasPriceGwei: number; source: string }
interface ComplianceResult { riskScore: number; band: string; signals: string[] }

export default function Web3Page() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [chains, setChains] = useState<Chain[]>([]);
  const [defi, setDefi] = useState<DefiProtocol[]>([]);
  const [chainId, setChainId] = useState("ethereum");
  const [address, setAddress] = useState("0x0000000000000000000000000000000000dEaD");
  const [account, setAccount] = useState<AccountLookup | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      setChains((await api<{ chains: Chain[] }>("/v1/web3/chains")).chains);
      setDefi((await api<{ protocols: DefiProtocol[] }>("/v1/web3/defi")).protocols);
    } catch { /* noop */ }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const lookupAccount = useCallback(async () => {
    setBusy(true);
    try {
      setAccount(await api<AccountLookup>(`/v1/web3/accounts/${chainId}/${address}`));
      setCompliance(await api<ComplianceResult>(`/v1/web3/compliance/${chainId}/${address}`));
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }, [chainId, address]);

  return (
    <PillarShell slug="web3" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Chain registry &amp; account lookup</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chains.map(c => (
            <button key={c.id} onClick={() => setChainId(c.id)} className={`rounded-full border px-3 py-1 text-xs ${chainId === c.id ? "border-primary-accent text-primary-accent" : "border-border text-text-secondary"}`}>{c.name}</button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={address} onChange={e => setAddress(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-accent" placeholder="address" />
          <button onClick={() => void lookupAccount()} disabled={busy || !online || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">{busy ? "…" : "Lookup"}</button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {account && (
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-text-primary">
            Balance: <span className="font-semibold">{account.balanceFormatted} {account.chain.name === "Solana" ? "SOL" : "native"}</span> · nonce {account.nonce} · gas {account.gasPriceGwei} gwei
            <span className="ml-2 text-xs text-text-secondary">({account.source})</span>
            {compliance && <div className="mt-1 text-xs text-text-secondary">Compliance risk: <span className="text-primary-accent">{compliance.band}</span> ({compliance.riskScore})</div>}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">DeFi protocol catalog</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {defi.map(p => <span key={p.id} className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">{p.name} · {p.category}</span>)}
          {defi.length === 0 && <span className="text-sm text-text-secondary">No protocols loaded yet.</span>}
        </div>
      </section>
    </PillarShell>
  );
}
