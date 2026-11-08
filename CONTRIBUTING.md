# Changes and deployments

`main` is the stable production branch. Vercel is the only website deployment provider.

Create a short-lived branch for each change, such as `feat/interactive-map`,
`fix/mobile-controls`, or `chore/deployment-config`. Push that branch and open a
pull request targeting `main`; do not push development changes directly to `main`.
Run `npm test` and `npm run build` before merging. The pull request workflow runs
these checks without publishing a website. Vercel can provide previews for pull
requests; merging into `main` updates production through the existing integration.
Delete the feature branch after its pull request is merged.

GitHub Pages is not used. Its site must be disabled in repository Settings → Pages
to stop the automatically generated Pages deployment workflow. This switch is a
repository setting, not something removing a workflow file can accomplish.
Historical `github-pages` deployment records can then be removed. Vercel
production deployments, Vercel previews, domains, and integration settings must
be preserved during Pages cleanup.

To enforce the workflow, configure a GitHub branch rule for `main` that requires a
pull request and the `Tests and production build` status check. For a sole
maintainer, do not require another person's approval unless another reviewer is
available. Repository rules and Pages settings are applied through GitHub, not
by this document.
