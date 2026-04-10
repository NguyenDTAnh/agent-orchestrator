const fs = require('fs');
const path = require('path');

const sleekRootKanban = `        :root {
            --bg-color: color-mix(in srgb, var(--vscode-editor-background, #0b0d12) 94%, #000000 6%);
            --bg-elevated: color-mix(in srgb, var(--vscode-sideBar-background, #151922) 82%, #0a0c10 18%);
            --panel-bg: color-mix(in srgb, var(--vscode-sideBar-background, #161b22) 90%, #0b0d12 10%);
            --panel-bg2: rgba(255, 255, 255, 0.03);
            --panel-bg3: rgba(255, 255, 255, 0.055);
            --glass-bg: rgba(255, 255, 255, 0.045);
            --glass-strong: rgba(255, 255, 255, 0.08);
            --border-color: rgba(255, 255, 255, 0.08);
            --border-bright: rgba(255, 255, 255, 0.16);
            --border-strong: rgba(255, 255, 255, 0.24);
            --text-primary: var(--vscode-editor-foreground, #edf2f7);
            --text-secondary: color-mix(in srgb, var(--vscode-descriptionForeground, #a0aec0) 88%, #ffffff 12%);
            --text-muted: rgba(237, 242, 247, 0.62);
            --accent-teal: color-mix(in srgb, var(--vscode-textLink-foreground, #7aa2f7) 38%, #dfe7f1 62%);
            --accent-teal-dim: color-mix(in srgb, var(--accent-teal) 18%, transparent);
            --accent-red: color-mix(in srgb, var(--vscode-errorForeground, #ff7b72) 72%, #f3d1d6 28%);
            --accent-orange: color-mix(in srgb, var(--vscode-charts-orange, #d29922) 74%, #e4d6bd 26%);
            --status-success: color-mix(in srgb, var(--vscode-testing-iconPassed, #73c991) 72%, #dcebdd 28%);
            --glow-teal: none;
            --shadow-soft: 0 16px 40px rgba(0, 0, 0, 0.24);
            --shadow-card: 0 12px 28px rgba(0, 0, 0, 0.18);
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'SFMono-Regular', 'Fira Code', 'Consolas', monospace);
        }`;

const sleekRootImplementation = `        :root {
            --bg-color: color-mix(in srgb, var(--vscode-editor-background, #0b0d12) 94%, #000000 6%);
            --bg-elevated: color-mix(in srgb, var(--vscode-sideBar-background, #151922) 82%, #0a0c10 18%);
            --panel-bg: color-mix(in srgb, var(--vscode-sideBar-background, #161b22) 90%, #0b0d12 10%);
            --panel-bg2: rgba(255, 255, 255, 0.03);
            --panel-bg3: rgba(255, 255, 255, 0.055);
            --border-color: rgba(255, 255, 255, 0.08);
            --border-bright: rgba(255, 255, 255, 0.16);
            --border-dim: rgba(255, 255, 255, 0.05);
            --bg-dim: rgba(255, 255, 255, 0.02);
            --text-primary: var(--vscode-editor-foreground, #edf2f7);
            --text-secondary: color-mix(in srgb, var(--vscode-descriptionForeground, #a0aec0) 88%, #ffffff 12%);
            --text-muted: rgba(237, 242, 247, 0.62);
            --accent-cyan: color-mix(in srgb, var(--vscode-textLink-foreground, #7aa2f7) 40%, #dfe7f1 60%);
            --accent-teal: color-mix(in srgb, var(--vscode-textLink-foreground, #7aa2f7) 35%, #dfe7f1 65%);
            --accent-teal-dim: color-mix(in srgb, var(--accent-teal) 18%, transparent);
            --accent-green: color-mix(in srgb, var(--vscode-testing-iconPassed, #73c991) 65%, #dfe7f1 35%);
            --accent-green-dim: color-mix(in srgb, var(--accent-green) 18%, transparent);
            --accent-red: color-mix(in srgb, var(--vscode-errorForeground, #ff7b72) 72%, #f3d1d6 28%);
            --accent-orange: color-mix(in srgb, var(--vscode-charts-orange, #d29922) 74%, #e4d6bd 26%);
            --accent-purple: color-mix(in srgb, #ab7df8 62%, #dfe7f1 38%);
            --glow-teal: none;
            --shadow-soft: 0 16px 40px rgba(0, 0, 0, 0.24);
            --shadow-card: 0 12px 28px rgba(0, 0, 0, 0.18);
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'SFMono-Regular', 'Fira Code', 'Consolas', monospace);
        }`;

const sleekRootReview = `        :root {
            --bg: color-mix(in srgb, var(--vscode-editor-background, #0b0d12) 94%, #000000 6%);
            --panel: color-mix(in srgb, var(--vscode-sideBar-background, #161b22) 90%, #0b0d12 10%);
            --panel-alt: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.08);
            --text: var(--vscode-editor-foreground, #edf2f7);
            --muted: rgba(237, 242, 247, 0.62);
            --accent: color-mix(in srgb, var(--vscode-textLink-foreground, #7aa2f7) 38%, #dfe7f1 62%);
            --danger: color-mix(in srgb, var(--vscode-errorForeground, #ff7b72) 72%, #f3d1d6 28%);
            --success: color-mix(in srgb, var(--vscode-testing-iconPassed, #73c991) 72%, #dcebdd 28%);
            --shadow: 0 16px 40px rgba(0, 0, 0, 0.24);
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif);
            --mono: var(--vscode-editor-font-family, 'SFMono-Regular', 'Fira Code', 'Consolas', monospace);
        }`;

function replaceRoot(filePath, newRoot) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /:root\s*\{[^}]+\}/;
    if (regex.test(content)) {
        content = content.replace(regex, newRoot);
        
        // Chỉ giữ các rewrite thật sự an toàn và không phá radius / shadow chủ đích.
        content = content.replace(/outline:\s*1px\s*dashed\s*[^;]+;/g, 'outline: 1px solid var(--accent-teal-dim);');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`Could not find :root in ${filePath}`);
    }
}

replaceRoot('src/webview/kanban.html', sleekRootKanban);
replaceRoot('src/webview/implementation.html', sleekRootImplementation);
replaceRoot('src/webview/review.html', sleekRootReview);

console.log('UI/UX Apple Glassy Refactoring synced to update_styles.js!');
