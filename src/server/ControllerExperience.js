import { Experience } from 'soundworks/server';

class ControllerExperience extends Experience {
  constructor(clientTypes, options = {}) {
    super(clientTypes);

    this.sharedParams = this.require('shared-params');
    this.errorReporter = this.require('error-reporter');
    this.network = this.require('network');

    // Used for audio recording such as applause
    this.sharedRecorder = this.require('shared-recorder');
    this.audioBufferManager = this.require('audio-buffer-manager'); // Note: Seems to be required manually

    if (options.auth) {
      this.auth = this.require('auth');
    }
  }

  start() {
    this.errorReporter.addListener('error', (file, line, col, msg, userAgent) => {
      this.broadcast('controller', null, 'log', 'error', file, line, col, msg, userAgent);
    });

    // Load the file libraries
    this.fs = require('fs-extra');
    const path = require('path');
    // Joining path of directory
    this.directoryPath = path.join(__dirname.replace("\\dist\\server", '').replace("/dist/server", ''), "public", "sounds");

    // Set the listener for new recorded sound files
    this.sharedRecorder.addListener('available-file', (name, chunkIndex, path) => {
      console.log("Server - new sound recorder file: " + name);

      // Load all the current files
      this.collectAllSoundFiles();
    });
  }

  enter(client) {
    super.enter(client);
    let experience = this;

    // TODO: The following lines are a workaround, that the broadcast isn't send to early. This may be improved
    // Do this initially once:
    setTimeout(function () {
      experience.collectAllSoundFiles();
    }, 1000);
  }

  // Fetches all given
  collectAllSoundFiles() {
    console.log("collectAllSoundFiles")
    let experience = this;
    experience.fs.readdir(experience.directoryPath, function (err, files) {
      // Handling error
      if (err) {
        return console.error('Unable to scan directory: ' + err);
      }

      // Collect the file data
      let currentFiles = [];
      files.forEach(function (file) {
        if (file.match('.*\\.wav$')) {
          currentFiles.push("sounds/" + file)
          console.log("load file " + file);
        }
      });

      // Send the broadcast
      experience.broadcast('controller', null, 'updated_sound_files', 'success', currentFiles);
    });
  }

}

export default ControllerExperience;
