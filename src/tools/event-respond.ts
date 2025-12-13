import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	calendarId: z.string().default('primary').describe('Calendar ID'),
	eventId: z.string().describe('Event ID to respond to'),
	response: z.enum(['accepted', 'declined', 'tentative']).describe('Your response to the event invitation'),
	sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Who to send notifications to'),
};

export function registerEventRespond(server: McpServer, config: Config): void {
	server.registerTool(
		'event_respond',
		{
			title: 'Respond to event',
			description: 'RSVP to a calendar event invitation (accept, decline, or tentative)',
			inputSchema,
		},
		async ({calendarId, eventId, response, sendUpdates}) => {
			// First get the event to find our attendee entry
			const event = await makeCalendarApiCall<{attendees?: {self?: boolean; responseStatus?: string}[]}>('GET', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, config.token);

			// Update our response status
			const attendees = event.attendees?.map((attendee) => {
				if (attendee.self) {
					return {...attendee, responseStatus: response};
				}

				return attendee;
			});

			const params = new URLSearchParams();
			params.set('sendUpdates', sendUpdates);

			const result = await makeCalendarApiCall('PATCH', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?${params.toString()}`, config.token, {attendees});
			return jsonResult(result);
		},
	);
}
