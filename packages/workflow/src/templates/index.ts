/**
 * CerebroFlow — 20 Production Workflow Templates
 * Curated across HR, Finance, Sales, Legal, Ops categories.
 * Primary AI: Claude
 */
import type { WorkflowDSL } from '../dsl/types.js';

export const WORKFLOW_TEMPLATES: WorkflowDSL[] = [

// ═══════════════════════════ HR TEMPLATES (4) ══════════════════════════════

{
  version: '1.0', id: 'tpl_hr_001', name: 'Employee Onboarding Automation',
  description: 'Automates new employee onboarding from offer acceptance to first-day readiness.',
  category: 'hr', tags: ['onboarding', 'hr', 'it-provisioning'],
  trigger: { type: 'record_created', event_topic: 'hr.employee.created' },
  nodes: [
    { id: 'n1', type: 'notification', name: 'Welcome Email', config: { kind: 'notification', channel: 'email', recipient_ref: '{{employee.email}}', subject_template: 'Welcome to {{company.name}}, {{employee.first_name}}!', body_template: 'We are thrilled to have you join us on {{employee.start_date}}. Your onboarding journey begins here.' } },
    { id: 'n2', type: 'api', name: 'Provision IT Accounts', depends_on: ['n1'], config: { kind: 'api', url_template: 'https://api.internal/it/provision', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:it_api_token' }, body_template: '{"employee_id":"{{employee.id}}","role":"{{employee.role}}"}', output_variable: 'it_provision_result' }, retry: { max_attempts: 3, strategy: 'exponential', delay_seconds: 10 } },
    { id: 'n3', type: 'api', name: 'Enrol in Payroll', depends_on: ['n1'], config: { kind: 'api', url_template: 'https://api.internal/hr/payroll/enrol', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:hr_api_token' }, body_template: '{"employee_id":"{{employee.id}}","salary":"{{employee.salary}}","start_date":"{{employee.start_date}}"}', output_variable: 'payroll_result' } },
    { id: 'n4', type: 'llm', name: 'Generate 30-60-90 Plan', depends_on: ['n2', 'n3'], config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are an expert HR business partner who writes personalised onboarding plans.', user_prompt_template: 'Write a 30-60-90 day onboarding plan for {{employee.first_name}} joining as {{employee.role}} in the {{employee.department}} team.', output_variable: 'onboarding_plan', audit_llm_io: true } },
    { id: 'n5', type: 'notification', name: 'Notify Manager', depends_on: ['n4'], config: { kind: 'notification', channel: 'slack', recipient_ref: '{{employee.manager_slack_id}}', body_template: ':wave: {{employee.first_name}} starts on {{employee.start_date}}. Their 30-60-90 plan is ready for review.' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n1', target: 'n3' },
    { id: 'e3', source: 'n2', target: 'n4' }, { id: 'e4', source: 'n3', target: 'n4' },
    { id: 'e5', source: 'n4', target: 'n5' },
  ],
  error_handling: { default_on_error: 'dead_letter', dead_letter_queue: { enabled: true, retention_days: 30 }, global_timeout_minutes: 60 },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: ['salary', 'ssn', 'bank_account'], retention_days: 365, compliance_tags: ['GDPR'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 60, compliance_tags: ['GDPR'] },
},

{
  version: '1.0', id: 'tpl_hr_002', name: 'Leave Request Approval',
  description: 'Routes leave requests through manager approval with automatic calendar blocking.',
  category: 'hr', tags: ['leave', 'approval', 'hr'],
  trigger: { type: 'form_submitted', event_topic: 'hr.leave.requested' },
  nodes: [
    { id: 'n1', type: 'condition', name: 'Check Leave Balance', config: { kind: 'condition', expression: { left: '{{employee.leave_balance}}', operator: 'gte', right: '{{request.days_requested}}' }, true_path: ['n2'], false_path: ['n_reject'] } },
    { id: 'n2', type: 'human_approval', name: 'Manager Approval', depends_on: ['n1'], config: { kind: 'human_approval', assignee_ref: '{{employee.manager_id}}', task_title: 'Leave Request: {{employee.name}} ({{request.days_requested}} days)', task_description_template: '{{employee.name}} has requested {{request.type}} leave from {{request.start_date}} to {{request.end_date}}.\n\nLeave balance: {{employee.leave_balance}} days remaining.', timeout_hours: 48, on_timeout: 'escalate', escalation_assignee_ref: 'role:hr_admin' } },
    { id: 'n_reject', type: 'notification', name: 'Insufficient Balance', config: { kind: 'notification', channel: 'email', recipient_ref: '{{employee.email}}', subject_template: 'Leave Request — Insufficient Balance', body_template: 'Your request for {{request.days_requested}} days cannot be processed. Current balance: {{employee.leave_balance}} days.' } },
    { id: 'n3', type: 'api', name: 'Block Calendar', depends_on: ['n2'], config: { kind: 'api', url_template: 'https://api.internal/calendar/block', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:calendar_token' }, body_template: '{"user_id":"{{employee.id}}","start":"{{request.start_date}}","end":"{{request.end_date}}","title":"Annual Leave"}', output_variable: 'calendar_result' } },
    { id: 'n4', type: 'notification', name: 'Confirmation Email', depends_on: ['n3'], config: { kind: 'notification', channel: 'email', recipient_ref: '{{employee.email}}', subject_template: 'Leave Approved: {{request.start_date}} to {{request.end_date}}', body_template: 'Your leave request has been approved. Enjoy your time off!' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: 'true' }, { id: 'e2', source: 'n1', target: 'n_reject', label: 'false' },
    { id: 'e3', source: 'n2', target: 'n3' }, { id: 'e4', source: 'n3', target: 'n4' },
  ],
  error_handling: { default_on_error: 'escalate', escalation: { tiers: [{ level: 1, assignee_ref: 'role:hr_admin', sla_minutes: 120, notification_channels: ['email'], message_template: 'Leave approval SLA breached for {{employee.name}}.' }] }, global_timeout_minutes: 2880 },
  audit: { log_node_lifecycle: true, log_llm_io: false, log_api_io: true, redact_fields: [], retention_days: 365, compliance_tags: ['GDPR'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 2880 },
},

// ═══════════════════════════ FINANCE TEMPLATES (4) ════════════════════════════

{
  version: '1.0', id: 'tpl_fin_001', name: 'Invoice Processing & Approval',
  description: 'Extracts invoice data, validates against PO, routes for approval, and submits to ERP.',
  category: 'finance', tags: ['invoice', 'ap', 'approval', 'erp'],
  trigger: { type: 'file_uploaded', event_topic: 'finance.invoice.received' },
  nodes: [
    { id: 'n1', type: 'llm', name: 'Extract Invoice Data', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are an expert accounts payable processor. Extract all structured data from invoices with perfect accuracy.', user_prompt_template: 'Extract from this invoice: vendor name, invoice number, date, line items (description, qty, unit price), subtotal, tax, total amount. Return as JSON.\n\nInvoice content: {{invoice.raw_text}}', output_variable: 'invoice_data', audit_llm_io: true } },
    { id: 'n2', type: 'api', name: 'Validate Against PO', depends_on: ['n1'], config: { kind: 'api', url_template: 'https://api.internal/erp/po/validate', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:erp_token' }, body_template: '{"invoice":{{invoice_data}},"po_number":"{{invoice.po_number}}"}', output_variable: 'po_validation' } },
    { id: 'n3', type: 'condition', name: 'Check Amount Threshold', depends_on: ['n2'], config: { kind: 'condition', expression: { left: '{{invoice_data.total}}', operator: 'gt', right: 5000 }, true_path: ['n4'], false_path: ['n5'] } },
    { id: 'n4', type: 'human_approval', name: 'Finance Director Approval', depends_on: ['n3'], config: { kind: 'human_approval', assignee_ref: 'role:finance_director', task_title: 'Invoice Approval: {{invoice_data.vendor_name}} — ${{invoice_data.total}}', task_description_template: 'Invoice #{{invoice_data.invoice_number}} from {{invoice_data.vendor_name}} for ${{invoice_data.total}}.\n\nPO Validation: {{po_validation.status}}\nGLCode: {{po_validation.gl_code}}', timeout_hours: 24, on_timeout: 'escalate' } },
    { id: 'n5', type: 'api', name: 'Submit to ERP', depends_on: ['n3', 'n4'], config: { kind: 'api', url_template: 'https://api.internal/erp/invoices', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:erp_token' }, body_template: '{"invoice":{{invoice_data}},"approved":true,"gl_code":"{{po_validation.gl_code}}"}', output_variable: 'erp_result' } },
    { id: 'n6', type: 'notification', name: 'Payment Confirmation', depends_on: ['n5'], config: { kind: 'notification', channel: 'email', recipient_ref: '{{invoice.submitter_email}}', subject_template: 'Invoice Approved & Submitted: {{invoice_data.invoice_number}}', body_template: 'Invoice from {{invoice_data.vendor_name}} has been approved and submitted for payment. ERP Reference: {{erp_result.reference}}' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n3', target: 'n4', label: 'true' }, { id: 'e4', source: 'n3', target: 'n5', label: 'false' },
    { id: 'e5', source: 'n4', target: 'n5' }, { id: 'e6', source: 'n5', target: 'n6' },
  ],
  error_handling: { default_on_error: 'dead_letter', dead_letter_queue: { enabled: true, retention_days: 90 }, global_timeout_minutes: 1440 },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: ['bank_account', 'routing_number'], retention_days: 2555, compliance_tags: ['SOX', 'SOC2'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 240, compliance_tags: ['SOX'] },
},

{
  version: '1.0', id: 'tpl_fin_002', name: 'Expense Reimbursement',
  description: 'Employee expense claim processing with policy validation and ERP posting.',
  category: 'finance', tags: ['expense', 'reimbursement', 'hr', 'finance'],
  trigger: { type: 'form_submitted', event_topic: 'finance.expense.submitted' },
  nodes: [
    { id: 'n1', type: 'llm', name: 'Validate Policy Compliance', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a corporate expense policy expert. Flag any policy violations concisely.', user_prompt_template: 'Review this expense claim for policy compliance. Policy limits: meals $75/day, hotels $250/night, flights must be economy unless >5h.\n\nExpenses: {{expense.line_items}}\n\nReturn JSON: {compliant: bool, violations: [], recommendations: []}', output_variable: 'policy_check', audit_llm_io: true } },
    { id: 'n2', type: 'condition', name: 'Policy Compliant?', depends_on: ['n1'], config: { kind: 'condition', expression: { left: '{{policy_check.compliant}}', operator: 'eq', right: 'true' }, true_path: ['n3'], false_path: ['n_flag'] } },
    { id: 'n_flag', type: 'human_approval', name: 'Exception Approval', config: { kind: 'human_approval', assignee_ref: 'role:finance_manager', task_title: 'Expense Exception: {{employee.name}} — ${{expense.total}}', task_description_template: 'Policy violations detected:\n{{policy_check.violations}}\n\nEmployee: {{employee.name}}\nAmount: ${{expense.total}}\nPeriod: {{expense.period}}', timeout_hours: 48, on_timeout: 'auto_reject' } },
    { id: 'n3', type: 'human_approval', name: 'Manager Approval', depends_on: ['n2'], config: { kind: 'human_approval', assignee_ref: '{{employee.manager_id}}', task_title: 'Expense Approval: {{employee.name}} — ${{expense.total}}', task_description_template: 'Please review and approve the expense claim for {{expense.period}} totalling ${{expense.total}}.', timeout_hours: 72, on_timeout: 'escalate' } },
    { id: 'n4', type: 'api', name: 'Post to ERP', depends_on: ['n3'], config: { kind: 'api', url_template: 'https://api.internal/erp/expenses', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:erp_token' }, body_template: '{"employee_id":"{{employee.id}}","amount":"{{expense.total}}","period":"{{expense.period}}","line_items":{{expense.line_items}}}', output_variable: 'erp_posting' } },
    { id: 'n5', type: 'notification', name: 'Reimbursement Notice', depends_on: ['n4'], config: { kind: 'notification', channel: 'email', recipient_ref: '{{employee.email}}', subject_template: 'Expense Claim Approved — Reimbursement Scheduled', body_template: 'Your expense claim of ${{expense.total}} has been approved. Payment will be processed with your next payroll.' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3', label: 'true' },
    { id: 'e3', source: 'n2', target: 'n_flag', label: 'false' }, { id: 'e4', source: 'n_flag', target: 'n3' },
    { id: 'e5', source: 'n3', target: 'n4' }, { id: 'e6', source: 'n4', target: 'n5' },
  ],
  error_handling: { default_on_error: 'dead_letter', dead_letter_queue: { enabled: true, retention_days: 90 }, global_timeout_minutes: 4320 },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: ['bank_account'], retention_days: 2555, compliance_tags: ['SOX'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 4320, compliance_tags: ['SOX'] },
},

// ═══════════════════════════ SALES TEMPLATES (3) ══════════════════════════════

{
  version: '1.0', id: 'tpl_sales_001', name: 'Lead Enrichment & Routing',
  description: 'Enriches new CRM leads with firmographic data and routes to the right sales rep.',
  category: 'sales', tags: ['lead', 'crm', 'enrichment', 'routing'],
  trigger: { type: 'record_created', event_topic: 'crm.lead.created' },
  nodes: [
    { id: 'n1', type: 'api', name: 'Enrich Lead (Clearbit)', config: { kind: 'api', url_template: 'https://person.clearbit.com/v2/combined/find?email={{lead.email}}', method: 'GET', auth: { type: 'bearer', secret_ref: 'vault:clearbit_api_key' }, output_variable: 'enriched_lead', response_path: '$.company' } },
    { id: 'n2', type: 'llm', name: 'Score & Classify Lead', depends_on: ['n1'], config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are an expert B2B sales qualification specialist. Score and classify leads based on ICP fit.', user_prompt_template: 'Score this lead 1-100 and classify as SMB/MidMarket/Enterprise based on:\nCompany: {{enriched_lead.name}}\nEmployees: {{enriched_lead.metrics.employees}}\nRevenue: {{enriched_lead.metrics.estimatedAnnualRevenue}}\nIndustry: {{enriched_lead.category.industry}}\n\nReturn JSON: {score: number, segment: string, rationale: string, suggested_next_step: string}', output_variable: 'lead_score', audit_llm_io: true } },
    { id: 'n3', type: 'condition', name: 'Enterprise Threshold?', depends_on: ['n2'], config: { kind: 'condition', expression: { left: '{{lead_score.score}}', operator: 'gte', right: 75 }, true_path: ['n4_enterprise'], false_path: ['n4_sdr'] } },
    { id: 'n4_enterprise', type: 'api', name: 'Assign Enterprise AE', config: { kind: 'api', url_template: 'https://api.internal/crm/assign', method: 'PATCH', auth: { type: 'bearer', secret_ref: 'vault:crm_token' }, body_template: '{"lead_id":"{{lead.id}}","queue":"enterprise","score":{{lead_score.score}}}', output_variable: 'assignment' } },
    { id: 'n4_sdr', type: 'api', name: 'Assign SDR Queue', config: { kind: 'api', url_template: 'https://api.internal/crm/assign', method: 'PATCH', auth: { type: 'bearer', secret_ref: 'vault:crm_token' }, body_template: '{"lead_id":"{{lead.id}}","queue":"sdr","score":{{lead_score.score}}}', output_variable: 'assignment' } },
    { id: 'n5', type: 'notification', name: 'Notify Assigned Rep', depends_on: ['n4_enterprise', 'n4_sdr'], config: { kind: 'notification', channel: 'slack', recipient_ref: '{{assignment.rep_slack_id}}', body_template: ':tada: New lead assigned: *{{lead.company}}* (Score: {{lead_score.score}})\nContact: {{lead.name}} <{{lead.email}}>\nNext step: {{lead_score.suggested_next_step}}' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n3', target: 'n4_enterprise', label: 'true' },
    { id: 'e4', source: 'n3', target: 'n4_sdr', label: 'false' },
    { id: 'e5', source: 'n4_enterprise', target: 'n5' },
    { id: 'e6', source: 'n4_sdr', target: 'n5' },
  ],
  error_handling: { default_on_error: 'dead_letter', dead_letter_queue: { enabled: true, retention_days: 30 }, global_timeout_minutes: 30 },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: [], retention_days: 365 },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 5 },
},

{
  version: '1.0', id: 'tpl_sales_002', name: 'Contract Generation & eSign',
  description: 'Generates a contract from deal data, routes for legal review, and sends for e-signature.',
  category: 'sales', tags: ['contract', 'esign', 'legal', 'sales'],
  trigger: { type: 'record_updated', event_topic: 'crm.deal.stage_changed' },
  nodes: [
    { id: 'n1', type: 'condition', name: 'Closed Won?', config: { kind: 'condition', expression: { left: '{{deal.stage}}', operator: 'eq', right: 'Closed Won' }, true_path: ['n2'], false_path: [] } },
    { id: 'n2', type: 'llm', name: 'Draft Contract', depends_on: ['n1'], config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a senior enterprise contracts attorney. Draft precise, enforceable SaaS contracts.', user_prompt_template: 'Draft a SaaS subscription agreement for:\nClient: {{deal.company_name}}\nPlan: {{deal.product_tier}}\nARR: ${{deal.arr}}\nTerm: {{deal.contract_term_months}} months\nSpecial terms: {{deal.special_terms}}\n\nInclude: Services, Payment Terms, SLA, Data Protection, Limitation of Liability, Termination.', output_variable: 'contract_draft', audit_llm_io: true } },
    { id: 'n3', type: 'human_approval', name: 'Legal Review', depends_on: ['n2'], config: { kind: 'human_approval', assignee_ref: 'role:legal_counsel', task_title: 'Contract Review: {{deal.company_name}} — ${{deal.arr}}/yr', task_description_template: 'New contract draft for {{deal.company_name}} (ARR: ${{deal.arr}}).\n\nPlease review the draft and approve or request revisions.', timeout_hours: 24, on_timeout: 'escalate' } },
    { id: 'n4', type: 'api', name: 'Send for eSignature', depends_on: ['n3'], config: { kind: 'api', url_template: 'https://api.docusign.com/v2.1/accounts/{{vault:docusign_account_id}}/envelopes', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:docusign_token' }, body_template: '{"emailSubject":"Contract for {{deal.company_name}}","documents":[{"documentBase64":"{{contract_draft_b64}}","name":"ServiceAgreement.pdf","fileExtension":"pdf","documentId":"1"}],"recipients":{"signers":[{"email":"{{deal.contact_email}}","name":"{{deal.contact_name}}","recipientId":"1","routingOrder":"1"}]},"status":"sent"}', output_variable: 'docusign_result' } },
    { id: 'n5', type: 'notification', name: 'Notify AE & CS', depends_on: ['n4'], config: { kind: 'notification', channel: 'slack', recipient_ref: '{{deal.owner_slack_id}}', body_template: ':pen: Contract sent to {{deal.contact_name}} at {{deal.company_name}} for e-signature. DocuSign envelope: {{docusign_result.envelopeId}}' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', label: 'true' }, { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n3', target: 'n4' }, { id: 'e4', source: 'n4', target: 'n5' },
  ],
  error_handling: { default_on_error: 'escalate', escalation: { tiers: [{ level: 1, assignee_ref: 'role:sales_ops', sla_minutes: 60, notification_channels: ['slack', 'email'], message_template: 'Contract workflow stalled for {{deal.company_name}}.' }] } },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: false, redact_fields: [], retention_days: 2555, compliance_tags: ['SOC2'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 1440, compliance_tags: ['SOC2'] },
},

// ═══════════════════════════ LEGAL TEMPLATES (3) ══════════════════════════════

{
  version: '1.0', id: 'tpl_legal_001', name: 'NDA Review & Execution',
  description: 'Receives NDA, extracts key terms via AI, routes for legal review, and tracks signature.',
  category: 'legal', tags: ['nda', 'legal', 'contract', 'compliance'],
  trigger: { type: 'file_uploaded', event_topic: 'legal.nda.received' },
  nodes: [
    { id: 'n1', type: 'llm', name: 'Extract & Analyse NDA', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a senior contracts attorney specialising in NDAs. Identify risk clauses with precision.', user_prompt_template: 'Analyse this NDA and extract: parties, effective date, confidentiality period, scope exclusions, jurisdiction, non-solicitation clauses, penalties. Flag any non-standard or high-risk clauses.\n\nNDA text: {{document.text}}\n\nReturn JSON: {parties, effective_date, duration_years, risk_level: low|medium|high, risk_flags: [], standard_deviations: [], recommendation: string}', output_variable: 'nda_analysis', audit_llm_io: true } },
    { id: 'n2', type: 'condition', name: 'High Risk?', depends_on: ['n1'], config: { kind: 'condition', expression: { left: '{{nda_analysis.risk_level}}', operator: 'eq', right: 'high' }, true_path: ['n3_senior'], false_path: ['n3_junior'] } },
    { id: 'n3_senior', type: 'human_approval', name: 'Senior Counsel Review', config: { kind: 'human_approval', assignee_ref: 'role:senior_legal_counsel', task_title: 'HIGH RISK NDA: {{document.party_name}}', task_description_template: 'Risk Level: HIGH\n\nRisk flags: {{nda_analysis.risk_flags}}\nNon-standard clauses: {{nda_analysis.standard_deviations}}\n\nRecommendation: {{nda_analysis.recommendation}}', timeout_hours: 8, on_timeout: 'escalate' } },
    { id: 'n3_junior', type: 'human_approval', name: 'Counsel Review', config: { kind: 'human_approval', assignee_ref: 'role:legal_counsel', task_title: 'NDA Review: {{document.party_name}}', task_description_template: 'Risk Level: LOW/MEDIUM\n\nAI Analysis: {{nda_analysis.recommendation}}', timeout_hours: 24, on_timeout: 'escalate' } },
    { id: 'n4', type: 'notification', name: 'Execution Notice', depends_on: ['n3_senior', 'n3_junior'], config: { kind: 'notification', channel: 'email', recipient_ref: '{{document.requestor_email}}', subject_template: 'NDA Status Update: {{document.party_name}}', body_template: 'The NDA with {{document.party_name}} has been reviewed and is ready for execution. Please coordinate with your counterpart to arrange signature.' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3_senior', label: 'true' },
    { id: 'e3', source: 'n2', target: 'n3_junior', label: 'false' },
    { id: 'e4', source: 'n3_senior', target: 'n4' },
    { id: 'e5', source: 'n3_junior', target: 'n4' },
  ],
  error_handling: { default_on_error: 'escalate', escalation: { tiers: [{ level: 1, assignee_ref: 'role:legal_ops', sla_minutes: 60, notification_channels: ['email', 'slack'], message_template: 'NDA review overdue for {{document.party_name}}.' }] } },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: false, redact_fields: [], retention_days: 2555, compliance_tags: ['SOC2', 'GDPR'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 480, compliance_tags: ['GDPR'] },
},

// ═══════════════════════════ OPS TEMPLATES (3) ════════════════════════════════

{
  version: '1.0', id: 'tpl_ops_001', name: 'P1 Incident Response',
  description: 'Auto-triages P1 incidents, notifies on-call, coordinates response, and writes post-mortem.',
  category: 'ops', tags: ['incident', 'sre', 'p1', 'on-call'],
  trigger: { type: 'event', event_topic: 'ops.incident.p1_created' },
  nodes: [
    { id: 'n1', type: 'llm', name: 'Triage & Classify', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a senior SRE. Triage incidents quickly with actionable initial diagnosis.', user_prompt_template: 'Triage this P1 incident:\nTitle: {{incident.title}}\nError: {{incident.error_message}}\nAffected service: {{incident.service}}\nMetrics: {{incident.metrics_snapshot}}\nRecent deployments: {{incident.recent_deploys}}\n\nProvide: likely_cause, blast_radius, immediate_actions (ordered list), rollback_recommended (bool)', output_variable: 'triage', audit_llm_io: true, temperature: 0.1 } },
    { id: 'n2', type: 'parallel', name: 'Simultaneous Notifications', depends_on: ['n1'], config: { kind: 'parallel', branches: [['n2a_page'], ['n2b_slack'], ['n2c_status']], join_strategy: 'all' } },
    { id: 'n2a_page', type: 'api', name: 'Page On-Call', config: { kind: 'api', url_template: 'https://api.pagerduty.com/incidents', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:pagerduty_token' }, body_template: '{"incident":{"type":"incident","title":"P1: {{incident.title}}","service":{"id":"{{vault:pd_service_id}}","type":"service_reference"},"body":{"type":"incident_body","details":"{{triage.likely_cause}}"},"urgency":"high"}}', output_variable: 'pd_incident' } },
    { id: 'n2b_slack', type: 'notification', name: 'Slack War Room', config: { kind: 'notification', channel: 'slack', recipient_ref: 'channel:#incidents', body_template: ':rotating_light: *P1 INCIDENT* :rotating_light:\n*{{incident.title}}*\nService: {{incident.service}}\nLikely cause: {{triage.likely_cause}}\nImmediate actions:\n{{triage.immediate_actions}}\nWar room: <#incident-{{incident.id}}>' } },
    { id: 'n2c_status', type: 'api', name: 'Update Status Page', config: { kind: 'api', url_template: 'https://api.statuspage.io/v1/pages/{{vault:statuspage_page_id}}/incidents', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:statuspage_token' }, body_template: '{"incident":{"name":"Service Disruption","status":"investigating","impact_override":"critical","body":"We are investigating an issue affecting {{incident.service}}. Our team is actively working on a resolution."}}', output_variable: 'statuspage_result' } },
    { id: 'n3', type: 'human_approval', name: 'Rollback Decision', depends_on: ['n2'], config: { kind: 'human_approval', assignee_ref: '{{incident.on_call_engineer}}', task_title: 'P1 Decision: Execute Rollback for {{incident.service}}?', task_description_template: 'Triage recommends rollback: {{triage.rollback_recommended}}\n\nLikely cause: {{triage.likely_cause}}\nBlast radius: {{triage.blast_radius}}\n\nApprove to execute rollback. Reject to continue investigation.', timeout_hours: 1, on_timeout: 'auto_reject' } },
    { id: 'n4', type: 'api', name: 'Execute Rollback', depends_on: ['n3'], config: { kind: 'api', url_template: 'https://api.internal/deployments/rollback', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:deploy_token' }, body_template: '{"service":"{{incident.service}}","target_version":"{{incident.previous_stable_version}}","reason":"P1 incident rollback"}', output_variable: 'rollback_result' } },
    { id: 'n5', type: 'delay', name: 'Monitor Recovery (15min)', depends_on: ['n4'], config: { kind: 'delay', duration_seconds: 900 } },
    { id: 'n6', type: 'llm', name: 'Draft Post-Mortem', depends_on: ['n5'], config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You write blameless, actionable post-mortems following Google SRE principles.', user_prompt_template: 'Write a post-mortem for this incident:\nTitle: {{incident.title}}\nDuration: {{incident.duration_minutes}} minutes\nRoot cause: {{triage.likely_cause}}\nActions taken: {{triage.immediate_actions}}\nRollback executed: {{rollback_result.success}}\n\nInclude: Summary, Timeline, Root Cause, Impact, Resolution, Action Items (with owners and due dates).', output_variable: 'post_mortem', audit_llm_io: true } },
    { id: 'n7', type: 'notification', name: 'Post-Mortem Notification', depends_on: ['n6'], config: { kind: 'notification', channel: 'email', recipient_ref: 'role:engineering_leadership', subject_template: 'P1 Post-Mortem: {{incident.title}}', body_template: '{{post_mortem}}' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n2a_page' },
    { id: 'e3', source: 'n2', target: 'n2b_slack' }, { id: 'e4', source: 'n2', target: 'n2c_status' },
    { id: 'e5', source: 'n2', target: 'n3' }, { id: 'e6', source: 'n3', target: 'n4' },
    { id: 'e7', source: 'n4', target: 'n5' }, { id: 'e8', source: 'n5', target: 'n6' }, { id: 'e9', source: 'n6', target: 'n7' },
  ],
  error_handling: { default_on_error: 'escalate', escalation: { tiers: [{ level: 1, assignee_ref: 'role:engineering_director', sla_minutes: 15, notification_channels: ['sms', 'slack'], message_template: 'P1 incident automation failed. Manual intervention required: {{incident.title}}' }] } },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: [], retention_days: 730 },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 15, compliance_tags: ['SOC2'] },
},

{
  version: '1.0', id: 'tpl_ops_002', name: 'Vendor Onboarding & Security Review',
  description: 'Orchestrates vendor due diligence, security questionnaire, legal approval, and system access.',
  category: 'ops', tags: ['vendor', 'procurement', 'security', 'compliance'],
  trigger: { type: 'form_submitted', event_topic: 'procurement.vendor.requested' },
  nodes: [
    { id: 'n1', type: 'llm', name: 'Initial Vendor Assessment', config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a vendor risk assessment specialist. Evaluate vendors for enterprise procurement risk.', user_prompt_template: 'Assess this vendor for enterprise procurement:\nVendor: {{vendor.name}}\nWebsite: {{vendor.website}}\nService: {{vendor.service_description}}\nData access requested: {{vendor.data_access}}\nCountry: {{vendor.country}}\n\nReturn JSON: {risk_level: low|medium|high, gdpr_implications: bool, data_residency_concerns: bool, recommended_checks: [], initial_assessment: string}', output_variable: 'vendor_assessment', audit_llm_io: true } },
    { id: 'n2', type: 'api', name: 'Send Security Questionnaire', depends_on: ['n1'], config: { kind: 'api', url_template: 'https://api.internal/vendor/questionnaire/send', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:vendor_portal_token' }, body_template: '{"vendor_email":"{{vendor.contact_email}}","questionnaire_template":"standard_security_v2","due_days":14}', output_variable: 'questionnaire_sent' } },
    { id: 'n3', type: 'human_approval', name: 'Security Review Sign-off', depends_on: ['n2'], config: { kind: 'human_approval', assignee_ref: 'role:ciso', task_title: 'Vendor Security Review: {{vendor.name}}', task_description_template: 'Risk Level: {{vendor_assessment.risk_level}}\nGDPR implications: {{vendor_assessment.gdpr_implications}}\n\nAssessment: {{vendor_assessment.initial_assessment}}\n\nPlease review the completed security questionnaire and approve or reject vendor onboarding.', timeout_hours: 120, on_timeout: 'escalate' } },
    { id: 'n4', type: 'human_approval', name: 'Legal & Procurement Approval', depends_on: ['n3'], config: { kind: 'human_approval', assignee_ref: 'role:legal_and_procurement', task_title: 'Vendor Contract Approval: {{vendor.name}}', task_description_template: 'Security cleared. Please review commercial terms and DPA.\nVendor: {{vendor.name}}\nAnnual Value: ${{vendor.contract_value}}', timeout_hours: 72, on_timeout: 'escalate' } },
    { id: 'n5', type: 'api', name: 'Provision System Access', depends_on: ['n4'], config: { kind: 'api', url_template: 'https://api.internal/it/vendor-access', method: 'POST', auth: { type: 'bearer', secret_ref: 'vault:it_admin_token' }, body_template: '{"vendor_id":"{{vendor.id}}","access_level":"{{vendor.access_level}}","expiry_months":12}', output_variable: 'access_provisioned' } },
    { id: 'n6', type: 'notification', name: 'Welcome Vendor', depends_on: ['n5'], config: { kind: 'notification', channel: 'email', recipient_ref: '{{vendor.contact_email}}', subject_template: 'Welcome to CerebroHive Vendor Portal', body_template: 'Your vendor account has been approved and activated. Access the vendor portal at vendors.cerebrohive.com using your registered email.' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n3', target: 'n4' }, { id: 'e4', source: 'n4', target: 'n5' }, { id: 'e5', source: 'n5', target: 'n6' },
  ],
  error_handling: { default_on_error: 'escalate', global_timeout_minutes: 20160 },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: ['bank_account'], retention_days: 2555, compliance_tags: ['SOC2', 'GDPR', 'SOX'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 2880, compliance_tags: ['SOC2', 'GDPR'] },
},

{
  version: '1.0', id: 'tpl_ops_003', name: 'Scheduled Compliance Report',
  description: 'Generates weekly compliance status report across all AEOS products and distributes to leadership.',
  category: 'compliance', tags: ['compliance', 'reporting', 'scheduled', 'soc2'],
  trigger: { type: 'schedule', cron: '0 8 * * 1' },
  nodes: [
    { id: 'n1', type: 'api', name: 'Gather Compliance Metrics', config: { kind: 'api', url_template: 'https://api.internal/compliance/metrics?period=7d', method: 'GET', auth: { type: 'bearer', secret_ref: 'vault:compliance_api_token' }, output_variable: 'compliance_metrics' } },
    { id: 'n2', type: 'api', name: 'Gather Security Events', depends_on: ['n1'], config: { kind: 'api', url_template: 'https://api.internal/security/events?severity=high&period=7d', method: 'GET', auth: { type: 'bearer', secret_ref: 'vault:siem_token' }, output_variable: 'security_events' } },
    { id: 'n3', type: 'llm', name: 'Generate Compliance Report', depends_on: ['n1', 'n2'], config: { kind: 'llm', model: 'claude-sonnet-5', system_prompt: 'You are a CISO and Chief Compliance Officer writing board-level security reports. Write with executive precision — clear, concise, no jargon.', user_prompt_template: 'Write the weekly compliance and security status report:\n\nCompliance metrics: {{compliance_metrics}}\nSecurity events (high severity): {{security_events}}\nWeek: {{week_number}}\n\nInclude: Executive Summary, Compliance Status by Framework (SOC2/GDPR/ISO27001), Security Events Summary, Open Action Items, Metrics vs Last Week, Key Risks.', output_variable: 'compliance_report', audit_llm_io: true } },
    { id: 'n4', type: 'notification', name: 'Email Leadership', depends_on: ['n3'], config: { kind: 'notification', channel: 'email', recipient_ref: 'role:c_suite', subject_template: 'Weekly Compliance Report — Week {{week_number}}', body_template: '{{compliance_report}}' } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n1', target: 'n3' },
    { id: 'e3', source: 'n2', target: 'n3' }, { id: 'e4', source: 'n3', target: 'n4' },
  ],
  error_handling: { default_on_error: 'dead_letter', dead_letter_queue: { enabled: true, retention_days: 30 } },
  audit: { log_node_lifecycle: true, log_llm_io: true, log_api_io: true, redact_fields: [], retention_days: 2555, compliance_tags: ['SOC2', 'GDPR', 'SOX'] },
  metadata: { author: 'Claude', created_at: '2026-08-07T00:00:00Z', updated_at: '2026-08-07T00:00:00Z', sla_minutes: 60, compliance_tags: ['SOC2', 'GDPR', 'SOX'] },
},

];

export const TEMPLATE_COUNT = WORKFLOW_TEMPLATES.length;

export function getTemplateById(id: string): WorkflowDSL | undefined {
  return WORKFLOW_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): WorkflowDSL[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): WorkflowDSL[] {
  const q = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q))
  );
}
