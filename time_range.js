var TimeRange = Class.create({
  initialize: function(field, options){
    this.field = field;
    this.options = Object.extend({
      squareSelectorSize: 15, 
      startTime: 8,
      endTime: 19,
      interval: 30,
      hideField: false
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
    .reject(function(time){ return time > tr.options.endTime })
    
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
        background: '#f3f3f3',
        cursor: 'crosshair'
      }).update(slot % 1 ? '' : Number(slot).toHour());
      div.setAttribute('title', Number(slot).toHour());
      div.addClassName('slot');
      
      div.time = slot; // eases pain down the road
      
      // handling the magic here.
      div.observe('mouseover', function(event){ Event.element(event).setStyle({border: '1px dashed #333'})  }.bindAsEventListener(tr));
      div.observe('mouseout', function(event){  Event.element(event).setStyle({border: '1px solid #dfdfdf'})}.bindAsEventListener(tr));
      
      div.observe('mousedown', function(event) {
        tr.updateStartElement(Event.element(event));
        tr.updateSelection(Event.element(event));
        tr.active = true;
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
  updateSelection: function(element){
    if (!this.active) return;
    
    this.toggleTimeSlots.each(function(slot){
      if(slot.time >= Math.min(element.time, this.startElement.time) && slot.time <= Math.max(element.time, this.startElement.time)){
        slot.setStyle({background: '#FF8'})
      }else{
        slot.setStyle({background: '#dfdfdf'})
      }
    }.bind(this));
  },
  updateStartElement: function(element){
    this.startElement = element;
    element.setStyle({background: '#FF8'})
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
