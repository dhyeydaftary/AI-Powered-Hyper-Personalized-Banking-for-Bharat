-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('SALARY', 'EMI', 'GROCERIES', 'RENT', 'UTILITIES', 'SHOPPING', 'TRAVEL', 'HEALTH', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('RECOMMEND', 'INTERVENE', 'VERIFY', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "FeedbackEventType" AS ENUM ('ENGAGED', 'IGNORED', 'FOLLOW_UP', 'DISMISSED');

-- CreateTable
CREATE TABLE "Customer" (
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "monthly_income" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "loan_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "principal" DECIMAL(12,2) NOT NULL,
    "outstanding" DECIMAL(12,2) NOT NULL,
    "monthly_emi" DECIMAL(12,2) NOT NULL,
    "annual_interest_rate" DECIMAL(5,2) NOT NULL,
    "remaining_months" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("loan_id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "behavioral_trend_analysis" BOOLEAN NOT NULL DEFAULT true,
    "anomaly_analysis" BOOLEAN NOT NULL DEFAULT true,
    "vernacular_assistance" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "decision_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reason_codes" JSONB NOT NULL,
    "signals" JSONB,
    "action" JSONB,
    "policy_version" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("decision_id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "reason_codes" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "signals" JSONB,
    "action" JSONB,
    "policy_version" TEXT NOT NULL,
    "audit_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "decision_id" TEXT,
    "event_type" "FeedbackEventType" NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_customer_id_idx" ON "Customer"("customer_id");

-- CreateIndex
CREATE INDEX "Transaction_customer_id_idx" ON "Transaction"("customer_id");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Loan_customer_id_idx" ON "Loan"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Consent_customer_id_key" ON "Consent"("customer_id");

-- CreateIndex
CREATE INDEX "Decision_customer_id_idx" ON "Decision"("customer_id");

-- CreateIndex
CREATE INDEX "Decision_timestamp_idx" ON "Decision"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_customer_id_idx" ON "AuditLog"("customer_id");

-- CreateIndex
CREATE INDEX "AuditLog_decision_id_idx" ON "AuditLog"("decision_id");

-- CreateIndex
CREATE INDEX "AuditLog_audit_timestamp_idx" ON "AuditLog"("audit_timestamp");

-- CreateIndex
CREATE INDEX "Feedback_customer_id_idx" ON "Feedback"("customer_id");

-- CreateIndex
CREATE INDEX "Feedback_decision_id_idx" ON "Feedback"("decision_id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "Decision"("decision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "Decision"("decision_id") ON DELETE SET NULL ON UPDATE CASCADE;
