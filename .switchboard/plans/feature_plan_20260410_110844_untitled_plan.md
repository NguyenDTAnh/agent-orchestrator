# UI/UX Refactoring: Apple Glassy Vibe & Sleek Design

## Goal
Tái thiết kế lại toàn bộ giao diện extension để loại bỏ cảm giác "rối mắt", chật chội và thiếu chuyên nghiệp. Hướng tới ngôn ngữ thiết kế "Sleek, Clean, Minimalist" mang âm hưởng Apple Glassy Vibe (hiệu ứng kính mờ, viền solid tinh tế) và bảng màu chuẩn mực, sang trọng (Apple Silicon Theme: Space Grey/Titanium tone).

## Metadata
**Tags:** frontend, UI
**Complexity:** 6

## User Review Required
> [!NOTE]
> - Đây là visual refactor cho webview; không thay đổi workflow agent, message contract, persistence, hay logic drag/drop.
> - Clarification: phạm vi chỉ cần bảo đảm chất lượng trong Dark Mode hiện tại của VS Code. Không bổ sung một light-theme riêng trong plan này.
> - Clarification: không chủ động đập lại DOM hay tách thêm wrapper chỉ để “cho đẹp”. Chỉ dùng CSS trên các container đang có; chỉ bổ sung cấu trúc nếu test thực tế chứng minh một block bị clipping hoặc mất contrast mà CSS hiện tại không cứu được.
> - Clarification: repo đang có `update_styles.js` rewrite trực tiếp `:root` của `src/webview/kanban.html` và `src/webview/implementation.html`. Nếu file này không được cập nhật cùng lúc, palette mới rất dễ bị script nội bộ ghi đè sạch. Đây không phải scope mới; đây là điều kiện để refactor này sống sót quá một lần chạy script.

## Complexity Audit
### Routine
- Cập nhật shared design tokens trong `src/webview/kanban.html` và `src/webview/implementation.html` để thay neon palette bằng titanium / space-grey palette bám theo VS Code theme variables.
- Tăng whitespace, radius, và spacing cho header strips, column shells, agent cards, modals, DB panel, và form controls mà không thay đổi DOM hiện hữu.
- Chuẩn hoá typography: dùng system font cho title/heading/card labels; giữ mono font cho metadata, counters, timestamp, và machine-oriented labels.
- Làm gọn scrollbar, button chrome, border treatment, hover states, và status colors theo hướng muted thay vì glow-heavy.

### Complex / Risky
- `backdrop-filter` phải được triển khai chọn lọc. Nếu bôi blur lên mọi column body, card stack, hoặc scroll container thì webview Chromium rất dễ thành nồi lẩu layer chồng nhau: mờ, lag, và đọc chữ như đi khám mắt.
- Kanban cards đang chứa nhiều metadata trên diện tích nhỏ. Tăng glass effect hoặc giảm contrast quá đà sẽ làm topic, trạng thái, và action buttons tụt readability.
- `src/webview/implementation.html` đang là điểm hội tụ của nhiều plan khác (onboarding, Airlock, DB UI). Dù thay đổi này thiên về CSS, cùng-file merge conflict vẫn là nguy cơ thật chứ không phải drama tưởng tượng.
- `update_styles.js` hiện đang force-rewrite `border-radius` và strip một số `box-shadow`. Nếu không chỉnh script này, style spec mới sẽ bị file tooling phản bội ngay sau khi triển khai.

## Edge-Case & Dependency Audit
- **Race Conditions:** Bản thân CSS refactor không tạo race condition runtime. Rủi ro thực tế là “visual race” giữa hover/focus/drag states và lớp blur nếu blur được đặt lên scroll container hoặc nested surface. Cách tránh: chỉ blur top bars, modal shells, và panel shells cố định; không blur card list bên trong card list.
- **Security:** Không thêm `innerHTML`, không thay CSP, không thay message handler, không tăng surface XSS. Đây là styling-only change.
- **Side Effects:** Tăng padding và radius có thể làm button rows, badge rows, và long plan titles wrap khác trước. Cần giữ nguyên các constraint đang có (`overflow`, `text-overflow`, `white-space`) trừ nơi plan này nói rõ phải đổi. `backdrop-filter` cũng phải luôn đi kèm nền bán mờ đủ đậm để UI vẫn readable khi blur bị ignore hoặc giảm hiệu lực.
- **Dependencies & Conflicts:** Không có MCP `get_kanban_state` trong môi trường hiện tại, nên không thể xác nhận chính xác plan nào đang nằm ở cột New / Planned. Audit xung đột dưới đây được suy luận từ nội dung trong `.switchboard/plans/` và phải được coi là “best-effort with uncertainty”, không phải ground truth của Kanban DB.
- **Dependencies & Conflicts:** `reverse_kanban_card_sort_order.md` chạm `src/webview/kanban.html` ở phần script sort (~lines 1932, 1950). Overlap thấp vì plan này chủ yếu sửa CSS ở phần đầu file, nhưng vẫn là cùng file nên merge phải re-read cẩn thận.
- **Dependencies & Conflicts:** `refactor_onboarding_state_synchronization.md` chạm `src/webview/implementation.html` ở onboarding state flow và JS handler. Overlap logic thấp, nhưng nếu visual refactor đụng onboarding container / header / inline onboarding styles trong cùng file thì sẽ có merge friction.
- **Dependencies & Conflicts:** `embed_kanban_state_in_plan_files.md` chạm `src/webview/implementation.html` trong khu DB panel, warning banner, và Rebuild Database area. Đây là vùng plan này cũng phải restyle, nên mức độ conflict là trung bình.
- **Dependencies & Conflicts:** `fix_airlock_tab_structure.md` và `airlock_tab_empty_bug.md` đều chạm `src/webview/implementation.html` ở Airlock render path. Plan này không nên chạm logic `renderAgentList()`; chỉ style `.agent-row`, `.action-btn`, `.agent-list`, và panel shells để giảm rủi ro merge.
- **Dependencies & Conflicts:** Không thấy plan nào khác đang nhắc tới `update_styles.js`. Điều đó không có nghĩa file này an toàn để bỏ qua; nó chỉ có nghĩa nếu implementer quên nó thì sẽ tự bắn vào chân mà không có warning từ conflict scan.

