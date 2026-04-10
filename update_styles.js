const fs = require('fs');
const path = require('path');

const sleekRootKanban = `        :root {
            --bg-color: var(--vscode-editor-background, #0f1117);
            --panel-bg: var(--vscode-sideBar-background, #161b22);
            --panel-bg2: var(--vscode-sideBarSectionHeader-background, rgba(255,255,255,0.02));
            --border-color: rgba(255, 255, 255, 0.08); /* Border trắng mờ nhẹ */
            --border-bright: rgba(255, 255, 255, 0.15);
            --text-primary: var(--vscode-editor-foreground, #e2e8f0);
            --text-secondary: var(--vscode-descriptionForeground, #94a3b8);

            --accent-teal: var(--vscode-textLink-foreground, #3ddbd9);
            --accent-teal-dim: color-mix(in srgb, var(--accent-teal) 15%, transparent);
            --glow-teal: none; 
            --accent-red: var(--vscode-errorForeground, #f85149);
            --accent-orange: var(--vscode-charts-orange, #d29922);
            --font-family: var(--vscode-font-family, 'Inter', 'Segoe UI', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'Fira Code', 'Consolas', monospace);
        }`;

const sleekRootImplementation = `        :root {
            --bg-color: var(--vscode-editor-background, #0f1117);
            --panel-bg: var(--vscode-sideBar-background, #161b22);
            --panel-bg2: rgba(255,255,255,0.02);
            --border-color: rgba(255, 255, 255, 0.08);
            --border-bright: rgba(255, 255, 255, 0.15);
            --border-dim: rgba(255, 255, 255, 0.03);
            --bg-dim: rgba(255,255,255,0.01);
            --text-primary: var(--vscode-editor-foreground, #e2e8f0);
            --text-secondary: var(--vscode-descriptionForeground, #94a3b8);

            --accent-cyan: #3ddbd9;
            --accent-teal: #3ddbd9;
            --accent-teal-dim: color-mix(in srgb, var(--accent-teal) 15%, transparent);
            --glow-teal: none;
            --accent-green: #4ec9b0;
            --accent-green-dim: rgba(78, 201, 176, 0.15);
            --accent-red: #f85149;
            --accent-orange: #d18616;
            --accent-purple: #ab7df8;

            --glow-green: none;
            --glow-red: none;
            --glow-green-btn: none;
            --glow-cyan: none;

            --font-family: var(--vscode-font-family, 'Inter', 'Segoe UI', 'Roboto', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'Fira Code', 'Consolas', monospace);
        }`;

const sleekRootReview = `        :root {
            --bg: var(--vscode-editor-background, #0f1117);
            --panel: var(--vscode-sideBar-background, #161b22);
            --panel-alt: rgba(255,255,255,0.02);
            --border: rgba(255, 255, 255, 0.08);
            --text: var(--vscode-editor-foreground, #e2e8f0);
            --muted: var(--vscode-descriptionForeground, #94a3b8);
            --accent: var(--vscode-textLink-foreground, #3ddbd9);
            --danger: var(--vscode-errorForeground, #f85149);
            --success: var(--vscode-testing-iconPassed, #3fb950);
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            --font-family: var(--vscode-font-family, 'Inter', 'Segoe UI', sans-serif);
            --mono: var(--vscode-editor-font-family, 'Fira Code', 'Consolas', monospace);
        }`;

function replaceRoot(filePath, newRoot) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /:root\s*\{[^}]+\}/;
    if (regex.test(content)) {
        content = content.replace(regex, newRoot);
        
        // Remove heavy gradients/shadows in kanban cards to make it "clean"
        content = content.replace(/background:\s*linear-gradient[^;]+;/g, 'background: var(--panel-bg2);');
        content = content.replace(/box-shadow:\s*var\(--glow-[^)]+\);/g, '/* Removed glow */');
        content = content.replace(/border-left:\s*3px\s*solid\s*var\(--accent-teal-dim\);/g, 'border-left: 2px solid var(--accent-teal); /* Sleek edge */');
        content = content.replace(/box-shadow:\s*[^;]*var\(--accent-teal\)[^;]*;/gi, '/* Removed shadow */');
        content = content.replace(/outline:\s*1px\s*dashed\s*[^;]+;/g, 'outline: 1px solid var(--accent-teal-dim);');
        
        // Ensure consistent border-radius for sleekness
        content = content.replace(/border-radius:\s*[1-4]px;/g, 'border-radius: 6px;');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(\`Updated \${filePath}\`);
    } else {
        console.log(\`Could not find :root in \${filePath}\`);
    }
}

replaceRoot('src/webview/kanban.html', sleekRootKanban);
replaceRoot('src/webview/implementation.html', sleekRootImplementation);
replaceRoot('src/webview/review.html', sleekRootReview);

console.log('UI/UX Refactoring applied!');
