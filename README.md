# Carveout Router

Initial project bootstrap with CI/CD.

## CI

Pull requests targeting `main` run:

- `npm run typecheck`
- `npm run lint`
- `npm test`

## Deploy Hooks

Pushes to `main` trigger `.github/workflows/deploy-hooks.yml`.
Set these repository secrets:

- `VERCEL_DEPLOY_HOOK_URL`
- `SUPABASE_DEPLOY_HOOK_URL`
