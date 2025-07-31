const { test, expect } = require("@playwright/test");

// This test simulates a user flow for checking out products on the Sauce Demo website.

async function login(page) {
  await page.goto("https://www.saucedemo.com/");

  // put credentials
  await page.fill("#user-name", "standard_user");
  await page.fill("#password", "secret_sauce");
  await page.locator('[data-test="login-button"]').click();

  //  verify login success and correct page
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('[data-test="title"]')).toHaveText("Products");
}

let selectedItems = [];
// Function to select three random products from the inventory
async function randomthree(page) {
  const products = page.locator('[data-test="inventory-item"]');
  const count = await products.count();
  selectedItems = [];
  // Ensure we select three unique products
  while (selectedItems.length < 3) {
    const i = Math.floor(Math.random() * count);
    if (!selectedItems.find((item) => item.index === i)) {
      const product = products.nth(i);
      const name = (
        await product.locator(".inventory_item_name").textContent()
      ).trim();
      const price = (
        await product.locator(".inventory_item_price").textContent()
      ).trim();
      selectedItems.push({ index: i, name, price });
      await product.locator("button").click();
    }
  }
}
// Function to verify the cart contains the selected items
// and that the prices match
async function verifyCart(page) {
  await page.locator('[data-test="shopping-cart-link"]').click();

  const cartItems = page.locator(".cart_item");
  const cartCount = await cartItems.count();
  // Verify that the cart count matches the number of selected items
  expect(cartCount).toBe(selectedItems.length);

  for (let i = 0; i < cartCount; i++) {
    const cartItem = cartItems.nth(i);
    const cartName = (
      await cartItem.locator(".inventory_item_name").textContent()
    ).trim();
    const cartPrice = (
      await cartItem.locator(".inventory_item_price").textContent()
    ).trim();

    const matched = selectedItems.find(
      (item) => item.name === cartName && item.price === cartPrice,
    );
    expect(
      matched,
      `Cart item ${cartName} - ${cartPrice} should be in selected items`,
    ).toBeTruthy();
  }
}
// Function to verify the total price in the cart
// and that it matches the sum of the selected items' prices
async function verifyPrice(page) {
  const sublabel = await page.locator(".summary_subtotal_label").textContent();
  const totalSelect = await page.locator(".summary_total_label").textContent();
  const totalLabel = parseFloat(totalSelect.replace(/[^0-9.-]+/g, ""));
  const taxLabel = await page.locator(".summary_tax_label").textContent();

  const SUM = (tax, sub) => {
    const taxValue = parseFloat(tax.replace(/[^0-9.-]+/g, ""));
    const subValue = parseFloat(sub.replace(/[^0-9.-]+/g, ""));
    return (taxValue + subValue).toFixed(2);
  };
  // Calculate the expected total
  expect(totalLabel).toEqual(Number(SUM(taxLabel, sublabel)));
}
// Function to perform the checkout process
// This includes filling out the checkout form and verifying the order confirmation
async function checkout(page) {
  await page.locator('[data-test="checkout"]').click();
  await page.fill('[data-test="firstName"]', "Mark Angelo");
  await page.fill('[data-test="lastName"]', "Casuco");
  await page.fill('[data-test="postalCode"]', "12345");
  await page.locator('[data-test="continue"]').click();
  await expect(page.locator(".checkout_summary_container")).toBeVisible();
  await verifyPrice(page);
  await page.locator('[data-test="finish"]').click();
  await expect(page.locator(".complete-header")).toHaveText(
    "Thank you for your order!",
  );
}
// Test case that combines all the steps
test.describe("Sauce Demo Checkout Flow Assesment", () => {
  test("verify checkout process successfully", async ({ page }) => {
    await login(page);
    await randomthree(page);
    await verifyCart(page);
    await checkout(page);
  });
});
