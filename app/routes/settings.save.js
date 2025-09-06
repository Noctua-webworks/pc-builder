import { redirect } from "@remix-run/node";
import db from "../db.server";

export const action = async ({ request }) => {
  const formData = await request.formData();

  // IDs of selected products
  const selectedIds = formData.getAll("selected");

  const updates = [];
  for (const pid of selectedIds) {
    const category = formData.get(`category-${pid}`);
    if (!category) continue;
    updates.push({ productId: pid, category });
  }

  // Clear old selections
  await db.pcBuilderProduct.deleteMany({});
  // Insert new selections
  if (updates.length) {
    await db.pcBuilderProduct.createMany({ data: updates });
  }

  return redirect("/settings");
};
