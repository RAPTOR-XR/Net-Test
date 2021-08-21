import functools
from PIL import Image

def image_transpose(img):
    orientation = 0x0112
    sequence = [
        [],
        [],
        [Image.FLIP_LEFT_RIGHT],
        [Image.ROTATE_180],
        [Image.FLIP_TOP_BOTTOM],
        [Image.FLIP_LEFT_RIGHT, Image.ROTATE_90],
        [Image.ROTATE_270],
        [Image.FLIP_TOP_BOTTOM, Image.ROTATE_90],
        [Image.ROTATE_90],
    ]
    try:
        seq = sequence[img._getexif()[orientation]]
    except:
        return img
    else:
        return functools.reduce(type(img).transpose, seq, img)

def resize_img(img_path, height, width):
    img = Image.open(img_path)
    img = image_transpose(img)
    if img.height > height or img.width > width:
        os = (height, width)
        img.thumbnail(os)
    img.save(img_path)
