"use strict";

import { ECSClient, ExecuteCommandCommand } from "@aws-sdk/client-ecs";
import {WebSocket} from "ws"
import { ssm } from "ssm-session";
import {TextDecoder, TextEncoder} from "util"

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const termOptions = {
  rows: 34,
  cols: 197,
};

// ECS Execute Command and Start a SSM Session 
var ecs = new ECSClient();

var params = {
	  command:     '/bin/shell-test-no-output.sh',
	  interactive: true,
	  task:        '9aeb968225ec4fdcb15e67edbc43840d',
	  cluster:     'default',
	  container:   'nginx'
};

var command = new ExecuteCommandCommand(params)


try {
		// Send a ExecuteCommandCommand
	    const data = await ecs.send(command)
	    console.log(data)
	    
	    // get SSM Session and connect the websocket
	    const startSessionRes = data.session;
	    const connection = new WebSocket(startSessionRes.streamUrl);
	    
		// auth on open using session token
		connection.onopen = () => {
		    ssm.init(connection, {
		      token: startSessionRes.tokenValue,
		      termOptions: termOptions,
		    });
		  };
		
		connection.onerror = (error) => {
			console.log(`WebSocket error: ${error}`);
		};
		
		// on receive message, do print stdout
		connection.onmessage = (event) => {
			var agentMessage = ssm.decode(event.data);
			ssm.sendACK(connection, agentMessage);
			if (agentMessage.payloadType === 1) {
				process.stdout.write(textDecoder.decode(agentMessage.payload));
			} else if (agentMessage.payloadType === 17) {
				ssm.sendInitMessage(connection, termOptions);
			}
		};
		
		// when job finish, it will get close connection event.
		connection.onclose = () => {
			console.log("websocket closed");
			// Program exit //
		};

	    console.log('end')
} catch (error) {
	    console.log(error)
}



