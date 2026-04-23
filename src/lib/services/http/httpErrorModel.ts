export type StandardHttpErrorContext = {
	responseStatusCode: number;
	responseStatusText: string;
	responseBodyMessage?: string;
	requestedEndpointPath: string;
};

export class StandardHttpRequestError extends Error {
	public readonly responseStatusCode: number;
	public readonly responseStatusText: string;
	public readonly responseBodyMessage?: string;
	public readonly requestedEndpointPath: string;

	constructor(errorContext: StandardHttpErrorContext) {
		const formattedResponseMessage = errorContext.responseBodyMessage
			? ` - ${errorContext.responseBodyMessage}`
			: "";
		super(
			`HTTP ${errorContext.responseStatusCode} ${errorContext.responseStatusText}${formattedResponseMessage}`
		);
		this.name = "StandardHttpRequestError";
		this.responseStatusCode = errorContext.responseStatusCode;
		this.responseStatusText = errorContext.responseStatusText;
		this.responseBodyMessage = errorContext.responseBodyMessage;
		this.requestedEndpointPath = errorContext.requestedEndpointPath;
	}
}

export const isStandardHttpRequestError = (unknownError: unknown): unknownError is StandardHttpRequestError =>
	unknownError instanceof StandardHttpRequestError;
