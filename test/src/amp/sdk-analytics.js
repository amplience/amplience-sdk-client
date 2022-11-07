(function(){

/**
 * Event binding for Analytics
 *
 * @class amp.stats
 */

var aEvents = [];
aEvents.all = [];

/* test-code */
amp.test.aEvents = aEvents;
/* end-test-code */
/**
 * Binds a callback to a set of events which can be filtered
 * (e.g. {type:slider,cb:function} will bind cb to all slider events
 * @method bind
 * @param {Object} o The config object
 */
amp.stats.bind = function(o) {
    if(typeof o == "function"){
        aEvents.all.push(o);
        return;
    };
    if(isArray(o)) {
        for (var i=0; i<o.length;i++) {
            amp.stats.bind(o[i]);
        }
        return;
    };
    if(typeof o != "object")
        return;

    if(!o.cb)
        return;

    if(o.type && o.event){
        aPush(o.type+'.'+ o.event, o.cb);
    } else if (o.type) {
        aPush(o.type, o.cb);
    } else if (o.event) {
        aPush(o.event,o.cb);
    }
};
var aPush = function (obj,fn){
    aEvents[obj] ? aEvents[obj].push(fn) :  aEvents[obj] = [fn];
};
 
/**
 * Triggers an event and its callbacks
 * @method event
 * @param {Object} dom The DOM source of the event
 * @param {String} type The type of source for the event e.g. Slider
 * @param {String} name The nature of the event e.g. Click
 * @param {Object} value The value of the event e.g. {'was':2,'now':3}
 */
amp.stats.event = function(dom,type,event,value){
    var cbs = [];
    cbs = cbs.concat(aEvents.all,aEvents[type]?aEvents[type]:[],aEvents[event]?aEvents[event]:[],aEvents[type+'.'+event]?aEvents[type+'.'+event]:[]);
    for (var i=0; i<cbs.length;i++) {
        cbs[i](dom,type,event,value);
    }
};

}());