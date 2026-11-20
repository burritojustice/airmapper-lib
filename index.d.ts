export type Position = [number, number];
export type Geometry =
  | {type: 'Point'; coordinates: Position}
  | {type: 'MultiPoint'; coordinates: Position[]}
  | {type: 'LineString'; coordinates: Position[]}
  | {type: 'MultiLineString'; coordinates: Position[][]}
  | {type: 'Polygon'; coordinates: Position[][]}
  | {type: 'MultiPolygon'; coordinates: Position[][][]}
  | {type: 'GeometryCollection'; geometries: Geometry[]};
export type Streets = {segs: {get(cnn: string): Position[] | undefined}; nodes: {get(cnn: string): Position | undefined}};
export type DrawMode = 'auto' | 'shapes' | 'dots' | 'streets' | 'both' | string;
export type LocationFields = {shape?: unknown; cnns?: string | null; lat?: number | string | null; lon?: number | string | null};
export type AreaFeature = {type: 'Feature'; geometry: {type: 'Polygon' | 'MultiPolygon'; coordinates: Position[][] | Position[][][]}; properties: {[k: string]: unknown}};
export type StreetsJson = {seg_fields: string[]; segs: unknown[][]; node_fields: string[]; nodes: unknown[][]};
type MapLike = {getLayer(id: string): unknown; setLayerZoomRange?(id: string, lo: number, hi: number): unknown; getFilter(id: string): unknown; setFilter(id: string, f: any): unknown; setLayoutProperty(id: string, k: string, v: unknown): unknown};

export function parseWkt(text: string): Geometry | null;
export function parseShape(raw: unknown): Geometry | null;
export function decodeStreets(raw: StreetsJson): Streets;
export function fromCnns(text: string, streets: Streets | null): Geometry | null;
export function pointOf(lat: unknown, lon: unknown): Geometry | null;
export function geometryOf(src: LocationFields | null | undefined, streets?: Streets | null, mode?: DrawMode): Geometry | null;
export function autoZoom(map: {getLayer(id: string): unknown; setLayerZoomRange(id: string, lo: number, hi: number): unknown}, shapeLayers: string[], dotLayers: string[], mode?: DrawMode, zoom?: number): void;
export function flatten(g: Geometry): Geometry[];
export function eachPosition(g: Geometry, fn: (p: Position) => void): void;
export function anchorOf(g: Geometry): Position | null;
export function inRing(p: Position, ring: Position[]): boolean;
export function inArea(p: Position, f: AreaFeature): boolean;
export function distTo(o: Position, g: Geometry): number;
export function circle(o: Position, r: number): Geometry;
export function fmtM(m: number): string;
export function hideCreeks(map: MapLike): void;
export function darkFill(hex: string | null | undefined, opacity?: number): boolean;
export function numOf(v: unknown): number | null;
export function abbrev(m: string): string;
export function short(x: string): string;
export function shortParts(l: string): string[];
export function plainStyle(dark: boolean, land: string): any;
