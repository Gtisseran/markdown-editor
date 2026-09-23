const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const resizer = document.getElementById("resizer");
const themeBtn = document.getElementById("theme-btn");
const themeIcon = themeBtn ? themeBtn.querySelector("i") : null;

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

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage issues in private browsing / restricted environments.
    }
  },
};

const defaultText = `# Welcome to Markdown Studio

Type on the left side, and watch the live preview on the right.

## Syntax Highlighting Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

\`\`\`python
def add(a, b):
    return a + b

print(add(5, 3))
\`\`\``;

if (!editor || !preview) {
  throw new Error("Required editor elements were not found.");
}

if (window.marked) {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}

const savedContent = safeStorage.get("markdown_content") || defaultText;
editor.value = savedContent;

function updateStats() {
  const text = editor.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (wordCountEl) {
    wordCountEl.textContent = `${words} ${words === 1 ? "word" : "words"}`;
  }

  if (charCountEl) {
    charCountEl.textContent = `${chars} ${chars === 1 ? "character" : "characters"}`;
  }
}

function renderMarkdown() {
  const text = editor.value;

  if (window.marked) {
    preview.innerHTML = marked.parse(text);
  } else {
    preview.textContent = text;
  }

  if (window.hljs) {
    preview.querySelectorAll("pre code").forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }

  updateStats();
  safeStorage.set("markdown_content", text);
}

editor.addEventListener("input", renderMarkdown);

let isResizing = false;

if (resizer) {
  resizer.addEventListener("mousedown", () => {
    isResizing = true;
    resizer.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });
}

window.addEventListener("mousemove", (e) => {
  if (!isResizing || !resizer) return;
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
    if (resizer) {
      resizer.classList.remove("dragging");
    }
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }
});

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  safeStorage.set("markdown_theme", theme);

  if (theme === "dark") {
    if (themeIcon) {
      themeIcon.className = "fa-solid fa-sun";
    }
    if (hljsLight) hljsLight.disabled = true;
    if (hljsDark) hljsDark.disabled = false;
  } else {
    if (themeIcon) {
      themeIcon.className = "fa-solid fa-moon";
    }
    if (hljsLight) hljsLight.disabled = false;
    if (hljsDark) hljsDark.disabled = true;
  }
}

const savedTheme = safeStorage.get("markdown_theme") || "light";
setTheme(savedTheme);

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    clearModal.classList.add("active");
  });
}

if (cancelClearBtn) {
  cancelClearBtn.addEventListener("click", () => {
    clearModal.classList.remove("active");
  });
}

if (clearModal) {
  clearModal.addEventListener("click", (e) => {
    if (e.target === clearModal) clearModal.classList.remove("active");
  });
}

if (confirmClearBtn) {
  confirmClearBtn.addEventListener("click", () => {
    editor.value = "";
    renderMarkdown();
    clearModal.classList.remove("active");
  });
}

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

if (exportMDBtn) {
  exportMDBtn.addEventListener("click", () => {
    const text = editor.value;
    if (!text.trim()) {
      alert("There is no content to export!");
      return;
    }
    downloadFile("document.md", text, "text/markdown");
  });
}

if (exportHTMLBtn) {
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
${window.marked ? marked.parse(text) : text}
</body>
</html>`;

    downloadFile("document.html", htmlDocument, "text/html");
  });
}

if (copyHTMLBtn) {
  copyHTMLBtn.addEventListener("click", async () => {
    const text = editor.value;
    if (!text.trim()) {
      alert("There is no content to copy!");
      return;
    }

    const htmlContent = window.marked ? marked.parse(text) : text;

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
}

renderMarkdown();