-- Создание таблицы consultants для хранения ИИ-консультантов
CREATE TABLE IF NOT EXISTS consultants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Мой ИИ-консультант',
  prompt TEXT NOT NULL DEFAULT 'Ты помощный ИИ-консультант. Отвечай вежливо и профессионально.',
  avatar_url TEXT DEFAULT '',
  theme_color TEXT DEFAULT '#3B82F6',
  target_url TEXT DEFAULT '',
  model TEXT DEFAULT 'deepseek-chat',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ограничение: один консультант на пользователя
  CONSTRAINT unique_user_consultant UNIQUE(user_id)
);

-- Включаем Row Level Security
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только своих консультантов
CREATE POLICY "Users can view own consultants" ON consultants
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать своих консультантов
CREATE POLICY "Users can create own consultants" ON consultants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять своих консультантов
CREATE POLICY "Users can update own consultants" ON consultants
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика: пользователи могут удалять своих консультантов
CREATE POLICY "Users can delete own consultants" ON consultants
  FOR DELETE USING (auth.uid() = user_id);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS consultants_user_id_idx ON consultants(user_id);
CREATE INDEX IF NOT EXISTS consultants_created_at_idx ON consultants(created_at);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_consultants_updated_at
    BEFORE UPDATE ON consultants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
