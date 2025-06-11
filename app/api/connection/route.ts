import { Composio } from '@composio/core';

const composio = new Composio();

const toolkit = await composio.toolkits.get('googlecalendar');
console.log(toolkit);

const connectionRequest = await composio.toolkits.authorize('default', 'gmail');
console.log(connectionRequest.toJSON());

const redirectURL = connectionRequest.redirectUrl;
console.log(`Please visit the following URL to authorize the toolkit: ${redirectURL}`);

const connectedAccount = await connectionRequest.status;

console.log(connectedAccount);