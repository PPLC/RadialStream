import { Experience } from 'soundworks/server';

class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.network = this.require('network');

    // Used for audio recording such as applause
    this.sharedRecorder = this.require('shared-recorder');
    this.sharedConfig = this.require('shared-config');
    this.sharedConfig.share('resamplingVarMax', 'player');
  }

  start() {
    /* this.sharedRecorder.addListener('available-file', (name, chunkIndex, path) => {
      console.log("Server - new sound recorder file: " + name);
      // TODO: Propagate this event to the player/PlayerExperience and update the button accordingly
    }); */
  }

  enter(client) {
    super.enter(client);
    this.sharedConfig.share('recordings', 'recorder');
    this.sharedParams.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    this.sharedParams.update('numPlayers', this.clients.length);
  }
}

export default PlayerExperience;
