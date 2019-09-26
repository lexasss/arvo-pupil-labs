// Imports

const zmq = require('zeromq');
const process = require('process');
const serializer = require('msgpack-lite');

const log = require('./log')( 'APPC' );
const requester = require('./requester');
const Request = require('./request');


// Constants

const HOST_ADDRESS = '127.0.0.1';
const REQUEST_PORT = 50020;

// Main routine
let _subscribers = [];

log.debug( 'Started' );
requester.connect( HOST_ADDRESS, REQUEST_PORT );

// finilizing when Ctrl+C is pressed
process.on( 'SIGINT', () => {
  app.quit();
});

/// Exported API
const app = {
  
  /// Connects subscribers to Pupil
  /// Args:
  ///  - subscribers: [Subscriber] | Subscriber
  start( subscribers ) {
    if (Array.isArray( subscribers )) {
      _subscribers = _subscribers.concat( subscribers );
      requester.subscribe( subscribers );
    }
    else {
      _subscribers.push( subscribers );
      requester.subscribe( [ subscribers ] );
    }
  },
  
  /// Disconnects subscribers to Pupil
  /// Args:
  ///  - subscribers: [Subscriber] | Subscriber
  stop( subscribers ) {
    if (Array.isArray( subscribers )) {
      _subscribers = _subscribers.filter( sub => !subscribers.includes( sub ) );
      log.debug( `  removing ${subscribers.length} subscribers` );
      subscribers.forEach( subscriber => subscriber.close() );
    }
    else {
      _subscribers = _subscribers.filter( sub => sub !== subscribers );
      log.debug( `  removing 1 subscriber` );
      subscribers.close();
    }
  },

  /// Sends a request to Pupil and fires callback function upon receiving response
  /// Args:
  ///  - id: String - a value from pupil.js/REQUESTS list
  ///  - cb: Function( reply ) - a callback that receives the response;  
  ///      if a callback is not provided, the function returns a promise
  request( id, cb ) {
    if (cb) {
      requester.send( new Request( id, cb ) );
    }
    else {
      return new Promise( resolve => {
        requester.send( new Request( id, resp => {
          resolve( resp );
        }) );
      });
    }
  },
  
  /// Sends a command to Pupil and fires callback function upon receiving response
  /// Args:
  ///  - cmd: { topic: String, ... } - must include "topic" field
  ///  - cb: Function( reply ) - a callback that receives the response;
  ///      if a callback is not provided, the function returns a promise
  command( cmd, cb ) {
    const payload = serializer.encode( cmd );
    if (cb) {
      const req = new Request( [ cmd.topic, payload ], cb );
      requester.send( req );
    }
    else {
      return new Promise( resolve => {
        const req = new Request( [ cmd.topic, payload ], resp => {
          resolve( resp );
        });
        requester.send( req );
      });
    }
  },
  
  /// Sends a notification to Pupil
  /// Args:
  ///  - notification: { subject: String, ... } - must include "subject" field
  notify( notification ) {
    const topic = 'notify.' + notification.subject;
    notification.topic = topic;
    
    const payload = serializer.encode( notification );
    const notificationRequest = new Request( [ topic, payload ] );
    
    requester.send( notificationRequest );
  },
  
  /// Quits the application
  quit() {
    _subscribers.forEach( subscriber => subscriber.close() );
    requester.close();
    log.debug( 'Closed' );
  },
  
  /// Returns the number of connected subscribers
  get subscribersCount() {
    return _subscribers.length;
  },
};


module.exports = app;