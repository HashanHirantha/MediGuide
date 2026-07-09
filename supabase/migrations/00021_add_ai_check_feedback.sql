-- Migration: 00019_add_ai_check_feedback
-- Adds feedback columns to ai_check_history for model retraining loops

ALTER TABLE public.ai_check_history
ADD COLUMN IF NOT EXISTS is_accurate BOOLEAN,
ADD COLUMN IF NOT EXISTS user_feedback TEXT;
