import {z} from 'zod';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

const inputSchema = {
	timeMin: z.string().describe('Start of the interval (RFC3339)'),
	timeMax: z.string().describe('End of the interval (RFC3339)'),
	timeZone: z.string().optional().describe('Timezone for the response'),
	calendarIds: z.array(z.string()).default(['primary']).describe('Calendar IDs to check (defaults to primary)'),
};

export function registerFreebusyQuery(server: McpServer, config: Config): void {
	server.registerTool(
		'freebusy_query',
		{
			title: 'Query free/busy',
			description: 'Find free and busy times for calendars within a time range. Useful for finding meeting availability.',
			inputSchema,
			annotations: {
				readOnlyHint: true,
			},
		},
		async ({timeMin, timeMax, timeZone, calendarIds}) => {
			const body = {
				timeMin,
				timeMax,
				timeZone,
				items: calendarIds.map((id) => ({id})),
			};

			const result = await makeCalendarApiCall('POST', '/freeBusy', config.token, body);
			return jsonResult(result);
		},
	);
}
