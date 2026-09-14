import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

// Routes
import healthRoutes from './routes/health.routes';
import customerRoutes from './routes/customer.routes';
import transactionRoutes from './routes/transaction.routes';
import loanRoutes from './routes/loan.routes';
import consentRoutes from './routes/consent.routes';
import analysisRoutes from './routes/analysis.routes';
import decisionRoutes from './routes/decision.routes';
import auditRoutes from './routes/audit.routes';
import feedbackRoutes from './routes/feedback.routes';
import simulationRoutes from './routes/simulation.routes';

const app = express();

// ─── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.BANK_DASHBOARD_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Auth Boundary ────────────────────────────────────────
app.use(authMiddleware);

// ─── API Routes ───────────────────────────────────────────
const BASE = '/api/v1';

app.use(`${BASE}/health`, healthRoutes);
app.use(`${BASE}/customers`, customerRoutes);
app.use(`${BASE}/customers`, transactionRoutes);
app.use(`${BASE}/customers`, loanRoutes);
app.use(`${BASE}/customers`, consentRoutes);
app.use(`${BASE}/customers`, analysisRoutes);
app.use(`${BASE}/customers`, decisionRoutes);
app.use(`${BASE}/customers`, auditRoutes);
app.use(`${BASE}/customers`, feedbackRoutes);
app.use(`${BASE}/customers`, simulationRoutes);

// ─── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
