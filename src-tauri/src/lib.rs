mod db;
mod sync;
mod favorites;
mod settings;
mod sync_server;

use db::{soft_delete, upsert_poem, DbState, Poem};
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

// ... keep existing helpers ...
// (I will use multi_replace for better precision if needed, but let's try a full replace for the imports and commands)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// Read the saved DB path from `app_config_dir/diwan_db_path.txt`.
#[cfg(desktop)]
fn read_saved_path(app: &AppHandle) -> Option<String> {
    let config_dir = app.path().app_config_dir().ok()?;
    let txt = config_dir.join("diwan_db_path.txt");
    std::fs::read_to_string(txt).ok().map(|s| s.trim().to_string())
}

/// Persist the current DB path so it survives restarts.
#[cfg(desktop)]
fn write_saved_path(app: &AppHandle, path: &str) -> std::io::Result<()> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
    std::fs::create_dir_all(&config_dir)?;
    std::fs::write(config_dir.join("diwan_db_path.txt"), path)
}

/// Open a fresh WAL-mode connection at `path` and run schema init.
#[cfg(desktop)]
fn open_connection(path: &str) -> Result<Connection, String> {
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    db::init_db(&conn).map_err(|e| e.to_string())?;
    Ok(conn)
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// All active poems from local SQLite.
#[tauri::command]
fn get_poems(state: State<DbState>) -> Result<Vec<Poem>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_all_poems(&conn).map_err(|e| e.to_string())
}

/// Insert or update a poem.
#[tauri::command]
fn save_poem(state: State<DbState>, poem: Poem) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    upsert_poem(&conn, &poem).map_err(|e| e.to_string())
}

/// Soft-delete a poem.
#[tauri::command]
fn delete_poem(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    soft_delete(&conn, &id).map_err(|e| e.to_string())
}


/// Returns the current absolute path to `diwan.db`.
#[tauri::command]
fn get_db_path(state: State<DbState>) -> Result<String, String> {
    let path = state.path.lock().map_err(|e| e.to_string())?;
    Ok(path.clone())
}

/// (Desktop only) Opens a native folder-picker dialog.
/// The user selects a directory; the database is copied there and the
/// connection is switched live — no restart required.
#[tauri::command]
async fn pick_db_location(_app: AppHandle, _state: State<'_, DbState>) -> Result<String, String> {
    // ── Mobile guard ──────────────────────────────────────────────────────────
    #[cfg(mobile)]
    return Err("Custom DB location is not supported on mobile.".to_string());

    // ── Desktop path ──────────────────────────────────────────────────────────
    #[cfg(desktop)]
    {
        use tauri_plugin_dialog::DialogExt;

        // Show the native OS folder picker (blocking on this thread, but async for the UI)
        let selection = _app
            .dialog()
            .file()
            .blocking_pick_folder()
            .ok_or_else(|| "No folder selected".to_string())?;

        let new_dir = std::path::PathBuf::from(selection.to_string());
        let new_db_path = new_dir.join("diwan.db");
        let new_db_str = new_db_path.to_string_lossy().to_string();

        std::fs::create_dir_all(&new_dir)
            .map_err(|e| format!("Cannot create directory: {e}"))?;

        // ── Checkpoint & get old path ─────────────────────────────────────────
        let old_path: String = {
            let old_conn = _state.conn.lock().map_err(|e| e.to_string())?;
            // Checkpoint WAL so everything is in the main file
            old_conn
                .execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")
                .ok();
            _state.path.lock().map_err(|e| e.to_string())?.clone()
        }; // Lock dropped here

        // ── Copy existing DB to new location ──────────────────────────────────
        let old_db = std::path::Path::new(&old_path);
        if old_db.exists() {
            // No DB locks held during copy!
            std::fs::copy(old_db, &new_db_path)
                .map_err(|e| format!("Cannot copy database: {e}"))?;
        }

        // ── Open fresh connection at new path ─────────────────────────────────
        let new_conn = open_connection(&new_db_str)?;

        {
            let mut conn_guard = _state.conn.lock().map_err(|e| e.to_string())?;
            let mut path_guard = _state.path.lock().map_err(|e| e.to_string())?;
            *conn_guard = new_conn;
            *path_guard = new_db_str.clone();
        }

        // Persist so the next launch opens from the same place
        write_saved_path(&_app, &new_db_str)
            .map_err(|e| format!("Could not save path preference: {e}"))?;

        Ok(new_db_str)
    }
}

// ─── App entry point ──────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // Load environment variables from .env if present
            dotenvy::dotenv().ok();
            // ── Resolve the DB path ───────────────────────────────────────────

            // On mobile: always use the sandboxed app-data dir (no user choice)
            // On desktop: use saved preference or fall back to app-data dir
            let db_path: String = {
                #[cfg(mobile)]
                {
                    let dir = app
                        .path()
                        .app_data_dir()
                        .expect("Could not resolve app data dir");
                    std::fs::create_dir_all(&dir).ok();
                    dir.join("diwan.db").to_string_lossy().to_string()
                }

                #[cfg(desktop)]
                {
                    // Check if the user previously chose a location
                    if let Some(saved) = read_saved_path(app.handle()) {
                        let p = std::path::Path::new(&saved);
                        if let Some(dir) = p.parent() {
                            std::fs::create_dir_all(dir).ok();
                        }
                        saved
                    } else {
                        // Default: app-data dir
                        let dir = app
                            .path()
                            .app_data_dir()
                            .expect("Could not resolve app data dir");
                        std::fs::create_dir_all(&dir).ok();
                        dir.join("diwan.db").to_string_lossy().to_string()
                    }
                }
            };

            // ── Seed Database if it doesn't exist ─────────────────────────────
            let db_file_path = std::path::Path::new(&db_path);
            if !db_file_path.exists() {
                if let Ok(seed_path) = app.path().resolve("resources/seed.db", tauri::path::BaseDirectory::Resource) {
                    if seed_path.exists() {
                        let _ = std::fs::copy(seed_path, &db_path);
                    }
                }
            }

            // ── Open & initialise the database ────────────────────────────────
            let conn = Connection::open(&db_path).expect("Failed to open SQLite database");
            db::init_db(&conn).expect("Failed to initialise schema");
            db::seed_if_empty(&conn).expect("Failed to seed database");

            app.manage(DbState {
                conn: Mutex::new(conn),
                path: Mutex::new(db_path),
            });

            // ── Start Local Sync Server if enabled ────────────────────────────
            let config = settings::load_config(app.handle());
            if config.local_sync_enabled {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let _ = sync_server::start_server(handle, 1421).await;
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_poems,
            save_poem,
            delete_poem,
            sync::sync_supabase,
            sync::sync_local_hub,
            sync::is_sync_configured,
            settings::get_config,
            settings::set_config,
            sync_server::get_local_ip,
            get_db_path,
            pick_db_location,
            favorites::get_favorites,
            favorites::toggle_favorite,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
