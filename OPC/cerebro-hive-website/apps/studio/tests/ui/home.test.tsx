import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';

// Mock the child components to avoid testing the entire tree (which includes complex 3D or animations)
vi.mock('../../components/home/v4-os/OsHero', () => ({
  OsHero: () => <div data-testid="os-hero">CerebroHive EIOS</div>
}));
vi.mock('../../components/home/v4-os/PlatformArchitecture', () => ({
  PlatformArchitecture: () => <div data-testid="platform-architecture">Architecture</div>
}));
vi.mock('../../components/home/v4-os/EnterprisePlatformCTA', () => ({
  EnterprisePlatformCTA: () => <div data-testid="enterprise-platform-cta">CTA</div>
}));
vi.mock('../../components/home/v4-os/ExecutiveMetrics', () => ({
  ExecutiveMetrics: () => <div data-testid="executive-metrics">Metrics</div>
}));
vi.mock('../../components/home/v4-os/LivingEnterpriseBrain', () => ({
  LivingEnterpriseBrain: () => <div data-testid="living-enterprise-brain">Brain</div>
}));
vi.mock('../../components/home/v4-os/EnterpriseTransformation', () => ({
  EnterpriseTransformation: () => <div data-testid="enterprise-transformation">Transformation</div>
}));
vi.mock('../../components/home/v4-os/IntegrationIntelligence', () => ({
  IntegrationIntelligence: () => <div data-testid="integration-intelligence">Integration</div>
}));
vi.mock('../../components/home/v4-os/KnowledgePlatform', () => ({
  KnowledgePlatform: () => <div data-testid="knowledge-platform">Knowledge</div>
}));
vi.mock('../../components/home/v4-os/EnterpriseSecurity', () => ({
  EnterpriseSecurity: () => <div data-testid="enterprise-security">Security</div>
}));
vi.mock('../../components/home/v4-os/ProofOfImpact', () => ({
  ProofOfImpact: () => <div data-testid="proof-of-impact">Impact</div>
}));
vi.mock('../../components/home/v4-os/EnterpriseJourney', () => ({
  EnterpriseJourney: () => <div data-testid="enterprise-journey">Journey</div>
}));
vi.mock('../../components/home/v4-os/ExecutiveDecisionPlatform', () => ({
  ExecutiveDecisionPlatform: () => <div data-testid="executive-decision">Decision</div>
}));
vi.mock('../../components/home/HomeFaq', () => ({
  HomeFaq: () => <div data-testid="home-faq">FAQ</div>
}));

describe('Studio HomePage Behavioral Contract', () => {
  it('renders all sections of the Enterprise Intelligence Operating System', () => {
    render(<HomePage />);
    expect(screen.getByTestId('os-hero')).toBeDefined();
    expect(screen.getByTestId('platform-architecture')).toBeDefined();
    expect(screen.getByTestId('executive-metrics')).toBeDefined();
    expect(screen.getByTestId('living-enterprise-brain')).toBeDefined();
    expect(screen.getByTestId('enterprise-transformation')).toBeDefined();
    expect(screen.getByTestId('home-faq')).toBeDefined();
  });
});
