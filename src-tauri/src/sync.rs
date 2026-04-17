use crate::db::{get_all_including_deleted, upsert_poem, Poem};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

// ── Replace with your Supabase project values ─────────────────────────────────
const SUPABASE_URL: &str = "https://jxizrpfxvawpvcfwkiyi.supabase.co";
const SUPABASE_ANON_KEY: &str = "sb_publishable_559HDvOpayl_oZE1oG0gsw_OW4gPR3h";
// ─────────────────────────────────────────────────────────────────────────────

/// The shape Supabase returns/accepts — tags are stored as a JSON text column.
#[derive(Debug, Serialize, Deserialize, Clone)]
struct RemotePoem {
    id: String,
    text: String,
    poet: String,
    source: String,
    tags: String, // JSON text: "[\"حكمة\", \"فخر\"]"
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

// ─── Public result type (returned to the frontend) ────────────────────────────

#[derive(Debug, Serialize)]
pub struct SyncResult {
    pub pulled: usize,
    pub pushed: usize,
}

// ─── Sync function ────────────────────────────────────────────────────────────

/// Full bidirectional sync with Supabase.
///
/// Strategy:
/// 1. Pull all rows from Supabase and upsert locally (newer timestamp wins).
/// 2. Push all local rows (including soft-deletes) to Supabase via upsert.
pub async fn sync(db: &Mutex<Connection>) -> Result<SyncResult, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let auth = format!("Bearer {SUPABASE_ANON_KEY}");

    // ── 1. Pull from Supabase ────────────────────────────────────────────────
    let remote: Vec<RemotePoem> = client
        .get(format!("{SUPABASE_URL}/rest/v1/poems?select=*"))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Authorization", &auth)
        .send()
        .await
        .map_err(|e| format!("Supabase fetch error: {e}"))?
        .json()
        .await
        .map_err(|e| format!("Supabase parse error: {e}"))?;

    let pulled = remote.len();

    // Merge remote records into local DB
    {
        let conn = db.lock().map_err(|e| e.to_string())?;
        for rp in &remote {
            let poem: Poem = rp.clone().into();
            upsert_poem(&conn, &poem).map_err(|e| e.to_string())?;
        }
    }

    // ── 2. Push local → Supabase ─────────────────────────────────────────────
    let local_remote: Vec<RemotePoem> = {
        let conn = db.lock().map_err(|e| e.to_string())?;
        get_all_including_deleted(&conn)
            .map_err(|e| e.to_string())?
            .iter()
            .map(RemotePoem::from)
            .collect()
    };

    let pushed = local_remote.len();

    // Upsert all — Supabase merges on primary key conflict
    client
        .post(format!("{SUPABASE_URL}/rest/v1/poems"))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Authorization", &auth)
        .header("Content-Type", "application/json")
        .header("Prefer", "resolution=merge-duplicates")
        .json(&local_remote)
        .send()
        .await
        .map_err(|e| format!("Supabase push error: {e}"))?;

    Ok(SyncResult { pulled, pushed })
}
