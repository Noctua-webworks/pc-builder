import shopify from "../shopify.server";
import db from "../db.server";

export const loader = async () => {
  try {
    // Offline session for Admin API
    const session = await shopify.sessionStorage.loadOfflineSession(
      process.env.SHOPIFY_SHOP
    );
    if (!session) throw new Error("No offline session found");

    const client = new shopify.api.clients.Graphql({ session });

    // Get selected products from DB
    const selected = await db.pcBuilderProduct.findMany();
    const productIds = selected.map(
      (p) => `gid://shopify/Product/${p.productId}`
    );

    if (!productIds.length) {
      return new Response(
        JSON.stringify({ data: { products: [] } }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Query only selected products
    const query = `
      query($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
            featuredImage { url }
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  price { amount currencyCode }
                  metafields(first: 10) {
                    edges {
                      node { namespace key value }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await client.query({
      data: { query, variables: { ids: productIds } },
    });

    return new Response(JSON.stringify(response.body), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Proxy failed", details: String(err) }),
      { status: 500 }
    );
  }
};
