import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID'),
	eventId: z.string().describe('Event ID to retrieve'),
};

export function registerEventGet(server: McpServer, config: Config): void {
	server.registerTool(
		'event_get',
		{
			title: 'Get event',
			description: 'Get details of a specific calendar event',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({calendarId, eventId}) => {
			const result = await makeCalendarApiCall('GET', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, config.token);
			return jsonResult(result);
		},
	);
}
