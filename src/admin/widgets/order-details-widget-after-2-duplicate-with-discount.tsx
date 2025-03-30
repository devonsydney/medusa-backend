import { 
  useAdminCreateDraftOrder,
  useAdminDiscounts
} from "medusa-react"
import { 
  Button,
  Container,
  Input,
  Text
} from "@medusajs/ui"
import { useState } from "react"
import type { WidgetConfig } from "@medusajs/admin"
import { Order } from "@medusajs/medusa"
import { useNavigate } from "react-router-dom"

type Props = {
  order: Order
}

const OrderDetailsWidgetBeforeDuplicateWithDiscount = ({ order }: Props) => {
  const [discountCode, setDiscountCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const createDraftOrder = useAdminCreateDraftOrder()
  const { discounts } = useAdminDiscounts({
    is_disabled: false
  })

  const handleCreateDraftOrder = async () => {
    if (!order || isProcessing) return

    // Only validate discount code if one was entered
    if (discountCode) {
      const discount = discounts?.find(d => 
        d.code?.toLowerCase() === discountCode.toLowerCase()
      )

      if (!discount) {
        setError("Invalid discount code")
        return
      }
    }

    try {
      setIsProcessing(true)
      setError(null)

      const { draft_order } = await createDraftOrder.mutateAsync({
        email: order.email,
        items: order.items.map(item => ({
          quantity: item.quantity,
          variant_id: item.variant.id
        })),
        shipping_address: order.shipping_address && {
          first_name: order.shipping_address.first_name,
          last_name: order.shipping_address.last_name,
          address_1: order.shipping_address.address_1,
          address_2: order.shipping_address.address_2,
          city: order.shipping_address.city,
          country_code: order.shipping_address.country_code,
          province: order.shipping_address.province,
          postal_code: order.shipping_address.postal_code,
          phone: order.shipping_address.phone,
          company: order.shipping_address.company
        },
        billing_address: order.billing_address && {
          first_name: order.billing_address.first_name,
          last_name: order.billing_address.last_name,
          address_1: order.billing_address.address_1,
          address_2: order.billing_address.address_2,
          city: order.billing_address.city,
          country_code: order.billing_address.country_code,
          province: order.billing_address.province,
          postal_code: order.billing_address.postal_code,
          phone: order.billing_address.phone,
          company: order.billing_address.company
        },
        region_id: order.region_id,
        customer_id: order.customer?.id,
        shipping_methods: order.shipping_methods.map(method => ({
          option_id: method.shipping_option.id,
          data: method.data
        })),
        // Only include discounts if a code was entered
        ...(discountCode ? { discounts: [{ code: discountCode }] } : {}),
        metadata: {
          original_order_id: order.id,
          is_duplicate: true
        }
      })

      navigate(`/a/draft-orders/${draft_order.id}`)

    } catch (error) {
      console.error("Error creating draft order:", error)
      setError("Failed to create draft order")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!order) return null

  return (
    <Container className="mt-4">
      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          onClick={handleCreateDraftOrder}
          disabled={isProcessing}
        >
          {isProcessing ? "Creating..." : "Duplicate Order"}
        </Button>
        <Input
          type="text"
          placeholder="Discount code (optional)"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="max-w-[200px]"
        />
      </div>
      {error && (
        <Text className="text-ui-fg-error text-sm mt-2">
          {error}
        </Text>
      )}
    </Container>
  )
}

export const config: WidgetConfig = {
  zone: "order.details.after",
}

export default OrderDetailsWidgetBeforeDuplicateWithDiscount 