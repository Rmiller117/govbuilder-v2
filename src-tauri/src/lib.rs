#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn generate_import_file(data: serde_json::Value, path: &str) -> Result<(), String> {
    use std::fs;
    use std::path::Path;

    let full_path = Path::new(path);
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(path, serde_json::to_string_pretty(&data).unwrap_or_else(|_| data.to_string()))
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
fn generate_import_file_raw(json: &str, path: &str) -> Result<(), String> {
    use std::fs;
    use std::path::Path;

    let full_path = Path::new(path);
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(path, json)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn fetch_api(url: &str) -> Result<String, String> {
    use reqwest;
    
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to fetch URL: {}", e))?;
    
    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    Ok(text)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_import_file, // MUST be in scope here
            generate_import_file_raw,
            fetch_api
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
