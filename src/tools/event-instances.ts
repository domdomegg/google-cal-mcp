import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID'),
	eventId: z.string().describe('Recurring event ID'),
	timeMin: z.string().optional().describe('Lower bound for instances (RFC3339)'),
	timeMax: z.string().optional().describe('Upper bound for instances (RFC3339)'),
	maxResults: z.number().min(1).max(2500).default(250).describe('Maximum instances to return'),
	pageToken: z.string().optional().describe('Page token for pagination'),
	showDeleted: z.boolean().default(false).describe('Include deleted instances'),
};

export function registerEventInstances(server: McpServer, config: Config): void {
	server.registerTool(
		'event_instances',
		{
			title: 'Get recurring event instances',
			description: 'Get all instances of a recurring event within a time range.',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({calendarId, eventId, timeMin, timeMax, maxResults, pageToken, showDeleted}) => {
			const params = new URLSearchParams();
			if (timeMin) {
				params.set('timeMin', timeMin);
			}

			if (timeMax) {
				params.set('timeMax', timeMax);
			}

			params.set('maxResults', String(maxResults));
			if (pageToken) {
				params.set('pageToken', pageToken);
			}

			if (showDeleted) {
				params.set('showDeleted', 'true');
			}

			const result = await makeCalendarApiCall(
				'GET',
				`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}/instances?${params.toString()}`,
				config.token,
			);
			return jsonResult(result);
		},
	);
}
