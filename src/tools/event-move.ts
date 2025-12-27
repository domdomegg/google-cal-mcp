import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const inputSchema = strictSchemaWithAliases({
	calendarId: z.string().describe('Source calendar ID'),
	eventId: z.string().describe('Event ID to move'),
	destination: z.string().describe('Destination calendar ID'),
	sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Who to send notifications to'),
}, {});

export function registerEventMove(server: McpServer, config: Config): void {
	server.registerTool(
		'event_move',
		{
			title: 'Move event',
			description: 'Move an event to a different calendar. Changes the event organizer. Only works for default events (not birthday, focusTime, etc.).',
			inputSchema,
		},
		async ({calendarId, eventId, destination, sendUpdates}) => {
			const params = new URLSearchParams();
			params.set('destination', destination);
			params.set('sendUpdates', sendUpdates);

			const result = await makeCalendarApiCall(
				'POST',
				`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}/move?${params.toString()}`,
				config.token,
			);
			return jsonResult(result);
		},
	);
}
