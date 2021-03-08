/**
 * Slider2D.js
 *
 * A basic 2D selection slider with and underlying canvas.
 *
 * Created by Jens Schindel
 */

// Clip value between min max
function clip(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

// Helper to get offset var on click in box
function addTouchOffsets(event) {
  var touch = event.touches[0] || event.changedTouches[0];
  var realTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  event.touches[0].offsetX = (
    touch.clientX - realTarget.getBoundingClientRect().x
  ).toFixed();
  event.touches[0].offsetY = (
    touch.clientY - realTarget.getBoundingClientRect().y
  ).toFixed();
  return event;
}

function RGBToHex(r, g, b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

class Slider2D {
  constructor(
    img_id,
    width = 300,
    height = 300,
    dot_size = 20,
    xrange_min = 0,
    xrange_max = 1,
    yrange_min = 0,
    yrange_max = 1
  ) {
    // Class Vars to draw
    this.img_id = img_id;
    this.width = width;
    this.height = height;
    this.xrange_min = xrange_min;
    this.yrange_min = yrange_min;
    this.xrange_max = xrange_max;
    this.yrange_max = yrange_max;
    this.dot_size = dot_size;

    // Class vars for interactivity
    this.active = false;
    this.old_position = {
      x: (0.0).toPrecision(),
      y: (0.0).toPrecision(),
    };
    this.new_position = {
      x: (0.0).toPrecision(),
      y: (0.0).toPrecision(),
    };
    this.ranged_position = {
      x: (0.0).toPrecision(),
      y: (0.0).toPrecision(),
    };

    this.untouched = true;
  }

  drag_start(e) {
    e.preventDefault();
    // If clicked on marker, save current position for later
    if (e.target === this.marker) {
      if (e.type === "touchstart") {
        // Touchevent
        this.old_position.x = e.touches[0].clientX - this.new_position.x;
        this.old_position.y = e.touches[0].clientY - this.new_position.y;
      } else {
        // Mouseevent
        this.old_position.x = e.clientX - this.new_position.x;
        this.old_position.y = e.clientY - this.new_position.y;
      }
    }
    // If clicked inside box, transport marker to that location first and then save for pos later
    else if (e.target === this.box) {
      if (e.type === "touchstart") {
        addTouchOffsets(e);
        // Touchevent
        this.new_position.x = e.touches[0].offsetX - this.dot_size / 2;
        this.new_position.y = e.touches[0].offsetY - this.dot_size / 2;
        this.old_position.x = e.touches[0].clientX - this.new_position.x;
        this.old_position.y = e.touches[0].clientY - this.new_position.y;
      } else {
        // Mouseevent
        this.new_position.x = e.offsetX - this.dot_size / 2;
        this.new_position.y = e.offsetY - this.dot_size / 2;
        this.old_position.x = e.clientX - this.new_position.x;
        this.old_position.y = e.clientY - this.new_position.y;
      }
      // Calculate the display position (based on the range given)
      this.calculate_position();
      // Move it
      this.set_translate(this.new_position.x, this.new_position.y, this.marker);
      // Display new pos in html
      // this.display_position();
    }

    // Only set active when marker was clicked
    this.active = true;
    this.untouched = false;
  }

  drag(e) {
    // Only active when marker was clicked
    if (this.active) {
      e.preventDefault();

      // Calculate the new position based on the drag movememt
      if (e.type === "touchmove") {
        // Touchevent
        this.new_position.x = e.touches[0].clientX - this.old_position.x;
        this.new_position.y = e.touches[0].clientY - this.old_position.y;
      } else {
        // Mouse event
        this.new_position.x = e.clientX - this.old_position.x;
        this.new_position.y = e.clientY - this.old_position.y;
      }

      // If drag event would place marker outisde box, clip. Subtract half the size the marker, so it is like measuring from the center, not top left of the bounding box
      this.new_position.x = clip(
        this.new_position.x,
        0 - this.dot_size / 2,
        this.width - this.dot_size / 2
      );
      this.new_position.y = clip(
        this.new_position.y,
        0 - this.dot_size / 2,
        this.height - this.dot_size / 2
      );
      // Calculate the display position (based on the range given)
      this.calculate_position();

      // Move it
      this.set_translate(this.new_position.x, this.new_position.y, this.marker);
      // Display new pos in html
      // this.display_position();
    }
  }

  drag_end(e) {
    if (e) {
      e.preventDefault();
    }
    // End drag action
    this.active = false;
  }

  ranged2relative(coord) {
    let x = parseFloat(coord.x);
    let y = parseFloat(coord.y);
    let Ax =
      ((x - this.xrange_min) / (this.xrange_max - this.xrange_min)) *
      this.width;
    let Ay =
      ((y - this.yrange_min) / (this.yrange_max - this.yrange_min)) *
      this.height;
    let res = {
      x: Ax,
      y: Ay,
    };
    return res;
  }

  set_marker_ranged(x, y) {
    this.new_position = this.ranged2relative({ x: x, y: y });
    this.new_position.x -= this.dot_size / 2;
    this.new_position.y -= this.dot_size / 2;
    // Move it
    this.set_translate(this.new_position.x, this.new_position.y, this.marker);
    // Display new pos in html
    // this.display_position();
  }

  get_marker() {
    return {
      x: this.new_position.x + this.dot_size / 2,
      y: this.new_position.y + this.dot_size / 2,
    };
  }

  set_marker(x, y) {
    this.new_position = {
      x: x - this.dot_size / 2,
      y: y - this.dot_size / 2,
    };
    // Move it
    this.set_translate(this.new_position.x, this.new_position.y, this.marker);
    // Display new pos in html
    // this.display_position();
  }

  // Translate an element
  set_translate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }

  // Calculate range that is wished
  calculate_position() {
    // Transform from top left, y down, x right TO center, y down, x right
    this.ranged_position.x = (
      ((this.new_position.x + this.dot_size / 2) / this.width) *
      (this.xrange_max - this.xrange_min) +
      this.xrange_min
    ).toFixed(0);
    this.ranged_position.y = (
      ((this.new_position.y + this.dot_size / 2) / this.height) *
      (this.yrange_max - this.yrange_min) +
      this.yrange_min
    ).toFixed(0);
    // Transform y down (css) to y up
    //this.ranged_position.y -= this.yrange_max;
    //this.ranged_position.y *= -1;
  }

  display_position() {
    console.log("Clicked position:");
    console.log(this.ranged_position);
    // document.getElementById("coord").innerHTML =
    //     "<br>x: " +
    //     parseFloat(this.ranged_position.x) +
    //     "<br> y: " +
    //     parseFloat(this.ranged_position.y) + // In CSS, top left is start, downwards is positive x
    //     "<p>&nbsp;</p>";
  }

  get ranged_pos() {
    return this.ranged_position;
  }

  register_elements() {
    // Grab elements where we need to set properties
    this.widget = document.getElementById("selection-widget");
    this.box = document.getElementById("box");
    this.marker = document.getElementById("marker");
    this.markerbounds = document.getElementById("markerbounds");
    this.canvas = document.getElementById("bg-canvas");
    this.canvas_ctx = this.canvas.getContext("2d");
  }

  draw() {
    // Set width and height
    this.markerbounds.style.width =
      (this.width + this.dot_size).toString() + "px";
    this.markerbounds.style.height =
      (this.height + this.dot_size).toString() + "px";

    this.box.style.width = this.width.toString() + "px";
    this.box.style.height = this.height.toString() + "px";
    this.box.style.top = (this.dot_size / 2).toString() + "px";
    this.box.style.left = (this.dot_size / 2).toString() + "px";

    this.marker.style.width = this.dot_size.toString() + "px";
    this.marker.style.height = this.dot_size.toString() + "px";

    this.widget.style.width = (this.width + this.dot_size).toString() + "px";

    // Set style and canvas obj sizes seperately
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Set marker to start position
    this.set_marker(this.width / 2, this.height / 2);

    // Draw the background canvas
    this.draw_canvas();
  }

  draw_canvas() {
    let img = document.getElementById(this.img_id);

    if (!img) {
      console.error("Couldn't find background image for slider");
      // Paint black image
      this.canvas_ctx.beginPath();
      this.canvas_ctx.rect(0, 0, this.width, this.height);
      this.canvas_ctx.fillStyle = "white";
      this.canvas_ctx.fill();

      this.assign_canvas();
    } else {
      img.addEventListener('load', e => {
        let canvas = document.getElementById("bg-canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height,
          0, 0, this.width, this.height);

        this.assign_canvas();
      });
    }
  }

  assign_canvas() {
    // Get Data URL of canvas (base64 string) and set this as background of the div
    let dataUrl = this.canvas.toDataURL();
    this.box.style.background = "url(" + dataUrl + ")";

    // Save the currently displayed image data in a variable so we can make a performant lookup later
    this.imgData = this.canvas_ctx.getImageData(0, 0, this.width, this.height);
  }

  get_rgb_at(x, y, hex = true) {

    // imgData ranges from 0 - width-1 or height-1, so fix this for incoming x,y whichs goes up to width/height 
    x = Math.round(clip(x - 1, 0, this.width - 1));
    y = Math.round(clip(y - 1, 0, this.height - 1));

    let index = (y * this.width + x) * 4;

    let r = this.imgData.data[index];
    let g = this.imgData.data[index + 1];
    let b = this.imgData.data[index + 2];
    let a = this.imgData.data[index + 3];

    if (hex) {
      return RGBToHex(r, g, b);
    } else {
      return [r, g, b];
    }
  }
}

export default Slider2D;
