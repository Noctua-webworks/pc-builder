import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const query = `
    {
      products(first: 50) {
        edges {
          node {
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
                      node {
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await admin.graphql(query);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products" }),
      { status: 500 }
    );
  }
};
