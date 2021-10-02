#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// we move some basic commands to a separate module just to show it works
mod commands;
use commands::{cmd, invoke, message, resolver};



fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![

    commands::simple_command,
    cmd,
    invoke,
    message,
    resolver,

  ])
    .run(tauri::generate_context!())
    
    .expect("error while running tauri application");
}
