import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';
import {makeCalendarApiCall} from '../utils/calendar-api.js';
import {jsonResult} from '../utils/response.js';

export function registerColorsGet(server: McpServer, config: Config): void {
	server.registerTool(
		'colors_get',
		{
			title: 'Get color palette',
			description: 'Get the color definitions available for calendars and events. Returns color IDs that can be used with calendarlist_update.',
			inputSchema: {},
			annotations: {
				readOnlyHint: true,
			},
		},
		async () => {
			const result = await makeCalendarApiCall('GET', '/colors', config.token);
			return jsonResult(result);
		},
	);
}
