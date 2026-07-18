/**
 * Seed one-time pentru catalogul Paddle (sandbox).
 * Creează produsul "CV profesional" + prețul unic.
 *
 * NOTĂ: Paddle nu suportă RON ca monedă de facturare — prețul de bază e în EUR
 * (echivalentul a ~49 RON). Ajustabil ulterior din dashboard sau re-rulând scriptul.
 *
 * Rulare: npx tsx --env-file=.env.local scripts/seed-paddle-catalog.ts
 */
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY;
if (!apiKey) {
  console.error("PADDLE_API_KEY lipsește din .env.local");
  process.exit(1);
}

const paddle = new Paddle(apiKey, {
  environment: apiKey.startsWith("pdl_sdbx_") ? Environment.sandbox : Environment.production,
});

async function seed() {
  const product = await paddle.products.create({
    name: "CV profesional",
    taxCategory: "standard", // digital-goods ar cere aprobare manuală în dashboard
    description:
      "CV profesional generat cu AI, optimizat pentru piața muncii din România. Descărcare PDF.",
  });

  const price = await paddle.prices.create({
    productId: product.id,
    description: "CV profesional — plată unică (~49 RON)",
    name: "Plată unică",
    unitPrice: { amount: "999", currencyCode: "EUR" }, // 9,99 € ≈ 49 RON
    quantity: { minimum: 1, maximum: 1 },
  });

  console.log(JSON.stringify({ productId: product.id, priceId: price.id }, null, 2));
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
