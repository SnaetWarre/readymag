# Scroll-Driven Broken Heart Animation

This folder contains a Readymag-ready scroll animation built from the Canva assets.

## Files

- `index.html` is the local preview shell.
- `styles.css` contains the preview styling.
- `script.js` builds and animates the scene.
- `readymag-embed.html` is the pasteable Readymag embed version with inline CSS and JavaScript.

## Required Assets

The animation expects these three files:

- `assets/layers/heart.png`
- `assets/layers/phones.png`
- `assets/layers/hand-left.png`

The phones are split in code from the combined `phones.png` image. The left hand is used for both sides; the right-side hand is mirrored horizontally in code from the center point of the image.

## Changing The Title

In `script.js`, edit:

```js
const CONFIG = {
  title: "De downfall van datingapps:\nHeeft online daten nog een toekomst?",
};
```

For Readymag, edit the same `CONFIG.title` value inside `readymag-embed.html`.

## Readymag Use

Upload the required images so the paths in the `ASSETS` object resolve, or replace each path with the hosted asset URL from Readymag.

Then paste the full contents of `readymag-embed.html` into a Readymag Embed/code widget.
