import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const attendeeSchema = z.object({
	email: z.string().describe('Attendee email address'),
	displayName: z.string().optional(),
	optional: z.boolean().optional(),
	responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).optional(),
});

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID'),
	eventId: z.string().describe('Event ID to update'),
	summary: z.string().optional().describe('New event title'),
	description: z.string().optional().describe('New event description'),
	location: z.string().optional().describe('New event location'),
	start: z.object({
		dateTime: z.string().optional(),
		date: z.string().optional(),
		timeZone: z.string().optional(),
	}).optional().describe('New start time'),
	end: z.object({
		dateTime: z.string().optional(),
		date: z.string().optional(),
		timeZone: z.string().optional(),
	}).optional().describe('New end time'),
	attendees: z.array(attendeeSchema).optional().describe('Updated attendee list'),
	sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Who to send notifications to'),
};

export function registerEventUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'event_update',
		{
			title: 'Update event',
			description: 'Update an existing calendar event. Only specified fields will be changed.',
			inputSchema,
		},
		async ({calendarId, eventId, summary, description, location, start, end, attendees, sendUpdates}) => {
			const params = new URLSearchParams();
			params.set('sendUpdates', sendUpdates);

			const body: Record<string, unknown> = {};
			if (summary !== undefined) {
				body.summary = summary;
			}

			if (description !== undefined) {
				body.description = description;
			}

			if (location !== undefined) {
				body.location = location;
			}

			if (start !== undefined) {
				body.start = start;
			}

			if (end !== undefined) {
				body.end = end;
			}

			if (attendees !== undefined) {
				body.attendees = attendees;
			}

			const result = await makeCalendarApiCall('PATCH', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${params.toString()}`, config.token, body);
			return jsonResult(result);
		},
	);
}
