# AI Research Lab website

A responsive, dependency-free static website for Cairo University's Artificial Intelligence Research Lab (AIRL).

## Pages

- `public/index.html` — Home
- `public/about.html` — Mission, history, and staff
- `public/collaborations.html` — Industry and academic collaboration
- `public/documentation.html` — Account access, connection, and user guide
- `public/resources.html` — Compute, storage, and quotas

## Preview locally

Serve the repository root with a local static file server, then open `/public/`. The shared header, footer, and Markdown content are fetched at runtime, so opening an HTML file directly from disk will not load them.

## Deploy to GitHub Pages

The GitHub Actions workflow publishes the static site on pushes to `main` and on manual runs. It packages `public/` with the public Markdown files used by the site; the `docs/admin/` files and other source documents are not published.

To use `https://AIRL-CUFE.github.io`, the repository must be named `AIRL-CUFE.github.io` and owned by the `AIRL-CUFE` account. After pushing or transferring this project into that repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The workflow will deploy automatically on the next push to `main`.

## Deploy to Netlify

The root `netlify.toml` sets `public` as the publish directory. There is no build command. Deploy from the project root with:

```sh
netlify deploy --prod --dir public
```

The original source documents and admin notes remain in `docs/` and are deliberately excluded from the published directory. The admin user-creation instructions contain privileged server operations; a hidden route or `noindex` page would not secure them on a public static site. Do not copy them to `public/` without adding real access control.

The public documentation links to the previously approved access form; Google sign-in may be required. It also makes the conflicting project-storage backup statements in `Resources.md` and `Regulations.md` explicit so users can confirm the current policy with AIRL.
