export const TALENT_ROLE_KEYS = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  CANDIDATE: 'CANDIDATE',
} as const;

export type TalentRoleKey = (typeof TALENT_ROLE_KEYS)[keyof typeof TALENT_ROLE_KEYS];

export interface TalentPermissionTuple {
  readonly key:
    | 'READ_ASSESSMENT'
    | 'CREATE_ASSESSMENT'
    | 'READ_COPILOT_INSIGHTS'
    | 'CREATE_SESSION'
    | 'SUBMIT_SESSION'
    | 'UPDATE_SESSION'
    | 'CREATE_EXECUTION';
  readonly resource:
    | 'talent_assessments'
    | 'talent_copilot'
    | 'talent_sessions'
    | 'talent_session_telemetry'
    | 'talent_executions';
  readonly action: 'read' | 'create' | 'submit' | 'write';
  readonly serialized: `${TalentPermissionTuple['resource']}:${TalentPermissionTuple['action']}`;
}

export const READ_ASSESSMENT = {
  key: 'READ_ASSESSMENT',
  resource: 'talent_assessments',
  action: 'read',
  serialized: 'talent_assessments:read',
} as const satisfies TalentPermissionTuple;

export const CREATE_ASSESSMENT = {
  key: 'CREATE_ASSESSMENT',
  resource: 'talent_assessments',
  action: 'create',
  serialized: 'talent_assessments:create',
} as const satisfies TalentPermissionTuple;

export const READ_COPILOT_INSIGHTS = {
  key: 'READ_COPILOT_INSIGHTS',
  resource: 'talent_copilot',
  action: 'read',
  serialized: 'talent_copilot:read',
} as const satisfies TalentPermissionTuple;

export const CREATE_SESSION = {
  key: 'CREATE_SESSION',
  resource: 'talent_sessions',
  action: 'create',
  serialized: 'talent_sessions:create',
} as const satisfies TalentPermissionTuple;

export const SUBMIT_SESSION = {
  key: 'SUBMIT_SESSION',
  resource: 'talent_sessions',
  action: 'submit',
  serialized: 'talent_sessions:submit',
} as const satisfies TalentPermissionTuple;

export const UPDATE_SESSION = {
  key: 'UPDATE_SESSION',
  resource: 'talent_session_telemetry',
  action: 'write',
  serialized: 'talent_session_telemetry:write',
} as const satisfies TalentPermissionTuple;

export const CREATE_EXECUTION = {
  key: 'CREATE_EXECUTION',
  resource: 'talent_executions',
  action: 'create',
  serialized: 'talent_executions:create',
} as const satisfies TalentPermissionTuple;

export const TALENT_PERMISSION_TUPLES = [
  READ_ASSESSMENT,
  CREATE_ASSESSMENT,
  READ_COPILOT_INSIGHTS,
  CREATE_SESSION,
  SUBMIT_SESSION,
  UPDATE_SESSION,
  CREATE_EXECUTION,
] as const satisfies readonly TalentPermissionTuple[];

const FULL_TALENT_PERMISSION_SET = TALENT_PERMISSION_TUPLES;

export const TALENT_PERMISSIONS_BY_ROLE = {
  OWNER: FULL_TALENT_PERMISSION_SET,
  ADMIN: FULL_TALENT_PERMISSION_SET,
  RECRUITER: [READ_ASSESSMENT, CREATE_ASSESSMENT, READ_COPILOT_INSIGHTS],
  CANDIDATE: [CREATE_SESSION, SUBMIT_SESSION, UPDATE_SESSION, CREATE_EXECUTION],
} as const satisfies Record<TalentRoleKey, readonly TalentPermissionTuple[]>;
