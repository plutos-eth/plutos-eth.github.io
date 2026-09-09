# banana — landing site

One static page for **$BANANA** on Robinhood Chain, served from GitHub Pages at
<https://plutos-eth.github.io/>.

No build step, no framework, no dependencies. Three files and a folder of images.

```
index.html    the page
styles.css    all of it — colours are lifted from the app's ui/src/tokens.css
main.js       config + copy-to-clipboard, accordion, scrollspy, reveal
assets/       mark, banner, favicons, og image
```

## Editing at launch

Everything that changes when the token goes live is in one block at the top of
`main.js`. Leave a value `null` and the page renders an honest "soon" state
instead of a dead link or a fake address.

```js
const CONFIG = {
  ca:       null,   // "0x…" — the one official contract address
  buyUrl:   null,   // pons.fun link for the pair
  chartUrl: null,   // DEX chart (falls back to explorer + ca if you set `explorer`)
  xUrl:     null,   // "https://x.com/<handle>"
  supply:   null,   // "1,000,000,000"
  tax:      null,   // "0 / 0"
  explorer: null,   // "https://…/address/"
};
```

Set `ca` to a valid `0x…40 hex` address and the page flips itself over: the top
strip turns from amber **PENDING LAUNCH** to green **OFFICIAL CONTRACT**, the
header chip shows the shortened address, the copy buttons start working, and the
`soon` tags come off any link whose URL you filled in.

Nothing else in the page needs touching for launch.

## Editing anything else

- **Copy** lives in `index.html` as plain HTML. The numbers in section 02 come
  from the app's own measurements — if a measurement is re-run, change it here too.
- **Colour, type and spacing** are CSS custom properties at the top of
  `styles.css`. `--key` is `#d4fc50`, the same key colour as the terminal.
- **Images** are pre-sized in `assets/`. Regenerate from originals rather than
  scaling in CSS; the `.webp` is the primary and the `.jpg` is the fallback.

## Running it locally

```sh
python -m http.server 8765
# then open http://127.0.0.1:8765/
```

Opening `index.html` directly off disk mostly works, but the clipboard API is
unavailable on `file://` — the copy button falls back to `execCommand` there.

## Deploying

Pushing to `main` publishes it. GitHub Pages serves this repo's root; `.nojekyll`
stops Jekyll from touching the files on the way out.
