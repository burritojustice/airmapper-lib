import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from './index.js';

test('parseShape reads WKT, GeoJSON and lat/lon pairs', () => {
  assert.deepEqual(L.parseShape('POINT (-122.4 37.7)'), {type: 'Point', coordinates: [-122.4, 37.7]});
  assert.equal(L.parseShape('MULTIPOLYGON (((0 0, 1 0, 1 1, 0 0)))').type, 'MultiPolygon');
  assert.equal(L.parseShape('{"type":"Feature","geometry":{"type":"Point","coordinates":[1,2]}}').type, 'Point');
  assert.deepEqual(L.parseShape('37.7, -122.4').coordinates, [-122.4, 37.7]);
  assert.equal(L.parseShape('not a shape'), null);
  assert.equal(L.parseShape('POLYGON EMPTY'), null);
});

test('decodeStreets and fromCnns', () => {
  const s = L.decodeStreets({seg_fields: ['cnn', 'geom'], segs: [[1, [-12240000, 3770000, 100, 0]]], node_fields: ['cnn', 'x', 'y'], nodes: [[2, -12240000, 3770000]]});
  assert.deepEqual(s.segs.get('1'), [[-122.4, 37.7], [-122.399, 37.7]]);
  assert.equal(L.fromCnns('1; 2', s).type, 'GeometryCollection');
  assert.equal(L.fromCnns('9', s), null);
});

test('distTo measures to the nearest part, 0 inside', () => {
  const o = [-122.42, 37.76];
  const sq = {type: 'Polygon', coordinates: [[[-122.421, 37.759], [-122.419, 37.759], [-122.419, 37.761], [-122.421, 37.761], [-122.421, 37.759]]]};
  assert.equal(L.distTo(o, sq), 0);
  const line = {type: 'LineString', coordinates: [[-122.43, 37.761], [-122.41, 37.761]]};
  assert.ok(Math.abs(L.distTo(o, line) - 110.5) < 1);
  assert.ok(Math.abs(L.distTo(o, {type: 'Point', coordinates: [-122.42, 37.761]}) - 110.5) < 1);
});

test('circle, inArea, anchorOf', () => {
  const c = L.circle([-122.42, 37.76], 500);
  assert.equal(c.coordinates[0].length, 65);
  const f = {type: 'Feature', geometry: c, properties: {}};
  assert.ok(L.inArea([-122.42, 37.762], f));
  assert.ok(!L.inArea([-122.42, 37.77], f));
  assert.deepEqual(L.anchorOf({type: 'LineString', coordinates: [[0, 0], [1, 1], [2, 2]]}), [1, 1]);
});

test('numbers', () => {
  assert.equal(L.numOf('$4,100'), 4100);
  assert.equal(L.numOf([{value: 'x'}, {value: 7}]), 7);
  assert.equal(L.numOf('zip 94110'), null);
  assert.equal(L.short('$4,100–$12,500'), '$4.1K–$12.5K');
  assert.equal(L.fmtM(1234), '1.2 km');
  assert.equal(L.fmtM(118), '120 m');
  assert.equal(L.darkFill('#0d366b'), true);
  assert.equal(L.darkFill('#ffffbf'), false);
});

test('hideCreeks converts legacy filters and hides streams', () => {
  const calls = {};
  const map = {
    getLayer: (id) => ['water_stream', 'water_river'].includes(id),
    getFilter: () => ['==', 'kind', 'river'],
    setFilter: (id, f) => (calls[id] = f),
    setLayoutProperty: (id, k, v) => (calls[id + ':' + k] = v),
  };
  L.hideCreeks(map);
  assert.equal(calls['water_stream:visibility'], 'none');
  assert.deepEqual(calls.water_river[1], ['==', ['get', 'kind'], 'river']);
});

test('parseShape takes SRID, Z values and objects', () => {
  assert.deepEqual(L.parseShape('SRID=4326;POINT Z (-122.4 37.7 12)'), {type: 'Point', coordinates: [-122.4, 37.7]});
  assert.equal(L.parseShape('MULTILINESTRING M ((0 0 1, 1 1 2))').type, 'MultiLineString');
  assert.equal(L.parseShape({type: 'Point', coordinates: [1, 2]}).type, 'Point');
  assert.equal(L.parseShape({type: 'Feature', geometry: {type: 'Point', coordinates: [1, 2]}}).type, 'Point');
  assert.equal(L.parseShape({foo: 1}), null);
});

test('geometryOf: shape, then CNNs, then lat/lon', () => {
  const s = L.decodeStreets({seg_fields: ['cnn', 'geom'], segs: [[1, [-12240000, 3770000, 100, 0]]], node_fields: ['cnn', 'x', 'y'], nodes: [[2, -12240000, 3770000]]});
  const poly = 'POLYGON ((0 0, 1 0, 1 1, 0 0))';
  assert.equal(L.geometryOf({shape: poly, cnns: '1', lat: 37.7, lon: -122.4}, s).type, 'Polygon');
  assert.equal(L.geometryOf({cnns: '1', lat: 37.7, lon: -122.4}, s).type, 'MultiLineString');
  assert.equal(L.geometryOf({cnns: '2', lat: 37.7, lon: -122.4}, s).type, 'MultiPoint');
  assert.equal(L.geometryOf({cnns: '1;2'}, s).type, 'GeometryCollection');
  assert.deepEqual(L.geometryOf({cnns: '9', lat: '37.7', lon: '-122.4'}, s), {type: 'Point', coordinates: [-122.4, 37.7]});
  assert.equal(L.geometryOf({shape: poly, cnns: '1'}, s, 'streets').type, 'MultiLineString');
  assert.equal(L.geometryOf({shape: poly, cnns: '9'}, s, 'streets').type, 'Polygon');
  assert.equal(L.geometryOf({shape: poly, cnns: '1'}, s, 'both').type, 'GeometryCollection');
  assert.equal(L.geometryOf({cnns: '1'}, null), null);
  assert.equal(L.geometryOf({lat: 0, lon: 0}), null);
  assert.equal(L.geometryOf({lat: 137, lon: -122}), null);
  assert.equal(L.geometryOf(null), null);
  const like = {segs: {get: (c) => (c === '5' ? [[0, 0], [1, 1]] : undefined)}, nodes: {get: () => undefined}};
  assert.equal(L.geometryOf({cnns: '5'}, like).type, 'MultiLineString');
});

test('autoZoom sets zoom ranges only', () => {
  const calls = {};
  const map = {getLayer: (id) => id !== 'gone', setLayerZoomRange: (id, lo, hi) => (calls[id] = [lo, hi])};
  L.autoZoom(map, ['fill', 'gone'], ['dot'], 'auto', 13);
  assert.deepEqual(calls, {fill: [13, 24], dot: [0, 13]});
  L.autoZoom(map, ['fill'], ['dot'], 'dots');
  assert.deepEqual(calls, {fill: [24, 24], dot: [0, 24]});
  L.autoZoom(map, ['fill'], ['dot'], 'shapes');
  assert.deepEqual(calls, {fill: [0, 24], dot: [24, 24]});
});
