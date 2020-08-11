// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START function_manager_instance_pubsub]
const Compute = require('@google-cloud/compute');
const compute = new Compute();

/**
 * Start and Stop Compute Engine instances.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 * {
 * "action":"stop",        //the action to execute.
 * "zone":"us-central1-a", //the GCP zone the instances are located in.
 * "label":"env=dev"       //the label of instances to start.
 * }
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating
 *  completion.
 */
exports.instanceManagerPubSub = async (event, context, callback) => {
  try {
    const payload = _validatePayload(
      JSON.parse(Buffer.from(event.data, 'base64').toString())
    );
    console.log(payload);
    const options = {filter: `labels.${payload.label}`};
    const [vms] = await compute.getVMs(options);

    //Validation result getVMs
    if ( vms.length === 0 || vms === undefined || vms === null ){
      const message= 'Instances not found with label ' + payload.label;
      throw new Error(message);
    } else {
      await Promise.all(
        vms.map(async (instance) => {
          //Validation zone
          if (payload.zone === instance.zone.id) {
            //Validation action
            if (payload.action === 'start')  {
              const [operation] = await compute
              .zone(payload.zone)
              .vm(instance.name)
              .start();
              console.log('Starting instance',instance.name);
              return operation.promise();

            } else if (payload.action === 'stop') {
              const [operation] = await compute
              .zone(payload.zone)
              .vm(instance.name)
              .stop();
              console.log('Stoping instance',instance.name);
              return operation.promise();

            } else {
              const message= 'Invalid Action: ' + payload.action;
              throw new Error(message);
            }

          }else{
            console.log('The instance',instance.name,'dont match with the zone', payload.zone)
            return Promise.resolve();
          }
        })
      );
  
      // Operation complete.
      const message = `Operation completed`;
      console.log(message);
      callback(null, message);
    }
  } catch (err) {
    console.log(err);
    callback(err);
  }
};

/**
 * Validates that a request payload contains the expected fields.
 *
 * @param {!object} payload the request payload to validate.
 * @return {!object} the payload object.
 */
const _validatePayload = (payload) => {
  if (!payload.action) {
    throw new Error(`Attribute 'action' missing from payload`);
  } else if (!payload.zone) {
    throw new Error(`Attribute 'zone' missing from payload`);
  } else if (!payload.label) {
    throw new Error(`Attribute 'label' missing from payload`);
  }
  return payload;
};
// [END function_manager_instance_pubsub]
