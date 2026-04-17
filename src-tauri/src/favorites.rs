use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Get the path to user's favorites.json
fn get_favorites_path(app: &AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("Could not resolve app data dir");
    fs::create_dir_all(&dir).ok();
    dir.join("favorites.json")
}

/// Command to get the list of favorite poem IDs
#[tauri::command]
pub fn get_favorites(app: AppHandle) -> Result<Vec<String>, String> {
    let path = get_favorites_path(&app);
    if let Ok(data) = fs::read_to_string(&path) {
        if let Ok(favs) = serde_json::from_str::<Vec<String>>(&data) {
            return Ok(favs);
        }
    }
    // If it doesn't exist or is malformed, return an empty list
    Ok(vec![])
}

/// Command to toggle a favorite poem ID
#[tauri::command]
pub fn toggle_favorite(app: AppHandle, id: String, is_favorite: bool) -> Result<(), String> {
    let path = get_favorites_path(&app);
    
    // Read current favorites
    let mut favs: Vec<String> = if let Ok(data) = fs::read_to_string(&path) {
        serde_json::from_str(&data).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };

    // Toggle
    if is_favorite {
        if !favs.contains(&id) {
            favs.push(id);
        }
    } else {
        favs.retain(|x| x != &id);
    }

    // Write back
    let new_data = serde_json::to_string(&favs).map_err(|e| e.to_string())?;
    fs::write(&path, new_data).map_err(|e| e.to_string())?;

    Ok(())
}
