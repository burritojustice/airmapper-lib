# airmapper-lib

Pure map helpers for [Airmapper](https://github.com/burritojustice/airmapper), the map element for Airtable interfaces, and [Block Party](https://github.com/burritojustice/block-party). No React, no Airtable, no data: WKT and GeoJSON parsing, sf-blocks `streets.json` decoding (CNNs to lines and points), point-in-area, distance to the nearest part of a shape, radius circles, John's creek fix for Protomaps basemaps, and short number formatting.

Airmapper lives in Airtable, and Airtable's build tool caps how much source it accepts, so these helpers live here and Airmapper installs them by commit:

```json
"airmapper-lib": "https://codeload.github.com/burritojustice/airmapper-lib/tar.gz/<commit>"
```

Airtable's builder has no git, so `github:` dependencies don't work there; the tarball link does.

## Picking what to draw

`geometryOf({shape, cnns, lat, lon}, streets, mode)` gives one geometry for a record:

- `shape`: WKT or GeoJSON, as text or an object.
- `cnns`: sf-blocks CNNs, separated by `;`, `,` or spaces. Street blocks become lines, intersections points.
- `lat`, `lon`: numbers or text, checked (in range, not 0, 0).
- `streets`: anything with `segs.get(cnn)` and `nodes.get(cnn)`, such as `decodeStreets(streetsJson)`.
- `mode`: `auto`, `shapes` and `dots` take the shape, else the CNNs, else lat/lon. `streets` takes the CNNs first. `both` draws the shape and the CNNs together.

`autoZoom(map, shapeLayers, dotLayers, mode, zoom)` switches MapLibre layers between dots (below `zoom`) and shapes (from `zoom`) in `auto`, or shows only one kind. It sets layer zoom ranges only, so visibility you set elsewhere is left alone. Give the dot layers one point per record; `anchorOf(geometry)` gives one.

## Using it in a page with no build step

It's one ES module. Load it from jsDelivr, pinned to a commit, and keep a copy next to the page in case the CDN fails:

```js
const lib = await import('https://cdn.jsdelivr.net/gh/burritojustice/airmapper-lib@<commit>/index.js')
  .catch(() => import('./vendor/airmapper-lib.js'));
```

## Changing it

1. Change `index.js` and `index.d.ts` together, and add a test in `test.js` (`node --test`).
2. Bump `version` in `package.json`, push to `main`.
3. In Airmapper, point `package.json` at the new commit, then rebuild every base (see Airmapper's `TESTING.md`).
4. In Block Party, change the commit in `index.html` and refresh `vendor/airmapper-lib.js` from it.

Positions are `[lon, lat]`. Distances use a flat-earth approximation that's fine at city scale.

License: AGPL-3.0-only, the same as Airmapper.