## Adversarial Synthesis
### Grumpy Critique
*"Tuyệt vời. Một ticket kiểu ‘làm cho đẹp hơn’ nữa, thể loại phá sản kỹ thuật nhanh nhất nếu người làm chỉ biết đổi màu với tăng blur như đang chỉnh wallpaper MacBook trong quán cafe.*

*Vấn đề đầu tiên: plan gốc nói ‘Apple Glassy Vibe’ nhưng không hề khóa điểm đặt blur. Nếu coder hăng máu quăng `backdrop-filter` lên `kanban-column`, `column-body`, `agent-row`, modal, DB panel, rồi còn nested thêm Airlock card bên trong `agent-row`, thì xin chúc mừng, extension sẽ trông như bị hấp hơi nước. Mờ thì nhiều, sang thì ít, còn hiệu năng thì đi bụi.*

*Vấn đề thứ hai: typography. Kêu đồng bộ system font nhưng file hiện tại đang dùng mono font khắp nơi như terminal cosplay thành UI framework. Nếu plan không chỉ rõ label nào chuyển sang system font và label nào phải giữ mono, coder sẽ either đổi tất cả sang system font làm mất hierarchy, hoặc giữ nguyên mọi thứ rồi bảo ‘em có sửa token rồi mà’. Cả hai đều là làm ẩu có tổ chức.*

*Vấn đề thứ ba: cùng-file conflict. `implementation.html` ở repo này là cái vali nhét mọi thứ vào: onboarding, Airlock, DB sync, live feed, agent cards, modal. Bất kỳ plan nào chạm file này mà không tuyên bố rõ “không đụng JS, chỉ đụng style blocks nào” là đang mời merge conflict vào nhà như mời bạn thân cũ đến dự đám cưới người yêu cũ. Và plan gốc chưa hề làm rõ chuyện đó.*

*Vấn đề thứ tư mới là cú đấm thật: `update_styles.js` đang rewrite thẳng `:root`, strip shadow, rồi force `border-radius: 6px`. Không cập nhật file này mà còn đi nói về radius 8px/12px và titanium palette thì khác gì sơn xe xong tự lái vào máy rửa xe công nghiệp. Mọi thứ đẹp đẽ sẽ bị script bóp chết sau một lần chạy.*

*Nói ngắn gọn: nếu không khóa phạm vi thành CSS-only, không trả lời chuyện font hierarchy, không giới hạn blur surface, và không xử lý `update_styles.js`, thì đây không phải ‘sleek design’. Đây là ‘một cú restyle cảm tính, độ bền bằng giấy ăn’."*

### Balanced Response
Grumpy cà khịa đau nhưng đúng chỗ. Bản improved plan này đã siết lại các điểm yếu đó như sau:

1. **Khoá blur surface rõ ràng:** blur chỉ áp dụng cho top-level header strips, modal shells, và panel surfaces cố định. Không blur card list, không blur nested content containers, không biến toàn bộ kanban thành bể sương.
2. **Chốt font hierarchy thay vì nói mơ hồ:** system font dùng cho tiêu đề, section label, card title, agent name; mono font chỉ giữ cho metadata, badge, counter, timestamp, và controls mang tính “machine”. Như vậy coder không còn cớ freestyle lung tung.
3. **Giảm merge risk bằng cách tránh JS:** plan ghi rõ `renderAgentList()`, onboarding message flow, drag/drop logic, và mọi message handlers là **no-change** trong pass này. Scope bị khóa vào style blocks và một helper script nội bộ duy nhất là `update_styles.js`.
4. **Xử lý tooling overwrite hazard:** `update_styles.js` được đưa vào spec như một thay đổi bắt buộc có nhãn Clarification để ngăn design mới bị script ghi đè. Đồng thời các blanket replacements phá radius/shadow bị loại bỏ hoặc thu hẹp.
5. **Giữ readability là constraint số 1:** mọi glass surface đều có fallback nền bán mờ + border rõ ràng; các rule `overflow`, `text-overflow`, và layout hit-area hiện hữu được giữ nguyên trừ nơi plan chỉ định cụ thể. Nghĩa là refactor này nhắm vào “mát mắt nhưng vẫn đọc được”, không phải “dribbble shot chụp xong khỏi dùng”.

## Proposed Changes
> [!IMPORTANT]
> **MAXIMUM DETAIL REQUIRED:** Thay đổi này phải được triển khai theo đúng các block dưới đây. Không đổi logic JS nếu không có mục riêng yêu cầu. Không dùng placeholder kiểu `TODO`, `...existing code...`, hay “style tương tự”.

### Preserved Original Scope
#### [REFERENCE] `/Users/dognnguyen/Sites/switchboard/.switchboard/plans/feature_plan_20260410_110844_untitled_plan.md`
- **Context:** Giữ nguyên nội dung phạm vi ban đầu để bản improved plan này không vô tình mở rộng scope hay làm mất ý định gốc của user.
- **Logic:** Các gạch đầu dòng dưới đây được copy nguyên văn từ plan gốc và là baseline để các bước chi tiết phía sau bám vào.
- **Implementation:**

```markdown
1. **Color Theme & Tonal Palette (`:root`)**
   - Loại bỏ triệt để các màu neon (teal/red) đang gây chói. Thay thế bằng các tone Solid mượt mà: Xám nhám (Space Grey), Đen OLED, và điểm xuyết các đường highlight ánh bạc siêu mỏng.
   - Cập nhật hệ thống màu trạng thái (Status colors) xuống tone mờ (muted tones) nhưng vẫn giữ được sự tương phản cần thiết.

2. **Apple Glassy Vibe & Borders**
   - Áp dụng `backdrop-filter: blur(16px)` kết hợp với nền bán trong suốt `rgba(255, 255, 255, 0.03)` cho các modal, dropdown, header panels.
   - Sử dụng các đường viền solid, cực nét và rất tinh tế: `border: 1px solid rgba(255, 255, 255, 0.08)`. Xoá sổ mọi `box-shadow` dày đặc gây bẩn layout.
   - Tinh chỉnh `border-radius: 8px` hoặc `12px` chuẩn ngôn ngữ thiết kế mới cứng cáp.

3. **Spacing & Typography (Khoảng trắng & Text)**
   - Bơm thêm "không khí" (Whitespace): Tăng `padding`, `gap` và `margin` ở các khối column, card và các section để layout trở nên đẳng cấp, dễ thở hơn.
   - Đồng bộ font chữ hệ thống `font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;`. Xử lý cấp bậc Typography bằng độ mờ chữ thay vì kích thước quá nhỏ.

4. **Layout Components Restructuring**
   - Refactor lại Layout của Kanban Board (`kanban.html`): Cắt bớt các đường nét phức tạp, header sạch sẽ, vuốt gọn scrollbar.
   - Refactor Agent Panel (`implementation.html`): Định dạng lại các Agent boxes dạng card kính nổi bật trên background, căn chỉnh spacing pixel-perfect.
```

