import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { trustClient } from './mock-sdk';
import { useExecutiveStore } from '@/src/store/trust/useExecutiveStore';
import { useSecurityStore } from '@/src/store/trust/useSecurityStore';
import { useComplianceStore } from '@/src/store/trust/useComplianceStore';
import { useRiskStore } from '@/src/store/trust/useRiskStore';
import { useAlertsStore } from '@/src/store/trust/useAlertsStore';
import { useAuditStore } from '@/src/store/trust/useAuditStore';

export function useSyncTrustData() {
  const { data: metrics } = useQuery({ queryKey: ['trust', 'executiveMetrics'], queryFn: () => trustClient.getExecutiveMetrics() });
  const { data: securityPosture } = useQuery({ queryKey: ['trust', 'securityPosture'], queryFn: () => trustClient.getSecurityPosture() });
  const { data: providerHealth } = useQuery({ queryKey: ['trust', 'providerHealth'], queryFn: () => trustClient.getProviderHealth() });
  const { data: risks } = useQuery({ queryKey: ['trust', 'risks'], queryFn: () => trustClient.getRisks() });
  const { data: safetyMetrics } = useQuery({ queryKey: ['trust', 'safetyMetrics'], queryFn: () => trustClient.getAISafetyMetrics() });
  const { data: compliance } = useQuery({ queryKey: ['trust', 'complianceFrameworks'], queryFn: () => trustClient.getComplianceFrameworks() });
  const { data: alerts } = useQuery({ queryKey: ['trust', 'alerts'], queryFn: () => trustClient.getAlerts() });
  const { data: audit } = useQuery({ queryKey: ['trust', 'auditTimeline'], queryFn: () => trustClient.getAuditTimeline() });

  const setMetrics = useExecutiveStore(state => state.setMetrics);
  const setSecurityPosture = useSecurityStore(state => state.setPosture);
  const setProviderHealth = useSecurityStore(state => state.setProviderHealth);
  const setRisks = useRiskStore(state => state.setRisks);
  const setSafetyMetrics = useRiskStore(state => state.setSafetyMetrics);
  const setCompliance = useComplianceStore(state => state.setFrameworks);
  const setAlerts = useAlertsStore(state => state.setAlerts);
  const setAudit = useAuditStore(state => state.setEvents);

  useEffect(() => {
    if (metrics) setMetrics(metrics);
  }, [metrics, setMetrics]);

  useEffect(() => {
    if (securityPosture) setSecurityPosture(securityPosture);
    if (providerHealth) setProviderHealth(providerHealth);
  }, [securityPosture, providerHealth, setSecurityPosture, setProviderHealth]);

  useEffect(() => {
    if (risks) setRisks(risks);
    if (safetyMetrics) setSafetyMetrics(safetyMetrics);
  }, [risks, safetyMetrics, setRisks, setSafetyMetrics]);

  useEffect(() => {
    if (compliance) setCompliance(compliance);
  }, [compliance, setCompliance]);

  useEffect(() => {
    if (alerts) setAlerts(alerts);
  }, [alerts, setAlerts]);

  useEffect(() => {
    if (audit) setAudit(audit);
  }, [audit, setAudit]);
}
