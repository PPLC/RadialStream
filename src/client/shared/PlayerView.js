import { View } from 'soundworks/client';
import Slider2D from './Slider2D';

const template = `
<% shouldShowButtonWidget = buttonVisible && buttonURL && buttonText %>
<% shouldShowStreamWidget = videoVisible && videoUrl && (playerType === 'streamer') %>
<% streamIFrame = '<iframe src="' + videoUrl + (videoUrl.includes("facebook") ? '&' : '?') + 'autoplay=1" width="640" height="480" frameborder="0" allow="fullscreen; autoplay" allowfullscreen></iframe>' %>

<div class="section-top flex-middle">
  <%= shouldShowStreamWidget ? streamIFrame : '' %>
</div>


<div class="section-center flex-center">
  <p class="small" <%= textVisible ? '' : 'style="display: none"'%>><%= textContent %></p>
</div>

<%= (playerType === 'streamer' || textVisible) ? '<hr>' : '' %>

<div class="section-bottom flex-middle">
    <div id="widget">  

    <%= !slider2dVisible && !shouldShowButtonWidget && !recordButtonVisible && !slider1dVisible ? '<p class="small">Interactions currently disabled</p>' : '' %>

    <!-- Slider1d widget -->
    <div class="slider1dcontainer" <%= slider1dVisible ? '' : 'style="display: none"'%>>
      <input type="range" min="0" max="127" value="63" class="slider" id="slider1d">
      <div>
        <div id=slider1d-descr-left  class=slider1d-descr> <p class="small"><%= slider1dLeft %></p> </div>
        <div id=slider1d-descr-mid   class=slider1d-descr> <p class="small"><%= slider1dMid %></p> </div>
        <div id=slider1d-descr-right class=slider1d-descr> <p class="small"><%= slider1dRight %></p> </div>
      </div>
    </div>
    <!-- Slider1d widget -->

    <!-- Slider2d widget -->
    <div id="selection-widget" <%= slider2dVisible? '' : 'style="display: none"' %>>  

        <div id="adj-tl" <%= slider2dCornersVisible ? '' : 'style="display: none"'%> class="selection-label-left" style=""><p class="small"> <%= slider2dUL %> </p></div>
        <div id="adj-tr" <%= slider2dCornersVisible ? '' : 'style="display: none"'%> class="selection-label-right" style=""><p class="small"> <%= slider2dUR %> </p></div>
        <div class="clearer"></div>
        
        <div id="markerbounds">
            <div id="box">
                <div id="marker"></div>

                <canvas id="bg-canvas" style="display: none;"></canvas>
                <img src="/images/<%= slider2dBackground %>" id="bg-canvas-img" style="display:none" />

            </div>
        </div>

        <div id="adj-bl" <%= slider2dCornersVisible ? '' : 'style="display: none"'%> class="selection-label-left"><p class="small"> <%= slider2dBL %> </p></div>
        <div id="adj-br" <%= slider2dCornersVisible ? '' : 'style="display: none"'%> class="selection-label-right"><p class="small"> <%= slider2dBR %> </p></div>
        <div class="clearer"></div>

        <div id="status">
            <table class="small" id="status-table">
                <tr class="status-table-row">
                    <td class="status-table-descr">My selection:</td>
                    <td class="status-table-cbox"> <span class="colored-box" id="my_selection"></span> </td>
                </tr>
                <tr class="status-table-row">
                    <td class="status-table-descr">Active:</td>
                    <td class="status-table-cbox"> <span class="colored-box" id="active"></span> </td>
                </tr>
            </table>
        </div>
        
    </div>
    <!-- End Slider2d widget -->
    
    <!-- Button widget -->
    <div id="button-widget" <%= shouldShowButtonWidget ? '' : 'style="display: none"' %>>  
          <a href="<%= buttonURL %>" target="_blank" class="button"><%= buttonText %></a>  
    </div>
    <!-- End Button widget -->
    
    <!-- Record widget -->
    <div id="record-widget" <%= recordButtonVisible ? '' : 'style="display: none"' %>>  
          <a class="button" id="record-button">Start recording</a>  
    </div>
    <!-- End Record widget -->

</div>
`;

