use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SyncRole {
    Master,
    Peer,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub supabase_role: SyncRole,
    pub local_sync_enabled: bool,
    pub local_hub_ip: Option<String>,
    pub supabase_url: Option<String>,
    pub supabase_anon_key: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            supabase_role: SyncRole::Peer, // Default to Peer for safety
            local_sync_enabled: false,
            local_hub_ip: None,
            supabase_url: None,
            supabase_anon_key: None,
        }
    }
}

fn get_config_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_config_dir()
        .expect("Failed to get config dir")
        .join("settings.json")
}

pub fn load_config(app: &AppHandle) -> AppConfig {
    let path = get_config_path(app);
    if let Ok(content) = fs::read_to_string(path) {
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = get_config_path(app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_config(app: AppHandle) -> AppConfig {
    load_config(&app)
}

// set_config is now handled in lib.rs to manage server lifecycle
