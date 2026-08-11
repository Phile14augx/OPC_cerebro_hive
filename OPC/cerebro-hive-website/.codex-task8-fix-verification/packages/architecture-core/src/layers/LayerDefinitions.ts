export const ArchitectureLayers = {
  APPLICATIONS: 'applications',
  PLATFORM_SERVICES: 'platform',
  KERNEL_SERVICES: 'kernel',
  INFRASTRUCTURE: 'infrastructure'
} as const;

export type ArchitectureLayer = typeof ArchitectureLayers[keyof typeof ArchitectureLayers];
