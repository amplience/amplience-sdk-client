(function () {
    /**
     * DI Methods
     *
     * @class amp.di
     */

    var diOptions = [
        {shortName: 'cs', fullName: 'grayscale', val: 'gray'},
        {shortName: 'dpi', fullName: 'dpi',type:'number'},
        {shortName: 'dpiFilter', fullName: 'dpiFilter',type:'string'},
        {shortName: 'resize', fullName: 'resize', type:'boolean'},
        {shortName: 'filter', fullName: 'filter', type:'string'},
        {shortName: 'upscale', fullName: 'upscale',  type:'boolean'},
        {shortName: 'bg', fullName: 'background', type:'string'},
        {shortName: 'qlt', fullName: 'quality', type:'number'},
        {shortName: 'cm', fullName: 'compositeMode',type:'string'},
        {shortName: 'cs', fullName: 'colourSpace', type:'string'},
        {shortName: 'maxW', fullName: 'maxWidth', type:'number'},
        {shortName: 'maxH', fullName: 'maxHeight', type:'number'},
        {shortName: 'template', fullName: 'template',type:'array'},
        {shortName: 'w', fullName: 'width', type:'number'},
        {shortName: 'h', fullName: 'height', type:'number'},
        {shortName: 'fmt', fullName: 'format', type:'string'},
        {shortName: 'unsharp', fullName: 'sharpen', type:'string'},
        {shortName: 'crop', fullName: 'crop', type:'string'},
        {shortName: 'pcrop', fullName: 'preCrop',type:'string'},
        {shortName: 'img404', fullName: 'missingImage', type:'string'},
        {shortName: 'sm', fullName: 'scaleMode', type:'string'},
        {shortName: 'strip', fullName: 'strip',  type:'boolean'},
        {shortName: 'orig', fullName: 'original',  type:'boolean'}
        ],
    /**
     * Switches options from longName to shortName and vice versa
     * @method returnAs
     * @param {Array} options The options array
     * @param {String} from shortName|fullName
     * @param {String} to shortName|fullName
     * @private
     */
    returnAs = function(options, from, to){
        for (var i = 0; i < options.length; i++) {
            var key = typeof options[i] == "object" && keys(options[i]); 
            for(var o in options[i]){
                if(options[i].hasOwnProperty(o)){
                    for (var c = 0; c < diOptions.length; c++) {
                        if (diOptions[c][from] == o) {
                            if (diOptions[c].val) options[i][diOptions[c][from]] = diOptions[c].val;
                            //rename object key from to
                            if(diOptions[c][to] != diOptions[c][from]) {
                                options[i][diOptions[c][to]] = options[i][o];
                                delete options[i][o];
                            }
                        }
                    }
                }
            }
        }
        return options;
    },
    removeDuplicates = function(arr){
        var obj = {}, i = arr.length;
        while(i--){
            var key = typeof arr[i] == "object" && keys(arr[i]);
            if(obj[key] && (key!="template")) arr.splice(i,1);
            obj[key] = true;
        }

        return arr;
    },
    buildUrl = function(str, setOptions, caller) {
        var url = str.split('?');
        var optionsArray = url[1] ? querystringToArray(url[1],function(parts, optionsObj){
            !parts[1] ? optionsObj["template"] = parts[0] : optionsObj[parts[0]] = parts[1];
        }) : [];

        if(!optionsArray)
            return false;

        if (!setOptions && !caller)
            return removeDuplicates(optionsArray);

        optionsArray = removeDuplicates(optionsArray);
        if (!setOptions && caller) {
            var specificVal = [];
            for (var i = 0; i < optionsArray.length; i++) {
                if(optionsArray[i][caller]){
                    //only need an array for templates otherwise values should be unique
                     if(caller == "template"){
                        specificVal.push(optionsArray[i][caller])
                    }else{
                        return optionsArray[i][caller];
                     }
                }
            }
            return specificVal.length > 0 ? specificVal : false;
        }

        optionsArray = removeDuplicates(optionsArray.concat(setOptions));
        var params = [];
        for (var i = 0; i < optionsArray.length; i++) {
            var key = keys(optionsArray[i]);
            if (key == "template") {
                var names = optionsArray[i][key];
                if( Object.prototype.toString.call( names ) === '[object Array]' ) {
                    for (var l=0;l<names.length;l++) {
                        params.push(names[l]);
                    }
                } else {
                    params.push(names);
                }
            } else {
                params.push(buildQueryString(optionsArray[i]));
            }


        }

        return url[0] + '?' + params.join("&");
    },
    traverse = function(o, options, filter, caller) {
        for (var i in o) {
            if(o.hasOwnProperty(i)){
                if (o[i] != null && typeof o[i] == "object") {
                    if (o[i].type == "img" || o[i].type == "set" || o[i].type == "video"){
                        if (filter && filter.exclude) {
                            var exclude = false;
                            for (var c = 0; c < filter.exclude.length; c++) {
                                 if (o[i].name == filter.exclude[c]) {
                                   exclude = true;
                                }
                            }
                            if(exclude)
                                continue;
                        }
                       // o[i].src = buildUrl(o[i].src, options, caller);
                    }
                    traverse(o[i], options, filter, caller);
                }else{
                    if((i == "src" && ( o.type == "img" ||  o.type == "set" || o.type == "video"))|| (i == "url" && o.isImage)){
                         o[i] = buildUrl(o[i], options, caller);
                    }
                }
            }
        }
        return o;
    };

    /**
     * Returns an object of the DI options set on a URL
     * @method get
     * @param {String} src A URL string
     */
    amp.di.get = function (src) {
        if(!src) return false;
        return returnAs(buildUrl(src), "shortName", "fullName");
    }

    /**
     * Returns a string or data object with the DI options chosen

     * @method set
     * @param {Object|String} src The source data or url to be set with the given options
     * @param {Array of Objects} options The DI options to be set on string
     * @param {Object} filter Exclude objects by name
     * @return The value passed to the src parameter with the options set
     */
    amp.di.set = function (src, options, filter, caller) {
        if(options){
             !isArray(options) ?
                options = returnAs([options], "fullName", "shortName"):
                options = returnAs(options, "fullName", "shortName")
        }

        return typeof src != "string" ?
            traverse(src, options, filter, caller) :
            buildUrl(src, options, caller);
    };

    /**
     * Method to set the image's colour space to grayscale
     * @method grayscale
     * @param {Object|String} src  Data containing src values or a src string
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the image resolution.  If not set the image will retain its
     * original resolution
     * @method resolution
     * @param {Object|String} src Data containing src values or a src string
     * @param {Integer} option  The number of dots per inch required.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the resampling algorithm to use when changing the image's resolution
     * @method resolutionFilter
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option Accepts string values:
     * q(Quadratic),
     * s(Sinc),
     * l(Lanczos) default,
     * p(Point),
     * c(Cubic)
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the image's background colour. This will only have effect when the image is padded or the original image is transparent
     * @method background
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  The colour required as RGB values
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the compression quality of the image
     * @method quality
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Integer} option  An integer value between 1-100
     * @returns The modified value passed to the src param
     */

    /**
     * Method to cut out a section of the image
     * @method crop
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  A string with the values for x,y,w,h respectively.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to cut out a section of the image.  Crops relative to the original image size
     * @method preCrop
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  A string with the values for x,y,w,h respectively.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the image format
     * @method format
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  Accepts the following string values:
     * GIF,
     * JPEG,
     * JPG,
     * PNG,
     * TIFF
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the resizing algorithim to use
     * @method filter
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option Accepts string values:
     * q(Quadratic),
     * s(Sinc),
     * l(Lanczos) default,
     * p(Point),
     * c(Cubic),
     * h(Hermite)
     * @returns The modified value passed to the src param
     */

   /**
     * Method to allow the image to be scaled to a bigger size than the original output.
     * @method upscale
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  Accpets the following string values:
     * true,
    *  false,
    *  padd
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the source colour space to grayscale
     * @method colourSpace
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option Accepts the following string values
     * rgb,
     * rgba,
     * srgb,
     * gray,
     * cmyk,
     * ohta,
     * lab,
     * xyz,
     * hsb,
     * hsl
     * @returns The modified value passed to the src param
     */

    /**
     * Method to resize the image
     * @method resize
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Object} option  An object accepting the following values
     * width,
     * height,
     * scale mode - S(Stretch), TL (Top Left),TC (Top Center),TR (Top Right),ML (Middle Left),
     * MC (Middle Center - Default), MR (Middle Right), BL (Bottom Left), BC (Bottom Center),BR (Bottom Right),
     * e.g., {'w':'asset','h':'i', sm:'S'}
     * @returns The modified value passed to the src param
     */

    /**
     * Method to sharpen the image with an unsharp mask
     * @method sharpen
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option  A string value specifying the following:
     * radius (0-5),
     * sigma (0.01-5),
     * amount (1-300),
     * threshold (1-255),
     * e.g., '4,3,120,220'
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the width of the image
     * @method width
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Integer} option The width in pixels.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the height of the image
     * @method height
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Integer} option The height in pixels.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the maximum height allowed for the image.  May be overridden at account level
     * @method maxHeight
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Integer} option The maximum height in pixels.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the maximum width allowed for the image.  May be overridden at account level
     * @method maxWidth
     * @param {Object|String} src  Data containing src values or a src string
     * @param {Integer} option The maximum width in pixels.
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set the composite operator when the image is applied on top of a background colour
     * @method compositeMode
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option Accepts the following string values:
     * over(default),
     * colo,
     * dark,
     * diff,
     * light,
     * multi,
     * cout,
     * cover
     * @returns The modified value passed to the src param
     */

    /**
     * Method to set an existing transformation template on the image.
     * @method template
     * @param {Object|String} src  Data containing src values or a src string
     * @param {String} option The template name wrapped with the $ symbol. e.g., $mobileTemplate$
     * @returns The modified value passed to the src param
     */

    (function buildDIOptions() {
        for (var i = 0; i < diOptions.length; i++) {
            (function (options) {
                amp.di[options.fullName] = function (src, option) {
                    if(!src) return;
                    var sn = options.fullName != "grayscale" ? options.shortName : null;
                    //checks if has auto filled option
                    var opt = typeof(options.val)!="undefined" ? options.val : option;
                    if(typeof(opt)!="undefined"){
                        var newObj = {};
                        newObj[options.shortName] = opt;
                        return amp.di.set(src, newObj, null, sn);
                    }
                    var val = amp.di.set(src, null, null, sn);
                    switch (options.type) {
                        case 'number':
                            return Number(val);
                        case 'boolean':
                            if(val=='true') {
                                return true;
                            } else if (val=='false') {
                                return false;
                            }
                        case 'string':
                        default:
                            return val
                    }
                }
            })(diOptions[i]);
        }
    })();
}());