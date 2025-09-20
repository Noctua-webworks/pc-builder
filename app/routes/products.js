// import shopify from "../shopify.server";
// import db from "../db.server";

// export const loader = async () => {
//   try {
//     console.log('he....2');
    
//     // Offline session for Admin API
//     const session = await shopify.sessionStorage.loadOfflineSession(
//       process.env.SHOPIFY_SHOP
//     );
//     if (!session) throw new Error("No offline session found");

//     const client = new shopify.api.clients.Graphql({ session });

//     // Get selected products from DB
//     const selected = await db.pcBuilderProduct.findMany();
//     const productIds = selected.map(
//       (p) => `gid://shopify/Product/${p.productId}`
//     );

//     if (!productIds.length) {
//       return new Response(
//         JSON.stringify({ data: { products: [] } }),
//         { headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Query only selected products
//     const query = `
//       query($ids: [ID!]!) {
//         nodes(ids: $ids) {
//           ... on Product {
//             id
//             title
//             handle
//             featuredImage { url }
//             variants(first: 5) {
//               edges {
//                 node {
//                   id
//                   title
//                   price { amount currencyCode }
//                   metafields(first: 10) {
//                     edges {
//                       node { namespace key value }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     `;

//     const response = await client.query({
//       data: { query, variables: { ids: productIds } },
//     });

//     return new Response(JSON.stringify(response.body), {
//       headers: { "Content-Type": "application/json" },
//       status: 200,
//     });
//   } catch (err) {
//     console.error("Proxy error:", err);
//     return new Response(
//       JSON.stringify({ error: "Proxy failed", details: String(err) }),
//       { status: 500 }
//     );
//   }
// };


import { json } from '@remix-run/node';
// import { authenticate } from '~/shopify.server'; // Adjust path as needed
import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
  try {
    console.log('here in loader...');
    
    // Authenticate admin session
    // const { admin } = await authenticate.admin(request);
    const { admin } = await authenticate.public.appProxy(request);
    console.log(admin, 'admin here..');
    
    // GraphQL query to fetch first 5 products
    const query = `
      {
        products(first: 5) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
              }
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    price
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();

    return json(data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return json(
      { error: 'Failed to fetch products', details: String(error) },
      { status: 400 }
    );
  }
};

