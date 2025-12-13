import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {textResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID'),
	eventId: z.string().describe('Event ID to delete'),
	sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Who to send cancellation notifications to'),
};

export function registerEventDelete(server: McpServer, config: Config): void {
	server.registerTool(
		'event_delete',
		{
			title: 'Delete event',
			description: 'Delete a calendar event',
			inputSchema,
		},
		async ({calendarId, eventId, sendUpdates}) => {
			const params = new URLSearchParams();
			params.set('sendUpdates', sendUpdates);

			await makeCalendarApiCall('DELETE', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${params.toString()}`, config.token);
			return textResult('Event deleted successfully');
		},
	);
}
