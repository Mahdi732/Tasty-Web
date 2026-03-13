'use client';

import React from 'react';
import { Store, Users, AlertTriangle } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import { useConsoleStore } from '../../store/consoleStore';
import { restaurantService } from '../../services/restaurant.service';

export default function RestaurantPanel() {
    const {
        restaurantId, restaurantName, city, citySlug,
        staffUserId, staffRole, orderRestaurantId,
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

    const handleCreate = async () => {
        const json = await run('Create restaurant', () =>
            restaurantService.create({ name: restaurantName, location: { city, citySlug } })
        );
        const createdId = (json as { data?: { _id?: string } })?.data?._id ?? '';
        if (createdId) {
            setField('restaurantId', createdId);
            setField('orderRestaurantId', createdId);
            pushLog(`Restaurant selected: ${createdId}`);
        }
    };

    const handleListPublic = () =>
        run('List public restaurants', () => restaurantService.listPublic());

    const handleGetOwned = () =>
        run('Get manager restaurant', () => restaurantService.getById(restaurantId));

    const handleRequestPublish = () =>
        run('Request publish', () => restaurantService.requestPublish(restaurantId));

    const handleArchive = () =>
        run('Archive restaurant', () => restaurantService.archive(restaurantId));

    const handleRestoreFee = () =>
        run('Request restore fee', () => restaurantService.requestRestoreFee(restaurantId, 'Need to reopen'));

    const handleAddStaff = () =>
        run('Add staff', () =>
            restaurantService.addStaff(restaurantId, {
                userId: staffUserId,
                role: staffRole as 'STAFF' | 'MANAGER' | 'DELIVERY_MAN' | 'CHEF',
            })
        );

    const handleLowStock = () =>
        run('Chef low-stock alert', () =>
            restaurantService.triggerLowStock(restaurantId, {
                ingredient: 'Tomato',
                threshold: 5,
                note: 'Urgent restock needed',
            })
        );

    return (
        <Card title="Restaurant (restaurantService)" icon={<Store className="h-4 w-4" />} accentColor="green">
            <Input
                label="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setField('restaurantName', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input label="City" value={city} onChange={(e) => setField('city', e.target.value)} />
                <Input label="City Slug" value={citySlug} onChange={(e) => setField('citySlug', e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleCreate} loading={isLoading}>Create</Button>
                <Button variant="secondary" onClick={handleListPublic} loading={isLoading}>
                    List Public
                </Button>
            </div>

            <Input
                label="Selected Restaurant ID"
                value={restaurantId}
                onChange={(e) => setField('restaurantId', e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={handleGetOwned} loading={isLoading}>Get Owned</Button>
                <Button variant="secondary" onClick={handleRequestPublish} loading={isLoading}>Request Publish</Button>
                <Button variant="danger" onClick={handleArchive} loading={isLoading}>Archive</Button>
                <Button variant="ghost" onClick={handleRestoreFee} loading={isLoading}>Restore Fee</Button>
            </div>

            <div className="border-t border-white/[0.06] pt-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <Users className="h-3.5 w-3.5" /> Staff Management
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Staff User ID"
                        value={staffUserId}
                        onChange={(e) => setField('staffUserId', e.target.value)}
                    />
                    <Input
                        label="Role"
                        value={staffRole}
                        onChange={(e) => setField('staffRole', e.target.value)}
                        placeholder="STAFF|MANAGER|CHEF|DELIVERY_MAN"
                    />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={handleAddStaff} loading={isLoading}>
                        Assign Staff
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleLowStock}
                        loading={isLoading}
                        icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    >
                        Low-Stock Alert
                    </Button>
                </div>
            </div>
        </Card>
    );
}
