import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = "/opt/homebrew/bin/tesseract"

img = Image.open("test.png")
print(pytesseract.image_to_string(img))
