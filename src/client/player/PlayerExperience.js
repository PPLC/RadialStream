import * as soundworks from 'soundworks/client';
import PlacerView from './PlacerView';
import userTiming from './user-timing';
import PlayerView from './PlayerView.js';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const model = { title: 'radial-stream', state: 'wait' };

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.placer = this.require('placer', { view: new PlacerView() });
    this.params = this.require('shared-params');

    this.noteIsOn = false;
    this.lastNoteOnTime = -999999;
    this.fingersDown = new Set();

    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);

    this.checkin = this.require('checkin', { showDialog: false });
    this.state = 
    this.sharedParams = this.require('shared-params');
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: [ /* ... */ ],
    });
  }

  setState(state) {
    this.view.state = state;
    this.view.render();

    if (state === 'running') {
      this.surface.addListener('touchstart', this._handleTouchStart);
      this.surface.addListener('touchend', this._handleTouchEnd);
    } else {
      this.surface.removeListener('touchstart', this._handleTouchStart);
      this.surface.removeListener('touchend', this._handleTouchEnd);
    }
  }

  _handleTouchStart(id, normX, normY, touch, touchEvent) {
    const now = performance.now();
    const scaledY = (0.9 - normY) / 0.8;
    const intensity = Math.max(0, Math.min(0.999, scaledY));
    this.send('note-on', intensity, now - this.lastNoteOnTime);

    this.fingersDown.add(id);
    this.noteIsOn = true;
    this.lastNoteOnTime = now;
    this.view.noteOn(intensity);
  }

  _handleTouchEnd(id, normX, normY) {
    this.fingersDown.delete(id);

    if (this.noteIsOn && this.fingersDown.size === 0) {
      const now = performance.now();

      this.send('note-off', now - this.lastNoteOnTime);
      this.noteIsOn = false;
      this.view.noteOff();
    }
  }

  async start() {
    super.start();

    this.view = new PlayerView({ state: 'wait' }, {id: 'player' });
    this.surface = new soundworks.TouchSurface(this.view.$el);
    this.view.setLabel(client.label);
    this.sharedParams.addParamListener('state', (state) => { this.setState(state); });

    await this.show();
  }
}

export default PlayerExperience;