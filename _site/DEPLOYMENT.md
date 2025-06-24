# Deployment Instructions

## GitHub Pages Setup

### Option 1: Repository Name in Subfolder
If your site is deployed to `my-org.github.io/repository-name`, update your `_config.yml`:

```yaml
baseurl: "/repository-name"  # Replace with your actual repository name
url: "https://my-org.github.io"  # Replace with your GitHub Pages URL
```

### Option 2: Custom Domain or Root Domain
If your site is deployed to a custom domain or `my-org.github.io` (root), keep:

```yaml
baseurl: ""
url: "https://your-custom-domain.com"  # Or https://my-org.github.io
```

## GitHub Actions Deployment

The included GitHub Actions workflow automatically:
- Detects your GitHub Pages configuration
- Sets the correct baseurl during build
- Handles asset paths correctly

### Enable GitHub Pages
1. Go to your repository Settings → Pages
2. Select "GitHub Actions" as the source
3. Save the settings

### Manual Baseurl Override
If you need to manually set the baseurl, update `_config.yml`:

```yaml
baseurl: "/your-repo-name"
```

Then push to trigger a new deployment.

## Local Development

For local development, use:
```bash
bundle exec jekyll serve
```

The `relative_url` filter ensures assets work both locally and on GitHub Pages.

## Troubleshooting

If CSS/JS files are not loading:
1. Check that your repository name matches the baseurl in `_config.yml`
2. Verify GitHub Actions completed successfully
3. Clear browser cache and hard refresh
4. Check that all asset references use `{{ 'path' | relative_url }}`