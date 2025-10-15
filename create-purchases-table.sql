-- Создание таблицы purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  item_name TEXT NOT NULL DEFAULT 'ИИ-Консультант для сайта',
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои покупки
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут добавлять свои покупки
CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Создаем индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);

-- Создаем индекс для поиска по email (для webhook)
CREATE INDEX IF NOT EXISTS purchases_email_idx ON purchases(email);
