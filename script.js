const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const clearBtn = document.getElementById("clear-btn");

const defaultText = "# Welcome to the Markdown Editor\n\nType on the left side, and preview the formatted result on the right.\n\n- Supports **bold**, *italics*\n- Bullet lists\n- `inline` code and block code";

const savedContent = localStorage.getItem("markdown_content") || defaultText;
editor.value = savedContent;

function renderMarkdown() {
  const text = editor.value;
  preview.innerHTML = marked.parse(text);
  localStorage.setItem("markdown_content", text);
}

editor.addEventListener("input", renderMarkdown);

clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all content?")) {
    editor.value = "";
    renderMarkdown();
  }
});

renderMarkdown();