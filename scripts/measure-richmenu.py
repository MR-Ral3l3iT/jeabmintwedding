"""Measure rich menu card boundaries straight from the PNG pixels.

Pure stdlib so it runs anywhere: inflates the IDAT stream, undoes the PNG
row filters, then looks for the dark separator lines that frame each card.
"""

import struct
import sys
import zlib


def load_rgba(path):
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("not a png")

    pos = 8
    width = height = None
    idat = bytearray()
    bit_depth = color_type = interlace = None

    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        ctype = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        if ctype == b"IHDR":
            width, height, bit_depth, color_type, _, _, interlace = struct.unpack(
                ">IIBBBBB", body
            )
        elif ctype == b"IDAT":
            idat += body
        elif ctype == b"IEND":
            break
        pos += 12 + length

    if bit_depth != 8 or interlace != 0 or color_type not in (2, 6):
        raise SystemExit(f"unsupported png: depth={bit_depth} color={color_type}")

    channels = 4 if color_type == 6 else 3
    raw = zlib.decompress(bytes(idat))
    stride = width * channels

    out = bytearray(height * stride)
    prev = bytearray(stride)
    src = 0
    for y in range(height):
        filt = raw[src]
        src += 1
        line = bytearray(raw[src : src + stride])
        src += stride

        if filt == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif filt == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif filt == 3:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif filt == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        elif filt != 0:
            raise SystemExit(f"bad filter {filt} on row {y}")

        out[y * stride : (y + 1) * stride] = line
        prev = line

    return width, height, channels, out


def luma_rows(width, height, channels, px):
    stride = width * channels
    rows = []
    for y in range(height):
        base = y * stride
        total = 0
        for x in range(0, width, 3):  # sample every 3rd pixel, plenty for edges
            i = base + x * channels
            total += px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114
        rows.append(total / (1000 * len(range(0, width, 3))))
    return rows


def luma_cols(width, height, channels, px, y0, y1):
    stride = width * channels
    cols = []
    ys = list(range(y0, y1, 3))
    for x in range(width):
        total = 0
        for y in ys:
            i = y * stride + x * channels
            total += px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114
        cols.append(total / (1000 * len(ys)))
    return cols


def valleys(values, lo, hi, threshold):
    """Return contiguous index ranges where value dips below threshold."""
    runs = []
    start = None
    for i in range(lo, hi):
        if values[i] < threshold:
            if start is None:
                start = i
        elif start is not None:
            runs.append((start, i - 1))
            start = None
    if start is not None:
        runs.append((start, hi - 1))
    return runs


def write_png(path, width, height, channels, px):
    stride = width * channels
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type: none
        raw += px[y * stride : (y + 1) * stride]

    def chunk(tag, body):
        return (
            struct.pack(">I", len(body))
            + tag
            + body
            + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6 if channels == 4 else 2, 0, 0, 0)
    with open(path, "wb") as fh:
        fh.write(b"\x89PNG\r\n\x1a\n")
        fh.write(chunk(b"IHDR", ihdr))
        fh.write(chunk(b"IDAT", zlib.compress(bytes(raw), 6)))
        fh.write(chunk(b"IEND", b""))


def draw_overlay(src, dst, areas, width, height, channels, px):
    """Paint each tap area border + a translucent tint so misalignment is obvious."""
    stride = width * channels
    palette = [(220, 60, 60), (40, 110, 220), (230, 150, 20), (140, 60, 200)]
    thickness = 4

    def blend(x, y, colour, alpha):
        if not (0 <= x < width and 0 <= y < height):
            return
        i = y * stride + x * channels
        for k in range(3):
            px[i + k] = int(px[i + k] * (1 - alpha) + colour[k] * alpha)

    for idx, area in enumerate(areas):
        colour = palette[idx % len(palette)]
        x0, y0 = area["x"], area["y"]
        x1, y1 = x0 + area["width"] - 1, y0 + area["height"] - 1

        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                blend(x, y, colour, 0.12)

        for t in range(thickness):
            for x in range(x0, x1 + 1):
                blend(x, y0 + t, colour, 1.0)
                blend(x, y1 - t, colour, 1.0)
            for y in range(y0, y1 + 1):
                blend(x0 + t, y, colour, 1.0)
                blend(x1 - t, y, colour, 1.0)

    write_png(dst, width, height, channels, px)
    print(f"overlay written: {dst}")


AREAS = [
    {"x": 0, "y": 0, "width": 1200, "height": 487, "label": "banner"},
    {"x": 0, "y": 487, "width": 414, "height": 323, "label": "schedule"},
    {"x": 414, "y": 487, "width": 371, "height": 323, "label": "location"},
    {"x": 785, "y": 487, "width": 415, "height": 323, "label": "assistant"},
]


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "docs/assets/richmenu-jm-wedding.png"

    if "--overlay" in sys.argv:
        dst = sys.argv[sys.argv.index("--overlay") + 1]
        width, height, channels, px = load_rgba(path)
        draw_overlay(path, dst, AREAS, width, height, channels, px)
        return

    width, height, channels, px = load_rgba(path)
    print(f"image: {width}x{height} channels={channels}")

    rows = luma_rows(width, height, channels, px)
    avg = sum(rows) / len(rows)
    print(f"mean luma: {avg:.1f}")

    print("\n-- darkest rows (candidate horizontal separators) --")
    for start, end in valleys(rows, 0, height, avg - 12):
        print(f"  rows {start:4d}-{end:4d}  (h={end - start + 1:3d})  luma={min(rows[start:end + 1]):.1f}")

    band_start = int(height * 0.55)
    cols = luma_cols(width, height, channels, px, band_start, height)
    cavg = sum(cols) / len(cols)
    print(f"\n-- bottom band y>={band_start}: darkest columns (card gaps), mean {cavg:.1f} --")
    for start, end in valleys(cols, 0, width, cavg - 12):
        print(f"  cols {start:4d}-{end:4d}  (w={end - start + 1:3d})  luma={min(cols[start:end + 1]):.1f}")


if __name__ == "__main__":
    main()
