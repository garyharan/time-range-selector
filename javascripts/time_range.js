var TimeRange = Class.create({
  initialize: function(options){
    this.options = Object.extend({
      startTime: 8,
      selectedBackgroundColor:    '#808080',  // selected color
      selectedBorderColor:        '#808080',  // selected color for bottom border
      deselectedBackgroundColor:  '#FFFFFF',  // deselected color
      deselectedBorderColor:      '#E0E0E0'   // deselected color for bottom border
    }, options);
    
    var tr = this;
    
/*    this.days = $w('sunday monday tuesday wednesday thursday friday saturday').map(function(day) { return $$('.' + day + ' .hour') })*/
    this.days = $w('sunday monday').map(function(day) { return $$('.' + day + ' .hour') })
    
    this.days.each(function(slot){
      slot.each(function(half, index){
        half.time = ((index+1) * 0.5) + tr.options.startTime;
        half.observe('mousedown', function(event) {
          tr.selectSlot(this);
        });
        half.observe('mousemove', function(event) {
          if (tr.active){
            this.setStyle({background: tr.options.selectedBackgroundColor, borderBottom: '1px solid ' + tr.options.selectedBackgroundColor})
            this.selected = true;
          }
        });
      });
    });
    
    $(document).observe('mouseup', function(event) { 
      tr.active = false;
      tr.displayTimes(event);
    });
  },
  selectSlot: function(slot){
    this.active = true
    slot.selected = true;
    slot.setStyle({background: this.options.selectedBackgroundColor, borderBottom: '1px solid ' + this.options.selectedBackgroundColor});
  },
  deselectSlot: function(slot){
    slot.selected = false;
    slot.setStyle({background: this.options.selectedBackgroundColor, borderBottom: '1px solid ' + this.options.selectedBackgroundColor});
  },
  deselectBlock: function(event){
    
  },
  displayTimes: function(event){
    // select each day...
    var day_sets = [];
    var time_set = [];
    var starter  = null;
    
    for (var i=0; i < this.days.length; i++) {
      var day = this.days[i];
      day.invoke('update','');
      d: for (var j=0; j < day.length; j++) {
        var slot = day[j];
        if (slot.selected){
          if (starter == null){
            starter = slot;
          }
          while(slot.next().selected){ continue d }
          time_set.push([starter, day[j]]);
          starter.update(starter.time + "-" + day[j].time)
          starter = null;
        }
      };
      day_sets.push(time_set.first())
    };
  }
});

Element.addMethods({
  getLastSelectedSibbling: function(element){
    var element = element;
    if (element.next().selected){
      return element.next()
    } else { 
      return element 
    }
  }
})

Object.extend(Number.prototype, {
  toHour: function() {
    if (this > 24 || this < 0){ throw "Unrecognized Hour Exception" }
    var h = Math.floor(this);
    var m = parseFloat((this % 1) / 100 * 6000).toString();
    return (h.toString().length == 2 ? h : '0' + h) + ":" + (m.length == 2 ? m : m + 0);
  },
  toDecimalMinutes: function(){
    return this / 6000 * 100
  },
  paddedMinutes: function() {
    if (this > 60 || this < 0){ throw "Unrecognized Minute Exception" }
    return this > 9 ? this : this + '0';
  }
});

Object.extend(String.prototype, {
  toDecimalHour: function(){
    return parseFloat(this.split(':').collect(function(v) { return parseFloat(v) }).join('.'))
  }
})



