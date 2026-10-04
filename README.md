# AI Research Lab website

A responsive, dependency-free static website for Cairo University's Artificial Intelligence Research Lab (AIRL).

## Pages

- `docs/Wiki.md` — Project wiki summarizing the AIRL website and source documentation
- `public/index.html` — Home
- `public/about.html` — Mission, history, and staff
- `public/collaborations.html` — Industry and academic collaboration
- `public/documentation.html` — Account access, connection, and user guide
- `public/resources.html` — Compute, storage, and quotas

## Preview locally

Open `public/index.html` in a browser, or serve the `public` directory with a local static file server.

## Deploy to Netlify

The root `netlify.toml` sets `public` as the publish directory. There is no build command. Deploy from the project root with:

```sh
netlify deploy --prod --dir public
```

The original source documents and admin notes remain in `docs/` and are deliberately excluded from the published directory. The admin user-creation instructions contain privileged server operations; a hidden route or `noindex` page would not secure them on a public static site. Do not copy them to `public/` without adding real access control.

The public documentation links to the previously approved access form; Google sign-in may be required. It also makes the conflicting project-storage backup statements in `Resources.md` and `Regulations.md` explicit so users can confirm the current policy with AIRL.
