import type { PluginArgs } from '..';

type assetNegotiationPagesPluginFunction<
	Env = unknown,
	Params extends string = any,
	Data extends Record<string, unknown> = Record<string, unknown>,
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

// map of extensions to mimetypes for images
// TODO: should we pull this from somewhere else?
const mimetypeMap = {
	jxl: 'image/jxl',
	avif: 'image/avif',
	webp: 'image/webp',
	gif: 'image/gif',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
};
// very basic "is image" detection
const isImage = (file: string) => {
	const ext = file.split('.').pop();
	return Boolean(mimetypeMap[ext]);
};
export const onRequest: assetNegotiationPagesPluginFunction = async ({ env, next, pluginArgs = {}, request }) => {
	pluginArgs.formats ??= ['jxl', 'avif', 'webp'];
	const acceptHeader = request.headers.get('accept');
	if (!acceptHeader) {
		// no accept header, so we can't do anything
		return next();
	}
	const url = new URL(request.url);
	if (!isImage(url.pathname)) {
		// not an image, so we can't do anything
		return next();
	}
	for (const format of pluginArgs.formats) {
		if (acceptHeader.includes(mimetypeMap[format])) {
			// found a format that we can serve
			// construct a new request for the new format, and try to retrieve it
			// this is kinda weird at the moment, because of differences with prod vs local
			// but this is the best way to do it for now
			const lookupFile = new URL(request.url);
			lookupFile.pathname = lookupFile.pathname.replace(/\.\w+$/, `.${format}`);
			const lookupReq = new Request(lookupFile.toString(), {
				cf: request.cf,
			});
			const asset = await env.ASSETS.fetch(lookupReq);
			if (asset && asset.status === 200) {
				// found the asset, so we can serve it
				// sometimes the asset doesn't have a valid content-type, so we should set it
				// to do that, we need to create a new response, so the headers become mutable
				const newHeaders = new Headers(asset.headers);
				if (!asset?.headers?.has?.('content-type') || asset?.headers?.get?.('content-type') === 'application/octet-stream') {
					newHeaders.set('content-type', mimetypeMap[format]);
				}
				const newResponse = new Response(
					[101, 204, 205, 304].includes(asset.status) ? null : asset.body,
					{ ...asset, headers: newHeaders },
				);
				return newResponse;
			}
		}
	}
	// no acceptable formats found, pass-through for original image
	return next();
};
