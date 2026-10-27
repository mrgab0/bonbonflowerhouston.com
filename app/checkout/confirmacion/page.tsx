import { Order } from "@/lib/models/Order";
import dbConnect from "@/lib/db";
import { CheckoutConfirmationClient } from "@/components/shop/CheckoutConfirmationClient";

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const { orderId } = await searchParams;
  await dbConnect();

  const orderDoc = await Order.findOne({ orderId }).lean();
  const order = orderDoc ? JSON.parse(JSON.stringify(orderDoc)) : null;

  return (
    <CheckoutConfirmationClient
      orderId={orderId}
      order={order}
    />
  );
}
