#!/bin/bash

# Authentication Health Check Script
# Run this script periodically to ensure auth stays healthy

echo "🔍 Running Authentication Health Check..."
echo "========================================="

# Run the auth health check
php artisan auth:health-check

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication is working properly!"
else
    echo ""
    echo "⚠️  Authentication issues detected!"
    echo "Run the following commands to fix:"
    echo "1. composer dump-autoload"
    echo "2. php artisan config:clear"
    echo "3. php artisan cache:clear"
    echo "4. Check .env file for hardcoded WORKOS_REDIRECT_URL"
fi