import { net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getImagesDir } from "./db";

export const MEDIA_SCHEME = "hkd-media";

// Must run before app is ready.
export function registerMediaSchemeAsPrivileged(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: MEDIA_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
  ]);
}

// Must run after app is ready.
export function installMediaProtocolHandler(): void {
  protocol.handle(MEDIA_SCHEME, (request) => {
    const url = new URL(request.url);
    const fileName = decodeURIComponent(url.hostname ? `${url.hostname}${url.pathname}` : url.pathname).replace(/^\/+/, "");
    const filePath = path.join(getImagesDir(), fileName);
    if (!filePath.startsWith(getImagesDir())) {
      return new Response("Forbidden", { status: 403 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}