- **Edge Cases Handled:** Việc preserve scope nguyên văn chặn hiện tượng scope creep kiểu “đang restyle sidebar xong tiện tay redesign luôn workflow”.

### `src/webview/kanban.html`
#### [MODIFY] `src/webview/kanban.html`
- **Context:** File này chứa toàn bộ visual shell của AUTOBAN, gồm `:root` tokens, top bars, columns, cards, buttons, scrollbars, và modal styles. Phần script drag/drop bên dưới đang ổn; plan này chỉ được đụng `<style>` block ở đầu file.
- **Logic:**
  1. **Low complexity:** thay token palette, spacing, radius, typography, scrollbar, modal chrome, card surface, button chrome.
  2. **Low complexity:** chuyển title và column heading sang system font; giữ `var(--font-mono)` cho counters, metadata, và action affordances mang tính kỹ thuật.
  3. **Complex / Risky:** chỉ áp dụng blur cho `.kanban-header`, `.controls-strip`, `.settings-strip`, và `.modal-content`. Không thêm blur cho `.column-body`, `.kanban-card`, hay scrollable card stacks.
  4. **Complex / Risky:** giữ nguyên constraints hiện có cho `white-space`, `overflow`, `text-overflow`, và hit area drag/drop để visual refresh không kéo theo layout regression.
- **Implementation:**

1. Thay toàn bộ block `:root` hiện tại bằng block sau:

```css
        :root {
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
        }
```

2. Thay các block shell phía trên board bằng đúng phiên bản sau:

```css
        body {
            font-family: var(--font-family);
            background:
                radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 28%),
                linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 55%, transparent) 0%, var(--bg-color) 26%, var(--bg-color) 100%);
            color: var(--text-primary);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .kanban-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 24px 14px;
            border-bottom: 1px solid var(--border-color);
            background: color-mix(in srgb, var(--panel-bg) 82%, transparent);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
        }

        .kanban-title {
            flex: 1;
            min-width: 0;
            font-family: var(--font-family);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 2.4px;
            text-transform: uppercase;
            color: var(--text-primary);
            opacity: 0.92;
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .workspace-select {
            background: color-mix(in srgb, var(--panel-bg3) 82%, var(--panel-bg) 18%);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            font-family: var(--font-family);
            font-size: 11px;
            letter-spacing: 0.2px;
            padding: 8px 12px;
            min-width: 200px;
        }

        .controls-strip {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            border-bottom: 1px solid var(--border-color);
            background: color-mix(in srgb, var(--panel-bg) 60%, transparent);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            flex-wrap: wrap;
        }

        .settings-strip {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 20px;
            border-bottom: 1px solid var(--border-color);
            background: color-mix(in srgb, var(--panel-bg2) 70%, transparent);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            flex-wrap: wrap;
        }

        .strip-btn {
            background: color-mix(in srgb, var(--panel-bg3) 55%, transparent);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.9px;
            text-transform: uppercase;
            padding: 6px 12px;
            cursor: pointer;
            border-radius: 10px;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .strip-btn:hover {
            background: color-mix(in srgb, var(--accent-teal) 10%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .strip-btn.is-active {
            color: var(--text-primary);
            border-color: color-mix(in srgb, var(--accent-teal) 26%, var(--border-bright));
            box-shadow: none;
            background: color-mix(in srgb, var(--accent-teal) 12%, transparent);
        }

        .btn-add-plan {
            background: color-mix(in srgb, var(--accent-teal) 12%, transparent);
            border: 1px solid color-mix(in srgb, var(--accent-teal) 22%, transparent);
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 14px;
            font-weight: 700;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 10px;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
            box-shadow: none;
        }

        .btn-add-plan:hover {
            background: color-mix(in srgb, var(--accent-teal) 18%, transparent);
            border-color: color-mix(in srgb, var(--accent-teal) 34%, transparent);
            color: var(--text-primary);
            box-shadow: none;
            transform: translateY(-1px);
        }

        .btn-batch {
            background: color-mix(in srgb, var(--accent-teal) 10%, transparent);
            border: 1px solid color-mix(in srgb, var(--accent-teal) 22%, transparent);
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.8px;
            line-height: 1;
            min-height: 24px;
            padding: 5px 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 10px;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
        }

        .btn-batch:hover {
            background: color-mix(in srgb, var(--accent-teal) 16%, transparent);
            border-color: color-mix(in srgb, var(--accent-teal) 30%, transparent);
            color: var(--text-primary);
            box-shadow: none;
            transform: translateY(-1px);
        }
```

3. Thay block layout cột bằng đúng nội dung sau:

```css
        .kanban-board {
            display: flex;
            gap: 16px;
            padding: 20px 20px 24px;
            flex: 1;
            min-height: 0;
            overflow-x: auto;
        }

        .kanban-column {
            flex: 1;
            min-width: 240px;
            max-width: 340px;
            display: flex;
            flex-direction: column;
            background: color-mix(in srgb, var(--panel-bg) 92%, transparent);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: visible;
            position: relative;
            transition: z-index 0s;
        }

        .kanban-column:hover {
            z-index: 100;
        }

        .column-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 14px 12px;
            border-bottom: 1px solid var(--border-color);
            background: color-mix(in srgb, var(--glass-bg) 82%, var(--panel-bg) 18%);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            min-height: 64px;
            border-top-left-radius: 15px;
            border-top-right-radius: 15px;
            z-index: 20;
        }

        .column-name {
            font-family: var(--font-family);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            color: var(--text-primary);
        }

        .column-agent {
            font-family: var(--font-family);
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 4px;
            text-transform: none;
            opacity: 1;
            letter-spacing: 0.2px;
            height: 16px;
        }

        .column-count {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-primary);
            background: color-mix(in srgb, var(--panel-bg3) 80%, transparent);
            border: 1px solid var(--border-color);
            padding: 3px 8px;
            border-radius: 999px;
            min-width: 28px;
            text-align: center;
            box-shadow: none;
        }

        .column-body {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            min-height: 140px;
            transition: background 0.15s ease;
            z-index: 1;
        }

        .column-body.drag-over {
            background: color-mix(in srgb, var(--accent-teal) 6%, transparent);
            outline: 1px solid color-mix(in srgb, var(--accent-teal) 20%, var(--border-bright));
            outline-offset: -6px;
            border-radius: 12px;
        }
```

