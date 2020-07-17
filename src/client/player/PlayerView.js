import * as soundworks from "soundworks/client";
//import Vex from 'vexflow';

const template = `
<div class="fit-container background"></div>
<div class="fit-container wrapper <%= state %>">
  <% if (state === 'wait' || state === 'running') { %>
    <% if (state === 'wait') { %>
      <p class="message wait">Please wait</p>
    <% } %>
    <div id="intensity">
      <p class="forte">fff</p>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="50" y2="100" />
        <line x1="50" y1="100" x2="100" y2="0" />
      </svg>
      <p class="piano">ppp</p>
    </div>
    <canvas id="note"></canvas>
  <% } else { %>
    <p class="message">Thanks!</p>
  <% } %>
</div>
`;

class PlayerView extends soundworks.View {
  constructor(model, events = {}, options = {}) {
    super(template, model, events, options);
  }

  onRender() {
    super.onRender();

    this.$canvas = this.$el.querySelector("#note");
    this.$background = this.$el.querySelector(".background");

    if (this._label && this.$canvas) this.displayNote();
  }

  setLabel(label) {
    this._label = label;
  }

  noteOn(value) {
    value = 0.1 + value * 0.9;
    this.$background.style.opacity = value;
  }

  noteOff() {
    this.$background.style.opacity = 0;
  }

  displayNote() {
    const label = this._label;
    const octava = parseInt(label.split("/")[1]);
    const clef = octava < 4 ? "bass" : "treble";

    const w = 100;
    const h = 260;

    const ctx = this.$canvas.getContext("2d");
    ctx.canvas.width = w;
    ctx.canvas.height = h;

    console.log('test');

    // const renderer = new Vex.Flow.Renderer(
    //   this.$canvas,
    //   Vex.Flow.Renderer.Backends.CANVAS
    // );

    // const stave = new Vex.Flow.Stave(0, 80, 100, { fill_style: "#000000" });

    // stave.addClef(clef);
    // stave.setContext(ctx).draw();

    // const note = new Vex.Flow.StaveNote({
    //   keys: [label],
    //   duration: "1",
    //   clef: clef,
    // });

    // if (/#/.test(label)) note.addAccidental(0, new Vex.Flow.Accidental("#"));

    // Vex.Flow.Formatter.FormatAndDraw(ctx, stave, [note]);

    // // invert colors and shift image in y axis
    // const imageData = ctx.getImageData(0, 0, 100, 260);
    // const data = imageData.data;
    // let lastDrawnPixelIndex = null;

    // for (let i = 0; i < data.length; i += 4) {
    //   // if the pixel is not transparent
    //   if (data[i + 3] !== 0) lastDrawnPixelIndex = i;

    //   data[i] = 255 - data[i];
    //   data[i + 1] = 255 - data[i + 1];
    //   data[i + 2] = 255 - data[i + 2];
    // }

    // // define line of the last pixel (4 values per pixels * 100 pixels per lines)
    // const line = Math.ceil(lastDrawnPixelIndex / (4 * w));
    // const yShift = h - line;

    // ctx.clearRect(0, 0, w, h);
    // ctx.putImageData(imageData, 0, yShift);
  }
}

export default PlayerView;
