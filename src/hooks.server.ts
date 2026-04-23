import { redirect, type Handle } from "@sveltejs/kit";

const protectedRoutePrefixes = ["/dashboard", "/payments"];
const guestOnlyRoutePrefixes = ["/login", "/register"];

const isPathMatchingAnyPrefix = (pathname: string, routePrefixes: string[]): boolean =>
	routePrefixes.some(
		(routePrefix) => pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
	);

const hasAnyAuthenticationCookie = (cookieHeaderValue: string | null): boolean => {
	if (!cookieHeaderValue) {
		return false;
	}

	return cookieHeaderValue.includes("access_token=") || cookieHeaderValue.includes("refresh_token=");
};

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const cookieHeaderValue = event.request.headers.get("cookie");
	const hasAuthenticatedSessionCookie = hasAnyAuthenticationCookie(cookieHeaderValue);

	if (isPathMatchingAnyPrefix(pathname, protectedRoutePrefixes) && !hasAuthenticatedSessionCookie) {
		throw redirect(302, "/login");
	}

	if (isPathMatchingAnyPrefix(pathname, guestOnlyRoutePrefixes) && hasAuthenticatedSessionCookie) {
		throw redirect(302, "/dashboard");
	}

	return resolve(event);
};