4. Thay block card / button / metadata bằng đúng nội dung sau:

```css
        .kanban-card {
            background: linear-gradient(180deg, color-mix(in srgb, var(--panel-bg2) 70%, rgba(255, 255, 255, 0.045) 30%) 0%, color-mix(in srgb, var(--panel-bg) 84%, transparent) 100%);
            border: 1px solid var(--border-color);
            border-left: 1px solid var(--border-strong);
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 10px;
            cursor: grab;
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            position: relative;
        }

        .kanban-card:hover {
            border-color: var(--border-bright);
            border-left-color: color-mix(in srgb, var(--accent-teal) 24%, var(--border-strong));
            box-shadow: var(--shadow-card);
            transform: translateY(-1px);
            z-index: 50;
        }

        .kanban-card.dragging {
            opacity: 0.45;
            border-color: color-mix(in srgb, var(--accent-teal) 18%, var(--border-color));
            box-shadow: none;
            transform: scale(0.995);
        }

        .kanban-card.completed {
            opacity: 0.78;
            border-left: 1px solid var(--status-success);
        }

        .kanban-card.completed:hover {
            opacity: 0.88;
        }

        .card-done-badge {
            font-size: 10px;
            color: var(--status-success);
            padding: 3px 8px;
            border: 1px solid color-mix(in srgb, var(--status-success) 34%, transparent);
            border-radius: 999px;
            white-space: nowrap;
            background: color-mix(in srgb, var(--status-success) 10%, transparent);
        }

        .card-topic {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.45;
            color: var(--text-primary);
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-meta {
            font-family: var(--font-mono);
            font-size: 9px;
            color: var(--text-muted);
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .card-btn {
            background: color-mix(in srgb, var(--panel-bg3) 45%, transparent);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-mono);
            font-size: 9px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 8px;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .card-btn:hover {
            background: color-mix(in srgb, var(--text-secondary) 10%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .card-btn.complete:hover {
            border-color: color-mix(in srgb, var(--accent-teal) 28%, transparent);
            color: var(--text-primary);
            background: color-mix(in srgb, var(--accent-teal) 10%, transparent);
        }

        .card-btn.recover:hover {
            border-color: color-mix(in srgb, var(--status-success) 30%, transparent);
            color: var(--text-primary);
            background: color-mix(in srgb, var(--status-success) 10%, transparent);
        }
```

5. Thay block scrollbar + modal bằng đúng nội dung sau:

```css
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.14);
            border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.22);
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(4, 6, 10, 0.58);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .modal-content {
            background: color-mix(in srgb, var(--panel-bg) 74%, transparent);
            border: 1px solid var(--border-bright);
            border-radius: 16px;
            width: 480px;
            max-width: 90vw;
            box-shadow: var(--shadow-soft);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 20px 14px;
            border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
            font-family: var(--font-family);
        }

        .modal-body {
            padding: 18px 20px;
        }

        .modal-body label {
            display: block;
            color: var(--text-secondary);
            font-size: 12px;
            margin-bottom: 8px;
        }

        .modal-textarea {
            width: 100%;
            background: color-mix(in srgb, var(--bg-color) 86%, #000000 14%);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-primary);
            font-family: var(--font-family);
            font-size: 13px;
            padding: 12px;
            resize: vertical;
            min-height: 100px;
        }

        .modal-textarea:focus {
            outline: none;
            border-color: color-mix(in srgb, var(--accent-teal) 24%, var(--border-bright));
            box-shadow: none;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 14px 20px 18px;
            border-top: 1px solid var(--border-color);
        }

        .modal-btn {
            padding: 9px 16px;
            border-radius: 10px;
            font-size: 13px;
            cursor: pointer;
            border: 1px solid transparent;
            font-family: var(--font-family);
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .modal-btn-secondary {
            background: color-mix(in srgb, var(--panel-bg3) 55%, transparent);
            border-color: var(--border-color);
            color: var(--text-primary);
        }

        .modal-btn-secondary:hover {
            border-color: var(--border-bright);
            background: color-mix(in srgb, var(--accent-teal) 8%, transparent);
        }

        .modal-btn-primary {
            background: color-mix(in srgb, var(--accent-teal) 16%, var(--panel-bg3));
            color: var(--text-primary);
            font-weight: 600;
            border-color: color-mix(in srgb, var(--accent-teal) 24%, transparent);
        }

        .modal-btn-primary:hover {
            background: color-mix(in srgb, var(--accent-teal) 22%, var(--panel-bg3));
            box-shadow: none;
        }
```

- **Edge Cases Handled:** Blur chỉ nằm ở shell ổn định, nên không phá drag/drop hit testing trong `.kanban-card` và `.column-body`. Các rule `white-space` / `overflow` trên card title được giữ nguyên để tránh card height nhảy loạn trong board data dày.

### `src/webview/implementation.html`
#### [MODIFY] `src/webview/implementation.html`
- **Context:** Đây là sidebar webview chính, gom Plan Select, Agents, Airlock, Autoban, Live Feed, Terminal Operations, custom agent modal, và DB panel. File này rất dài và nhiều plan khác đang chạm vào phần script; vì vậy pass này phải giới hạn vào `<style>` block và giữ nguyên hành vi JS.
- **Logic:**
  1. **Low complexity:** cập nhật tokens, shell background, section spacing, tab chrome, agent cards, buttons, inputs, modal shells, DB panel cards.
  2. **Low complexity:** system font cho heading / labels chính, mono cho status / CLI / timestamps / DB path / counters.
  3. **Complex / Risky:** `.agent-row`, `.db-sync-fields`, và modal surfaces được xử lý theo kiểu glass solid có blur ở shell ngoài nhưng không blur nội dung cuộn nhiều tầng.
  4. **Complex / Risky:** tuyệt đối không thay `renderAgentList()`, onboarding message flow, Airlock append logic, hay bất kỳ handler nào để tránh đạp vào các plan đang chờ merge.
