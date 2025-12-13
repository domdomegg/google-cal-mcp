const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export async function makeCalendarApiCall<T = Record<string, unknown>>(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: string,
	token: string,
	body?: unknown,
): Promise<T> {
	const url = `${CALENDAR_API_BASE}${path}`;

	const options: RequestInit = {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(url, options);

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(`Calendar API error: ${response.status} ${JSON.stringify(error)}`);
	}

	// Handle 204 No Content
	if (response.status === 204) {
		return {} as T;
	}

	return response.json() as Promise<T>;
}
