var TimeRange = Class.create({
  initialize: function(options){
    this.options = Object.extend({
      startTime: 8,
      selectedBackgroundColor:    '#808080',  // selected color
      selectedBorderColor:        '#808080',  // selected color for bottom border
      deselectedBackgroundColor:  '#FFFFFF',  // deselected color
      deselectedBorderColor:      '#E0E0E0',  // deselected color for bottom border
      fontColor:                  '#FFFFFF'   // font color
    }, options);
    
    var tr = this;
    
    this.dayNames = $w('sunday monday tuesday wednesday thursday friday saturday');
    this.days = this.dayNames.map(function(day) { return $$('.' + day + ' .hour') })
    
    this.days.each(function(lapse){
      lapse.each(function(half, index){
        half.time = ((index) * 0.5) + tr.options.startTime;
        half.tr = tr;
        half.observe('mousedown', function(event) {
          tr.selectSlot(this);
          event.stop()
        });
        half.observe('mousemove', function(event) {
          if (tr.active){
            this.setStyle({background: tr.options.selectedBackgroundColor, borderBottom: '1px solid ' + tr.options.selectedBackgroundColor})
            this.selected = true;
          }
        });
      });
    });
    
    this.selectSlotsFromFields();
    
    $(document).observe('mouseup', function(event) { 
      tr.active = false;
      tr.displayTimes(event);
    });
  },
  selectSlot: function(slot){
    this.active = true
    slot.selected = true;
    slot.setStyle({background: this.options.selectedBackgroundColor,   borderBottom: '1px solid ' + this.options.selectedBackgroundColor});
  },
  deselectSlot: function(slot){
    slot.selected = false;
    slot.setStyle({background: this.options.deselectedBackgroundColor, borderBottom: '1px solid ' + this.options.deselectedBorderColor});
  },
  deselectLapse: function(event, slot){
    var slot = event.findElement().up('div');
    var lapses = $(slot).nextSiblings();
    this.deselectSlot(slot);
    for (var i=0; i < lapses.length; i++) {
      if (lapses[i].selected){
        this.deselectSlot(lapses[i])
      }else{
        break;
      }
    };
    this.displayTimes();
    event.stop()
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
          if (slot.next()) {
            while(slot.next().selected){ continue d }
          }
          time_set.push([starter, day[j]]);
          starter.update(starter.time.toHour() + "-" + Math.max(day[j].time + 0.5, starter.time + 0.5).toHour())
          starter.setStyle({
            fontWeight: 'bold', 
            color: this.options.fontColor,
            padding: '2px'
          });
          var closeLapse = Builder.node('img', {src: 'images/icons/delete.png', height: '16px', width: '16px'}).setStyle({position: 'relative', top: (Prototype.Browser.WebKit ? '0px' : '-16px'), cssFloat: 'right'});
          closeLapse.observe('mousedown', this.deselectLapse.bindAsEventListener(this, slot));
          starter.appendChild(closeLapse);
          starter = null;
        }
      };
      day_sets.push(time_set.first())
    };
    
    // input into fields
    this.populateFieldsFromSlots(event);
  },
  selectSlotsFromFields: function(){
    this.dayNames.each(function(dayName){
      $F(dayName).split(' ').collect(function(t){ return t.split('-') }).each(function(range) {
        /*console.info(dayName + " " + range.first() + " " + range.last());*/
        $$('.' + dayName + ' .hour').each(function(slot) {
          if (slot.time >= range.first().toDecimalHour() && slot.time < range.last().toDecimalHour()){
            this.selectSlot(slot);
          }
        }.bind(this))
      }.bind(this));
    }.bind(this));
    this.active = false;
    this.displayTimes();
  },
  populateFieldsFromSlots: function(){
    this.dayNames.each(function(dayName) {
      $(dayName).value = $$('div.' + dayName + ' .hour').reject(function(s){
        return s.innerHTML == ''
      }).map(function(s){
        return s.innerHTML.replace(/<.*>/, '')
      }).join(' ');
    });
  }
});

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



