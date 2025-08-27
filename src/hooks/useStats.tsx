import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Stats {
  totalAds: number;
  activeUsers: number;
  successStories: number;
  foundOwner: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    activeUsers: 0,
    successStories: 0,
    foundOwner: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get total ads count
        const { count: totalAds } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Get success stories (found items)
        const { count: successStories } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'found')
          .eq('is_active', true);

        // Get items with found_owner status
        const { count: foundOwner } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'found_owner')
          .eq('is_active', true);

        // Get active users count (users who have logged in)
        const { data: activeUsersData } = await supabase
          .from('profiles')
          .select('user_id');

        const activeUsers = activeUsersData?.length || 0;

        setStats({
          totalAds: totalAds || 0,
          activeUsers,
          successStories: successStories || 0,
          foundOwner: foundOwner || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};