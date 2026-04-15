#!/bin/sh
# Run database migration on startup (creates DB if it doesn't exist)
npx prisma db push --schema ./prisma/schema.prisma --skip-generate
exec node server.js
