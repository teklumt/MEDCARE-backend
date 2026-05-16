export type RouteMarkerKind = 'pharmacy' | 'destination' | 'driver';

const PIN_PATH =
  'M20 0C11.16 0 4 7.16 4 16c0 12 16 32 16 32s16-20 16-32C36 7.16 28.84 0 20 0z';

function svgPin(fill: string, glyph: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
  <path d="${PIN_PATH}" fill="${fill}" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="21" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="system-ui,sans-serif">${glyph}</text>
</svg>`;
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const ROUTE_MARKER_META: Record<
  RouteMarkerKind,
  { url: string; legendLabel: string; dotClass: string }
> = {
  pharmacy: {
    url: toDataUrl(svgPin('#16a34a', 'P')),
    legendLabel: 'Pickup (pharmacy)',
    dotClass: 'bg-green-600'
  },
  destination: {
    url: toDataUrl(svgPin('#2563eb', 'D')),
    legendLabel: 'Drop-off (patient)',
    dotClass: 'bg-blue-600'
  },
  driver: {
    url: toDataUrl(svgPin('#ea580c', 'V')),
    legendLabel: 'Driver',
    dotClass: 'bg-orange-600'
  }
};

/** Icon config for classic google.maps.Marker (vis.gl Marker). */
export function routeMarkerIcon(kind: RouteMarkerKind): google.maps.Icon | undefined {
  // @ts-ignore
  if (typeof google === 'undefined') return undefined;
  const { url } = ROUTE_MARKER_META[kind];
  return {
    url,
    scaledSize: new google.maps.Size(36, 44),
    anchor: new google.maps.Point(18, 44)
  };
}
