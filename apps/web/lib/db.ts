import { createClient } from '@/utils/supabase/client';

// Helper to provide a Dexie-like API wrapper around Supabase for backward compatibility
// during migration. In a full rewrite, we'd replace calls directly.

const supabase = createClient();

class TableWrapper {
  constructor(private tableName: string) {}

  async add(data: any) {
    const { user_id, ...rest } = data;
    
    // Ensure we have a user_id from auth context if not passed
    // But typically the app passes user_id.
    // If user_id is number (from Dexie legacy), we might need to handle it.
    // For now, assume Supabase RLS handles user scoping via auth.uid()
    // but we still need to insert user_id in the row if the table requires it.
    
    // Legacy app uses numeric IDs for users. Supabase uses UUIDs.
    // The migration strategy: 
    // New users get UUIDs.
    // Existing data from Dexie needs to be migrated to Supabase with new UUIDs.
    
    // For this wrapper, we assume the app gets refactored to use UUIDs for `currentUserId`.
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return result.id;
  }

  async update(id: any, data: any) {
    const { error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id);
    if (error) throw error;
  }

  async get(id: any) {
     const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
     if (error) return null;
     return data;
  }
  
  // Minimal query builder mock
  where(field: string) {
    return {
      equals: (value: any) => {
        return {
          toArray: async () => {
             const { data } = await supabase.from(this.tableName).select('*').eq(field, value);
             return data || [];
          },
          first: async () => {
             const { data } = await supabase.from(this.tableName).select('*').eq(field, value).limit(1).single();
             return data;
          },
          count: async () => {
              const { count } = await supabase.from(this.tableName).select('*', { count: 'exact', head: true }).eq(field, value);
              return count || 0;
          },
          reverse: () => {
              return {
                  sortBy: async (sortField: string) => {
                      const { data } = await supabase.from(this.tableName).select('*').eq(field, value).order(sortField, { ascending: false });
                      return data || [];
                  },
                  limit: (n: number) => {
                      return {
                          toArray: async () => {
                               // Start simple: fetch all then slice?? No, utilize pg
                               // But we need to chain .order by date desc typically
                               const { data } = await supabase.from(this.tableName).select('*').eq(field, value).order('created_at', { ascending: false }).limit(n);
                               return data || [];
                          }
                      }
                  },
                  first: async () => {
                      const { data } = await supabase.from(this.tableName).select('*').eq(field, value).order('created_at', { ascending: false }).limit(1).single();
                      return data;
                  }
              }
          },
          and: (condition: any) => {
             // Complex logic not easily mockable without full query builder
             // Returning promise for now to minimally satisfy some calls
             return {
                 toArray: async () => [],
                 first: async () => null
             }
          }
        }
      },
      between: (start: any, end: any) => {
          return {
              and: (condition: any) => {
                  return {
                      toArray: async () => {
                          // This is specific to the stats query
                          // condition is typically (w => w.user_id === userId)
                          // We can't parse the function.
                          // But we know standard usage patterns.
                           const { data } = await supabase.from(this.tableName)
                             .select('*')
                             .gte(field, start)
                             .lte(field, end);
                           return data || []; 
                      }
                  }
              }
          }
      },
      anyOf: (values: any[]) => {
          return {
              toArray: async () => {
                  const { data } = await supabase.from(this.tableName).select('*').in(field, values);
                  return data || [];
              }
          }
      }
    }
  }
  
  limit(n: number) {
      return {
          first: async () => {
               const { data } = await supabase.from(this.tableName).select('*').limit(n).single();
               return data;
          }
      }
  }
}

export const db = {
  table: (name: string) => {
      // Map legacy table names if needed
      if (name === 'users') return new TableWrapper('profiles'); // Dexie 'users' -> Supabase 'profiles'
      return new TableWrapper(name);
  }
};
