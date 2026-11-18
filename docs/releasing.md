# Production releases

The Cloudflare Pages project, its `everyday-impact.pages.dev` address and the D1 database keep the name the app had before it was renamed Tenfold.

Publish completed changes to the existing public Cloudflare Pages project `everyday-impact` after testing and pushing `main`. The deployed project owns the existing `AI` and `USAGE` bindings and native Cloudflare Web Analytics settings. Keep those settings unchanged for ordinary releases.

Do not deploy from the repository root with `wrangler.jsonc`: Wrangler can clear the native Web Analytics settings. Instead, upload the committed static assets and Pages Function from a temporary directory without a Wrangler config. From a clean checkout of the approved release commit, after `npm ci` and `npm test`:

```sh
repo="$PWD"
release="$(git rev-parse HEAD)"
stage="$(mktemp -d /tmp/everyday-impact-release-XXXXXX)"
git archive "$release" dist functions lib | tar -x -C "$stage"
(
  cd "$stage"
  "$repo/node_modules/.bin/wrangler" pages deploy dist \
    --project-name everyday-impact --branch main \
    --commit-hash "$release" --commit-dirty=false
)
```

The temporary directory must contain `dist/`, `functions/` and `lib/`, which the Pages Function imports. Do not copy the private Wrangler config into it. This upload reuses the project's deployed bindings and compatibility settings. If a release needs a binding or compatibility change, review and apply that separately rather than silently relying on the local config. Apply required database migrations using the private config before the release; analytics-only releases do not need migrations.

After upload, read back the production deployment and project settings. Confirm the intended commit, `AI` and `USAGE` bindings, compatibility settings and `fail_open` are unchanged unless explicitly part of the release. Confirm the project's `build_config.web_analytics_tag` and `web_analytics_token` remain set. The live homepage and credits page should each contain exactly one native `static.cloudflareinsights.com/beacon.min.js` script, and a browser visit should load the script and send its analytics request successfully. Do not add a second hard-coded beacon. Verify the production calculator and its existing NFS Home launcher entry. For an analytics-only redeployment, stage the currently deployed commit rather than newer unrelated changes on `main`.
