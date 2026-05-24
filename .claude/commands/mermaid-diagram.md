---
name: mermaid-diagram
description: Generate a Mermaid architecture diagram visualizing component dependencies and state flow for a React/TypeScript project. Use this skill whenever the user wants to visualize, document, or explore project structure — trigger on phrases like "architecture diagram", "visualize the project", "show component dependencies", "mermaid diagram", "mermaid로 구조", "프로젝트 구조 시각화", "의존성 시각화", or any request to map out how parts of the codebase connect. Also trigger when the user asks to update or regenerate the architecture diagram.
---

# Mermaid Architecture Diagram

Generate a Mermaid diagram that reflects the **actual current state** of the codebase — always read source files first, never assume structure.

## Step 1: Analyze src/

Read every `.ts` and `.tsx` file under `src/`. For each file, collect:
- **Import statements** → who depends on whom
- **useContext / custom hook calls** → state flow connections (e.g., `useNotes()`)
- **Props passed between components** → data flow direction

Build a dependency map from this data. Do not guess or use prior knowledge about the project.

## Step 2: Generate the Mermaid diagram

Use `graph TD` syntax. Organize nodes into `subgraph` blocks by layer:

```
subgraph API["API Layer"]
subgraph CTX["Context / State"]
subgraph UI["Components"]
```

**Arrow conventions:**
- `A -->|imports| B` — file A imports B
- `A -.->|useHook()| B` — component A consumes context/hook from B
- `A -->|props| B` — A passes props down to B

Keep node IDs short (e.g., `NE` for NoteEditor). Use the full name as the label.

**Example shape:**
```
graph TD
  subgraph API["API Layer"]
    AN["api/notes.ts"]
  end
  subgraph CTX["Context / State"]
    NC["NotesContext"]
  end
  subgraph UI["Components"]
    App --> NL["NoteList"]
    App --> NE["NoteEditor"]
    NL --> NI["NoteItem"]
  end
  NC -.->|"useNotes()"| NL
  NC -.->|"useNotes()"| NE
  AN -->|"api.*"| NC
```

## Step 3: Create docs/architecture/index.html

Create `docs/architecture/` directory if it doesn't exist, then write `index.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Architecture — [Project Name]</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body { font-family: sans-serif; background: #f8f9fa; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
    h1 { color: #333; margin-bottom: 0.25rem; }
    p.sub { color: #888; font-size: 0.85rem; margin-bottom: 2rem; }
    .diagram { background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 2rem; max-width: 900px; width: 100%; }
  </style>
</head>
<body>
  <h1>Project Architecture</h1>
  <p class="sub">Generated <!-- DATE --></p>
  <div class="diagram">
    <pre class="mermaid">
<!-- DIAGRAM -->
    </pre>
  </div>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
</body>
</html>
```

Replace `<!-- DIAGRAM -->` with the generated Mermaid syntax and `<!-- DATE -->` with today's date.

## Step 4: Open in browser

Detect OS and open the file:
- **Windows**: `start docs/architecture/index.html`
- **macOS**: `open docs/architecture/index.html`
- **Linux**: `xdg-open docs/architecture/index.html`

Use the absolute file path if relative path doesn't work.

## Rules

- Read actual files — never draw from memory or assumptions
- Re-running regenerates with the latest code state (overwrite the HTML)
- If a file has no imports relevant to the diagram, omit it (e.g., `types/`, `index.css`)
- Keep the diagram readable: if there are many files, group siblings under their parent component
