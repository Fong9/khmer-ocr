from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests for your frontend

# Optional: if you need a custom path for tesseract
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'

@app.route("/ocr", methods=["POST"])
def ocr():
    files = request.files.getlist("files")
    results = []

    if not files:
        return jsonify({"error": "No files uploaded"})

    for f in files:
        try:
            img = Image.open(f.stream)
            # Extract text (English + Khmer)
            text = pytesseract.image_to_string(img, lang="eng+khm")
            results.append(text)
        except Exception as e:
            return jsonify({"error": str(e)})

    return jsonify({"text": "\n".join(results)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
