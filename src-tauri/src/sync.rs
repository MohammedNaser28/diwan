use crate::db::{get_all_including_deleted, upsert_poem, Poem};
use crate::settings::SyncRole;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

/// The shape Supabase/Hub returns/accepts.
#[derive(Debug, Serialize, Deserialize, Clone)]
struct RemotePoem {
    id: String,
    text: String,
    poet: String,
    source: String,
    tags: String,
    updated_at: i64,
    deleted_at: Option<i64>,
}

impl From<&Poem> for RemotePoem {
    fn from(p: &Poem) -> Self {
        RemotePoem {
            id: p.id.clone(),
            text: p.text.clone(),
            poet: p.poet.clone(),
            source: p.source.clone(),
            tags: serde_json::to_string(&p.tags).unwrap_or_else(|_| "[]".to_string()),
            updated_at: p.updated_at,
            deleted_at: p.deleted_at,
        }
    }
}

impl From<RemotePoem> for Poem {
    fn from(r: RemotePoem) -> Self {
        Poem {
            id: r.id,
            text: r.text,
            poet: r.poet,
            source: r.source,
            tags: serde_json::from_str(&r.tags).unwrap_or_default(),
            updated_at: r.updated_at,
            deleted_at: r.deleted_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct SyncResult {
    pub pulled: usize,
    pub pushed: usize,
}

/// Generic sync logic that can talk to Supabase or a Local Hub.
async fn run_sync_logic(
    db: &Mutex<Connection>,
    base_url: &str,
    apikey: &str,
    auth_header: &str,
    can_push: bool,
    is_supabase: bool,
) -> Result<SyncResult, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    // ── 1. Pull ─────────────────────────────────────────────────────────────
    let url = if is_supabase {
        format!("{}/rest/v1/poems?select=*", base_url)
    } else {
        format!("{}/v1/poems", base_url)
    };

    let mut req = client.get(url);
    if !apikey.is_empty() { req = req.header("apikey", apikey); }
    if !auth_header.is_empty() { req = req.header("Authorization", auth_header); }

    let response = req.send().await.map_err(|e| format!("Fetch error: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let err_body = response.text().await.unwrap_or_default();
        return Err(format!("Server error ({}): {}", status, err_body));
    }

    let remote: Vec<RemotePoem> = response.json().await
        .map_err(|e| format!("Parse error: {e}"))?;

    let pulled = remote.len();
    {
        let conn = db.lock().map_err(|e| e.to_string())?;
        for rp in &remote {
            let poem: Poem = rp.clone().into();
            upsert_poem(&conn, &poem).map_err(|e| e.to_string())?;
        }
    }

    // ── 2. Push ─────────────────────────────────────────────────────────────
    if !can_push {
        return Ok(SyncResult { pulled, pushed: 0 });
    }

    let local_remote: Vec<RemotePoem> = {
        let conn = db.lock().map_err(|e| e.to_string())?;
        get_all_including_deleted(&conn).map_err(|e| e.to_string())?
            .iter().map(RemotePoem::from).collect()
    };

    let pushed = local_remote.len();
    let push_url = if is_supabase {
        format!("{}/rest/v1/poems", base_url)
    } else {
        format!("{}/v1/upsert", base_url)
    };

    // If local hub, we might need to push poems one by one or as a list depending on implementation
    // For simplicity, let's assume the Hub endpoint /v1/upsert accepts a list or we loop
    // I'll make the hub /v1/upsert accept a list too or just use the Supabase style
    
    let mut push_req = client.post(push_url);
    if !apikey.is_empty() { push_req = push_req.header("apikey", apikey); }
    if !auth_header.is_empty() { push_req = push_req.header("Authorization", auth_header); }
    
    if is_supabase {
        push_req = push_req.header("Prefer", "resolution=merge-duplicates");
    }

    let push_res = push_req.json(&local_remote).send().await
        .map_err(|e| format!("Push error: {e}"))?;

    if !push_res.status().is_success() {
        let status = push_res.status();
        let err_body = push_res.text().await.unwrap_or_default();
        return Err(format!("Push failed ({}): {}", status, err_body));
    }

    Ok(SyncResult { pulled, pushed })
}

#[tauri::command]
pub async fn sync_supabase(
    state: tauri::State<'_, crate::db::DbState>,
    app: tauri::AppHandle,
) -> Result<SyncResult, String> {
    let config = crate::settings::load_config(&app);
    let url = config.supabase_url.as_deref().unwrap_or("");
    let key = config.supabase_anon_key.as_deref().unwrap_or("");

    if url.is_empty() || key.is_empty() {
        return Err("Supabase not configured".into());
    }

    let can_push = matches!(config.supabase_role, SyncRole::Master);
    let auth = format!("Bearer {}", key);

    run_sync_logic(&state.conn, url, key, &auth, can_push, true).await
}

#[tauri::command]
pub async fn sync_local_hub(
    state: tauri::State<'_, crate::db::DbState>,
    app: tauri::AppHandle,
) -> Result<SyncResult, String> {
    let config = crate::settings::load_config(&app);
    let hub_ip = config.local_hub_ip.as_deref().unwrap_or("");

    if hub_ip.is_empty() {
        return Err("Local Hub IP not configured".into());
    }

    let url = format!("http://{}:1421", hub_ip);
    // Local Wi-Fi sync always pushes/pulls between Phone and Laptop
    run_sync_logic(&state.conn, &url, "", "", true, false).await
}

#[tauri::command]
pub fn is_sync_configured(app: tauri::AppHandle) -> bool {
    let config = crate::settings::load_config(&app);
    config.supabase_url.is_some() && config.supabase_anon_key.is_some()
}
