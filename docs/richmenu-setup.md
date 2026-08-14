# Rich menu setup

The artwork lives at `docs/assets/richmenu-jm-wedding.png` (1200 × 810).

## Why not LINE Official Account Manager

The Manager UI only lets you pick from fixed template grids. The closest
template — one wide block on top, three below — splits the canvas at 50 % height,
but the artwork's banner ends at 60 % (y = 487). Every card ends up offset, and
the middle card is narrower than the outer two, which no template supports.

Registering the menu through the Messaging API gives each card its exact bounds.

## Measured geometry

`scripts/measure-richmenu.py` reads the PNG pixels and reports the separators:

| separator | pixels |
| --- | --- |
| banner / cards divider | y 480–493 |
| gap between card 1 and 2 | x 405–423 |
| gap between card 2 and 3 | x 776–794 |
| outer frame | 17 px on each side |

Tap areas split down the middle of each gap and tile the whole canvas, so there
are no dead pixels between buttons:

| area | bounds (x, y, w, h) | action |
| --- | --- | --- |
| banner | 0, 0, 1200, 487 | none (postback the webhook ignores) |
| กำหนดการ | 0, 487, 414, 323 | sends `ขอดูกำหนดการงานแต่งค่ะ` |
| สถานที่ | 414, 487, 371, 323 | opens Google Maps |
| น้องมายมิ้นท์ | 785, 487, 415, 323 | postback `richmenu=chat` — bot replies with the how-to-chat card |

The chat button is a postback rather than a message so the webhook can branch on
it without string-matching, and so the tap does not answer through Gemini. Its
`data` value must stay in sync with `POSTBACK.chat` in
`apps/api/src/line/flex/theme.ts`.

To eyeball the alignment, regenerate the overlay and open it:

```bash
npm run line:richmenu:preview
open docs/assets/richmenu-areas-preview.png
```

## Image constraints

LINE requires width 800/1200/2500, height ≥ 250, aspect ratio ≥ 1.45, and file
size ≤ 1 MB. The source PNG is 1.5 MB, so `setup-richmenu.mjs` converts it to
JPEG at quality 92 (≈ 360 KB) before uploading. Nothing needs to be done by
hand — but if you replace the artwork, keep the 1200 × 810 canvas.

## Applying it

Needs `LINE_CHANNEL_ACCESS_TOKEN`, read from `apps/api/.env` or the environment.

```bash
npm run line:richmenu:list          # what is registered right now
npm run line:richmenu -- --dry-run  # print the payload, call nothing
npm run line:richmenu               # create, upload, set as default
npm run line:richmenu -- --replace  # same, then delete the older menus
```

The LINE app caches the previous menu, so reopen the chat (or wait a minute or
two) before deciding whether it worked.

## Changing what the buttons do

Edit the `RICH_MENU.areas` array in `scripts/setup-richmenu.mjs` and re-run with
`--replace`. A rich menu is immutable once created, so every change means a new
menu — that is what `--replace` cleans up.

`MAPS_URL` at the top of the script is a copy of the value in
`apps/web/src/lib/constants.ts`. If the venue map link changes in `/admin`,
update it here too.
