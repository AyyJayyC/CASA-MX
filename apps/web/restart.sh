#!/bin/bash
# Casa MX - Rebuild & Restart Script
# Kills old server, cleans build cache, rebuilds, starts fresh.

set -e
cd "$(dirname "$0")"

echo "🛑 Stopping old server..."
kill $(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K\d+') 2>/dev/null || true
sleep 1

echo "🧹 Cleaning build cache..."
rm -rf .next

echo "🔨 Building..."
npm run build

echo "🚀 Starting server..."
PORT=3000 node ./node_modules/next/dist/bin/next start > /tmp/casa-mx-frontend.log 2>&1 &
echo "PID=$!"
disown

echo ""
echo "✅ Server starting on http://localhost:3000"
echo "⚠️  Hard refresh your browser: Ctrl+Shift+R"
echo "📋 Logs: /tmp/casa-mx-frontend.log"
echo ""
echo "💡 If login fails, reseed the database:"
echo "   docker exec -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/casamx -e JWT_SECRET=test -e NODE_ENV=test casamx-backend npx tsx prisma/seed.ts"
