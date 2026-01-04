// ===== QR Splash Overlay =====
window.addEventListener("load", () => {
    const qrSplash = document.getElementById("qrSplash");
    const closeBtn = document.getElementById("closeQrBtn");
    const mainUI = document.getElementById("mainUI");

    mainUI.classList.add("blur");

    setTimeout(() => {
        qrSplash.style.display = "none";
        mainUI.classList.remove("blur");
    }, 5000);

    closeBtn.addEventListener("click", () => {
        qrSplash.style.display = "none";
        mainUI.classList.remove("blur");
    });
});

// ===== Elements =====
const input = document.getElementById("images");
const dropZone = document.getElementById("drop-zone");
const preview = document.getElementById("preview");
const fileCount = document.getElementById("file-count");
const error = document.getElementById("error");
const loading = document.getElementById("loading");
const extractBtn = document.getElementById("extractBtn");
const resultArea = document.getElementById("result");
let uploadedFiles = [];

// ===== Handle Files =====
function handleFiles(files) {
    for (const file of files) {
        if (uploadedFiles.length >= 5) break;
        uploadedFiles.push(file);

        const div = document.createElement("div");
        div.classList.add("preview-item");

        let content;
        if (file.type === "application/pdf") {
            content = document.createElement("div");
            content.innerText = "PDF";
        } else {
            content = document.createElement("img");
            content.src = URL.createObjectURL(file);
        }

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "×";
        removeBtn.className = "remove-btn";
        removeBtn.onclick = () => {
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            div.remove();
            updateFileCount();
        };

        div.appendChild(content);
        div.appendChild(removeBtn);
        preview.appendChild(div);
    }
    updateFileCount();
}

function updateFileCount() {
    fileCount.innerText = `${uploadedFiles.length} / 5 files uploaded`;
}

// ===== Input change =====
input.addEventListener("change", () => handleFiles([...input.files]));

// ===== Drag & Drop =====
dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles([...e.dataTransfer.files]);
});
dropZone.addEventListener("click", () => input.click());

// ===== Paste =====
document.getElementById("pasteBtn").addEventListener("click", async () => {
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            for (const type of item.types) {
                if (type.startsWith("image/")) {
                    if (uploadedFiles.length >= 5) return alert("Max 5 files");
                    const blob = await item.getType(type);
                    handleFiles([new File([blob], `pasted-${Date.now()}.png`, {type})]);
                    return;
                }
            }
        }
        alert("No image found in clipboard");
    } catch {
        alert("Clipboard access denied");
    }
});

// ===== Ctrl/Cmd + V =====
window.addEventListener("paste", (e) => {
    const files = [];
    for (let item of e.clipboardData.items) {
        if (item.type.startsWith("image/")) files.push(item.getAsFile());
    }
    if (files.length) handleFiles(files);
});

// ===== Clear =====
document.getElementById("clearBtn").addEventListener("click", () => {
    uploadedFiles = [];
    preview.innerHTML = "";
    input.value = "";
    resultArea.value = "";
    error.innerText = "";
    updateFileCount();
});

// ===== Copy =====
document.getElementById("copyBtn").addEventListener("click", () => {
    resultArea.select();
    document.execCommand("copy");
    alert("Text copied");
});

// ===== Extract =====
extractBtn.addEventListener("click", async () => {
    if (!uploadedFiles.length) return error.innerText = "Upload at least 1 file";
    error.innerText = "";
    loading.innerText = "Extracting...";
    extractBtn.disabled = true;

    const formData = new FormData();
    uploadedFiles.forEach(f => formData.append("files", f));

    try {
        const res = await fetch("https://text-generators-9wz7.onrender.com/ocr", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        resultArea.value = data.text || data.error;
    } catch (e) {
        console.error(e);
        error.innerText = "Server error. Is backend running?";
    }

    loading.innerText = "";
    extractBtn.disabled = false;
});
