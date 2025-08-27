import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate, Database } from '@/integrations/supabase/types';

export type Item = Tables<'items'>;
export type ItemInsert = TablesInsert<'items'>;
export type ItemUpdate = TablesUpdate<'items'>;
export type ItemCategory = Database['public']['Enums']['item_category'];
export type ItemStatus = Database['public']['Enums']['item_status'];

export interface ItemFilters {
  category?: ItemCategory;
  status?: ItemStatus | 'all';
  wilaya?: string;
  search?: string;
}

export const useItems = (filters?: ItemFilters) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.wilaya) {
        query = query.ilike('wilaya', `%${filters.wilaya}%`);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "خطأ في تحميل البيانات",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const createItem = async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'is_active'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [data, ...prev]);
      toast({
        title: "تم نشر الإعلان بنجاح",
        description: "سيتم مراجعة إعلانك وعرضه قريباً"
      });

      return data;
    } catch (err: any) {
      toast({
        title: "خطأ في نشر الإعلان",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "تم تحديث الإعلان بنجاح"
      });

      return data;
    } catch (err: any) {
      toast({
        title: "خطأ في تحديث الإعلان",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "تم حذف الإعلان بنجاح"
      });
    } catch (err: any) {
      toast({
        title: "خطأ في حذف الإعلان",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await supabase.rpc('increment_item_views', { item_id: id });
    } catch (err: any) {
      console.error('Error incrementing views:', err);
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    incrementViews,
    refetch: fetchItems
  };
};

export const useItem = (id: string) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        setItem(data);
        
        // Increment views
        await supabase.rpc('increment_item_views', { item_id: id });
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "خطأ في تحميل التفاصيل",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  return { item, loading, error };
};

export const useUserItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    responses: 0,
    found: 0
  });
  const { toast } = useToast();

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const views = data?.reduce((sum, item) => sum + (item.views_count || 0), 0) || 0;
      const found = data?.filter(item => item.status === 'found').length || 0;
      
      setStats({ total, views, responses: 0, found });
    } catch (err: any) {
      toast({
        title: "خطأ في تحميل إعلاناتك",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "تم حذف الإعلان بنجاح"
      });
    } catch (err: any) {
      toast({
        title: "خطأ في حذف الإعلان",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchUserItems();
  }, []);

  return { items, loading, stats, deleteItem };
};