# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Deploying to GitHub Pages

This project includes a GitHub Actions workflow that builds the app and deploys the `dist/` folder to GitHub Pages whenever you push to the `main` branch.

Steps to deploy:
1. Create a GitHub repository and push this project to the `main` branch.
2. Ensure the repository has Actions enabled.
3. The workflow `.github/workflows/deploy-gh-pages.yml` will run on push to `main`, build the site and publish it to the `gh-pages` branch.
4. In your repository settings -> Pages, select the `gh-pages` branch as the source (it may be automatic after the first run).

Notes:
- The Vite `base` is set to `./` in `vite.config.js` so the site works on a repo subpath (e.g., `https://<user>.github.io/<repo>`).
- If you use a different branch than `main`, edit the workflow `on.push.branches` accordingly.
