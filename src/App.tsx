import React from "react";

import "./App.css";
import Editor from "@monaco-editor/react";
import { fs, event } from "@tauri-apps/api";
import {
  getCurrent,
  WebviewWindow,
} from "@tauri-apps/api/window";
import { homeDir } from "@tauri-apps/api/path";

type fileType = {
  name: string;
  path: string;
  children: fileType[];
  is_file: boolean;
};

interface State {
  files: fileType[];
  pathValue: string;
  monacoValue?: string;
  hideExplore: boolean;
}
export default class App extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props);
    this.state = {
      files: [],
      hideExplore: false,
      pathValue: "",
    };
    this.read_directory = this.read_directory.bind(this);
    getCurrent().listen("show_file_only", async (event: event.Event<string>) => {
      this.setState({ monacoValue: await fs.readTextFile(event.payload), hideExplore: true }, () => {
        this.forceUpdate();
      });
    });
  }
  
  async componentDidMount() {
    this.setState({ pathValue: await homeDir() });
    let r = await this.read_directory(await homeDir());
    this.setState({ files: r });

  }

  async loadDirectory(file: fileType) {
    if (file.children.length == 0)
      file.children = await this.read_directory(file.path);
    else file.children = [];
    this.forceUpdate();
  }

  /**
   * Lit le contenu d'un dossier et le converti en filetype
   * @param path Le chemin du dossier à lire
   * @returns une liste de filetype
   */
  async read_directory(path: string) {
    let filesComputed: fileType[] = [];

    try {
      let files = await fs.readDir(path);

      for (let file of files) {
        console.log(file);
        if (!file.children) {
          let fileComputed: fileType = {
            name: file.name!,
            path: file.path,
            children: [],
            is_file: true,
          };
          filesComputed.push(fileComputed);
        } else {
          let fileComputed: fileType = {
            name: file.name!,
            path: file.path,
            children: [],
            is_file: false,
          };
          filesComputed.push(fileComputed);
        }
      }

      return filesComputed;
    } catch (e) {
      return [];
    }
  }

  /**
   * Parametrage de Monaco
   * @param monaco Value of the editor
   */
  handleEditorWillMount(monaco: any) {

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: "react",
      tsx: "react",
    });

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  /**
   * Ouvre un fichier dans une nouvelle fenêtre
   * @param file Le fichier à ouvrir dans une nouvelle fenêtre
   */
  openInNewWindow(file: fileType) {

    let webview1 = new WebviewWindow(file.path, {
      url: "public/index.html",
    });

    setTimeout(async () => {
      webview1.emit("show_file_only", file.path);

    }, 2000);
  }

  /**
   * Render of the directory list
   * @param files Liste des fichiers parents
   * @returns Un element TSX qui contient la liste des fichiers
   */
  renderDirectoryList(files: fileType[]) {
    return files.map((file) => {
      if (file.is_file) {
        return (
          <div
            className="hoverGrey"
            onClick={async (event) => {
              let monacoValue = await fs.readTextFile(file.path);
              if (event.shiftKey) {
                this.openInNewWindow(file);
              } else {
                this.setState({ monacoValue: monacoValue });
              }
            }}
            style={{ textAlign: "left", color: "grey", cursor: "pointer" }}
          >
            {file.name}
          </div>
        );
      } else {
        return (
          <div style={{ textAlign: "left", color: "blue", cursor: "pointer" }}>
            <div
              onClick={async () => {
                await this.loadDirectory(file);
              }}
              className="hoverGrey"
            >
              {file.name}
            </div>
            <div style={{ marginLeft: "10px" }}>
              {this.renderDirectoryList(file.children)}
            </div>
          </div>
        );
      }
    });
  }

  render() {
    return (
      <div className="App">
        <div style={{ display: "flex" }}>
          {(() => {
            if (!this.state.hideExplore) {
              return (
                <div style={{ width: "30%" }}>
                  <input
                    onChange={async (e) => {
                      let val = e.target.value;
                      let r = await this.read_directory(val);
                      this.setState({ files: r, pathValue: val });
                    }}
                    value={this.state.pathValue}
                  />
                  <div style={{height: "100vh", overflowX: "scroll"}}>{this.renderDirectoryList(this.state.files)}</div>
                </div>
              );
            }
          })()}

          <Editor
            height="100vh"
            beforeMount={this.handleEditorWillMount}
            language="typescript"
            theme="vs-dark"
            defaultValue="// TypeScript code goes here"
            value={this.state.monacoValue}
          />
        </div>
      </div>
    );
  }
}
