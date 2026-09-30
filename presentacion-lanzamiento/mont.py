import sys
from PIL import Image
out, names = sys.argv[1], sys.argv[2:]
ims = [Image.open(f'cap/{n}.png').convert('RGB') for n in names]
ims = [i.resize((300, int(i.size[1] * 300 / i.size[0]))) for i in ims]
ims = [i.crop((0, 0, 300, min(i.size[1], 700))) for i in ims]
h = max(i.size[1] for i in ims)
W = Image.new('RGB', (310 * len(ims), h), 'gray')
for k, i in enumerate(ims): W.paste(i, (310 * k, 0))
W.save(out)