- **Implementation:**

1. Thay toàn bộ block `:root` hiện tại bằng block sau:

```css
        :root {
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
            --glow-green: none;
            --glow-red: none;
            --glow-green-btn: none;
            --glow-cyan: none;
            --shadow-soft: 0 16px 40px rgba(0, 0, 0, 0.24);
            --shadow-card: 0 12px 28px rgba(0, 0, 0, 0.18);
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'SFMono-Regular', 'Fira Code', 'Consolas', monospace);
        }
```

2. Thay các block shell phía trên của sidebar bằng đúng nội dung sau:

```css
        body {
            font-family: var(--font-family);
            padding: 0;
            margin: 0;
            color: var(--text-primary);
            background:
                radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 24%),
                linear-gradient(180deg, color-mix(in srgb, var(--bg-elevated) 58%, transparent) 0%, var(--bg-color) 24%, var(--bg-color) 100%);
            font-size: 13px;
            overflow-x: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            min-height: 0;
        }

        .header-section {
            padding: 16px 14px 14px;
            background: color-mix(in srgb, var(--panel-bg) 82%, transparent);
            border-bottom: 1px solid var(--border-color);
            box-shadow: none;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
        }

        .section-label {
            font-family: var(--font-family);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2.2px;
            color: var(--text-secondary);
            margin-bottom: 8px;
            font-weight: 600;
            opacity: 0.88;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .plan-select {
            width: 100%;
            background: color-mix(in srgb, var(--panel-bg3) 82%, var(--panel-bg) 18%);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 10px 12px;
            font-size: 12px;
            font-family: var(--font-family);
            outline: none;
            cursor: pointer;
            appearance: none;
            letter-spacing: 0.2px;
            border-radius: 10px;
        }

        .plan-select:hover,
        .plan-select:focus {
            border-color: var(--border-bright);
            outline: none;
        }

        .select-arrow {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            font-size: 10px;
            color: var(--text-secondary);
        }

        .sub-tab-bar {
            display: flex;
            gap: 8px;
            padding: 10px 12px 6px 12px;
            background: color-mix(in srgb, var(--panel-bg) 72%, transparent);
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        .sub-tab-btn {
            flex: 1;
            background: color-mix(in srgb, var(--panel-bg3) 40%, transparent);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.9px;
            text-transform: uppercase;
            padding: 8px 10px;
            cursor: pointer;
            border-radius: 10px;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .sub-tab-btn:hover {
            background: color-mix(in srgb, var(--text-secondary) 10%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .sub-tab-btn.is-active {
            color: var(--text-primary);
            border-color: color-mix(in srgb, var(--accent-teal) 24%, var(--border-bright));
            box-shadow: none;
            background: color-mix(in srgb, var(--accent-teal) 10%, transparent);
        }

        .agent-list {
            flex: 1;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow-y: auto;
        }

        .activity-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px 14px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .activity-row {
            border: 1px solid var(--border-color);
            background: color-mix(in srgb, var(--panel-bg2) 68%, var(--panel-bg) 32%);
            padding: 10px 12px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .activity-row.summary {
            border-color: color-mix(in srgb, var(--accent-green) 22%, var(--border-color));
            background: color-mix(in srgb, var(--accent-green-dim) 12%, var(--panel-bg) 88%);
            box-shadow: none;
        }

        .activity-summary-message {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.5;
            letter-spacing: 0.15px;
        }
```

3. Thay block agent cards / controls / inputs bằng đúng nội dung sau:

