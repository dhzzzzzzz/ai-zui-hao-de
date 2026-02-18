
-- Add AI Agent category
INSERT INTO categories (name, slug, description, icon, display_order)
VALUES ('AI Agent', 'ai-agent', '热门AI智能体与自动化Agent合集', 'Bot', 14)
ON CONFLICT DO NOTHING;
