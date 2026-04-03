# Frontend Gateway Coverage Matrix

This file maps API Gateway endpoints to frontend implementation status.

Source of truth:
- `backend/apiGateway/src/routes/api.routes.js`

## Legend

- `Implemented` = consumed in `web/src/services/*` and used by pages/components.
- `Available` = endpoint has service helper but no full UI workflow yet.
- `Intentional` = endpoint is backend/internal or operationally limited for specific actors.

## Auth and Profile

- `POST /api/v1/auth/register` -> Implemented
- `POST /api/v1/auth/login` -> Implemented
- `POST /api/v1/auth/refresh` -> Implemented (explicit helper + 401 retry path)
- `POST /api/v1/auth/logout` -> Implemented
- `POST /api/v1/auth/logout-all` -> Implemented
- `GET /api/v1/auth/sessions` -> Implemented
- `DELETE /api/v1/auth/sessions/:sessionId` -> Implemented
- `GET /api/v1/auth/oauth/:provider/start` -> Implemented
- `POST /api/v1/auth/oauth/link/:provider` -> Implemented
- `DELETE /api/v1/auth/oauth/unlink/:provider` -> Implemented
- `POST /api/v1/auth/email/start-verification` -> Implemented
- `POST /api/v1/auth/email/verify` -> Implemented
- `POST /api/v1/auth/phone/start-verification` -> Implemented
- `POST /api/v1/auth/phone/verify` -> Implemented
- `POST /api/v1/activate-account` -> Implemented
- `GET /api/v1/auth/me` and `/profile` -> Implemented (`/me` primary)

## Restaurants

- `GET /api/v1/restaurants` -> Implemented
- `GET /api/v1/restaurants/:citySlug/:slug` -> Implemented
- `GET /api/v1/restaurants/:citySlug/:slug/menu` -> Implemented
- `POST /api/v1/restaurants/:citySlug/:slug/estimate-delivery-time` -> Implemented
- `POST /api/v1/restaurants` -> Intentional (use manager create route for ownership flow)

## Manager and Admin

- `POST /api/v1/manager/restaurants` -> Implemented
- `GET /api/v1/manager/restaurants/:id` -> Implemented
- `PATCH /api/v1/manager/restaurants/:id` -> Implemented
- `POST /api/v1/manager/restaurants/:id/request-publish` -> Implemented
- `POST /api/v1/manager/restaurants/:id/staff` -> Implemented
- `POST /api/v1/manager/restaurants/:id/archive` -> Implemented
- `POST /api/v1/manager/restaurants/:id/restore/request-fee` -> Implemented
- `POST /api/v1/manager/restaurants/:id/inventory/low-stock-alert` -> Implemented
- `POST/GET/PATCH/DELETE /api/v1/manager/restaurants/:id/menu/categories*` -> Implemented
- `POST/GET/PATCH/DELETE /api/v1/manager/restaurants/:id/menu/items*` -> Implemented
- `PATCH /api/v1/manager/menu/items/:id/availability` -> Implemented
- `PATCH /api/v1/manager/menu/items/:id/publish` -> Implemented
- `PATCH /api/v1/admin/restaurants/:id/subscription` -> Implemented (superadmin controls)

## Orders, Ops, and Payments

- `POST /api/v1/orders` -> Implemented
- `GET /api/v1/orders/me` -> Implemented
- `POST /api/v1/orders/:orderId/driver-arrived` -> Implemented (ops console)
- `GET /api/v1/ops/orders/restaurant/:restaurantId` -> Implemented
- `GET /api/v1/ops/orders/admin/all` -> Implemented
- `POST /api/v1/ops/orders/qr/scan` -> Implemented
- `POST /api/v1/payments/order` -> Implemented
- `POST /api/v1/payments/subscribe` -> Implemented

## Security Helper

- `POST /api/v1/face/compare-id` -> Intentional

Reason:
- frontend uses `POST /api/v1/activate-account` which already orchestrates face+ID comparison and account activation server-side.
