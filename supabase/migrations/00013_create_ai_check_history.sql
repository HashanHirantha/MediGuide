-- Migration: 00013_create_ai_check_history
-- Stores AI symptom check results from the Gemini-based checker

CREATE TABLE IF NOT EXISTS public.ai_check_history (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- What the patient reported
  symptoms                TEXT[]        NOT NULL DEFAULT '{}',
  duration                TEXT          NOT NULL DEFAULT '',
  additional_notes        TEXT,

  -- Gemini AI output
  overall_risk            TEXT          NOT NULL DEFAULT 'LOW',
  conditions              JSONB         NOT NULL DEFAULT '[]',  -- [{name, possibility_percent, icon_name, risk_level}]
  recommendation          TEXT,
  recommended_specialist  TEXT,
  recommended_specialties TEXT[]        DEFAULT '{}',

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_check_history_user_id    ON public.ai_check_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_check_history_created_at ON public.ai_check_history(created_at);

-- Enable RLS
ALTER TABLE public.ai_check_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_check_history_select_own" ON public.ai_check_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_check_history_insert_own" ON public.ai_check_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_check_history_delete_own" ON public.ai_check_history
  FOR DELETE USING (auth.uid() = user_id);
