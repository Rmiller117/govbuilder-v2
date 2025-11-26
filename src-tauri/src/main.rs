use std::fs;
use std::process::Command;

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

#[tauri::command]
fn open_directory(path: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .args([path])
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args([path])
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .args([path])
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn fetch_api_with_cookies(url: &str, cookies: &str) -> Result<String, String> {
    println!("fetch_api_with_cookies called with URL: {}", url);
    println!("fetch_api_with_cookies: Cookies: {}", cookies);
    
    let client = reqwest::Client::new();
    
    println!("fetch_api_with_cookies: Making request to {}", url);
    let response = client
        .get(url)
        .header("Content-Type", "application/json")
        .header("Cookie", cookies)
        .send()
        .await
        .map_err(|e| format!("Failed to make request: {}", e))?;

    println!("fetch_api_with_cookies: Response status: {}", response.status());
    if !response.status().is_success() {
        return Err(format!("HTTP error: {} {}", response.status(), response.status().canonical_reason().unwrap_or("Unknown")));
    }

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("fetch_api_with_cookies: Response text length: {}", text.len());
    Ok(text)
}

#[tauri::command]
async fn fetch_api(url: &str) -> Result<String, String> {
    println!("fetch_api called with URL: {}", url);
    
    let client = reqwest::Client::new();
    
    println!("fetch_api: Making request to {}", url);
    let response = client
        .get(url)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Failed to make request: {}", e))?;

    println!("fetch_api: Response status: {}", response.status());
    if !response.status().is_success() {
        return Err(format!("HTTP error: {} {}", response.status(), response.status().canonical_reason().unwrap_or("Unknown")));
    }

    let text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    println!("fetch_api: Response text length: {}", text.len());
    Ok(text)
}

#[tauri::command]
fn open_url(url: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args([url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .args([url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![generate_import_file_raw, open_directory, open_url, fetch_api, fetch_api_with_cookies])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}