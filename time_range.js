var TimeRange = Class.create({
  initialize: function(field, options){
    this.field = field;
    this.options = Object.extend({
      squareSelectorSize: 15, 
      startTime: 8,
      endTime: 19,
      interval: 30,
      hideField: false,
      selectedBackgroundColor: '#FF8',
      deselectedBackgroundColor: '#f3f3f3'
    }, options);
    
    var tr = this;
    
    this.container = Builder.node('div');
    document.body.appendChild(this.container);
    this.container.setStyle({position: 'absolute', height: '30px'})
      .clonePosition(this.field, {
        setWidth: false, 
        setHeight: false, 
        offsetTop: -4, 
        offsetLeft: this.field.offsetWidth + 10
      });
    
    this.toggleTimes = $R(this.options.startTime, this.options.endTime).collect(function(hour){
      return $R(0, Math.floor(60 / tr.options.interval)-1).collect(function(minute){
        return hour + '.' + (Number(minute * tr.options.interval) / 60 * 100)
      }.bind(hour));
    })
    .flatten()
    .reject(function(time){ return time >= tr.options.endTime })
    
    this.toggleTimeSlots = this.toggleTimes.collect(function(slot) {
      var div = Builder.node('div').setStyle({
        border: '1px solid #dfdfdf',
        float: 'left',
        margin: 'auto',
        textAlign: 'center',
        width: '21px',
        height: '30px',
        fontSize: '9px',
        lineHeight: '30px',
        background: tr.options.deselectedBackgroundColor,
        cursor: 'crosshair'
      }).update(slot % 1 ? '' : Number(slot).toHour());
      div.setAttribute('title', Number(slot).toHour());
      div.addClassName('slot');
      
      div.time = slot; // eases pain down the road
      
      var selected_ranges = $F(tr.field).split(' ').collect(function(range){ return range.split('-') }).each(function(range){
        if (slot >= range[0].toDecimalHour() && slot <= range[1].toDecimalHour()) tr.selectSlot(div);
      });
      
      
      // handling the magic here.
      div.observe('mouseover',  function(event){ Event.element(event).setStyle({border: '1px dashed #333'}    )}.bindAsEventListener(tr));
      div.observe('mouseout',   function(event){ Event.element(event).setStyle({border: '1px solid #dfdfdf'}  )}.bindAsEventListener(tr));
      
      div.observe('mousedown', function(event) {
        tr.updateStartElement(Event.element(event));
        tr.updateSelection(Event.element(event));
        tr.active = true; // determines wether or not we update selected ones.
        Event.stop(event);
      }.bindAsEventListener(tr));
      
      $(document).observe('mouseup', function(event) {
        tr.active = false;
      }.bindAsEventListener(tr));
      
      div.observe('mousemove', function(event) {
        if(tr.active == true){
          tr.updateSelection(Event.element(event));
        }
      }.bindAsEventListener(tr))
      
      return div;
    }).each(function(slot) {
      tr.container.appendChild(slot)
    });
    
    if (this.options.hideField){ this.field.hide(); }
  },
  updateSelection: function(slot){
    if (!this.active) return;
    
    if (this.startElement.selected){
      this.selectSlot(slot);
    } else {
      this.deselectSlot(slot);
    }
    
    this.calculateTimeRange();
  },
  updateStartElement: function(slot){
    this.toggleSlot(slot);
    this.startElement = slot;
  },
  toggleSlot: function(slot){
    if (slot.selected){
      this.deselectSlot(slot);
    }else{
      this.selectSlot(slot);
    }
  },
  selectSlot: function(slot) {
    slot.setStyle({background: this.options.selectedBackgroundColor});
    slot.selected = true;
  },
  deselectSlot: function(slot){
    slot.setStyle({background: this.options.deselectedBackgroundColor});
    slot.selected = false;
  },
  calculateTimeRange: function(){
    var difference = this.options.interval / 60;
    var times      = this.toggleTimeSlots.select(function(slot){ 
      return slot.selected
    }).map(function(slot) {
      return parseFloat(slot.time) // these are all valid times
    });
    
    // determine which item finish a set
    times = times.collect(function(time, index){
      if (time == times.last()) return [time, true];
      return [time, (Math.abs(time - times[index+1]) != difference)]
    });
    
    var starter = null;
    var ranges  = [];
    
    for (var i=0; i < times.length; i++) {
      var time    = times[i][0];
      var breaker = times[i][1];
      
      if (starter == null){
        starter = time;
      }
      
      if (breaker){
        ranges.push([starter, time + difference])
        starter = null
      }
    }
    
    this.field.value = ranges.collect(function(range) {
      return range.collect(function(t){ return t.toHour() }).join('-');
    }).join(' ')
  }
});

$(document).observe('dom:loaded', function(event){
  $$('.time_range').each(function(field){
    new TimeRange(field);
  });
})

Object.extend(Number.prototype, {
  toHour: function() {
    if (this > 24 || this < 0){ throw "Unrecognized Hour Exception" }
    var h = Math.floor(this);
    var m = parseFloat((this % 1) / 100 * 6000).toString();
    return h + ":" + (m.length == 2 ? m : m + 0);
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
