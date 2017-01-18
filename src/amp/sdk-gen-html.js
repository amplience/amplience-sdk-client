(function(){
/**
 * Generated HTML based on asset JSON
 * @method genHTML
 * @param {Object} asset The Asset Data
 * @param {Object} attach The DOM node to attach the result to
 */
amp.genHTML = function (asset, attach, lazy, videoSourceSort) {
    if(!asset) return;
    var doms = {};
    var transform = function(asset) {
        var assHTML = genAssetHTML(asset, lazy, videoSourceSort);
        doms[asset.name]=(assHTML);
        if (attach && attach.appendChild) {
            attach.appendChild(assHTML);
        }
    };
    if(isArray(asset)) {
        for (var i = 0; i < asset.length; i++) {
            transform(asset[i]);
        }
    } else if(typeof asset == "object") {
        transform(asset);
    } else {
        return;
    }

    return doms;
};

var hasSize = function(o) {
    if(!o || (!o.src && !o.url))
        return false;
    var src = o.isImage? o.url :  o.src;
    var op =  amp.di.get(src);
    for (var i = 0; i < op.length; i++) {
        var obj = op[i];
        if ((obj.width && obj.width!='undefined')||(obj.height && obj.height!='undefined')) {
           return true;
        }
    }
    return false;

}

amp.videoToFormat = function(video){
    if(!video) return;

    var format = video.format;
    var videoCodec = "";
    var audioCodec = "";

    switch(format && format.toLowerCase()){
        case "flash video":
            format = "flv";
            break;
        case "mpeg4":
            format = "mp4";
            break;
    }

    switch(video["video.codec"] && video["video.codec"].toLowerCase()){
        case "h264":
            /** Baseline, it could be higher but we dont have that info **/
            //videoCodec = "avc1.42E01E";
            break;
        case "theora":
            videoCodec = "theora";
            break;
        case "vp8":
            videoCodec = "vp8";
            break;
    }

    switch(video["audio.codec"] && video["audio.codec"].toLowerCase()){
        case "aac":
            if(format == "mp4"){
                audioCodec = "mp4a.40.2";
            }
            break;
        case "vorbis":
            audioCodec = "vorbis";
            break;
    }

    var typeString = format ? "video/" + format : typeString;
    if(videoCodec != ""){
        typeString += '; codecs="';
        typeString += videoCodec;
        if(audioCodec != ""){
            typeString += ", " + audioCodec;
        }
        typeString += '"'
    }

     return typeString;
};

amp.genVideoHTML = function(asset,  videoSourceSort){
    if(!asset.src) {
        asset.src=asset.url;
    }
    var dom = document.createElement('div');
    dom.setAttribute('id', asset.name);
    var video = document.createElement('video');
    if(!hasSize(asset)) {
        video.setAttribute('poster', amp.di.width( asset.src, amp.conf.default_size));
    } else {
        video.setAttribute('poster', asset.src);
    }

    try{
        video.setAttribute('preload', 'auto');
    } catch(e) {
    }
    video.setAttribute('controls', '');
    var media = asset.media, sorted;

    if(videoSourceSort){
        sorted = amp.sortVideoSource(media, videoSourceSort);
    }else{
        sorted = media;
    }
    if(sorted) {
        for (var m=0;m<sorted.length;m++) {
            var media = sorted[m];
            var src = document.createElement('source');
            src.setAttribute('src',media.src);
            src.setAttribute('res',media.bitrate);
            src.setAttribute('label',media.profileLabel);
            src.setAttribute('type', amp.videoToFormat(media));
            video.appendChild(src);
        }
    }
    dom.appendChild(video);
    return dom;
}

amp.sortVideoSource = function(media, by){

    if(isArray(by)){
        if(by.length > 0){
            var mediaLen = media.length, result = [];
            for(var c=0; c<by.length;c++){
                for(var i=0; i<mediaLen; i++) {
                    if(by[c] == media[i].profile || by[c] == media[i].profileLabel) {
                        result.push(media[i]);
                    }
                }
            }

            for(var i=0; i<mediaLen; i++) {
                if((indexOf(by, media[i].profile) == -1 )&& (indexOf(by, media[i].profileLabel) == -1)){
                    result.push(media[i]);
                }
            }
            return result;
        }
    } else if(!isNaN(by)){
        return media.sort(function(a,b){
            var indexA = Math.abs(by - parseInt(a.bitrate));
            var indexB = Math.abs(by - parseInt(b.bitrate));

            return indexA - indexB;
        });
    }

    return media;
};

var getIdFromUrl = function(url) {
    var arr = url.split('/');
    var last = arr[arr.length-1];
    return last.split('?')[0];
};

var genAssetHTML = function (asset,lazy, videoSourceSort) {
    var dom;
     if (asset.isImage || asset.type == "img") {

        var dom = document.createElement('img');
        var attr = asset.isImage ? asset.url :  asset.src;

        if(!hasSize(asset)) {
            attr = attr + '?' + webCacheSize(asset);
        }
        if(lazy) {
            dom.setAttribute('data-amp-src', attr);
        } else {
            dom.setAttribute('src', attr);
        }
        dom.setAttribute('class','amp-main-img');
        if(!asset.name) {
            dom.setAttribute('id', getIdFromUrl(attr));
        } else {
            dom.setAttribute('id', asset.name);
        }

    } else if (asset.type == "video" || asset.media ) {
        dom = amp.genVideoHTML(asset, videoSourceSort);
    } else if (asset.items || asset.set.items) {
        var items = asset.items || asset.set.items;
        var dom = document.createElement('ul');
        dom.setAttribute('id', asset.name);
        for (var i = 0; i < items.length; i++) {
            var li = document.createElement('li');
            dom.appendChild(li);
            var child = items[i];
            child.url = asset.url;
            li.appendChild(genAssetHTML(child, lazy));
        }
    }
    return dom;
};

var webCacheSize = function (data) {
    if (data.width > data.height) {
        return 'w='+amp.conf.default_size;
    } else {
        return 'h='+amp.conf.default_size;
    }
};



/* test-code */
amp.test.genHTML = {};
amp.test.genHTML.sortVideoSource = amp.sortVideoSource;
/* end-test-code */

}());