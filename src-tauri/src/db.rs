use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

// ─── Poem model ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Poem {
    pub id: String,
    pub text: String,
    pub poet: String,
    pub source: String,
    /// Stored as a JSON array string in SQLite
    pub tags: Vec<String>,
    /// Unix timestamp in milliseconds – used for sync conflict resolution
    pub updated_at: i64,
    /// Set when the poem is soft-deleted; NULL = active
    pub deleted_at: Option<i64>,
}

// ─── App state ───────────────────────────────────────────────────────────────

/// Holds the live SQLite connection and its file path.
/// Both are wrapped in `Mutex` so `set_db_path` can swap them at runtime.
pub struct DbState {
    pub conn: Mutex<Connection>,
    pub path: Mutex<String>,
}

// ─── Schema ─────────────────────────────────────────────────────────────────

pub fn init_db(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         CREATE TABLE IF NOT EXISTS poems (
             id         TEXT PRIMARY KEY,
             text       TEXT NOT NULL,
             poet       TEXT NOT NULL DEFAULT '',
             source     TEXT NOT NULL DEFAULT '',
             tags       TEXT NOT NULL DEFAULT '[]',
             updated_at INTEGER NOT NULL,
             deleted_at INTEGER
         );
         CREATE INDEX IF NOT EXISTS idx_updated ON poems(updated_at);",
    )?;
    Ok(())
}

// ─── Seed (first-run only) ───────────────────────────────────────────────────

pub fn seed_if_empty(conn: &Connection) -> Result<()> {
    let count: i64 =
        conn.query_row("SELECT COUNT(*) FROM poems", [], |r| r.get(0))?;
    if count > 0 {
        return Ok(());
    }

    let now = now_ms();
    let seeds: &[(&str, &str, &str, &[&str])] = &[
        (
            "وما المرءُ إلا حيثُ يجعلُ نفسَهُ\nفكُن طالبًا في العُلا أعلاها مقاما",
            "المتنبي", "ديوان المتنبي", &["حكمة", "فخر"],
        ),
        (
            "أنا البحرُ في أحشائه الدُّرُّ كامنٌ\nفهل سألوا الغوّاصَ عن صدفاتي",
            "أبو العلاء المعري", "اللزوميات", &["فخر"],
        ),
        (
            "على قَدْرِ أهلِ العزمِ تأتي العزائمُ\nوتأتي على قَدْرِ الكِرامِ المكارمُ",
            "المتنبي", "ديوان المتنبي", &["حكمة"],
        ),
        (
            "إذا غامرتَ في شرفٍ مرومٍ\nفلا تقنع بما دون النجوم",
            "المتنبي", "ديوان المتنبي", &["حكمة", "حنين"],
        ),
        (
            "لكلِّ امرئٍ من دهرِهِ ما تعوَّدا\nوعادةُ سيفِ الدولةِ الطعنُ في العِدا",
            "المتنبي", "ديوان المتنبي", &["فخر", "رثاء"],
        ),
    ];

    for (text, poet, source, tags) in seeds {
        let id = uuid::Uuid::new_v4().to_string();
        let tags_json = serde_json::to_string(tags).unwrap();
        conn.execute(
            "INSERT INTO poems (id, text, poet, source, tags, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, text, poet, source, tags_json, now],
        )?;
    }
    Ok(())
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/// Returns all active (non-deleted) poems, newest first.
pub fn get_all_poems(conn: &Connection) -> Result<Vec<Poem>> {
    let mut stmt = conn.prepare(
        "SELECT id, text, poet, source, tags, updated_at, deleted_at
         FROM poems
         WHERE deleted_at IS NULL
         ORDER BY updated_at DESC",
    )?;
    collect_poems(&mut stmt, [])
}

/// Returns *every* poem including soft-deleted ones (needed for sync push).
pub fn get_all_including_deleted(conn: &Connection) -> Result<Vec<Poem>> {
    let mut stmt = conn.prepare(
        "SELECT id, text, poet, source, tags, updated_at, deleted_at
         FROM poems
         ORDER BY updated_at DESC",
    )?;
    collect_poems(&mut stmt, [])
}

/// Insert or update based on `updated_at` – the newer record wins.
pub fn upsert_poem(conn: &Connection, poem: &Poem) -> Result<()> {
    let tags_json =
        serde_json::to_string(&poem.tags).unwrap_or_else(|_| "[]".to_string());

    conn.execute(
        "INSERT INTO poems (id, text, poet, source, tags, updated_at, deleted_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
             text       = excluded.text,
             poet       = excluded.poet,
             source     = excluded.source,
             tags       = excluded.tags,
             updated_at = excluded.updated_at,
             deleted_at = excluded.deleted_at
         WHERE excluded.updated_at > poems.updated_at",
        params![
            poem.id,
            poem.text,
            poem.poet,
            poem.source,
            tags_json,
            poem.updated_at,
            poem.deleted_at,
        ],
    )?;
    Ok(())
}

/// Soft-delete: sets deleted_at and bumps updated_at so the deletion syncs.
pub fn soft_delete(conn: &Connection, id: &str) -> Result<()> {
    let now = now_ms();
    conn.execute(
        "UPDATE poems SET deleted_at = ?1, updated_at = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    Ok(())
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

pub fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64
}

fn collect_poems(
    stmt: &mut rusqlite::Statement,
    params: impl rusqlite::Params,
) -> Result<Vec<Poem>> {
    let iter = stmt.query_map(params, |row| {
        let tags_json: String = row.get(4)?;
        Ok(Poem {
            id: row.get(0)?,
            text: row.get(1)?,
            poet: row.get(2)?,
            source: row.get(3)?,
            tags: serde_json::from_str(&tags_json).unwrap_or_default(),
            updated_at: row.get(5)?,
            deleted_at: row.get(6)?,
        })
    })?;
    iter.collect()
}
