import { redirect } from "next/navigation";

import PaymentDetail from "@/components/subscription/PaymentDetail";
import { getAuthSession } from "@/lib/auth";

interface PaymentDetailPageProps {
  params: {
    clientSecret: string;
  };
}

const PaymentDetailPage = async ({ params }: PaymentDetailPageProps) => {
  const { clientSecret } = params;

  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }
  return (
    <PaymentDetail
      clientSecret={clientSecret}
      name={user.name!}
      email={user.email!}
    />
  );
};

export default PaymentDetailPage;
