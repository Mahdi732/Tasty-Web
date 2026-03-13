import { api } from '../lib/api';
import type { ApiResponse, CreateOrderPayload, CreateOrderResponse } from '../types';

const PREFIX = '/api/v1/orders';

export const orderService = {
    create(payload: CreateOrderPayload) {
        return api.post<ApiResponse<CreateOrderResponse>>(`${PREFIX}/v1/orders/me`, payload);
    },

    myOrders() {
        return api.get<ApiResponse>(`${PREFIX}/v1/orders/me`);
    },

    restaurantOrders(restaurantId: string) {
        return api.get<ApiResponse>(`${PREFIX}/v1/orders/restaurant/${restaurantId}`);
    },

    adminOrders() {
        return api.get<ApiResponse>(`${PREFIX}/v1/orders/admin/all`);
    },

    scanQr(qrToken: string) {
        return api.post<ApiResponse>(`${PREFIX}/v1/orders/qr/scan`, { qrToken });
    },
};
