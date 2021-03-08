import { Experience, View } from "soundworks/client";
import SharedParamsComponent from "./components/SharedParamsComponent";
import LogComponent from "./components/LogComponent";
import DataHandler from "./DataHandler";
import MidiHandler from "./MidiHandler";
import StatsComponent from "./components/StatsComponent";

const template = `
    <h1 class="big">Settings</h1>
    <div id="shared-params"></div>
    <div class='dropdown'>
        <div class='title pointerCursor small'>Select MIDI Output <p class="fa fa-angle-right small"></p></div>
        
        <div class='menu pointerCursor hide'>
            <%= midi_devices %>
        </div>
    </div>

    <hr>
    <div id="stats" class="section-center flex-center"></div> 
    <hr>
    <h1 class="big"">Available audio files</h1>
    <div id="audio">
        <!--
        <a href="#" class="button-small" id="audio-play-all">Play all files</a>
        <a href="#" class="button-small" id="audio-erase-all">Erase all files</a>
        -->
        <p style="font-size:1em;text-align: center">Click a file name to play the according sound file</p>
        <ul id="audio-file-listing"></ul>
    </div>
    <hr>
    <h1 class="big"">Log Output</h1>
    <div id="log"></div>
    
`;

// Dropdown Menu JS
function toggleClass(elem, className) {
  if (elem.className.indexOf(className) !== -1) {
    elem.className = elem.className.replace(className, "");
  } else {
    elem.className = elem.className.replace(/\s+/g, " ") + " " + className;
  }

  return elem;
}

function toggleMenuDisplay(e) {
  const dropdown = e.currentTarget.parentNode;
  const menu = dropdown.querySelector(".menu");
  const icon = dropdown.querySelector(".fa-angle-right");

  toggleClass(menu, "hide");
  toggleClass(icon, "rotate-90");
}

function handleOptionSelected(e) {
  toggleClass(e.target.parentNode, "hide");

  const id = e.target.id;
  const newValue = e.target.textContent + " ";
  const titleElem = document.querySelector(".dropdown .title");
  const icon = document.querySelector(".dropdown .title .fa");

  titleElem.textContent = newValue;
  titleElem.appendChild(icon);

  //trigger custom event
  document.querySelector(".dropdown .title").dispatchEvent(new Event("change"));
  //setTimeout is used so transition is properly shown
  setTimeout(() => toggleClass(icon, "rotate-90", 0));
}

class ControllerExperience extends Experience {
  constructor(options = {}) {
    super();

    // Midi
    this.midiHandler = new MidiHandler();

    this.network = this.require("network");
    this.sharedParams = this.require("shared-params");
    console.log(this.sharedParams);
    this.sharedParamsComponent = new SharedParamsComponent(
      "#shared-params",
      this
    );
    this.logComponent = new LogComponent("#log", this);

    // Used for audio recording such as applause
    this.sharedRecorder = this.require('shared-recorder');
    this.fileSystem = this.require('file-system');

    //this.setGuiOptions("numPlayers", { readonly: true });

    if (options.auth) {
      this.auth = this.require("auth");
    }
  }

