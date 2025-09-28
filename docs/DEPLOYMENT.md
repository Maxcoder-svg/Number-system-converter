# Deployment Guide

## Deploying Number System Converter

### Quick Deploy Options

#### Option 1: GitHub Pages (Recommended)

1. **Push code** to your GitHub repository
2. **Go to** repository Settings → Pages
3. **Select** source branch (usually `main`)
4. **Wait** for deployment (usually 1-2 minutes)
5. **Access** your app at `https://username.github.io/repository-name`

#### Option 2: Netlify

1. **Connect** your GitHub repository to Netlify
2. **Set build settings**:
   - Build command: (leave empty)
   - Publish directory: `/`
3. **Deploy** automatically on every push
4. **Get** a custom domain: `https://yourapp.netlify.app`

#### Option 3: Vercel

1. **Import** your GitHub repository to Vercel
2. **Configure** project settings:
   - Framework: None
   - Root directory: `./`
3. **Deploy** with automatic HTTPS
4. **Access** at `https://yourapp.vercel.app`

#### Option 4: Firebase Hosting

1. **Install** Firebase CLI: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting`
4. **Configure** public directory as `.`
5. **Deploy**: `firebase deploy`

### Manual Server Setup

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/number-converter
    
    # PWA MIME types
    AddType application/manifest+json .json
    AddType application/javascript .js
    
    # Cache settings
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
    
    # Service worker (don't cache)
    <Files "sw.js">
        ExpiresActive Off
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </Files>
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/number-converter;
    index index.html;
    
    # PWA MIME types
    location ~* \.json$ {
        add_header Content-Type application/manifest+json;
    }
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Don't cache service worker
    location = /sw.js {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### HTTPS Setup (Required for PWA)

#### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate (Apache)
sudo certbot --apache -d yourdomain.com

# Get certificate (Nginx)  
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Cloudflare (Free SSL)

1. **Add** your domain to Cloudflare
2. **Update** nameservers as instructed
3. **Enable** "Always Use HTTPS" in SSL/TLS settings
4. **Set** SSL mode to "Flexible" or "Full"

### Environment Variables

The app doesn't require environment variables, but you can optionally set:

```bash
# Optional: Custom analytics ID
ANALYTICS_ID=your-analytics-id

# Optional: Custom domain
CUSTOM_DOMAIN=yourdomain.com
```

### Performance Optimization

#### Enable Compression

```apache
# Apache .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

```nginx
# Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### Set Cache Headers

```apache
# Apache .htaccess
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### Domain Configuration

#### Custom Domain Setup

1. **Purchase** domain from registrar
2. **Point** DNS to your hosting provider:
   - A record: `@` → `your.server.ip.address`
   - CNAME: `www` → `yourdomain.com`
3. **Update** manifest.json with new domain:
   ```json
   {
     "start_url": "https://yourdomain.com/",
     "scope": "https://yourdomain.com/"
   }
   ```

#### Subdomain Setup

For `converter.yourdomain.com`:
1. **Add** CNAME record: `converter` → `yourdomain.com`
2. **Update** web server configuration
3. **Get** SSL certificate for subdomain

### Testing Deployment

#### Pre-deployment Checklist

- [ ] All files copied to server
- [ ] HTTPS enabled and working
- [ ] Service worker registers successfully
- [ ] PWA manifest accessible
- [ ] All conversions work correctly
- [ ] Mobile responsive design
- [ ] Offline functionality works

#### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.com --view

# Check PWA criteria specifically
lighthouse https://yourdomain.com --only-categories=pwa --view
```

Target scores:
- Performance: >90
- Accessibility: >90  
- Best Practices: >90
- SEO: >90
- PWA: All criteria met

#### Browser Testing

Test in multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome Mobile, Safari Mobile, Samsung Internet
- **PWA Installation**: Android Chrome, Edge Mobile

### Monitoring

#### Basic Analytics

Add Google Analytics or similar:

```html
<!-- Add before closing </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

#### Error Monitoring

Consider adding error tracking:

```javascript
// Add to app.js
window.addEventListener('error', (event) => {
    // Send to error tracking service
    console.error('Global error:', event.error);
});
```

#### Performance Monitoring

Monitor Core Web Vitals:
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

### Troubleshooting

#### Common Issues

**PWA not installing**:
- Verify HTTPS is enabled
- Check manifest.json accessibility  
- Ensure service worker registers
- Verify all PWA criteria met

**Service worker not working**:
- Check browser console for errors
- Verify sw.js is accessible
- Check HTTPS requirement
- Clear browser cache

**Performance issues**:
- Enable gzip compression
- Set proper cache headers
- Optimize images
- Minimize CSS/JS files

**CORS errors**:
- Ensure all resources served from same origin
- Configure proper CORS headers if needed
- Check service worker cache strategy

### Updates and Maintenance

#### Deployment Updates

1. **Update** version in manifest.json and sw.js
2. **Test** changes locally first
3. **Deploy** to staging environment
4. **Run** Lighthouse audit
5. **Deploy** to production
6. **Verify** service worker updates users

#### Regular Maintenance

- **Monthly**: Check for security updates
- **Quarterly**: Performance audit
- **Annually**: Review and update dependencies

For support, check the project's GitHub repository or contact the development team.