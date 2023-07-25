# React Email Reader View

The React Email Reader View is an app that uses React to generate the appropriate files needed for a Chrome extension.

Currently, the extension supports web versions of Gmail. When enabled, it removes clutter from an email and allows a recipient the ability to change text size, contrast, layout, etc for improved readability.

## Installation

```sh
git clone https://github.com/email-markup-consortium/email-reader-view.git
cd email-reader-view
npm install
```

## Local Development

Most development will take place in `/src`.

- The `npm run dev` command will detect any saved changes and automatically rebuild `dist/`.
- The `npm run build` can be used as well, as a manual approach.
- Both commands generate `dist/` which can be loaded into Chrome as an unpacked extension

The `/public` directory contains static assets, and are copied into `dist/` during the build process

- manifest
- images

### `popup.jsx`

Generates the UI, handles actions, and manages state/storage. It's converted to `popup.js` and copied into `dist/` during the build process.

### `persistReaderView.jsx`

Experimental feature intended to persist the reader view settings while navigating between emails in the inbox. It's converted to `persistReaderView.js` and copied into `dist/` during the build process. It is excluded from being injected into `popup.html` by default.

### `popup.html`

Serves as a template for webpack. `<script>` tags will be injected during the build process which will be responsible for populating the DOM and creating the UI. It's copied into `dist/` during the build process. _options are available for developing and testing the output of popup.html_

### `public/`

Contents of this directory are copied into `dist/` during the build process, individual files are untouched.

### `utils/`

- `disableReaderView.js` logic to disable the extension
- `enableReaderView.js` logic to enable the extension
- `css/styles.css` styles are injected automatically

## Notes

- The `JSX`, `JS`, `CSS` are compiled and packaged as a `JS` file, which is injected into `popup.html`
- `localStorage` is used to maintain state between instances
- Unlike conventional extensions, there is no specified _content script_, or _background script_ in use
