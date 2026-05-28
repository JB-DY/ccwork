#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 직접 실행: node check-design-system.js <path>
// hook 실행: CLAUDE_TOOL_INPUT={"file_path":"..."} node check-design-system.js
let filePath = process.argv[2];
if (!filePath) {
  try {
    const input = JSON.parse(process.env.CLAUDE_TOOL_INPUT || '{}');
    filePath = input.file_path || input.path;
  } catch {}
}
if (!filePath) process.exit(0);

const ext = path.extname(filePath).toLowerCase();
if (!['.tsx', '.jsx', '.css', '.ts'].includes(ext)) process.exit(0);

let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch {
  process.exit(0);
}

// ── 승인된 토큰 목록 ────────────────────────────────────────────────────────

const APPROVED_HEX = new Set([
  // surface 계층
  '#ffffff', '#f8f9fa', '#f1f4f6', '#eaeff1', '#e2e9ec', '#dbe4e7',
  // text
  '#2b3437', '#586064',
  // accent
  '#0053dc', '#3e76fe', '#faf8ff',
  // outline
  '#abb3b7',
]);

// rgba는 패턴으로 허용 목록 관리
const APPROVED_RGBA = [
  /rgba\(171,\s*179,\s*183,\s*0\.15\)/,   // ghost border
  /rgba\(248,\s*249,\s*250,\s*0\.[89]\d*\)/, // glassmorphism surface
  /rgba\(43,\s*52,\s*55,\s*0\.0[3-9]\d*\)/, // ambient shadow
  /rgba\(43,\s*52,\s*55,\s*0\.[12]\d*\)/,   // overlay
  /\[#0053dc\]\/\[0\.02\]/,                 // ghost button hover
];

// Tailwind arbitrary spacing 허용값 (spacing.md 기준)
const APPROVED_SPACING_ARBITRARY = new Set([
  '0.35rem', '0.7rem', '1.05rem', '1.4rem', '2.1rem', '2.8rem', '3.5rem',
  '5.6px', '11.2px', '16.8px', '22.4px', '33.6px', '44.8px', '56px',
]);

// ── 검사 ────────────────────────────────────────────────────────────────────

const warnings = [];
const lines = content.split('\n');

lines.forEach((line, i) => {
  const num = i + 1;

  // 1. hard-coded hex 색상
  for (const match of line.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    const color = match[0].toLowerCase();
    if (!APPROVED_HEX.has(color)) {
      warnings.push(`  Line ${num}: 미승인 색상 "${color}" → colors.md 토큰을 확인하세요`);
    }
  }

  // 2. rgb() — rgba()는 아래서 별도 처리
  if (/(?<!\w)rgb\s*\(/.test(line)) {
    warnings.push(`  Line ${num}: rgb() 사용 → colors.md 토큰 hex 값으로 교체하세요`);
  }

  // 3. rgba() — 승인 목록에 없는 경우만 경고
  for (const match of line.matchAll(/rgba\([^)]+\)/g)) {
    const val = match[0];
    const approved = APPROVED_RGBA.some(pattern => pattern.test(val));
    if (!approved) {
      warnings.push(`  Line ${num}: 미승인 rgba() "${val}" → colors.md 토큰을 확인하세요`);
    }
  }

  // 4. hsl()
  if (/(?<!\w)hsla?\s*\(/.test(line)) {
    warnings.push(`  Line ${num}: hsl() 사용 → colors.md 토큰 hex 값으로 교체하세요`);
  }

  // 5. Tailwind arbitrary spacing 값
  const spacingPropPattern = /(?:^|[\s"'`])((?:p|m|gap|space|top|left|right|bottom|inset|px|py|mx|my|mt|mb|ml|mr|pt|pb|pl|pr|w|h|min-w|max-w|min-h|max-h)-\[([^\]]+)\])/g;
  for (const match of line.matchAll(spacingPropPattern)) {
    const fullClass = match[1];
    const value = match[2].trim();

    // 색상값, 퍼센트, calc, auto, CSS 변수 등은 제외
    if (/^(auto|calc|100%|50%|33%|25%|75%|full|screen|min|max|fit|var\(|--)/.test(value)) continue;
    if (/[a-zA-Z]{2,}/.test(value) && !/rem|px|em|vh|vw/.test(value)) continue;
    if (/rgba?|hsl|#/.test(value)) continue;

    if (!APPROVED_SPACING_ARBITRARY.has(value)) {
      warnings.push(`  Line ${num}: 미승인 spacing "${fullClass}" → spacing.md 스케일을 확인하세요`);
    }
  }
});

// ── 출력 ────────────────────────────────────────────────────────────────────

if (warnings.length > 0) {
  const header = `\n🎨 Design System Check — ${path.basename(filePath)} (${warnings.length}건)\n${'─'.repeat(55)}`;
  process.stderr.write(header + '\n');
  warnings.forEach(w => process.stderr.write(w + '\n'));
  process.stderr.write('\n');
}

process.exit(0);
