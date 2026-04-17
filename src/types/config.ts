export type SyncRole = 'Master' | 'Peer';

export interface AppConfig {
  supabase_role: SyncRole;
  local_sync_enabled: boolean;
  local_hub_ip: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
}
