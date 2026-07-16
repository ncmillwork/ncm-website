# National Custom Millwork — Website

Modern static website for [National Custom Millwork](https://nationalcustommillwork.com), a custom architectural millwork shop in Beltsville, MD.

No build step, no framework, no dependencies — plain HTML, CSS, and JavaScript. Open `index.html` or host the folder anywhere.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — hero, services, shop story, featured work, CTA |
| `about.html` | About — story, values, stats, photo strip |
| `projects.html` | Projects — filterable gallery with hover previews + lightbox |
| `contact.html` | Contact — phones, team, form, map |

## Structure

```
css/styles.css      Design system (all styling)
js/main.js          Nav, mobile menu, reveals, filters, lightbox, form
assets/img/         Logo, hero, favicon
assets/img/projects/  Project photography (from the original site)
```

## Run locally

Just open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

## Contact form

The form posts to [Formspree](https://formspree.io); the endpoint lives in `FORM_ENDPOINT` at the top of `js/main.js`. To change where messages are delivered, edit the form settings on Formspree or point that constant at a new endpoint. If the endpoint is ever emptied, the form falls back to a "call us" message instead of failing silently.

## Deploy

Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or the existing web host (upload the folder contents via FTP/cPanel). When the final domain is confirmed, update the `og:image` URL in `index.html` to point at the deployed hero image.
