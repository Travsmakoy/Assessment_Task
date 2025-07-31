Sauce Demo Checkout Test
What it does:

Logs in as standard user

Picks 3 random products, adds to cart

Checks cart has those exact products with correct prices

Verifies total price = subtotal + tax

Completes checkout with dummy user info

Confirms order success message

**How to run?**
Install Playwright:
npm install @playwright/test

Run the test:
npx playwright test tests/saucedemo.spec.js

Notes
Uses random selection but guarantees 3 unique products

Verifies cart and prices using simple exact matching

Checkout uses fixed dummy info

All assertions use Playwright expect

