import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID (use "primary" for the main calendar, or an email address for shared calendars)'),
	timeMin: z.string().optional().describe('Lower bound for event end time (RFC3339, e.g., "2025-01-01T00:00:00Z")'),
	timeMax: z.string().optional().describe('Upper bound for event start time (RFC3339)'),
	q: z.string().optional().describe('Free text search query'),
	maxResults: z.number().min(1).max(2500).default(250).describe('Maximum number of events to return'),
	pageToken: z.string().optional().describe('Page token for pagination'),
	singleEvents: z.boolean().default(true).describe('Expand recurring events into individual instances'),
	orderBy: z.enum(['startTime', 'updated']).default('startTime').describe('Order of events (startTime requires singleEvents=true)'),
	showDeleted: z.boolean().default(false).describe('Include deleted events'),
};

export function registerEventsList(server: McpServer, config: Config): void {
	server.registerTool(
		'events_list',
		{
			title: 'List events',
			description: 'List calendar events within a time range. Returns events with their details including attendees and response status.',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({calendarId, timeMin, timeMax, q, maxResults, pageToken, singleEvents, orderBy, showDeleted}) => {
			const params = new URLSearchParams();
			if (timeMin) {
				params.set('timeMin', timeMin);
			}

			if (timeMax) {
				params.set('timeMax', timeMax);
			}

			if (q) {
				params.set('q', q);
			}

			params.set('maxResults', String(maxResults));
			if (pageToken) {
				params.set('pageToken', pageToken);
			}

			params.set('singleEvents', String(singleEvents));
			params.set('orderBy', orderBy);
			if (showDeleted) {
				params.set('showDeleted', 'true');
			}

			const result = await makeCalendarApiCall('GET', `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, config.token);
			return jsonResult(result);
		},
	);
}
