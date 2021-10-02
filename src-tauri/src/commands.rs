// Copyright 2019-2021 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT
use std::io;
use std::fs::{self, DirEntry};
use std::path::Path;
use tauri::{command};

#[command]
pub fn cmd(_argument: String) {}

#[command]
pub fn invoke(_argument: String) {}

#[command]
pub fn message(_argument: String) {}

#[command]
pub fn resolver(_argument: String) {}

#[command]
pub fn simple_command(argument: String) {
  println!("{}", argument);
}

#[command]
pub fn visit_dirs(papa: String)  {
    let pathCopy = papa;
    let dir: &Path = Path::new(&pathCopy);

    if dir.is_dir() {
        //go through the directory and print out the files
        for entry in fs::read_dir(dir).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                println!("{}", path.display());
            }
        }
        
    }
}