  async start() {
    super.start();

    // Store inputs and calculate metrics
    this.dataHandler = new DataHandler();

    // Enable MIDI and check for support.
    // await this method because connection is promise
    await this.midiHandler.connect();

    // Make List fit for dropdown menu
    var midi_lst = "";
    if (this.midiHandler.output_names.length === 0) {
      midi_lst = "NO DEVICES";
    } else {
      for (let i in this.midiHandler.output_names) {
        midi_lst +=
          "<div class='option small' id='option" +
          (parseInt(i) + 1) +
          "'>" +
          this.midiHandler.output_names[i] +
          "</div>\n";
      }
    }
    // Add MIDI Devices to Model
    this.model = {
      midi_devices: midi_lst,
    };
    // Define Midi Configurations
    this.midiHandler.conf = [
      { chn: 1, ctrl: 0, val: 0 }, // Latest X
      { chn: 1, ctrl: 1, val: 0 }, // Latest Y
      { chn: 1, ctrl: 2, val: 0 }, // Avg of last n X
      { chn: 1, ctrl: 3, val: 0 }, // Avg of last n Y
      { chn: 1, ctrl: 4, val: 0 }, // Global Avg X
      { chn: 1, ctrl: 5, val: 0 }, // Global Avg Y
      { chn: 1, ctrl: 6, val: 63 } // Applause
    ];

    // Display statistics in controller
    this.statsComponent = new StatsComponent("#stats", this, this.dataHandler, this.midiHandler);
    // Show
    this.view = new View(template, this.model, {}, { id: "controller" });

    this.show().then(() => {
      this.sharedParamsComponent.enter();
      this.logComponent.enter();
      this.statsComponent.enter();

      // Receive logs
      this.receive("log", (type, ...args) => {
        switch (type) {
          case "error":
            this.logComponent.error(...args);
            break;
        }
      });


      // ---------------- hack -----------------
      // TODO For branch log_input: cant save to a file, so log inputs for copy pasta in error log
      this.logComponent.error_msg('Date,UUID,Name,MidiCH,Data');
      // ---------------- hack -----------------

      // Receive finished sound files
      this.receive("updated_sound_files", (type, fileList) => {
        console.log("Received updated_sound_files broadcast:", type);
        switch (type) {
          case 'success':
            // Refresh the audio list
            this.updateAvailableAudioFiles(fileList);
            break;
          case 'error':
            // TODO handle error on client side
            break;
        }
      });

      this.network.receive("slider1d_position", (id, pos) => {
          
        console.log("Slider1D Input " + pos + " received from Player " + id);
        
        this.midiHandler.conf[6].val = pos;
        
        this.statsComponent.update(this);
        

        // ---------------- hack -----------------
        // TODO For branch log_input: cant save to a file, so log inputs for copy pasta in error log
        let d = new Date().toISOString();
        this.logComponent.error_msg(d+','+id+','+'Applause'+','+'6'+','+pos);
        // ---------------- hack -----------------
        

        if (this.midiHandler.output === undefined) {
          console.error("MIDI Device not defined! Input accepted but not send.");
          //this.logComponent.error_msg("MIDI Device not defined! Input accepted but not send.");
          return;
        }

        this.midiHandler.send_conf();
      });

      // Receive Position from players
      this.network.receive("slider2d_position", (id, pos) => {
        this.dataHandler.add_user_input(id, pos);
        this.statsComponent.update(this);

        // We have to send both values, player has to decide (based on sharedParam["current_color"], which one to display)
        this.network.send(['streamer', 'attendee'], 'stats', this.dataHandler.last(this.sharedParams.params['lastN'].value), this.dataHandler.global());

        console.log('Slider2D Input ' + pos + ' received from Player ' + id);
        
        // ---------------- hack -----------------
        // TODO For branch log_input: cant save to a file, so log inputs for copy pasta in error log
        let d = new Date().toISOString();
        this.logComponent.error_msg(d+','+id+','+'latest_X'+','+'0'+','+pos.x);
        this.logComponent.error_msg(d+','+id+','+'latest_Y'+','+'1'+','+pos.y);
        this.logComponent.error_msg(d+','+id+','+'lastN_X'+','+'2'+','+this.dataHandler.last(this.sharedParams.params["lastN"].value).x);
        this.logComponent.error_msg(d+','+id+','+'lastN_Y'+','+'3'+','+this.dataHandler.last(this.sharedParams.params["lastN"].value).y);
        this.logComponent.error_msg(d+','+id+','+'global_X'+','+'4'+','+this.dataHandler.global().x);
        this.logComponent.error_msg(d+','+id+','+'global_Y'+','+'5'+','+this.dataHandler.global().y);
        // ---------------- hack -----------------

        // Send Midi Control change events
        /* FROM THE WEBMIDI REPO
        https://github.com/djipco/webmidi/blob/76dcf0f32ec050b59455f6437830349d7de390f2/src/webmidi.js#L3345
        sendControlChange = function(controller, value, channel, options)
        * @param controller {Number|String} The MIDI controller number (0-119) or name.

        * @param [value=0] {Number} The value to send (0-127).

        * @param [channel=all] {Number|Array|String} The MIDI channel number (between 1 and 16) or an
        * array of channel numbers. If the special value "all" is used, the message will be sent to all
        * 16 channels.
        */
        if (this.midiHandler.output === undefined) {
          console.error("MIDI Device not defined! Input accepted but not send.");
          //this.logComponent.error_msg("MIDI Device not defined! Input accepted but not send.");
          return;
        }

        // Update values of midi send config with user input stats
        this.midiHandler.conf[0].val = this.dataHandler.latest().x;
        this.midiHandler.conf[1].val = this.dataHandler.latest().y;

        this.midiHandler.conf[2].val = this.dataHandler.last(this.sharedParams.params["lastN"].value).x;
        this.midiHandler.conf[3].val = this.dataHandler.last(this.sharedParams.params["lastN"].value).y;

        this.midiHandler.conf[4].val = this.dataHandler.global().x;
        this.midiHandler.conf[5].val = this.dataHandler.global().y;
        // Send Midi signal
        this.midiHandler.send_conf();
      });

      // Listener for #players
      this.sharedParams.addParamListener("numPlayers", () => {
        this.statsComponent.update(this);
      });

      this.sharedParams.addParamListener("lastN", () => {
        this.statsComponent.update(this);
      });

      // Dropdown Menu related
      // -> get elements
      const dropdownTitle = document.querySelector(".dropdown .title");
      const dropdownOptions = document.querySelectorAll(".dropdown .option");

      // -> bind listeners to these elements
      dropdownTitle.addEventListener("click", toggleMenuDisplay);
      dropdownOptions.forEach((option) =>
        option.addEventListener("click", handleOptionSelected)
      );
      document
        .querySelector(".dropdown .title")
        .addEventListener("change", this.handleDeviceChange.bind(this));
    });
  }

  // Updates the list with all available sound files
  updateAvailableAudioFiles(soundFilePathsList) {
    console.log("updateAvailableAudioFiles")
    this.availableAudioFiles = [];
    let experience = this;
    let audioFilesList = document.getElementById("audio-file-listing");

    soundFilePathsList.forEach(function (filePath) {
      let li = document.createElement('li');
      li.textContent = filePath;
      audioFilesList.appendChild(li);
      experience.availableAudioFiles.push(filePath)

      li.addEventListener("click", function (e) {
        e.preventDefault();

        let audio = new Audio(filePath);
        audio.play();
      });
    });
  }

  // Handles a midi device change
  handleDeviceChange(e) {
    // Getting the textContext adds a trailing whitespace to the string
    // then the midi device cant be used - also trim the string
    console.log(e.target.textContent);
    console.log(e.target.textContent.length);
    console.log(e.target.textContent.trim());
    console.log(e.target.textContent.trim().length);
    let selection = e.target.textContent.trim();
    this.midiHandler.set_output(selection);
  }

  // Updates the GUI options
  setGuiOptions(name, options) {
    this.sharedParamsComponent.setGuiOptions(name, options);
  }
}

export default ControllerExperience;
