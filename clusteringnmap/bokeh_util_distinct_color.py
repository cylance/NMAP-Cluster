import numpy as np
import colorsys
from random import random
def rgb_to_hex(rgb):
    return '#%02x%02x%02x' % rgb

def hsv2rgb(h,s,v):
    return tuple(i * 255 for i in colorsys.hsv_to_rgb(h,s,v))

def distinctColors(count):
    max_value = 16581375 #255**3
    interval = int(max_value/count)
    colors = [hex(I)[2:].zfill(6) for I in np.arange(0, max_value, interval)]
    return map(lambda x: "#" + x[:-1], colors)