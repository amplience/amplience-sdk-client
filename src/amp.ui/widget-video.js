(function ($) {

    $.widget("amp.ampVideo", {
        options: {
            autoplay: false,
            loop: false,
            muted: false,
            skin: 'amp-video-skin',
            responsive: true,
            preload: 'auto',
            pauseOnHide: true,
            controls:true,
            nativeControlsForTouch:true,
            plugins:{}
        },
        _states: {
            stopped:0,
            buffering:1,
            paused:2,
            playing:3,
            loading:4,
            error:5,
            idle:6
        },
        _ready: false,
        _loopCount: 0,
        _savedHTML:'',
        _getCreateOptions:function(){
            this._savedHTML = this.element[0].outerHTML;
            var attributes = this.element.data().ampVideo;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function () {
            this.element.addClass('amp amp-video');
            var video = this.element.find('video');
            var self = this;
            video.addClass('video-js' + ' ' + this.options.skin);
            if(videojs) {
                videojs.options.flash.swf = (this.options.swfUrl +"video-js.swf") || "../../assets/video-js.swf";

                this._player = videojs(video[0], {
                    autoplay: this.options.autoplay,
                    muted: this.options.muted,
                    width: '100%',
                    height: '100%',
                    loop: false,
                    controls: this.options.controls,
                    preload: this.options.preload,
                    plugins: self._sanitisePlugins(this.options.plugins),
                    nativeControlsForTouch:this.options.nativeControlsForTouch
                });
            }

            self._calcSize();
            if (self.options.responsive) {
                $(window).bind("resize", function (_self) {
                    return function () {
                        return _self._calcSize();
                    }
                }(self));
            }

            this._player.ready(function () {
                self._ready = true;
                var vid = self.element.find('.vjs-tech');
                var interval = setInterval(function () {
                    if(self.options.height == 'auto'){
                        var height = vid.css({'height':'auto'}).height();
                        if (height != 0) {
                            clearInterval(interval);
                            self.element.height(height);
                            vid.css({height:''});
                            self._player.dimensions(self.element.width(), self.element.height())
                        }
                    }
                }, 200);
                if (self.options.autoplay)
                    self.state(self._states.playing);

                this.on("play", function (e) {
                    if (!self.softPlay) {
                        self.state(self._states.playing);
                        self._track("play", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    } else {
                        self.softPlay = false;
                    }
                });

                this.on("error", function (e) {
                    self.state(self._states.error);
                    self._track("error", null);
                });

                this.on("pause", function (e) {
                    if(!e.target.ended && !e.target.seeking){
                        self.state(self._states.paused);
                        self._track("pause", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    }
                });

                this.on("waiting", function (e) {
                    self.state(self._states.buffering);
                });

                this.on("seeking", function (e) {
                    if (!self.softSeek) {
                        if (self.state() != self._states.paused && e.target.currentTime != 0)
                            self.softPlay = true;
                        self._track("seeked", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    } else {
                        self.softSeek = false;
                    }
                });

                this.on("timeupdate", function (e) {
                    self._track("timeUpdate", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                });

                this.on("volumechange", function (e) {
                    self._track("volume", {event:e,player:this,volume: this.volume(), muted: this.muted()});
                });

                this.on("durationchange", function (e) {
                    self.duration = this.duration();
                    self._track("durationChange", {event:e,player:this,duration: self.duration});
                });

                this.on("fullscreenchange", function (e) {
                    self._track("fullScreenChange", {event:e,player:this});
                    setTimeout(function(){$(window).resize()},200);
                });

                this.on("ended", function (e) {
                    if (self.options.loop) {
                        self.softSeek = true;
                        self._player.currentTime(0);
                        self.softPlay = true;
                        self._player.play();
                        self._track("looped", { count: ++self._loopCount });
                    }else{
                        self._track("ended", null);
                    }
                });
                self._track("created",{player:this,duration: self.duration});
            });
        },
        visible: function(visible) {
            if(visible == this._visible)
                return;

            if (visible) {
                this._track('visible',{'visible':visible});
                this._calcSize();
            } else {
                if(this._states.playing == this.state() || this._states.buffering== this.state()) {
                    if(this.options.pauseOnHide){
                        this.pause();
                    }
                }
            }

            this._visible = visible;
        },

        redraw:function(){
            this._calcSize();
        },
        _calcSize: function() {
            var w,h;
            if ((this.options.responsive) && (this.options.width && this.options.height && this.options.width!='auto' && this.options.height!='auto')) {
                var display = this.element.css('display');
                this.element.css('display','block');
                w  = Math.round((this.element.width()));
                this.element.css('display',display);
                h =  Math.round((w*(this.options.height/this.options.width)));
                this.element.height(h);
            } else {
                if (this.options.width) {
                    this.element.width(this.options.width)
                } else if (this.options.responsive) {
                    this.element.width(this.element.parent().width());
                }
                if (this.options.height) {
                    this.element.height(this.options.height);
                }else if (this.options.responsive) {
                    this.element.height(this.element.parent().height());
                }
            }

            if(this.options.center) {
                var eh = this.element.height();
                var ph = this.element.parent().height();
                this.element.css('margin-top',((ph/2)-(eh/2))+'px');
            }

            if (this._player)
                this._player.dimensions(this.element.width(), this.element.height())

        },
        play: function () {
            if(!this._ready || this._states.playing === this.state()) return;
            this._player.play();
        },
        pause: function () {
            if(!this._ready || this._states.paused === this.state()) return;
            this._player.pause();
        },
        stop: function () {
            if(!this._ready || this._states.stopped === this.state()) return;
            this._player.pause();
            this.softSeek = true;
            this._player.currentTime(0);
            this._track("stopped", null);
            this.state(this._states.stopped);
        },
        seek: function (time) {
            if(!this._ready) return;
            this.currentTime(time)
        },
        currentTime: function (time) {
            if (time === void 0)
                return this._player.currentTime();
            this._player.currentTime(time);
        },
        state: function(state){
            if (state === void 0)
                return this._currentState;

            this._currentState = state;
            this._trigger("stateChange", null, {state:state})
        },
        _track: function (event, value) {
            this._trigger(event, null, value);
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element, 'video', event, value);
            }
        },
        _destroy: function() {
            this._player.dispose();
            this.element[0].outerHTML = this._savedHTML;
        },
        _sanitisePlugins: function(plugins){
            // setting plugins to false doesn't deactivate, remove instead
            if (plugins && plugins['resolutions'] == false){
                delete plugins['resolutions'];
            }
            return plugins;
        }
    });

}(jQuery));
