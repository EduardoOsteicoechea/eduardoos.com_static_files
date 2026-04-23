<script lang="ts">
	import {
		captureCreatedOrderById,
		createUsdOneDollarOrder
	} from "$lib/services/payments/paymentApiService";

	type PaymentExecutionStatus = "idle" | "processing" | "success" | "error";

	let paymentExecutionStatus = $state<PaymentExecutionStatus>("idle");
	let paymentFeedbackMessage = $state("Charge $1.00 USD using PayPal backend flow.");

	const executeOneDollarCheckoutFlow = async (): Promise<void> => {
		paymentExecutionStatus = "processing";
		paymentFeedbackMessage = "Creating PayPal order...";

		try {
			const createdOrder = await createUsdOneDollarOrder();
			paymentFeedbackMessage = `Order ${createdOrder.orderId} created. Capturing...`;
			const capturedOrder = await captureCreatedOrderById(createdOrder.orderId);
			paymentExecutionStatus = "success";
			paymentFeedbackMessage = `Captured ${capturedOrder.orderId} for $${capturedOrder.amount.toFixed(2)} (${capturedOrder.status}).`;
		} catch (error) {
			paymentExecutionStatus = "error";
			paymentFeedbackMessage = error instanceof Error ? error.message : "Payment flow failed.";
		}
	};
</script>

<section class="payment-panel">
	<h2>One Dollar Checkout</h2>
	<p>{paymentFeedbackMessage}</p>
	<button
		class="payment-action-button"
		onclick={executeOneDollarCheckoutFlow}
		disabled={paymentExecutionStatus === "processing"}
	>
		{paymentExecutionStatus === "processing" ? "Processing..." : "Pay $1.00"}
	</button>
</section>

<style>
	.payment-panel {
		max-width: 36rem;
		margin: 0 auto;
		padding: 1rem;
		border: 1px solid var(--border-clear);
		border-radius: var(--radius-1);
		background: var(--accordion-bg);
		color: var(--text-main);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.payment-action-button {
		width: 100%;
		border: 1px solid var(--border-clear);
		background: var(--btn-hover-bg);
		color: var(--text-main);
	}
</style>
