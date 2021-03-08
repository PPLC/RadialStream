const { WebMidi } = require("webmidi");

class MidiHandler {
  constructor() {
    this.output_names = [];
    this.input_names = [];
    this.ouput;
    this.conf;
  }

  async connect() {
    await WebMidi.enable()
      .then(() => {
        // ON SUCCESS
        console.log("Available Midi Inputs");
        console.log(WebMidi.inputs);
        console.log("Available Midi Outputs");
        console.log(WebMidi.outputs);

        // Add Midi Devices to dropdown menu (model variable)
        for (let i in WebMidi.outputs) {
          this.output_names.push(WebMidi.outputs[i].name);
        }
        for (let i in WebMidi.inputs) {
          this.input_names.push(WebMidi.inputs[i].name);
        }
      })
      .catch((err) => {
        // ON FAIL
        alert(err);
      });
  }

  set_output(name) {
    this.output = WebMidi.getOutputByName(name);
    console.log("The following Midi Output was selected: ");
    console.log(this.output);
  }

  send_conf() {
    for (let i in this.conf) {
      this.output.sendControlChange(
        this.conf[i].ctrl,
        this.conf[i].val,
        this.conf[i].chn
      );
    }
  }
}

export default MidiHandler;