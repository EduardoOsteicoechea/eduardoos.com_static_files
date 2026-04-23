import { executeJsonHttpRequest } from "$lib/services/http/httpRequestExecutor";

type CreateOrderResponse = {
	orderId: string;
	status: string;
};

type CaptureOrderResponse = {
	orderId: string;
	status: string;
	amount: number;
};

export const createUsdOneDollarOrder = async (): Promise<CreateOrderResponse> =>
	executeJsonHttpRequest<CreateOrderResponse>("/api/payments/create-order", {
		requestMethod: "POST",
		requestBody: {
			amount: 1,
			currencyCode: "USD"
		}
	});

export const captureCreatedOrderById = async (orderId: string): Promise<CaptureOrderResponse> =>
	executeJsonHttpRequest<CaptureOrderResponse>("/api/payments/capture-order", {
		requestMethod: "POST",
		requestBody: {
			orderId
		}
	});
