const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const resizer = document.getElementById("resizer");
const themeBtn = document.getElementById("theme-btn");
const themeIcon = themeBtn.querySelector("i");

const clearBtn = document.getElementById("clear-btn");
const clearModal = document.getElementById("clear-modal");
const cancelClearBtn = document.getElementById("cancel-clear");
const confirmClearBtn = document.getElementById("confirm-clear");

const exportMDBtn = document.getElementById("export-md-btn");
const exportHTMLBtn = document.getElementById("export-html-btn");
const copyHTMLBtn = document.getElementById("copy-html-btn");

const hljsLight = document.getElementById("hljs-light");
const hljsDark = document.getElementById("hljs-dark");

const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");

// 1. Initial Content & Persistence
const defaultText = `# Welcome to Markdown Studio\n\nType on the left side, and watch the live preview on the right.\n\n## Syntax Highlighting Example\n\n\`\`\`javascript\nfunction greet(name) {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet("World");\n\`\`\`\n\n\`\`\`python\ndef add(a, b):\n    return a + b\n\nprint(add(5, 3))\n\`\`\``;

const savedContent = localStorage.getItem("markdown_content") || defaultText;
editor.value = savedContent;

// Word and Character Counter
function updateStats() {
  const text = editor.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  wordCountEl.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  charCountEl.textContent = `${chars} ${chars === 1 ? "character" : "characters"}`;
}

// Render Markdown, apply syntax highlighting, update counters
function renderMarkdown() {
  const text = editor.value;
  preview.innerHTML = marked.parse(text);
  
  preview.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });

  updateStats();
  localStorage.setItem("markdown_content", text);
}

editor.addEventListener("input", renderMarkdown);

// 2. Resizer Logic
let isResizing = false;

resizer.addEventListener("mousedown", () => {
  isResizing = true;
  resizer.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

window.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const containerRect = document.querySelector(".editor-container").getBoundingClientRect();
  const relativeX = e.clientX - containerRect.left;
  let percentage = (relativeX / containerRect.width) * 100;

  if (percentage < 15) percentage = 15;
  if (percentage > 85) percentage = 85;

  editor.style.width = `${percentage}%`;
  preview.style.width = `${100 - percentage}%`;
});

window.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    resizer.classList.remove("dragging");
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }
});

// 3. Theme Switcher Logic
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("markdown_theme", theme);

  if (theme === "dark") {
    themeIcon.className = "fa-solid fa-sun";
    hljsLight.disabled = true;
    hljsDark.disabled = false;
  } else {
    themeIcon.className = "fa-solid fa-moon";
    hljsLight.disabled = false;
    hljsDark.disabled = true;
  }
}

const savedTheme = localStorage.getItem("markdown_theme") || "light";
setTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

// 4. Modal Warning Logic
clearBtn.addEventListener("click", () => {
  clearModal.classList.add("active");
});

cancelClearBtn.addEventListener("click", () => {
  clearModal.classList.remove("active");
});

clearModal.addEventListener("click", (e) => {
  if (e.target === clearModal) clearModal.classList.remove("active");
});

confirmClearBtn.addEventListener("click", () => {
  editor.value = "";
  renderMarkdown();
  clearModal.classList.remove("active");
});

// 5. Export Functionality (.md & .html)
function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

exportMDBtn.addEventListener("click", () => {
  const text = editor.value;
  if (!text.trim()) {
    alert("There is no content to export!");
    return;
  }
  downloadFile("document.md", text, "text/markdown");
});

exportHTMLBtn.addEventListener("click", () => {
  const text = editor.value;
  if (!text.trim()) {
    alert("There is no content to export!");
    return;
  }

  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported Document</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  line-height: 1.6;
  color: #0f172a;
}
pre {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}
code {
  font-family: ui-monospace, monospace;
}
</style>
</head>
<body>
${marked.parse(text)}
</body>
</html>`;

  downloadFile("document.html", htmlDocument, "text/html");
});

// 6. Copy HTML Logic
copyHTMLBtn.addEventListener("click", async () => {
  const text = editor.value;
  if (!text.trim()) {
    alert("There is no content to copy!");
    return;
  }

  const htmlContent = marked.parse(text);

  try {
    await navigator.clipboard.writeText(htmlContent);
    const originalContent = copyHTMLBtn.innerHTML;
    copyHTMLBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';
    
    setTimeout(() => {
      copyHTMLBtn.innerHTML = originalContent;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy HTML: ", err);
  }
});

// Initial render
renderMarkdown();