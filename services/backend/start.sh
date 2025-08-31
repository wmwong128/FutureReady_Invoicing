#!/bin/bash

# Exit if any command fails
set -e

# Start Stripe CLI listener in the background
stripe listen --forward-to localhost:8080/webhook/stripe &

# Save the Stripe listener's PID so we can kill it later if needed
STRIPE_PID=$!

# Start your Node.js server
npm run dev

# If the server stops, also stop Stripe listener
kill $STRIPE_PID
