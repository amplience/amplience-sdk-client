(function ( $ ) {
    $.widget( "amp.ampBuild", {
        // Default options.
        options: {
        },
        _create: function() {
            for(var prop in $.amp){
                if($.amp.hasOwnProperty(prop)){
                    this.element.find("[data-"+ prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+"]")[prop]();
                }
            }
            this._track("created");
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'build',event,value);
            }
        }
    });

}( jQuery ));