// ===== QR Splash Overlay =====
window.addEventListener("load", () => {
    const qrSplash = document.getElementById("qrSplash");
    const closeBtn = document.getElementById("closeQrBtn");
    const mainUI = document.getElementById("mainUI");

    if (!qrSplash || !mainUI) return;

    mainUI.classList.add("blur");

    setTimeout(() => {
        qrSplash.style.display = "none";
        mainUI.classList.remove("blur");
    }, 5000);

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            qrSplash.style.display = "none";
            mainUI.classList.remove("blur");
        });
    }
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
        div.className = "preview-item";

        let content;
        if (file.type === "application/pdf") {
            content = document.createElement("div");
            content.innerText = "PDF";
            content.className = "pdf-preview";
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
    if (fileCount) {
        fileCount.innerText = `${uploadedFiles.length} / 5 files uploaded`;
    }
}

// ===== Input Change =====
if (input) {
    input.addEventListener("change", () => handleFiles([...input.files]));
}

// ===== Drag & Drop =====
if (dropZone) {
    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        handleFiles([...e.dataTransfer.files]);
    });

    dropZone.addEventListener("click", () => input && input.click());
}

// ===== Paste Button =====
const pasteBtn = document.getElementById("pasteBtn");
if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith("image/")) {
                        if (uploadedFiles.length >= 5) {
                            alert("Maximum 5 files allowed");
                            return;
                        }
                        const blob = await item.getType(type);
                        handleFiles([
                            new File([blob], `pasted-${Date.now()}.png`, { type })
                        ]);
                        return;
                    }
                }
            }
            alert("No image found in clipboard");
        } catch {
            alert("Clipboard access denied");
        }
    });
}

// ===== Ctrl / Cmd + V =====
window.addEventListener("paste", e => {
    const files = [];
    for (const item of e.clipboardData.items) {
        if (item.type.startsWith("image/")) {
            files.push(item.getAsFile());
        }
    }
    if (files.length) handleFiles(files);
});

// ===== Clear =====
const clearBtn = document.getElementById("clearBtn");
if (clearBtn) {
    clearBtn.addEventListener("click", () => {
        uploadedFiles = [];
        preview.innerHTML = "";
        input.value = "";
        resultArea.value = "";
        error.innerText = "";
        updateFileCount();
    });
}

// ===== Copy =====
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        resultArea.select();
        document.execCommand("copy");
        alert("Text copied");
    });
}

// ===== Extract OCR =====
extractBtn.addEventListener("click", async () => {
    if (!uploadedFiles.length) {
        error.innerText = "Upload at least 1 file";
        return;
    }

    error.innerText = "";
    loading.innerText = "Extracting...";
    extractBtn.disabled = true;

    const formData = new FormData();
    uploadedFiles.forEach(f => formData.append("files", f));

    try {
        const res = await fetch("https://khmer-ocr.onrender.com/ocr", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Backend error");
        }

        const data = await res.json();
        resultArea.value = data.text || data.error || "No text found";

    } catch (e) {
        console.error(e);
        error.innerText = "Server error. Backend may be sleeping. Try again.";
    }

    loading.innerText = "";
    extractBtn.disabled = false;
});
