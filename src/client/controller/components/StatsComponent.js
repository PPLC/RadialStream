import { View } from 'soundworks/client';

const template = `
<div id="leftbox"> 
    <h2 class="normal">General Stats</h2> 
    <ul class="settings-list small">
    <li>
        <span class="settings-descr">Viewers</span>
        <span class="settings-item"><%= sharedParams.params['numPlayers'].value %></span>
    </li>
    <br>
    <li>
        <span class="settings-descr">Times clicked</span>
        <span class="settings-item"><%= dataHandler.data_arr.length %></span>
    </li>
    </ul>
</div>  

<div id="rightbox"> 
    <h2 class="normal">Midi Send Stats</h2> 
    <ul class="settings-list small">
        <li>
            <span class="settings-descr">Last Clicked</span>
            <ul>
                <li>
                  <span class="settings-descr">X: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[0].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[0].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.latest().x %></span>
                  <span class="settings-descr">)</span>
                </li>
                <li>
                  <span class="settings-descr">Y: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[1].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[1].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.latest().y %></span>
                  <span class="settings-descr">)</span>
                </li>
            </ul>
        </li>
        <br>
        <li>
            <span class="settings-descr">Last <%= sharedParams.params['lastN'].value %> Clicks Avg</span>
            <ul>
                <li>
                  <span class="settings-descr">X: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[2].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[2].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.last(sharedParams.params['lastN'].value).x %></span>
                  <span class="settings-descr">)</span>
                </li>
                <li>
                  <span class="settings-descr">Y: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[3].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[3].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.last(sharedParams.params['lastN'].value).y %></span>
                  <span class="settings-descr">)</span>
                </li>
            </ul>
        </li>
        <br>
        <li>
            <span class="settings-descr">Global Clicks Avg</span>
            <ul>
                <li>
                  <span class="settings-descr">X: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[4].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[4].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.global().x %></span>
                  <span class="settings-descr">)</span>
                </li>
                <li>
                  <span class="settings-descr">Y: Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[5].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[5].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= dataHandler.global().y %></span>
                  <span class="settings-descr">)</span>
                </li>
            </ul>
        </li>
        <br>
        <li>
            <span class="settings-descr">Applause</span>
            <ul>
                <li>
                  <span class="settings-descr">Chn(</span>
                  <span class="settings-item"><%= midiHandler.conf[6].chn %></span>
                  <span class="settings-descr">), Data1(</span>
                  <span class="settings-item"><%= midiHandler.conf[6].ctrl %></span>
                  <span class="settings-descr">), Data2(</span>
                  <span class="settings-item"><%= midiHandler.conf[6].val %></span>
                  <span class="settings-descr">)</span>
                </li>
            </ul>
        </li>
    </ul>
</div> 
`;

class StatsComponent {
  constructor(selector, experience, dataHandler, midiHandler) {
    this.selector = selector;
    this.experience = experience;
    this.dataHandler = dataHandler;
    this.midiHandler = midiHandler;

    this.model = {
      dataHandler: this.dataHandler,
      sharedParams: experience.sharedParams,
      midiHandler: experience.midiHandler
    };
  }

  enter() {
    const $container = this.experience.view.$el.querySelector(this.selector);

    this.view = new View(template, this.model);
    this.view.render();
    this.view.appendTo($container);
  }

  exit() {
    this.view.remove();
  }

  update(experience) {
    this.experience = experience;

    this.model = {
      dataHandler: this.dataHandler,
      sharedParams: experience.sharedParams
    };
    this.view.render();
  }
}

export default StatsComponent;
