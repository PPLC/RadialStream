import { View } from "soundworks/client";

const template = `
  <% logs.forEach(function(log) { %>
    <pre class="error"><%= log %></pre>
  <% }); %>
`;

class LogComponent {
  constructor(selector, experience) {
    this.selector = selector;
    this.experience = experience;

    this.stack = [];
  }

  enter() {
    const $container = this.experience.view.$el.querySelector(this.selector);

    this.view = new View(template, { logs: this.stack });
    this.view.render();
    this.view.appendTo($container);
  }

  exit() {
    this.view.remove();
  }

  error_msg(msg) {
    const logView = `${msg}`;
    this.stack.unshift(logView);

    this.view.render();
  }

  error(file, line, col, msg, userAgent) {
    // @todo - check sourcemap support
    // https://stackoverflow.com/questions/24637356/javascript-debug-stack-trace-with-source-maps
    const logView = `
${userAgent}
${file}:${line}:${col}  ${msg}
    `;
    this.stack.unshift(logView);

    this.view.render();
  }
}

export default LogComponent;
