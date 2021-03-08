import * as soundworks from "soundworks/client";
import PlayerView from "../shared/PlayerView";

const audioContext = soundworks.audioContext;

function uniqueID() {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }

  return (
    chr4() +
    chr4() +
    "-" +
    chr4() +
    "-" +
    chr4() +
    "-" +
    chr4() +
    "-" +
    chr4() +
    chr4() +
    chr4()
  );
}

class StreamerExperience extends soundworks.Experience {
  constructor(assetsDomain, type='streamer') {
    super();
    this.init(assetsDomain, type);
  }

  init(assetsDomain, type) {
    // streamer or attendee
    this.type = type
    // ID for this player
    this.UUID = this.type + '_' + uniqueID();
    this.recordBuffer = this.UUID + '_record'
    // time between interactions that are sent to controller in seconds
    this.cooldown = 1;
    // For various style things
    this.neverClicked = true;

    this.platform = this.require("platform", { features: ["web-audio"] });

    this.checkin = this.require("checkin", { showDialog: false });
    this.sharedParams = this.require("shared-params");
    this.audioBufferManager = this.require("audio-buffer-manager", {
      assetsDomain: assetsDomain,
      files: [
        /* ... */
      ],
    });

    // Recorder stuff
    this.sharedRecorder = this.require('shared-recorder', { recorder: false });
    this.sharedConfig = this.require('shared-config', { items: ['recordings'] });
    // This does nothing: this.sharedRecorder.addListener('record', [this.phase], function(buffer, phase) { console.log("buffer, phase: " + buffer + phase)});

    // Instantiate Network so we can send our values
    this.network = this.require("network");
  }

