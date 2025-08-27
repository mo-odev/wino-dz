-- Create function to increment item views
CREATE OR REPLACE FUNCTION increment_item_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.items 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;