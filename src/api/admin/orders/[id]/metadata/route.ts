import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const id = req.params.id

  const metadata = req.body.metadata

  const orderService = req.scope.resolve("orderService")

  const order = await orderService.update(id, { metadata: metadata })

  res.json({ order })
}
