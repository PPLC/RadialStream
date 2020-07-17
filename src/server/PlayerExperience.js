import { Experience } from 'soundworks/server';
import scoreRecorder from './scoreRecorder';

// server-side 'player' experience.
class PlayerExperience extends Experience {
  constructor(clientType, midiNotes, midi) {
    super(clientType);

    this.midiNotes = midiNotes;
    this.noteIsOn = [];
    this.midi = midi;

    this.checkin = this.require('checkin');
    this.config = this.require('shared-config');
    this.placer = this.require('placer');
    this.sharedParams = this.require('shared-params');
    this.audioBufferManager = this.require('audio-buffer-manager');

    this.onPanic = this.onPanic.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
  }

  // if anything needs to append when the experience starts
  start() {
    this.sharedParams.addParamListener('panic', this.onPanic);
    this.sharedParams.addParamListener('state', this.onStateChange);
    console.log(this.config.get('scoreRecordDirectory'));
    scoreRecorder.init(this.config.get('scoreRecordDirectory'));
  }

  // if anything needs to happen when a client enters the performance (*i.e.*
  // starts the experience on the client side), write it in the `enter` method
  enter(client) {
    super.enter(client);

    this.receive(client, 'note-on', (intensity, deltaNoteOnTime) => {
      const index = client.index;
      const pitch = this.midiNotes[index];

      const velocity = Math.floor(1 + 127 * intensity);
      this.noteOn(pitch, velocity);
    });

    this.receive(client, 'note-off', (duration) => {
      const index = client.index;
      const pitch = this.midiNotes[index];
      this.noteOff(pitch);
      this.noteIsOn[index] = false;
    });

    this.sharedParams.update('numPlayers', this.clients.length);
  }

  exit(client) {
    super.exit(client);

    const index = client.index;
    const pitch = this.midiNotes[index];

    this.noteOff(pitch);
    this.sharedParams.update('numPlayers', this.clients.length);
  }

  noteOn(pitch, velocity) {
    if(this.noteIsOn[pitch])
      this.noteOff(pitch);

    this.midi.MidiOut(144, pitch, velocity);
    this.noteIsOn[pitch] = true;

    console.log("note on:", pitch, velocity);
    scoreRecorder.record('note-on', pitch, velocity);
  }

  noteOff(pitch) {
    this.midi.MidiOut(128, pitch, 64);
    this.noteIsOn[pitch] = false;

    //console.log("note off:", pitch);
    scoreRecorder.record('note-off', pitch);
  }
  
  onStateChange(state) {
    if (state === 'running')
      scoreRecorder.start();
  }

  onPanic() {
    this.midiNotes.forEach((pitch) => this.noteOff(pitch));
  }
}

export default PlayerExperience;