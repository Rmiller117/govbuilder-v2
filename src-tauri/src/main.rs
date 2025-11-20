use tauri::generate_handler;


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn generate_import_file(data: serde_json::Value, path: &str) -> Result<(), String> {
    use std::fs;
    use std::path::Path;
    
    // Create the directory if it doesn't exist
    let full_path = Path::new(path);
    if let Some(parent) = full_path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            return Err(format!("Failed to create directory: {}", e));
        }
    }
    
    // Write the file
    match fs::write(path, serde_json::to_string_pretty(&data).unwrap_or_else(|_| data.to_string())) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![generate_import_file])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}