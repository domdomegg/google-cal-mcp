import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {Config} from './types.js';

// Calendars
import {registerCalendarsList} from './calendars-list.js';

// CalendarList (user settings)
import {registerCalendarlistInsert} from './calendarlist-insert.js';
import {registerCalendarlistUpdate} from './calendarlist-update.js';
import {registerCalendarlistDelete} from './calendarlist-delete.js';

// Events
import {registerEventsList} from './events-list.js';
import {registerEventGet} from './event-get.js';
import {registerEventCreate} from './event-create.js';
import {registerEventUpdate} from './event-update.js';
import {registerEventDelete} from './event-delete.js';
import {registerEventRespond} from './event-respond.js';
import {registerEventMove} from './event-move.js';
import {registerEventInstances} from './event-instances.js';

// Free/Busy
import {registerFreebusyQuery} from './freebusy-query.js';

// ACL
import {registerAclList} from './acl-list.js';

// Colors
import {registerColorsGet} from './colors-get.js';

export type {Config} from './types.js';

export function registerAll(server: McpServer, config: Config): void {
	// Calendars
	registerCalendarsList(server, config);

	// CalendarList (user settings)
	registerCalendarlistInsert(server, config);
	registerCalendarlistUpdate(server, config);
	registerCalendarlistDelete(server, config);

	// Events
	registerEventsList(server, config);
	registerEventGet(server, config);
	registerEventCreate(server, config);
	registerEventUpdate(server, config);
	registerEventDelete(server, config);
	registerEventRespond(server, config);
	registerEventMove(server, config);
	registerEventInstances(server, config);

	// Free/Busy
	registerFreebusyQuery(server, config);

	// ACL
	registerAclList(server, config);

	// Colors
	registerColorsGet(server, config);
}
