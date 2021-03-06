// Imports
import process from 'process';

import app from './src/app';
import Subscriber from './src/subscriber';
import REQUESTS from './src/pupil';
import { Surface } from './src/messages';
import logFactory from './src/log';

const log = logFactory( 'MAIN' );

// finilizing when Ctrl+C is pressed
process.on( 'SIGINT', () => {
  app.quit();
});

// Uncomment required subscribers and modify their callbacks
const subscribers = [
  // Subscriber.create.pupil( pupil => console.log(`[PUPL] ${pupil.id}: ${pupil.norm_pos[0]} ${pupil.norm_pos[0]}`) ),
  // Subscriber.create.gaze( gaze => console.log(`[GAZE] ${gaze.norm_pos[0]} ${gaze.norm_pos[0]}`) ),
  // Subscriber.create.fixation( fixation => console.log(`[FIXN] ${fixation.norm_pos[0]} ${fixation.norm_pos[1]}`) ),
  Subscriber.create.surfaces( onSurface ),
  // Subscriber.create.blinks( blink => console.log(`[BLNK] ${blink.timestamp} blink ${blink.type}`) ),
  // Subscriber.create.annotation( annotation => console.log(`[ANNT] ${annotation.timestamp} ${annotation.label}`) ),
  // Subscriber.create.frame( (frame, /** @type {Buffer} */ image) => {
  //   const camera = frame.topic.split('.')[1];
  //   if (camera === 'world') {
      // do something with "image" here, it is of type "Buffer"
  //   }
  // }),
  // Subscriber.create.logging( (log: any) => console.log( `[LOGS] ${JSON.stringify( log )}` ) ),
  // Subscriber.create.notify( ntf => console.log( `[NTFY] ${JSON.stringify( ntf )}` ) ),
  // Subscriber.create.other( (data, extras) => console.log( `[OTHR] -- ${JSON.stringify( data )}${extras ? ', has extras' : ''}` ) ),
];

app.start( subscribers );



// Examples

// -------------------------------------------------------------------------------------
// Example of sending notification to Pupil to enabled Log_History plugin
// -------------------------------------------------------------------------------------
// setTimeout( _ => {
//   log.info( 'Send request to start LogHistory' );
//   app.notify({ 'subject': 'start_plugin', 'name': 'Log_History' });
// }, 1000);

// -------------------------------------------------------------------------------------
// Example of how to get timestamp and send logging info into Pupil
// -------------------------------------------------------------------------------------
// setTimeout( _ => {
  
//   log.info( 'Send timestamp request' );
//   app.request( REQUESTS.timestamp )
//     .then( timestamp => {
//       log.info( `Timestamp is ${timestamp}` );
// 	  return Promise.resolve( timestamp );
// 	}).
// 	then( timestamp => {
//       // upon receiving a timestamp, send some logging info into Pupil
//       const cmd = { 
//         levelname: 'INFO', 
//         name: 'NODEJS', 
//         msg: 'Log message from NodeJS', 
//         timestamp,
//         topic: 'logging.info',
//       };
    
//       log.info( `Send info "${ cmd.msg }" to Pupil` );
//       app.command( cmd ).then( resp => log.info( `Reply: "${resp}"`) );
//     });
  
// }, 2000 );


// -------------------------------------------------------------------------------------
// Adding a new subscriber: annotation tracker
// -------------------------------------------------------------------------------------
// const annotationTracker = Subscriber.create.annotation( annotation => {
//   log.info( `Got annotation "${annotation.label}" at ${annotation.timestamp} --` );
// });

// setTimeout( _ => {
//   log.info( 'Add annotation tracker. NOTE: you should enable "Annotation capture" and add some annotation in PupilCapture, then hit the annotation button in PupilCapture in order to see the effect of this demo.' );
//   app.start( annotationTracker );
// }, 3000);

// -------------------------------------------------------------------------------------
// Removing this subscriber
// -------------------------------------------------------------------------------------
// setTimeout( _ => {
//   log.info( 'Removing annotation tracker' );
//   app.stop( annotationTracker );
// }, 10000);


// -------------------------------------------------------------------------------------
// Adding a new subscriber: gaze tracker
// -------------------------------------------------------------------------------------
// const gazeTracker = Subscriber.create.gaze( gaze => {
//   console.log(`[GAZE] x = ${gaze.norm_pos[0].toFixed(2)}, y = ${gaze.norm_pos[1].toFixed(2)}`) 
// });
	
// setTimeout( _ => {
//   log.info( 'Adding gaze tracker' );
//   app.start( gazeTracker );
// }, 12000);

// -------------------------------------------------------------------------------------
// Removing this subscriber
// -------------------------------------------------------------------------------------
// setTimeout( _ => {
//   log.info( 'Removing gaze tracker' );
//   app.stop( gazeTracker );
// }, 16000);

// -------------------------------------------------------------------------------------
// Removing all subscribers
// -------------------------------------------------------------------------------------
// setTimeout( _ => {
//   log.info( 'Removing all subscribers' );
//   app.stop( subscribers );
  
//   if (app.subscribersCount === 0) {
//     app.quit();
//   }
// }, 18000);

function onSurface( surface: Surface ) {
  if (surface.gaze_on_surfaces.length > 0) {
    const gaze = surface.gaze_on_surfaces[0];
    console.log(`[SURF] ${surface.name} : ${JSON.stringify( gaze )}`);
  }
  // console.log(`[SURF] ${surface.name} ${JSON.stringify( surface.gaze_on_srf[0].on_srf )}`);
}
