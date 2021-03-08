import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import ControllerExperience from './ControllerExperience';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch (err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// configure express environment ('production' enables express cache for static files)
process.env.NODE_ENV = config.env;
// override config if port has been defined from the command line
if (process.env.PORT)
  config.port = process.env.PORT;

// Set Recording config
config.recordings = {
  'record': {
    duration: 2,
    period: 1,
    num: 1,
    cyclic: false,
  },
}

// initialize application with configuration options
soundworks.server.init(config);

// define the configuration object to be passed to the `.ejs` template
soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

// ---- Define SharedParams ----
const sharedParams = soundworks.server.require('shared-params');
// Number of people on site (not changeable hence not displayed in Settings)
sharedParams.addText('numPlayers', 'Number of Viewers', '0');

// Video
sharedParams.addBoolean('videoVisible', 'Video: Show', false);
// Src URL of iFrame shown to player
sharedParams.addText('videoUrl', 'Video: URL', '');

// Text
sharedParams.addBoolean('textVisible', 'Text: Show', false);
// Text under video shown to player
sharedParams.addText('textContent', 'Text: Content', '');

// Input
// SLider 2D
sharedParams.addBoolean('slider2dVisible', 'Slider2D: Show', false);
sharedParams.addEnum('slider2dBackground', 'Slider2D: Background', ['image001.png'], 'image001.png');
// The four words in the corner
sharedParams.addBoolean('slider2dCornersVisible', 'Slider2D Corners: Show', false);
sharedParams.addText('slider2dUL', 'Slider2D Corners: Upper Left', 'amazed');
sharedParams.addText('slider2dUR', 'Slider2D Corners: Upper Right', 'euphoric');
sharedParams.addText('slider2dBL', 'Slider2D Corners: Bottom Left', 'curious');
sharedParams.addText('slider2dBR', 'Slider2D Corners: Bottom Right', 'thoughtful');
// Slider 1D
sharedParams.addBoolean('slider1dVisible', 'Slider1D: Show', false);
sharedParams.addText('slider1dLeft', 'Slider1D: Left', 'No clap');
sharedParams.addText('slider1dMid', 'Slider1D: Mid', 'Slow clap');
sharedParams.addText('slider1dRight', 'Slider1D: Right', 'Red hands');

// Checkbox to enable or disable the button widget
sharedParams.addBoolean('buttonVisible', 'Link Button: Show', false);
// The url of the button widget
sharedParams.addText('buttonURL', 'Link Button: URL', 'https://us02web.zoom.us/j/86131663765?pwd=UTIyWktwRndHaFo1WTE2TXEwSG40QT09');
// The text of the button widget
sharedParams.addText('buttonText', 'Link Button: Title', 'Zoom Lounge');

// Checkbox to enable or disable the record widget
sharedParams.addBoolean('recordButtonVisible', 'Record Button: Visible', false);

// Button to update the whole PlayerView
sharedParams.addTrigger('updateView', 'Update PlayerView')

// Cooldown, seconds player has to wait before next vote is accepted
sharedParams.addNumber('cooldown', 'Input Cooldown (sec)', 0, 99999999999999, 0.5, 1);

// Other
// Number of votes that build an average
sharedParams.addNumber('lastN', 'Last n Clicks', 0, 99999999999999, 1, 30);
// Select which average is sent to player
sharedParams.addEnum('measureMethod', 'Measure method', ["Last n", "Global"], "Last n");

const experience = new PlayerExperience(['attendee', 'streamer']);
const controller = new ControllerExperience('controller', { auth: true });

var server = soundworks.server;
server.start();

module.exports = { server };