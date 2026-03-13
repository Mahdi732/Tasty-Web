import { api } from '../lib/api';
import type {
    ApiResponse,
    Restaurant,
    Menu,
    DeliveryETA,
    CreateRestaurantPayload,
    StaffPayload,
    LowStockPayload,
    PaginatedData,
} from '../types';

const PREFIX = '/api/v1/restaurants';

export const restaurantService = {
    create(payload: CreateRestaurantPayload) {
        return api.post<ApiResponse<Restaurant>>(`${PREFIX}/restaurants`, payload);
    },

    getById(id: string) {
        return api.get<ApiResponse<Restaurant>>(`${PREFIX}/restaurants/${id}`);
    },

    listPublic(page = 1, limit = 20) {
        return api.get<ApiResponse<PaginatedData<Restaurant>>>(`${PREFIX}/restaurants`, {
            params: { page, limit },
        });
    },

    requestPublish(id: string) {
        return api.post<ApiResponse>(`${PREFIX}/restaurants/${id}/request-publish`);
    },

    addStaff(id: string, payload: StaffPayload) {
        return api.post<ApiResponse>(`${PREFIX}/restaurants/${id}/staff`, payload);
    },

    archive(id: string) {
        return api.post<ApiResponse>(`${PREFIX}/restaurants/${id}/archive`);
    },

    requestRestoreFee(id: string, reason: string) {
        return api.post<ApiResponse>(`${PREFIX}/restaurants/${id}/restore/request-fee`, { reason });
    },

    triggerLowStock(id: string, payload: LowStockPayload) {
        return api.post<ApiResponse>(`${PREFIX}/restaurants/${id}/inventory/low-stock-alert`, payload);
    },

    getMenu(id: string) {
        return api.get<ApiResponse<Menu>>(`${PREFIX}/restaurants/${id}/menu`);
    },

    getDeliveryETA(slug: string, lat: number, lng: number) {
        return api.get<ApiResponse<DeliveryETA>>(
            `${PREFIX}/restaurants/${slug}/estimate-delivery-time`,
            { params: { lat, lng } }
        );
    },
};
