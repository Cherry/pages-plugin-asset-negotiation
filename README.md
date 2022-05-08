# pages-plugin-asset-negotiation

[![npm version](https://badge.fury.io/js/pages-plugin-asset-negotiation.svg)](https://badge.fury.io/js/pages-plugin-asset-negotiation)

This is a Cloudflare Pages plugin that can deliver optimised assets like imags, in much newer and modern formats via [Content Negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

Today, Clouflare Pages doesn't support other zone-level features such as Polish, which effectively does this same thing automatically if you were using Cloudflare as a CDN, but we have to implement it ourselves within Pages.

By using Content Negotiation, we can deliver images in the most modern formats, like JPEG XL, AVIF, WEBP, etc. without having to change anything in our markup - this means you could reference `/images/dog.jpeg` in your HTML or CSS, but if the requesting browser supports a newer image format (as presented in the Accept header), we can serve the image in that format, such as `dog.jxl`. This is a huge win for your users, as they get the image in the most modern format - which means smaller filesizes - without having to change anything in your markup.

This plugin assumes a few thing:

- You have pre-optimised all of your assets into the most modern formats. This plugin doesn't do any on-the-fly image optimisation or anything like that - it relies on your images being optimised already.
- With above, the images should exist alongside eachother, such like `/images/dog.jpeg` and `/images/dog.jxl`.
- And for the best results, you should store images in a separate folder, so you only have to invoke this plugin on a specific folder, like `/images`.


## Installation

```sh
npm install --save pages-plugin-asset-negotiation
```

## Usage

```ts
// ./functions/images/_middleware.ts

import assetNegotiationPlugin from "pages-plugin-asset-negotiation";

export const onRequest: PagesFunction = assetNegotiationPlugin({
	formats: ['jxl', 'avif', 'webp'], // The formats you want to support, in order of preference. This is the default configuration and will serve a jxl image if the browser supports it (and it was found) first, followed by avif and then webp.
});
```