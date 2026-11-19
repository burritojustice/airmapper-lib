# airmapper-lib

Pure map helpers for [Airmapper](https://github.com/burritojustice/airmapper), the map element for Airtable interfaces. No React, no Airtable, no data: WKT and GeoJSON parsing, sf-blocks `streets.json` decoding (CNNs to lines and points), point-in-area, distance to the nearest part of a shape, radius circles, John's creek fix for Protomaps basemaps, and short number formatting.

Airmapper lives in Airtable, and Airtable's build tool caps how much source it accepts, so these helpers live here and Airmapper installs them by commit:

```json
"airmapper-lib": "https://codeload.github.com/burritojustice/airmapper-lib/tar.gz/<commit>"
```

Airtable's builder has no git, so `github:` dependencies don't work there; the tarball link does.

## Changing it

1. Change `index.js` and `index.d.ts` together, and add a test in `test.js` (`node --test`).
2. Bump `version` in `package.json`, push to `main`.
3. In Airmapper, point `package.json` at the new commit, then rebuild every base (see Airmapper's `TESTING.md`).

Positions are `[lon, lat]`. Distances use a flat-earth approximation that's fine at city scale.

License: AGPL-3.0-only, the same as Airmapper.