class PlayerView extends View {
  constructor(experience, width = 250, height = 250) {
    super(template, experience.model, {}, { id: 'player' });
    this.slider_width = width;
    this.slider_height = height;
    this.experience = experience;

    this.slider2d = new Slider2D("bg-canvas-img", this.slider_width, this.slider_height, 25, 0, 127, 0, 127);

  }

  setModelValue(name, val) {
    if (name === "videoVisible") {
      this.model.videoVisible = val;
    } else if (name === "videoUrl") {
      this.model.videoUrl = val;
    } else if (name === "textVisible") {
      this.model.textVisible = val;
    } else if (name === "textContent") {
      this.model.textContent = val;
    } else if (name === "slider2dVisible") {
      this.model.slider2dVisible = val;
    } else if (name === "slider2dBackground") {
      this.model.slider2dBackground = val;
    } else if (name === "slider2dCornersVisible") {
      this.model.slider2dCornersVisible = val;
    } else if (name === "slider2dUL") {
      this.model.slider2dUL = val;
    } else if (name === "slider2dUR") {
      this.model.slider2dUR = val;
    } else if (name === "slider2dBL") {
      this.model.slider2dBL = val;
    } else if (name === "slider2dBR") {
      this.model.slider2dBR = val;
    } else if (name === "slider1dVisible") {
      this.model.slider1dVisible = val;
    } else if (name === "slider1dLeft") {
      this.model.slider1dLeft = val;
    } else if (name === "slider1dMid") {
      this.model.slider1dMid = val;
    } else if (name === "slider1dRight") {
      this.model.slider1dRight = val;
    } else if (name === "buttonVisible") {
      this.model.buttonVisible = val;
    } else if (name === "buttonURL") {
      this.model.buttonURL = val;
    } else if (name === "buttonText") {
      this.model.buttonText = val;
    } else if (name === "recordButtonVisible") {
      this.model.recordButtonVisible = val;
    } else {
      console.error("Variable \"" + name + "\" not found in PlayerView Model. Couldn't update with value " + val);
    }
  }
  /* End data model setters */

  update_view() {
    this.render();
  }

  set_bg_color(id, hex) {
    let el = document.getElementById(id);
    el.setAttribute("style", "background-color: " + hex + ";")
  }

  update_my_color() {
    this.set_bg_color("my_selection", this.slider2d.get_rgb_at(this.slider2d.get_marker().x, this.slider2d.get_marker().y));
  }

  update_cur_color(pos) {
    let new_pos = this.slider2d.ranged2relative(pos);
    this.set_bg_color("active", this.slider2d.get_rgb_at(new_pos.x, new_pos.y));
  }

  create_slider2d() {
    this.slider2d.register_elements();
    this.slider2d.draw();

    this.slider2d.box.addEventListener(
      "touchstart",
      this.slider2d.drag_start.bind(this.slider2d),
      false
    );
    this.slider2d.box.addEventListener(
      "touchmove",
      this.slider2d.drag.bind(this.slider2d),
      false
    );
    this.slider2d.box.addEventListener(
      "touchend",
      this.experience.handle_slider2d_click.bind(this.experience),
      false
    );

    this.slider2d.box.addEventListener(
      "mousedown",
      this.slider2d.drag_start.bind(this.slider2d),
      false
    );
    window.addEventListener(
      "mousemove",
      this.slider2d.drag.bind(this.slider2d),
      false
    );
    window.addEventListener(
      "mouseup",
      this.experience.handle_slider2d_click.bind(this.experience),
      false
    );
  }

  // Not really creating it, just connecting the functionality
  create_slider1d() {
    let slider = document.getElementById("slider1d");

    slider.addEventListener(
      "change",
      this.experience.handle_slider1d_change.bind(this.experience),
      false
    );
  }
}

export default PlayerView;