```css
        .agent-row {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: linear-gradient(180deg, color-mix(in srgb, var(--panel-bg2) 68%, rgba(255, 255, 255, 0.045) 32%) 0%, color-mix(in srgb, var(--panel-bg) 85%, transparent) 100%);
            border: 1px solid var(--vscode-contrastBorder, var(--border-color));
            padding: 12px 14px;
            border-radius: 14px;
            transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }

        .agent-row:has(.status-dot.green) {
            box-shadow: none;
            background: linear-gradient(180deg, color-mix(in srgb, var(--panel-bg2) 70%, rgba(255, 255, 255, 0.05) 30%) 0%, color-mix(in srgb, var(--accent-green-dim) 10%, var(--panel-bg) 90%) 100%);
            border-color: color-mix(in srgb, var(--accent-green) 18%, var(--border-color));
        }

        .agent-row:has(.status-dot.green-pulse) {
            box-shadow: none;
            background: linear-gradient(180deg, color-mix(in srgb, var(--panel-bg2) 70%, rgba(255, 255, 255, 0.055) 30%) 0%, color-mix(in srgb, var(--accent-green-dim) 14%, var(--panel-bg) 86%) 100%);
            border-color: color-mix(in srgb, var(--accent-green) 24%, var(--border-color));
        }

        .agent-row:has(.status-dot.red) {
            box-shadow: none;
            background: linear-gradient(180deg, color-mix(in srgb, var(--panel-bg2) 70%, rgba(255, 255, 255, 0.045) 30%) 0%, color-mix(in srgb, color-mix(in srgb, var(--accent-red) 14%, transparent) 14%, var(--panel-bg) 86%) 100%);
            border-color: color-mix(in srgb, var(--accent-red) 18%, var(--border-color));
        }

        .row-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .agent-identity {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--border-color);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: none;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .status-dot.green {
            background: var(--accent-green);
            border-color: color-mix(in srgb, var(--accent-green) 70%, #ffffff 30%);
            box-shadow: none;
        }

        .status-dot.green-pulse {
            background: var(--accent-green);
            border-color: color-mix(in srgb, var(--accent-green) 70%, #ffffff 30%);
            box-shadow: none;
            animation: pulse-green 2s infinite ease-in-out;
        }

        .status-dot.red {
            background: var(--accent-red);
            border-color: color-mix(in srgb, var(--accent-red) 70%, #ffffff 30%);
            box-shadow: none;
        }

        .status-dot.orange {
            background: var(--accent-orange);
            border-color: color-mix(in srgb, var(--accent-orange) 70%, #ffffff 30%);
        }

        .agent-name {
            font-family: var(--font-family);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            color: var(--text-primary);
        }

        .agent-row:has(.status-dot.green) .agent-name,
        .agent-row:has(.status-dot.green-pulse) .agent-name {
            color: var(--text-primary);
        }

        .locate-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-family: var(--font-mono);
            font-size: 10px;
            text-decoration: none;
            letter-spacing: 0.5px;
            padding: 0;
            opacity: 0.78;
            transition: color 0.15s ease, opacity 0.15s ease;
        }

        .locate-btn:hover {
            opacity: 1;
            color: var(--text-primary);
            text-shadow: none;
        }

        .action-btn {
            width: 100%;
            background: color-mix(in srgb, var(--panel-bg3) 50%, transparent);
            border: 1px solid color-mix(in srgb, var(--accent-teal) 16%, var(--border-color));
            color: var(--text-primary);
            text-shadow: none;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 600;
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 1.1px;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, color 0.15s ease;
            text-align: center;
            border-radius: 10px;
        }

        .action-btn:hover:not(:disabled) {
            background: color-mix(in srgb, var(--accent-teal) 12%, transparent);
            color: var(--text-primary);
            border-color: color-mix(in srgb, var(--accent-teal) 28%, transparent);
            box-shadow: none;
        }

        .mini-action-btn {
            background: color-mix(in srgb, var(--panel-bg3) 45%, transparent);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-family: var(--font-mono);
            font-size: 9px;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 8px;
            letter-spacing: 0.6px;
        }

        .mini-action-btn:hover:not(:disabled) {
            background: color-mix(in srgb, var(--text-secondary) 10%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .mini-action-btn.is-active {
            color: var(--text-primary);
            border-color: color-mix(in srgb, var(--accent-cyan) 26%, var(--border-bright));
            box-shadow: none;
            background: color-mix(in srgb, var(--accent-cyan) 10%, transparent);
        }

        .agent-input {
            width: 100%;
            background: color-mix(in srgb, var(--bg-dim) 78%, var(--panel-bg) 22%);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 11px;
            padding: 10px 12px;
            resize: none;
            height: 52px;
            margin-bottom: 4px;
            border-radius: 10px;
            line-height: 1.45;
        }

        .agent-input:focus,
        .agent-input:hover {
            border-color: color-mix(in srgb, var(--accent-green) 22%, var(--border-bright));
            outline: none;
        }
```

4. Thay block system sections / modal / DB panel bằng đúng nội dung sau:

```css
        .status-footer {
            padding: 8px 12px;
            background: color-mix(in srgb, var(--panel-bg) 78%, transparent);
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
            letter-spacing: 0.5px;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
        }

        .system-section,
        .startup-section {
            padding: 12px;
            background: color-mix(in srgb, var(--panel-bg) 76%, transparent);
            border-top: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            gap: 8px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        .panel-fields,
        .startup-fields {
            display: none;
            flex-direction: column;
            gap: 8px;
        }

        .panel-fields.open,
        .startup-fields.open {
            display: flex;
        }

        .secondary-btn {
            background: color-mix(in srgb, var(--panel-bg3) 48%, transparent);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 10px 12px;
            font-size: 10px;
            font-family: var(--font-mono);
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
            box-shadow: none;
            border-radius: 10px;
        }

        .secondary-btn:hover {
            background: color-mix(in srgb, var(--border-bright) 10%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .secondary-btn.is-cyan,
        .secondary-btn.is-teal,
        .secondary-btn.success,
        .secondary-btn.error {
            box-shadow: none;
        }

        .startup-row label {
            display: block;
            font-size: 10px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.9px;
            font-family: var(--font-mono);
            margin-bottom: 2px;
        }

        .startup-row input {
            width: 100%;
            background: color-mix(in srgb, var(--bg-dim) 78%, var(--panel-bg) 22%);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 7px 10px;
            font-family: var(--font-mono);
            font-size: 11px;
            border-radius: 10px;
        }

        .startup-row input:focus,
        .startup-row input:hover {
            border-color: var(--border-bright);
            outline: none;
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(4, 6, 10, 0.58);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            padding: 12px;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }

        .modal-card {
            width: 100%;
            max-width: 800px;
            background: color-mix(in srgb, var(--panel-bg) 74%, transparent);
            border: 1px solid var(--border-bright);
            border-radius: 18px;
            padding: 16px;
            box-shadow: var(--shadow-soft);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .modal-title {
            font-family: var(--font-family);
            letter-spacing: 1.2px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 12px;
            text-transform: uppercase;
        }

        .modal-label {
            display: block;
            margin-bottom: 6px;
            font-size: 10px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: var(--font-mono);
        }

        .modal-input,
        .modal-textarea {
            width: 100%;
            background: color-mix(in srgb, var(--bg-dim) 76%, var(--panel-bg) 24%);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 10px 12px;
            font-family: var(--font-mono);
            font-size: 11px;
            margin-bottom: 12px;
            border-radius: 10px;
        }

        .modal-input:hover,
        .modal-input:focus,
        .modal-textarea:hover,
        .modal-textarea:focus {
            border-color: var(--border-bright);
            outline: none;
        }

        .recover-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            margin-bottom: 6px;
            font-size: 11px;
            background: color-mix(in srgb, var(--panel-bg3) 36%, transparent);
        }

        .recover-status-chip {
            display: inline-block;
            font-size: 9px;
            padding: 2px 7px;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: var(--font-mono);
        }

        .recover-restore-btn {
            flex-shrink: 0;
            margin-left: 8px;
            padding: 5px 10px;
            font-size: 10px;
            font-family: var(--font-mono);
            background: color-mix(in srgb, var(--accent-green) 10%, transparent);
            color: var(--text-primary);
            border: 1px solid color-mix(in srgb, var(--accent-green) 22%, transparent);
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .recover-restore-btn:hover {
            background: color-mix(in srgb, var(--accent-green) 14%, transparent);
        }

        .db-sync-fields {
            display: none;
            flex-direction: column;
            gap: 14px;
            padding: 14px;
            background: color-mix(in srgb, var(--panel-bg2) 82%, transparent);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 14px 14px;
            margin-top: -1px;
        }

        .db-subsection {
            padding: 14px;
            border: 1px solid var(--border-dim);
            border-radius: 12px;
            background: color-mix(in srgb, var(--panel-bg3) 34%, transparent);
        }

        .db-subsection:last-child {
            border-bottom: 1px solid var(--border-dim);
            padding-bottom: 14px;
        }

        .subsection-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-mono);
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .db-status-badge {
            margin-left: auto;
            padding: 3px 9px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: var(--bg-dim);
            color: var(--text-secondary);
            border: 1px solid var(--border-dim);
        }

        .db-path-display {
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-secondary);
            background: var(--bg-dim);
            padding: 8px 10px;
            border-radius: 10px;
            word-break: break-all;
            margin-bottom: 10px;
            border: 1px solid var(--border-dim);
        }

        .db-radio-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 11px;
            color: var(--text-secondary);
            transition: background 0.15s ease, color 0.15s ease;
        }

        .db-radio-option:hover {
            background: var(--bg-dim);
            color: var(--text-primary);
        }

        .db-custom-path-input {
            width: 100%;
            padding: 8px 10px;
            font-family: var(--font-mono);
            font-size: 10px;
            background: var(--bg-dim);
            border: 1px solid var(--border-dim);
            border-radius: 10px;
            color: var(--text-primary);
            margin-top: 6px;
        }

        .db-cli-tool-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            background: var(--bg-dim);
            border-radius: 10px;
            padding: 8px 10px;
            border: 1px solid var(--border-dim);
        }

        .db-quick-actions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 6px;
        }

        .db-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 10px 6px;
            border: 1px solid var(--border-dim);
            background: color-mix(in srgb, var(--bg-dim) 78%, var(--panel-bg) 22%);
            color: var(--text-secondary);
            border-radius: 10px;
            cursor: pointer;
            font-size: 9px;
            text-align: center;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
            text-transform: uppercase;
            font-weight: 600;
        }

        .db-action-btn:hover {
            background: color-mix(in srgb, var(--border-dim) 80%, transparent);
            border-color: var(--border-bright);
            color: var(--text-primary);
        }

        .db-secondary-btn,
        .db-primary-btn {
            border-radius: 10px;
        }

        .db-secondary-btn {
            padding: 6px 12px;
            font-size: 10px;
            background: var(--bg-dim);
            color: var(--text-secondary);
            border: 1px solid var(--border-dim);
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .db-secondary-btn:hover {
            border-color: var(--border-bright);
            background: var(--border-dim);
            color: var(--text-primary);
        }

        .db-primary-btn {
            width: 100%;
            padding: 8px 10px;
            font-size: 11px;
            margin-top: 10px;
            background: color-mix(in srgb, var(--accent-green) 8%, transparent);
            color: var(--text-primary);
            border: 1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border-dim));
            cursor: pointer;
            font-family: var(--font-mono);
            letter-spacing: 1px;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .db-primary-btn:hover:not(:disabled) {
            border-color: color-mix(in srgb, var(--accent-green) 28%, transparent);
            color: var(--text-primary);
            background: color-mix(in srgb, var(--accent-green) 12%, transparent);
        }
```

