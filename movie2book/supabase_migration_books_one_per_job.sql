-- One book per job: remove duplicates, then enforce UNIQUE(job_id).
-- Run once in Supabase SQL Editor. Safe to re-run (drops constraint first).

-- 1. Delete duplicate book rows, keeping one per job_id (the one with earliest created_at)
DELETE FROM books a
USING books b
WHERE a.job_id = b.job_id
  AND a.created_at > b.created_at;

-- 2. Add unique constraint so one job = one book (upsert will update instead of insert)
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_job_id_unique;
ALTER TABLE books ADD CONSTRAINT books_job_id_unique UNIQUE (job_id);
