'use client';

import React from 'react';
import { ShoppingCart, QrCode } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { useConsoleStore } from '../../store/consoleStore';
import { orderService } from '../../services/order.service';
import type { CreateOrderPayload } from '../../types';

export default function OrderPanel() {
    const {
        orderRestaurantId, orderType, paymentMethod,
        itemName, itemPrice, itemQty, qrToken,
        restaurantName, citySlug,
        setField, setResult, pushLog, setLoading, isLoading,
    } = useConsoleStore();

    const run = async (label: string, fn: () => Promise<unknown>) => {
        try {
            setLoading(true);
            pushLog(`${label} started`);
            const res = await fn();
            const json = (res as { data?: unknown })?.data ?? res;
            setResult(JSON.stringify(json, null, 2));
            pushLog(`${label} success`);
            return json;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setResult(message);
            pushLog(`${label} failed`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrder = async () => {
        const payload: CreateOrderPayload = {
            restaurantId: orderRestaurantId,
            orderType: orderType as CreateOrderPayload['orderType'],
            paymentMethod: paymentMethod as CreateOrderPayload['paymentMethod'],
            restaurantSnapshot: {
                name: restaurantName,
                slug: restaurantName.toLowerCase().replace(/\s+/g, '-'),
                citySlug,
                version: 1,
                taxRate: 0,
                serviceFee: 0,
                currency: 'USD',
            },
            fulfillment: {
                mode: orderType as CreateOrderPayload['orderType'],
                deliveryAddress: orderType === 'DELIVERY' ? 'Demo Street 12, Agadir' : null,
                tableRef: orderType === 'RESERVATION' ? 'T-3' : null,
                scheduledAt: null,
            },
            items: [
                {
                    menuItemId: 'demo-item-1',
                    name: itemName,
                    unitPrice: Number(itemPrice),
                    quantity: Number(itemQty),
                },
            ],
        };

        const json = await run('Create order', () => orderService.create(payload));
        const tokenFromResponse =
            (json as { data?: { qrToken?: string } })?.data?.qrToken ?? '';
        if (tokenFromResponse) {
            setField('qrToken', tokenFromResponse);
            pushLog('QR token captured from order creation');
        }
    };

    const handleMyOrders = () => run('List my orders', () => orderService.myOrders());
    const handleRestaurantOrders = () =>
        run('List restaurant orders', () => orderService.restaurantOrders(orderRestaurantId));
    const handleAdminOrders = () => run('List admin orders', () => orderService.adminOrders());
    const handleScanQr = () => run('Scan QR', () => orderService.scanQr(qrToken));

    return (
        <Card title="Order (orderService)" icon={<ShoppingCart className="h-4 w-4" />} accentColor="purple">
            <Input
                label="Order Restaurant ID"
                value={orderRestaurantId}
                onChange={(e) => setField('orderRestaurantId', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Order Type"
                    value={orderType}
                    onChange={(e) => setField('orderType', e.target.value)}
                    placeholder="DELIVERY|PREORDER|RESERVATION"
                />
                <Input
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setField('paymentMethod', e.target.value)}
                    placeholder="PAY_ON_APP|PAY_LATER"
                />
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Input label="Item Name" value={itemName} onChange={(e) => setField('itemName', e.target.value)} />
                <Input label="Price" value={itemPrice} onChange={(e) => setField('itemPrice', e.target.value)} />
                <Input label="Qty" value={itemQty} onChange={(e) => setField('itemQty', e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleCreateOrder} loading={isLoading}>Create Order</Button>
                <Button variant="secondary" onClick={handleMyOrders} loading={isLoading}>My Orders</Button>
                <Button variant="secondary" onClick={handleRestaurantOrders} loading={isLoading}>Restaurant Orders</Button>
                <Button variant="ghost" onClick={handleAdminOrders} loading={isLoading}>Admin Orders</Button>
            </div>

            <div className="border-t border-white/[0.06] pt-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <QrCode className="h-3.5 w-3.5" /> QR Scanning
                </div>
                <Input label="QR Token" value={qrToken} onChange={(e) => setField('qrToken', e.target.value)} />
                <div className="mt-3">
                    <Button variant="secondary" onClick={handleScanQr} loading={isLoading}>
                        Scan QR
                    </Button>
                </div>
            </div>
        </Card>
    );
}
