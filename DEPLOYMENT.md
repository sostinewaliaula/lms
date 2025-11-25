# Deployment Guide

This guide covers deploying the LMS platform on a traditional server setup.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ and npm
- PostgreSQL 14+
- Nginx
- PM2
- FFmpeg (for video processing)
- SSL certificate (Let's Encrypt recommended)

## Server Setup

### 1. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install FFmpeg
sudo apt install -y ffmpeg
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

### 3. Backend Deployment

```bash
# Navigate to backend directory
cd /path/to/lms/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run database migrations
npm run migrate

# Create .env file
cp .env.example .env
# Edit .env with your configuration
nano .env
```

Update `.env` with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
FRONTEND_URL=https://your-domain.com
```

### 4. Start Backend with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided
```

### 5. Frontend Deployment

```bash
# Navigate to frontend directory
cd /path/to/lms/frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://your-domain.com/api" > .env.local

# Build the application
npm run build

# Start the application with PM2
pm2 start npm --name "lms-frontend" -- start
pm2 save
```

### 6. Nginx Configuration

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/lms
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### 8. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Maintenance

### View Logs

```bash
# Backend logs
pm2 logs lms-backend

# Frontend logs
pm2 logs lms-frontend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services

```bash
# Restart backend
pm2 restart lms-backend

# Restart frontend
pm2 restart lms-frontend

# Restart Nginx
sudo systemctl restart nginx
```

### Database Backups

```bash
# Create backup
pg_dump -U lms_user lms_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U lms_user lms_db < backup_20240101.sql
```

## Troubleshooting

### Backend not starting
- Check PM2 logs: `pm2 logs lms-backend`
- Verify database connection in `.env`
- Check if port 5000 is available: `netstat -tulpn | grep 5000`

### Frontend not loading
- Check PM2 logs: `pm2 logs lms-frontend`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check if port 3000 is available

### Nginx errors
- Test configuration: `sudo nginx -t`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify upstream servers are running

### Database connection issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection: `psql -U lms_user -d lms_db`
- Verify credentials in `.env`

## Security Considerations

1. **Change default passwords** - Update all default passwords
2. **Keep dependencies updated** - Regularly run `npm audit` and update packages
3. **Database backups** - Set up automated daily backups
4. **SSL/TLS** - Always use HTTPS in production
5. **Firewall** - Only expose necessary ports
6. **File permissions** - Ensure proper file permissions on uploads directory
7. **Environment variables** - Never commit `.env` files to version control

## Performance Optimization

1. **Enable Nginx caching** for static assets
2. **Use CDN** for media files if needed
3. **Database indexing** - Ensure proper indexes on frequently queried columns
4. **PM2 clustering** - For high traffic, use PM2 cluster mode
5. **Load balancing** - Use multiple backend instances behind a load balancer

## Monitoring

Consider setting up monitoring with:
- PM2 monitoring: `pm2 monit`
- Application monitoring: PM2 Plus or similar
- Server monitoring: htop, iotop
- Database monitoring: pg_stat_statements