5. Giữ nguyên toàn bộ phần script của file này. Không sửa các block sau trong pass này:

```text
- renderAgentList()
- switchAgentTab()
- onboarding message handlers
- Airlock panel construction logic
- DB sync message handlers
```

- **Edge Cases Handled:** Việc khóa thay đổi ở style blocks giảm trực tiếp rủi ro merge với các plan Airlock / onboarding / DB đang chạm cùng file. `agent-row` được restyle mà không đổi cấu trúc DOM, nên Airlock, standard agents, và Autoban phụ đều hưởng cùng visual language mà không cần tách nhánh logic.

### `update_styles.js`
#### [MODIFY] `update_styles.js`
- **Context:** File này không phải user-facing UI, nhưng nó rewrite trực tiếp `:root` của `src/webview/kanban.html` và `src/webview/implementation.html`, đồng thời force một số replacement rất hung hãn (`border-radius: 6px`, xóa shadow theo regex). Nếu bỏ qua file này, visual refactor ở hai webview trên không bền.
- **Logic:**
  1. **Low complexity:** cập nhật `sleekRootKanban` và `sleekRootImplementation` để đồng bộ token block với spec ở hai file HTML.
  2. **Complex / Risky:** bỏ blanket replacement ép mọi `border-radius` về `6px` và regex strip `box-shadow` quá rộng. Chỉ giữ các replacement thật sự an toàn (ví dụ loại gradient cũ hoặc đổi dashed outline sang solid outline).
  3. **Clarification:** đây không phải thêm scope mới. Đây là phần bắt buộc để tránh script nội bộ phá style mới sau triển khai.
- **Implementation:**

1. Thay hai constant `sleekRootKanban` và `sleekRootImplementation` bằng đúng nội dung sau:

```javascript
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
            --glow-green: none;
            --glow-red: none;
            --glow-green-btn: none;
            --glow-cyan: none;
            --shadow-soft: 0 16px 40px rgba(0, 0, 0, 0.24);
            --shadow-card: 0 12px 28px rgba(0, 0, 0, 0.18);
            --font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif);
            --font-mono: var(--vscode-editor-font-family, 'SFMono-Regular', 'Fira Code', 'Consolas', monospace);
        }`;
