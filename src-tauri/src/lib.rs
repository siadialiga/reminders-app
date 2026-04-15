use tauri_plugin_autostart::MacosLauncher;
use tauri::{Manager, WindowEvent};
use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton};
use tauri::menu::{Menu, MenuItem};
use std::sync::Mutex;

struct AppState {
    minimize_to_tray: bool,
}

#[tauri::command]
fn update_settings(state: tauri::State<'_, Mutex<AppState>>, minimize_to_tray: bool) {
    if let Ok(mut state) = state.lock() {
        state.minimize_to_tray = minimize_to_tray;
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--silent"])))
        .manage(Mutex::new(AppState { minimize_to_tray: true }))
        .invoke_handler(tauri::generate_handler![update_settings])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let state = window.state::<Mutex<AppState>>();
                let minimize = state.lock().map(|s| s.minimize_to_tray).unwrap_or(true);
                
                if minimize {
                    let _ = window.hide();
                    api.prevent_close();
                }
                // If minimize is false, we don't prevent close, so the app exits (or window closes)
            }
        })
        .setup(|app| {
            // Set process priority on Windows
            #[cfg(windows)]
            {
                use windows::Win32::System::Threading::{GetCurrentProcess, SetPriorityClass, ABOVE_NORMAL_PRIORITY_CLASS};
                unsafe {
                    let _ = SetPriorityClass(GetCurrentProcess(), ABOVE_NORMAL_PRIORITY_CLASS);
                }
            }

            // Create Tray Menu
            let open_i = MenuItem::with_id(app, "open", "Open Reminders", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&open_i, &quit_i])?;

            // Create a tray icon
            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Reminders")
                .menu(&tray_menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "open" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
