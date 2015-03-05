(function ( $ ) {

    $.widget( "amp.ampNav", {
        // Default options.
        options: {
        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampNav;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            var self = this;
            var components = this.element.data();
            for (var i in components) {
                if(components.hasOwnProperty(i)){
                    var component = components[i];
                    if(component.bind && i.substring(0,3)=='amp'){
                        component.bind(this.options);
                    }
                }
            }
            this._track("created");
        },
        _track: function(event,value) {
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'navigation',event,value);
            }
        }
    });



}( jQuery ));