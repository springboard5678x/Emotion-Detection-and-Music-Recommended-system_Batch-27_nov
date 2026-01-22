import io
import base64
import numpy as np
from PIL import Image

def preprocess_image(base64_string):
    """
    Converts a base64 image string to a normalized (48,48,1) numpy array for model input.
    """
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]

    image_bytes = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(image_bytes)).convert('L')  # grayscale
    img = img.resize((48, 48))
    img_array = np.array(img).astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=(0, -1))  # batch and channel dim
    return img_array
