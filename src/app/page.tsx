'use client';

import PageShell from '../components/layout/PageShell';
import AuthPanel from '../components/console/AuthPanel';
import RestaurantPanel from '../components/console/RestaurantPanel';
import OrderPanel from '../components/console/OrderPanel';
import ResultViewer from '../components/console/ResultViewer';

export default function ConsolePage() {
  return (
    <PageShell
      title="Tasty Test Console"
      description="Test Auth, Restaurant, and Order services end-to-end through the API Gateway."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <AuthPanel />
        <RestaurantPanel />
        <OrderPanel />
      </div>
      <ResultViewer />
    </PageShell>
  );
}
