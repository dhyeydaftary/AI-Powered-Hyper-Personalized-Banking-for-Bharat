import { z } from 'zod';

// ---------- Params ----------

export const customerIdParamSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
});

// ---------- Pagination ----------

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ---------- Consent ----------

export const consentUpdateSchema = z.object({
  behavioral_trend_analysis: z.boolean(),
  anomaly_analysis: z.boolean(),
  vernacular_assistance: z.boolean(),
});

// ---------- Feedback ----------

export const feedbackEventTypes = ['ENGAGED', 'IGNORED', 'FOLLOW_UP', 'DISMISSED'] as const;

export const feedbackCreateSchema = z.object({
  event_type: z.enum(feedbackEventTypes),
  decision_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});

// ---------- Analysis ----------

export const analysisRequestSchema = z.object({
  analysis_scope: z
    .object({
      financial_context: z.boolean().default(true),
      behavioral_trends: z.boolean().default(true),
      anomaly_analysis: z.boolean().default(true),
    })
    .optional()
    .default({
      financial_context: true,
      behavioral_trends: true,
      anomaly_analysis: true,
    }),
});

// ---------- Simulation ----------

export const simulationRequestSchema = z.object({
  loan: z.object({
    principal: z.number().positive('Principal must be positive'),
    annual_interest_rate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
    tenure_months: z.number().int().positive('Tenure must be a positive integer').max(360),
  }),
});

// ---------- Decision (from intelligence service) ----------

export const decisionTypeEnum = z.enum(['RECOMMEND', 'INTERVENE', 'VERIFY', 'NO_ACTION']);

export const intelligenceDecisionSchema = z.object({
  decision_id: z.string().min(1),
  customer_id: z.string().min(1),
  decision: decisionTypeEnum,
  confidence: z.number().min(0).max(1),
  reason_codes: z.array(z.string()),
  signals: z.record(z.unknown()).nullable().optional(),
  action: z.record(z.unknown()).nullable().optional(),
  policy_version: z.string().min(1),
  timestamp: z.string().min(1),
});

// ---------- Financial Health (from intelligence service) ----------

export const financialHealthSchema = z.object({
  customer_id: z.string(),
  emi_to_income_ratio: z.number().nullable(),
  savings_rate: z.number().nullable(),
  expense_to_income_ratio: z.number().nullable(),
  balance_trend: z.string().nullable().optional(),
  income_stability: z.number().nullable().optional(),
  history_months: z.number().int().min(0),
  confidence: z.number().min(0).max(1),
});
