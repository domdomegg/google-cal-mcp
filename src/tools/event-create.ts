import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const attendeeSchema = z.object({
	email: z.string().describe('Attendee email address'),
	displayName: z.string().optional().describe('Attendee display name'),
	optional: z.boolean().optional().describe('Whether attendance is optional'),
	responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).optional(),
});

const inputSchema = strictSchemaWithAliases({
	calendarId: z.string().default('primary').describe('Calendar ID'),
	summary: z.string().describe('Event title'),
	description: z.string().optional().describe('Event description'),
	location: z.string().optional().describe('Event location'),
	start: z.object({
		dateTime: z.string().optional().describe('Start datetime (RFC3339, e.g., "2025-01-15T09:00:00-08:00")'),
		date: z.string().optional().describe('Start date for all-day events (YYYY-MM-DD)'),
		timeZone: z.string().optional().describe('Timezone (e.g., "America/Los_Angeles")'),
	}).describe('Event start time'),
	end: z.object({
		dateTime: z.string().optional().describe('End datetime (RFC3339)'),
		date: z.string().optional().describe('End date for all-day events (YYYY-MM-DD)'),
		timeZone: z.string().optional().describe('Timezone'),
	}).describe('Event end time'),
	attendees: z.array(attendeeSchema).optional().describe('List of attendees'),
	sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Who to send notifications to'),
	conferenceDataVersion: z.number().optional().describe('Set to 1 to create a Google Meet link'),
}, {});

export function registerEventCreate(server: McpServer, config: Config): void {
	server.registerTool(
		'event_create',
		{
			title: 'Create event',
			description: 'Create a new calendar event. Can include attendees and optionally create a Google Meet link.',
			inputSchema,
		},
		async ({calendarId, summary, description, location, start, end, attendees, sendUpdates, conferenceDataVersion}) => {
			const params = new URLSearchParams();
			params.set('sendUpdates', sendUpdates);
			if (conferenceDataVersion) {
				params.set('conferenceDataVersion', String(conferenceDataVersion));
			}

			const body: Record<string, unknown> = {
				summary,
				start,
				end,
			};
			if (description) {
				body.description = description;
			}

			if (location) {
				body.location = location;
			}

			if (attendees) {
				body.attendees = attendees;
			}

			if (conferenceDataVersion) {
				body.conferenceData = {
					createRequest: {
						requestId: `meet-${Date.now()}`,
						conferenceSolutionKey: {type: 'hangoutsMeet'},
					},
				};
			}

			const result = await makeCalendarApiCall('POST', `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, config.token, body);
			return jsonResult(result);
		},
	);
}
