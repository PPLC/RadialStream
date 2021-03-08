// DataHandler handles the data
// Adds inputs, sets timestamps to it, stores everything, deletes entries when a player left, etc
class DataHandler {
  constructor(num_tails = 30, num_mins = 10) {
    this.data_arr = [];
    // Number of elements building intermediate avg
    this.num_tails = num_tails;
    // Minutes to look back to build an avg
    this.num_mins = num_mins;

    // Stats that will be used by controller
    this.global_cum = {
      x: 0,
      y: 0
    };
    this.tailed_avg = {
      x: 0,
      y: 0
    };
    this.timed_avg = {
      x: 0,
      y: 0
    };
  }

  // Add an input and update stats
  add_user_input(id, pos) {
    // calculate for global stats
    this.global_cum.x += parseInt(pos.x);
    this.global_cum.y += parseInt(pos.y);

    // this is saved in array
    var data = {
      id: id,
      x: pos.x,
      y: pos.y,
      date: new Date()
    }

    // Add elements at the beginning of the array
    // -> time-based avg later is faster bc we can abort at first sight of older element
    this.data_arr.unshift(data);

    // Update internal stats
    //this.tailed_avg = this.update_tailed_avg();
  }

  update_num_tails(val) {
    this.num_tails = val;
    this.tailed_avg = this.update_tailed_avg();
  }

  update_num_mins(val) {
    this.num_mins = val;
    this.tailed_avg = this.update_timed_avg();
  }

  // Get last stop_cnd entries
  update_tailed_avg() {
    // Get cumulative val and count number of inputs
    var cum_x = 0;
    var cum_y = 0;
    var cnt = 0;
    for (let e of this.data_arr) {
      // This is to check last x entries
      if (cnt >= this.num_tails) {
        break;
      }
      cum_x += parseInt(e.x);
      cum_y += parseInt(e.y);
      cnt++;
    }

    // Calc avg
    this.tailed_avg = {
      x: (cum_x / cnt).toFixed(),
      y: (cum_y / cnt).toFixed()
    }
  }

  // get last stop_cnd minutes of input
  update_timed_avg() {
    // Reference value
    var now = new Date();

    // Get cumulative val and count number of inputs
    var cum_x = 0;
    var cum_y = 0;
    var cnt = 0;
    for (let e of this.data_arr) {
      if ((Math.abs(now - e.date) / 1000 / 60) > this.num_mins) { // / 1000 for seconds, / 60 for mins
        break;
      }
      cum_x += parseInt(e.x);
      cum_y += parseInt(e.y);
      cnt++;
    }

    // Calc avg
    this.timed_avg = {
      x: (cum_x / cnt).toFixed(),
      y: (cum_y / cnt).toFixed()
    }
  }

  // Get latest vote
  latest() {
    if (this.data_arr.length === 0) {
      return {
        x: 0,
        y: 0
      };
    } else {
      // Latest vote always at front of array
      return {
        x: parseInt(this.data_arr[0].x),
        y: parseInt(this.data_arr[0].y)
      };
    }
  }

  last(val) {
    if (this.data_arr.length === 0) {
      return {
        x: 0,
        y: 0
      };
    }

    // Get cumulative val and count number of inputs
    var cum_x = 0;
    var cum_y = 0;
    var cnt = 0;
    for (let e of this.data_arr) {
      // This is to check last x entries
      if (cnt >= val) {
        break;
      }
      cum_x += parseInt(e.x);
      cum_y += parseInt(e.y);
      cnt++;
    }

    // Calc avg
    return {
      x: parseInt((cum_x / cnt).toFixed()),
      y: parseInt((cum_y / cnt).toFixed())
    };
  }

  // Get average votes. If stop_cnd is undefined, show everything from beginning
  global() {
    if (this.data_arr.length === 0) {
      return {
        x: 0,
        y: 0
      };
    } else {
      return {
        x: parseInt((parseInt(this.global_cum.x) / this.data_arr.length).toFixed()),
        y: parseInt((parseInt(this.global_cum.y) / this.data_arr.length).toFixed())
      };
    }
  }

}

export default DataHandler;