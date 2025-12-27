import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';
import {strictSchemaWithAliases} from '../utils/schema.js';

const inputSchema = strictSchemaWithAliases({
	id: z.string().describe('Calendar ID to subscribe to (usually an email address)'),
	colorId: z.string().optional().describe('Color ID from colors.get'),
	backgroundColor: z.string().optional().describe('Background color in hex (#0088aa)'),
	foregroundColor: z.string().optional().describe('Foreground color in hex'),
	hidden: z.boolean().optional().describe('Whether to hide from the calendar list'),
	selected: z.boolean().optional().describe('Whether to show events in the UI'),
	summaryOverride: z.string().optional().describe('Custom name for the calendar'),
}, {});

export function registerCalendarlistInsert(server: McpServer, config: Config): void {
	server.registerTool(
		'calendarlist_insert',
		{
			title: 'Subscribe to calendar',
			description: 'Add an existing calendar to the user\'s calendar list. Use this to subscribe to shared calendars.',
			inputSchema,
		},
		async ({id, colorId, backgroundColor, foregroundColor, hidden, selected, summaryOverride}) => {
			const body: Record<string, unknown> = {id};
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

			const result = await makeCalendarApiCall('POST', '/users/me/calendarList', config.token, body);
			return jsonResult(result);
		},
	);
}
