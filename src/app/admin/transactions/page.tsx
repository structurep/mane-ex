import { getAdminTransactions } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  funded: "bg-blue-100 text-blue-700",
  shipping: "bg-yellow-100 text-yellow-700",
  delivered: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default async function AdminTransactionsPage() {
  const transactions = await getAdminTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-black">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-ink-mid">
          {transactions.length} escrow transactions
        </p>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {transactions.map(
          (tx: {
            id: string;
            offer_id: string;
            buyer_id: string;
            seller_id: string;
            amount: number;
            platform_fee: number;
            status: string;
            stripe_payment_intent_id: string | null;
            created_at: string;
            funded_at: string | null;
            completed_at: string | null;
          }) => (
            <Card key={tx.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[tx.status] || ""}>
                        {tx.status}
                      </Badge>
                      <span className="text-sm font-medium text-ink-black">
                        ${(tx.amount / 100).toLocaleString()}
                      </span>
                      <span className="text-xs text-ink-light">
                        (fee: ${(tx.platform_fee / 100).toLocaleString()})
                      </span>
                    </div>
                    <p className="text-xs text-ink-light">
                      Created{" "}
                      {new Date(tx.created_at).toLocaleDateString()}{" "}
                      {tx.funded_at && (
                        <>
                          &middot; Funded{" "}
                          {new Date(tx.funded_at).toLocaleDateString()}
                        </>
                      )}
                      {tx.completed_at && (
                        <>
                          {" "}
                          &middot; Completed{" "}
                          {new Date(tx.completed_at).toLocaleDateString()}
                        </>
                      )}
                    </p>
                    {tx.stripe_payment_intent_id && (
                      <p className="font-mono text-xs text-ink-light">
                        {tx.stripe_payment_intent_id}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-mid">
            No transactions found.
          </p>
        )}
      </div>
    </div>
  );
}
