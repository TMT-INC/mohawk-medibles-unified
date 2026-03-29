---
name: require-predeploy-gate
enabled: false
event: bash
pattern: vercel\s+--prod|npm\s+run\s+deploy|vercel\s+deploy\s+--prod
action: block
---

**PRODUCTION DEPLOYMENT BLOCKED — Pre-Deploy Gate Required**

You MUST run the OMMAE Production Deployment Gate before deploying to production.

**Required steps:**
1. Run `bash scripts/pre-deploy.sh` first
2. All 7 gates must PASS (git status, env vars, build, lint, security, assets, diff summary)
3. Only if ALL gates pass, proceed with `vercel --prod`

**Or use the safe deploy command:** `npm run deploy` (runs gate automatically)

**DO NOT bypass this gate.** Production deployments without passing the gate risk:
- Deploying with build errors
- Missing environment variables
- Security vulnerabilities reaching production
- Broken assets/images on live site

Run `bash scripts/pre-deploy.sh` now, then deploy if it passes.
