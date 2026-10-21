"use client";

import dynamic from "next/dynamic";

const OrderClient = dynamic(() => import("./OrderClient"), { ssr: false });

export default function OrderPage() {
  return <OrderClient />;
}
