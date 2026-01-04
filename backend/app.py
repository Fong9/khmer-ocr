from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from pdf2image import convert_from_path
import pytesseract, os, uuid, sys, shutil

app = Flask(__name__)
CORS(app)  # allow frontend requests

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------------------------
# Cross-platform Tesseract
# --------------------------
def find_tesseract():
    # 1. Check if pytesseract can find it in PATH
    tesseract_path = shutil.which("tesseract")
    if tesseract_path:
        return tesseract_path

    # 2. Common paths per OS
    if sys.platform.startswith("win"):
        possible = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(possible):
            return possible
    elif sys.platform.startswith("darwin"):  # macOS
        possible = "/opt/homebrew/bin/tesseract"
        if os.path.exists(possible):
            return possible
    else:  # Linux
        possible = "/usr/bin/tesseract"
        if os.path.exists(possible):
            return possible

    # 3. Not found
    raise RuntimeError(
        "Tesseract executable not found. Install Tesseract and make sure it's in your PATH."
    )

pytesseract.pytesseract.tesseract_cmd = "tesseract"

# --------------------------
# OCR endpoint
# --------------------------
@app.route("/ocr", methods=["POST"])
def ocr():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error":"No files uploaded"}), 400
    if len(files) > 5:
        return jsonify({"error":"Max 5 files allowed"}), 400

    texts = []
    for f in files:
        filename = f"{uuid.uuid4()}_{f.filename}"
        path = os.path.join(UPLOAD_DIR, filename)
        f.save(path)

        try:
            if filename.lower().endswith(".pdf"):
                pages = convert_from_path(path)
                for i, page in enumerate(pages, 1):
                    texts.append(f"\n--- {f.filename} Page {i} ---\n" +
                                 pytesseract.image_to_string(page, lang="khm+eng"))
            else:
                img = Image.open(path).convert("RGB")
                texts.append(f"\n--- {f.filename} ---\n" +
                             pytesseract.image_to_string(img, lang="khm+eng"))
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            texts.append(f"Error {f.filename}: {e}")

    return jsonify({"text":"\n".join(texts)})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
