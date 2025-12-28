import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const inputSchema = strictSchemaWithAliases({
	calendarId: z.string().describe('Calendar ID to update'),
	colorId: z.string().optional().describe('Color ID from colors.get'),
	backgroundColor: z.string().optional().describe('Background color in hex (#0088aa)'),
	foregroundColor: z.string().optional().describe('Foreground color in hex'),
	hidden: z.boolean().optional().describe('Whether to hide from the calendar list'),
	selected: z.boolean().optional().describe('Whether to show events in the UI'),
	summaryOverride: z.string().optional().describe('Custom name for the calendar'),
	defaultReminders: z.array(z.object({
		method: z.enum(['email', 'popup']),
		minutes: z.number(),
	})).optional().describe('Default reminders for events'),
}, {});

export function registerCalendarlistUpdate(server: McpServer, config: Config): void {
	server.registerTool(
		'calendarlist_update',
		{
			title: 'Update calendar settings',
			description: 'Update user-specific settings for a calendar (color, visibility, reminders, custom name).',
			inputSchema,
		},
		async ({calendarId, colorId, backgroundColor, foregroundColor, hidden, selected, summaryOverride, defaultReminders}) => {
			const body: Record<string, unknown> = {};
			if (colorId !== undefined) {
				body.colorId = colorId;
			}

			if (backgroundColor !== undefined) {
				body.backgroundColor = backgroundColor;
			}

			if (foregroundColor !== undefined) {
				body.foregroundColor = foregroundColor;
			}

			if (hidden !== undefined) {
				body.hidden = hidden;
			}

			if (selected !== undefined) {
				body.selected = selected;
			}

			if (summaryOverride !== undefined) {
				body.summaryOverride = summaryOverride;
			}

			if (defaultReminders !== undefined) {
				body.defaultReminders = defaultReminders;
			}

			const result = await makeCalendarApiCall(
				'PATCH',
				`/users/me/calendarList/${encodeURIComponent(calendarId)}`,
				config.token,
				body,
			);
			return jsonResult(result);
		},
	);
}
