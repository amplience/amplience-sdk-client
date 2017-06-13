(function ( $ ) {

    $.widget( "amp.ampImage", {
        options: {
            errImg: null,
            preload:'visible',
            insertAfter:false
        },
        _loadedHistory : [],
        _getCreateOptions:function(){
            var attributes = this.element.data().ampImage;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            this.element.addClass('amp');
            this.element.addClass('amp-image');
            var self = this;
            this.element.bind('load',function(e){
                self._loaded();
            });
            this.element.bind('error',function(){
                self._failLoad();
            });

            if($.inArray(this.options.preload, ['created', 'visible', 'none']) == -1){
                this.options.preload = 'visible';
            }

            if(this.options.preload == 'created') {
                this.newLoad();
            }
            this._track("created");

        },

        dimensionsParams: function (imgSrc) {
            //Dynamically assign width and/or height attributes in src attribute of an image
            var self = this;
            var dimensionsObj = self.element.data('amp-dimensions');
            var src = imgSrc;
            if (!dimensionsObj) {
                return src;
            }

            var paramPrefix = src.indexOf('?') === -1 ? '?' : '&';
            var paramsString = '';

            $.each(dimensionsObj[0], function (key, obj) {
                var regExp = new RegExp(paramPrefix + key + '=' + '[0-9]*', "g");
                var duplicate = src.match(regExp);

                if (duplicate && duplicate.length > 0) {
                    $.each(duplicate, function (i, v) {
                        src = src.replace(v, '');
                    });
                }

                var $parent = obj.domName === 'window' ? $(window) : self.element.closest(obj.domName);
                paramsString += paramPrefix + key + '=' + parseFloat($parent[obj.domProp](), 10);
                paramPrefix = '&';

            });

            src += paramsString;
            return src;
        },

        newLoad: function() {
            var src = (this.element.attr('src') && this.element.attr('src')!="")?this.element.attr('src'):this.element.attr('data-amp-src');
            src = this.dimensionsParams(src);
            var ampSrcSet = this.element.attr('data-amp-srcset') || null;

            if($.inArray(src, this._loadedHistory)!==-1){
                if(this.loading) {
                    this.loading.remove();
                }
                this.element.attr('src',src);
                if(ampSrcSet){
                    this.element.attr('srcset',ampSrcSet);
                }
                this.element.show();
                return;
            }
            if(!this.loading) {
                this.loading = $('<div class="amp-loading"></div>');
            }
            this.element.hide();
            !this.options.insertAfter ? this.element.parent().append(this.loading) :this.options.insertAfter.prepend(this.loading);
            this.element.attr('src','');
            this.element.attr('src',src);

            if(ampSrcSet){
                this.element.attr('srcset','');
                this.element.attr('srcset', ampSrcSet);
            }
        },

        visible: function(visible) {
            if(visible && visible!= this._visible) {
                if(this.options.preload == 'visible'){
                    if(this.loaded || this.loading)
                        return;

                    this.newLoad();
            }
            }
            this._visible = visible;
        },
        load: function(options) {
            if(this.loaded || this.loading)
                return;

            this.newLoad();
        },
        preload: function() {
            if(!this.element.parent().hasClass('amp-spin')){
                this.newLoad();
            }
        },
        loaded:false,
        _loaded: function(){
            this._loadedHistory.push(this.element.attr('src'));
            this._track( 'loaded', true );
            this.loaded = true;
            if(this.loading) {
                this.loading.remove();
            }
            this.element.show();
        },
        _failLoad: function() {
            if(this.options.errImg) {
                this.element.attr('src',this.options.errImg);
            } else {
                if (window.amp && amp.conf && amp.conf.err_img) {
                    this.element.attr('src',amp.conf.err_img);
                }
            }
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'image',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-image');
            if(this.loading) {
                this.loading.remove();
            }
            this.element.css('display','');
            this._removeEmptyAttributeHelper(this.element);
        },
        _removeEmptyAttributeHelper:function(elm, attsToCleanIfEmpty){
            var attArr = attsToCleanIfEmpty || ['class','style'];
            for (var i= 0,len=attArr.length;i<len;i++ ) {
                if(!(elm.attr(attArr[i]) && elm.prop(attArr[i]))){
                    elm.removeAttr(attArr[i]);
                }
            }
        }
    });


}( jQuery ));