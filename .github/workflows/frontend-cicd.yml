name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: ["main"]
    paths:
      - 'frontend/**'

# Set permissions for GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4