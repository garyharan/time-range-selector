var TimeRange = Class.create({
  initialize: function(field, options){
    this.field = field;
    this.options = Object.extend({
      squareSelectorSize: 15, 
      startTime: 8,
      endTime: 20,
      interval: 30,
      hideField: false
    }, options);
    
    this.buildTogglers();
    if (this.options.hideField){ this.field.hide(); }
  },
  buildTogglers: function(){
    var timeSlots = $R(this.options.startTime, this.options.endTime).collect(function(hour){
      return [hour, $R(0, Math.floor(60 / this.options.interval)-1).collect(function(minute){
        return minute * this.options.interval
      }.bind(this))]
    }.bind(this));
    
    var div = Builder.node('div');
    div.setStyle({position: 'absolute', height: '30px'});
    document.body.appendChild(div);
    div.clonePosition(this.field, {setWidth: false, setHeight: false, offsetTop: -4, offsetLeft: this.field.offsetWidth + 10});
    timeSlots.each(function(s){
      s[1].each(function(slot) {
        var slotDiv = Builder.node('div').setStyle({width: 20  + 'px', fontSize: '9px'});
        slotDiv.update(s[0] + ":" + slot.paddedMinutes()).setStyle({float: 'left', height: '30px', fontSize: '8px', background: '#DDDDDD', border: '1px solid #D0D0D0'});
        div.appendChild(slotDiv)
      }.bind(this));
    }.bind(this));
  }
});

$(document).observe('dom:loaded', function(event){
  [$$('.time_range').first()].each(function(field){
    new TimeRange(field);
  });
})


Object.extend(Number.prototype, {
  toHour: function() {
    if (this > 24 || this < 0){ throw "Unrecognized Hour Exception" }
    var h = Math.floor(this);
    var m = parseFloat((this % 1) / 100 * 6000).toString();
    return h + ":" + Math.round(m.length == 2 ? m : m + 0);
  },
  paddedMinutes: function() {
    if (this > 60 || this < 0){ throw "Unrecognized Minute Exception" }
    return this > 9 ? this : this + '0';
  }
});
