use std::fs;

#[tauri::command]
fn generate_import_file_raw(json: String, path: &str) -> Result<(), String> {
    let full_path = std::path::PathBuf::from(path);

    eprintln!("Attempting to write raw JSON to path: {:?}", full_path);

    if let Some(parent) = full_path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("Failed to create directory: {}", e);
            return Err(format!("Failed to create directory: {}", e));
        }
    }

    match fs::write(&full_path, json) {
        Ok(_) => {
            eprintln!("File written successfully to: {:?}", full_path);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to write file: {}", e);
            Err(format!("Failed to write file: {}", e))
        }
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![generate_import_file_raw])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}