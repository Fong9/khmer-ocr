from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import os

app = Flask(__name__)

# Optional: set Tesseract path if needed in Docker
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'

@app.route("/ocr", methods=["POST"])
def ocr():
    files = request.files.getlist("files")
    results = []

    for f in files:
        try:
            img = Image.open(f.stream)
            # Extract text from image
            text = pytesseract.image_to_string(img, lang="eng+khm")  # Khmer + English
            results.append(text)
        except Exception as e:
            return jsonify({"error": str(e)})

    return jsonify({"text": "\n".join(results)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
