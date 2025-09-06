import { useLoaderData, Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Loader: fetch products from Shopify Admin API + saved selections
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const query = `
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            featuredImage { url }
          }
        }
      }
    }
  `;
  const res = await admin.graphql(query);
  const data = await res.json();

  // Already selected products in DB
  const selected = await db.pcBuilderProduct.findMany();

  return json({
    products: data.data.products.edges,
    selected,
  });
};

// React UI for merchant
export default function Settings() {
  const { products, selected } = useLoaderData();

  return (
    <div style={{ padding: 20 }}>
      <h1>⚙️ PC Builder Settings</h1>
      <p>Select which products can be used in the PC Builder tool.</p>

      <Form method="post" action="/settings/save">
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Product</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Category</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Selected?</th>
            </tr>
          </thead>
          <tbody>
            {products.map(({ node }) => {
              const pid = node.id.split("/").pop(); // raw ID
              const isSelected = selected.find((s) => s.productId === pid);

              return (
                <tr key={node.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {node.featuredImage && (
                      <img
                        src={node.featuredImage.url}
                        width={40}
                        alt=""
                        style={{ marginRight: 10 }}
                      />
                    )}
                    {node.title}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <select
                      name={`category-${pid}`}
                      defaultValue={isSelected?.category || ""}
                    >
                      <option value="">None</option>
                      <option value="cpu">CPU</option>
                      <option value="gpu">GPU</option>
                      <option value="motherboard">Motherboard</option>
                    </select>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <input
                      type="checkbox"
                      name="selected"
                      value={pid}
                      defaultChecked={!!isSelected}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button type="submit" style={{ marginTop: 20 }}>
          💾 Save Settings
        </button>
      </Form>
    </div>
  );
}
