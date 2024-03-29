import { EventBusService } from "@medusajs/medusa"
import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/medusa"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const id = req.params.id
  const email = req.body.email
  const eventName = req.body.eventName

  const eventBusService = req.scope.resolve<EventBusService>("eventBusService")

  eventBusService.emit([
    {
      eventName: eventName,
      data: {
        "id": id,
        "email": email,
        "resend": true,
      },
    }
  ])

  res.json({
    message: "[POST] Email Event Sender",
  })
}