```

2. Thay thân hàm `replaceRoot()` bằng đúng phiên bản sau:

```javascript
function replaceRoot(filePath, newRoot) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /:root\s*\{[^}]+\}/;
    if (regex.test(content)) {
        content = content.replace(regex, newRoot);

        // Chỉ giữ các rewrite thật sự an toàn và không phá radius / shadow chủ đích.
        content = content.replace(/background:\s*linear-gradient[^;]+;/g, 'background: var(--panel-bg2);');
        content = content.replace(/outline:\s*1px\s*dashed\s*[^;]+;/g, 'outline: 1px solid var(--accent-teal-dim);');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`Could not find :root in ${filePath}`);
    }
}
```

- **Edge Cases Handled:** Loại bỏ blanket radius/shadow rewrites giúp spec 8px/10px/12px/14px không bị script kéo ngược về `6px`. Đồng thời script vẫn giữ được vai trò sync root tokens nếu team còn dùng nó trong workflow nội bộ.

## Verification Plan
### Automated Tests
- Chạy `npm run compile` để chắc chắn webview HTML vẫn bundle và không có syntax break do CSS block edits.
- Nếu team còn dùng script sync style, chạy `node update_styles.js` rồi re-open diff của `src/webview/kanban.html` và `src/webview/implementation.html` để xác nhận script không còn phá radius/shadow/token mới.

### Manual Verification
- Mở sidebar `Switchboard` và `OPEN AUTOBAN`; kiểm tra top bars, cards, buttons, modal, DB panel đều theo cùng ngôn ngữ titanium / glassy mới.
- Kiểm tra Dark Mode trong VS Code với tối thiểu hai theme tối khác nhau để xác nhận token bám theo `var(--vscode-...)` vẫn readable.
- Hover và focus qua `workspace-select`, tab buttons, plan select, action buttons, card buttons, modal inputs để chắc chắn hover state không phát sáng quá tay và border vẫn đủ nét.
- Kéo thả plan cards giữa các cột trong Kanban để xác nhận visual refresh không làm lệch hit area hoặc làm card drag ghost khó nhìn.
- Mở modal trong `kanban.html` và modal trong `implementation.html`; xác nhận blur chỉ nằm ở shell và text vẫn rõ trên nền tối.
- Kiểm tra các vùng data-dense: card title dài, metadata dài, DB path dài, custom agent entries, live feed items, Airlock panel. Mục tiêu là “mát mắt” nhưng vẫn đọc được trong use case thực, không chỉ trong screenshot.
- Giữ nguyên các expectation gốc của plan: Webview phải ăn khớp với Dark Mode, `backdrop-filter` phải mượt, contrast ratio phải ổn, và tổng thể phải đạt cảm giác “Mát mắt”, “Gọn gàng”, “Sang trọng”.

## Recommended Agent
Send to Coder

## Reviewer Pass Update
### Review Date
- 2026-04-10

### Grumpy Findings
- **MAJOR** `update_styles.js:73-84` vẫn dùng rewrite hậu xử lý lên toàn file sau khi sync token. Bản đầu còn ép `border-radius`, bản sửa giữa chừng lại tiếp tục regex-càn `background: linear-gradient...`, kết quả là style tooling tự tay đập vỡ các gradient surface chủ đích ở webview. Đúng kiểu “sơn nhà xong tự thuê người tới cạo tường”.
- **MAJOR** `src/webview/implementation.html:322-355` trước khi fix, `agent-row` và state variants bị script flatten thành `background: var(--panel-bg2)`, làm mất visual hierarchy mà plan yêu cầu cho agent cards. Glass vibe biến thành miếng carton mờ mờ, rất tiếc nhưng đúng là vậy.
- **MAJOR** `src/webview/implementation.html:530-541` và các block status cũ trước khi fix còn lệ thuộc `--status-success` dù token mới không còn khai báo trong `:root`. UI kiểu này nhìn thì tưởng chỉ là màu, nhưng runtime lại thành “cầu nguyện cho CSS fallback cứu mình”. Không ổn.
- **MAJOR** `src/webview/kanban.html:291-307`, `503-558` trước khi fix vẫn còn các điểm neon/glow cứng ở selected states, icon hover, routing badges, và hard-coded highlight treatment lệch hẳn khỏi hướng muted titanium trong plan. Apple Glassy mà nhá đèn như cyber cafe thì thôi xong.

### Balanced Synthesis
- Giữ lại phần tốt: token palette mới cho cả hai webview, blur được giới hạn vào shell surfaces chính, và đa số typography/spacings đã đi đúng hướng minimal hơn.
- Phải fix ngay: script `update_styles.js` không được phép rewrite quá rộng sau khi sync `:root`; các agent/card surfaces cần được khôi phục đúng gradient/muted states; những điểm hard-coded neon/glow cần kéo về cùng visual language.
- Có thể defer: manual QA trong VS Code thực tế với nhiều dark theme và interaction drag/drop vẫn chưa chạy được trong môi trường CLI này, nên phần đó giữ thành risk cần confirm bằng mắt.

### Fixes Applied
- Cập nhật `src/webview/implementation.html` để hoàn thiện các block style material theo plan: shell/header, tabs, agent cards, controls, modal, DB panel, status footer.
- Khôi phục gradient và state treatment cho agent cards ở `src/webview/implementation.html:322-355`, thay vì để script flatten toàn bộ về `var(--panel-bg2)`.
- Chuẩn hóa button chrome và footer treatment ở `src/webview/implementation.html:440-463` và `src/webview/implementation.html:530-541` theo muted titanium styling, đồng thời bỏ phụ thuộc màu trạng thái lỗi thời.
- Cập nhật `src/webview/kanban.html:291-307` để giữ card surface gradient đúng spec và chỉnh selected/icon hover states ở `src/webview/kanban.html:503-558` về muted, không glow-heavy.
- Sửa `update_styles.js:73-84` để script chỉ sync `:root` và rewrite dashed outline an toàn; loại bỏ các blanket rewrites phá radius/shadow/gradient chủ đích.

### Files Changed
- `src/webview/implementation.html`
- `src/webview/kanban.html`
- `update_styles.js`

### Validation Results
- `node update_styles.js`: PASS
  Script sync chạy thành công sau khi sửa syntax và không còn phá gradient/radius của các surface đã chỉnh.
- `npm run compile`: PASS
  Đã sửa lỗi syntax tại `src/services/TaskViewerProvider.ts(3038-3039)` do cặp backtick rác lọt vào giữa `Promise.all(...)`. Sau khi xóa typo này, webpack compile thành công.

### Remaining Risks
- Chưa chạy manual verification trong VS Code/webview thật nên chưa xác nhận bằng mắt các trạng thái hover, drag/drop, modal blur và contrast trên nhiều dark themes.
- `update_styles.js` vẫn tiếp tục sync cả `src/webview/review.html`; file đó ngoài scope plan này nhưng vẫn bị script chạm tới theo workflow hiện tại.
- Worktree đang có thay đổi ngoài plan ở các file khác; pass này không revert hay can thiệp vào chúng theo đúng policy.

### Verdict
- Ready.
