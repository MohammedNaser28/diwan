use axum::{
    extract::{State, Json},
    routing::{get, post},
    Router,
};
use crate::db::{get_all_including_deleted, upsert_poem, Poem, DbState};
use tauri::Manager;
use tokio::net::TcpListener;

#[derive(Clone)]
struct ServerState {
    app: tauri::AppHandle,
}

pub async fn start_server(app: tauri::AppHandle, port: u16) -> Result<(), String> {
    let state = ServerState { app: app.clone() };
    
    let router = Router::new()
        .route("/v1/poems", get(handle_get_poems))
        .route("/v1/upsert", post(handle_upsert_poem))
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await
        .map_err(|e| format!("Failed to bind to {}: {}", addr, e))?;
    
    axum::serve(listener, router).await
        .map_err(|e| format!("Server error: {}", e))?;
    
    Ok(())
}

async fn handle_get_poems(State(state): State<ServerState>) -> Json<Vec<Poem>> {
    let db = state.app.state::<DbState>();
    let conn = db.conn.lock().unwrap();
    let poems = get_all_including_deleted(&conn).unwrap_or_default();
    Json(poems)
}

async fn handle_upsert_poem(
    State(state): State<ServerState>,
    Json(poems): Json<Vec<Poem>>,
) -> Result<(), String> {
    let db = state.app.state::<DbState>();
    let conn = db.conn.lock().unwrap();
    for poem in poems {
        upsert_poem(&conn, &poem).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_local_ip() -> Result<String, String> {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| e.to_string())
}