  async start() {
    super.start();

    this.model = {
      playerType: this.type,
      videoVisible: this.sharedParams.params['videoVisible'].value,
      videoUrl: this.sharedParams.params['videoUrl'].value,

      textVisible: this.sharedParams.params['textVisible'].value,
      textContent: this.sharedParams.params['textContent'].value,

      slider2dVisible: this.sharedParams.params['slider2dVisible'].value,
      slider2dBackground: this.sharedParams.params['slider2dBackground'].value,
      slider2dCornersVisible: this.sharedParams.params['slider2dCornersVisible'].value,
      slider2dUL: this.sharedParams.params['slider2dUL'].value,
      slider2dUR: this.sharedParams.params['slider2dUR'].value,
      slider2dBL: this.sharedParams.params['slider2dBL'].value,
      slider2dBR: this.sharedParams.params['slider2dBR'].value,

      slider1dVisible: this.sharedParams.params['slider1dVisible'].value,
      slider1dLeft: this.sharedParams.params['slider1dLeft'].value,
      slider1dMid: this.sharedParams.params['slider1dMid'].value,
      slider1dRight: this.sharedParams.params['slider1dRight'].value,

      buttonVisible: this.sharedParams.params['buttonVisible'].value,
      buttonURL: this.sharedParams.params['buttonURL'].value,
      buttonText: this.sharedParams.params['buttonText'].value,
      recordButtonVisible: this.sharedParams.params['recordButtonVisible'].value
    };

    this.view = new PlayerView(this);
    await this.show();

    console.log("Player UUID: " + this.UUID);

    // Draw slider, make it movable
    this.view.create_slider2d();
    // Connect functionality
    this.view.create_slider1d();


    // Load the recorder Config
    const recordingsConfig = this.sharedConfig.get('recordings');
    const { duration, period, num, cyclic } = recordingsConfig['record'];
    // Update the recording settings
    this.sharedRecorder.createBuffer(this.recordBuffer, duration, period, num, cyclic);
    //console.log('record', duration, period, num, cyclic);

    // Fetch the needed ui elements and context variables
    let recordButton = document.getElementById("record-button");
    let initialButtonText = recordButton.innerText;
    let playerExperience = this;
    playerExperience.isRecording = false;

    // TODO: Clean up this code, when the listener callback is working
    // Apply the onclick listener
    recordButton.onclick = function (e) {
      e.preventDefault()
      if (!this.isRecording) {
        recordButton.innerText = "Recording..."
        playerExperience.startRecordingOnClient();
        playerExperience.isRecording = true;
        recordButton.classList.add("recording");
        console.log("Should start recording")
        setTimeout(function () {
          recordButton.innerText = initialButtonText
          playerExperience.isRecording = false;
          recordButton.classList.remove("recording");
        }, 2000);
      }
    }

    // Listeners if sharedParams are changed from controller
    // VIEW
    this.sharedParams.addParamListener("videoVisible", (value) => {
      this.view.setModelValue("videoVisible", value);
    });
    this.sharedParams.addParamListener("videoUrl", (value) => {
      this.view.setModelValue("videoUrl", value);
    });
    this.sharedParams.addParamListener("textVisible", (value) => {
      this.view.setModelValue("textVisible", value);
    });
    this.sharedParams.addParamListener("textContent", (value) => {
      this.view.setModelValue("textContent", value);
    });
    this.sharedParams.addParamListener("slider2dVisible", (value) => {
      this.view.setModelValue("slider2dVisible", value);
    });
    this.sharedParams.addParamListener("slider2dBackground", (value) => {
      this.view.setModelValue("slider2dBackground", value);
    });
    this.sharedParams.addParamListener("slider2dCornersVisible", (value) => {
      this.view.setModelValue("slider2dCornersVisible", value);
    });
    this.sharedParams.addParamListener("slider2dUL", (value) => {
      this.view.setModelValue("slider2dUL", value);
    });
    this.sharedParams.addParamListener("slider2dUR", (value) => {
      this.view.setModelValue("slider2dUR", value);
    });
    this.sharedParams.addParamListener("slider2dBL", (value) => {
      this.view.setModelValue("slider2dBL", value);
    });
    this.sharedParams.addParamListener("slider2dBR", (value) => {
      this.view.setModelValue("slider2dBR", value);
    });
    this.sharedParams.addParamListener("slider1dVisible", (value) => {
      this.view.setModelValue("slider1dVisible", value);
    });
    this.sharedParams.addParamListener("slider1dLeft", (value) => {
      this.view.setModelValue("slider1dLeft", value);
    });
    this.sharedParams.addParamListener("slider1dMid", (value) => {
      this.view.setModelValue("slider1dMid", value);
    });
    this.sharedParams.addParamListener("slider1dRight", (value) => {
      this.view.setModelValue("slider1dRight", value);
    });
    this.sharedParams.addParamListener("buttonVisible", (value) => {
      this.view.setModelValue("buttonVisible", value);
    });
    // Update button widget url
    this.sharedParams.addParamListener("buttonURL", (value) => {
      this.view.setModelValue("buttonURL", value);
    });
    // Update button widget text
    this.sharedParams.addParamListener("buttonText", (value) => {
      this.view.setModelValue("buttonText", value);
    });
    // Update buttonVisible
    this.sharedParams.addParamListener("recordButtonVisible", (value) => {
      this.view.setModelValue("recordButtonVisible", value);
    });
    // Trigger to refresh the players view
    this.sharedParams.addParamListener("updateView", () => {
      this.view.update_view();
      this.view.create_slider2d();
      this.view.create_slider1d();
    });
    // NOT VIEW
    // Time (seconds) between inputs sent to controller
    this.sharedParams.addParamListener("cooldown", (value) => {
      this.cooldown = value;
    });

    // Receive messages send from controller
    this.network.receive("stats", (pos_last, pos_global) => {
      let pos = (this.sharedParams.params["measureMethod"].value === "Last n") ? pos_last : pos_global;
      this.view.update_cur_color(pos);
    });
  }

  startRecordingOnClient() {
    this.sharedRecorder.startRecord(this.recordBuffer);
  }

  handle_slider1d_change(e) {
    // Check when last click was, if it's < cooldown, don't send to controller
    var click_date = new Date();
    var date_diff_sec = this.cooldown;

    if (this.last_clicked) {
      date_diff_sec = Math.abs(click_date - this.last_clicked) / 1000;
    }

    if (date_diff_sec < this.cooldown) {
      return;
    }

    let slider = document.getElementById("slider1d");
    let val = parseInt(slider.value);
    console.log(slider.value);

    this.network.send(
      "controller",
      "slider1d_position",
      this.UUID,
      val
    );

    this.last_clicked = click_date;

  }

  handle_slider2d_click(e) {
    if (this.view.slider2d.active) {
      // If clicked first time, remove the glowing border
      if (this.neverClicked) {
        let element = document.getElementById("box");
        element.classList.remove("glowborder");
      }
      this.view.slider2d.drag_end(e);

      // Check when last click was, if it's < cooldown, don't send to controller
      var click_date = new Date();
      var date_diff_sec = this.cooldown;

      if (this.last_clicked) {
        date_diff_sec = Math.abs(click_date - this.last_clicked) / 1000;
      }

      if (date_diff_sec < this.cooldown) {
        return;
      }

      // Send position to controller
      this.network.send(
        "controller",
        "slider2d_position",
        this.UUID,
        this.view.slider2d.ranged_pos
      );
      this.last_clicked = click_date;

      // Update status feedback boxes
      this.view.update_my_color();
    }
  }
}

export default StreamerExperience;
