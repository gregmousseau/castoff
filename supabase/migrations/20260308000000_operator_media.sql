-- Add thumbnail_image to operators (separate from hero for OG/directory cards)
ALTER TABLE operators ADD COLUMN IF NOT EXISTS thumbnail_image TEXT;

-- Media library for operators
CREATE TABLE operator_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo', -- 'photo' | 'video'
  content_type TEXT,
  role TEXT NOT NULL DEFAULT 'gallery', -- 'hero' | 'thumbnail' | 'gallery'
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  file_size INT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operator_media_operator ON operator_media(operator_id);
CREATE INDEX idx_operator_media_role ON operator_media(operator_id, role);

-- RLS
ALTER TABLE operator_media ENABLE ROW LEVEL SECURITY;

-- Public can view media
CREATE POLICY "Public can view operator media"
  ON operator_media FOR SELECT
  USING (true);

-- Operators can manage own media
CREATE POLICY "Operators can manage own media"
  ON operator_media FOR ALL
  USING (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

-- Admin can manage all media (for admin@castoff.boats)
CREATE POLICY "Admin can manage all media"
  ON operator_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM operators WHERE user_id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM operators WHERE user_id = auth.uid() AND is_admin = true
    )
  );
