# amplience-client-sdk

Amplience Client SDK is a collection of tools designed to make the consumption of the Amplience platform easier for developers.

## Setup

First download and extract the SDK. If you want to use the widgets you will also need jQuery and the jQuery UI Widget Factory. `amplience-api.js` does not require jQuery and handles the retrieval and manipulation of asset data via the Dynamic Imaging API (DI).

    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
    <script src="//path-to-your/amplience-sdk-client.js"></script>
                
To use our DI services you will need to initialise the SDK with your client ID it is also possible to initialise a default 404 image here with err_img.

    amp.init({
        "client_id": "playground",
        "di_basepath": "http://i1.adis.ws/",
        "err_img": "http://i1.adis.ws/i/playground/404"
    });
                
## Retrieving Asset Data

To get JSON data from DI, you can use `amp.get(Object | Array,function,function)`. The function takes either an object or an array of objects and a success and error callback. The objects need a 'name' and 'type' (either 'i' for image, 's' for a set or 'v' for video).

    // getting image data
    amp.get({"name":"mens_winter_season","type":"i"},function(data){
        console.log(data);
    });
    // output:
    /*
    {
        "mens_winter_season": {
            "isImage": true,
            "alpha": false,
            "width": 5000,
            "height": 5000,
            "format": "JPEG",
            "status": "ok",
            "url": "http://i1.adis.ws/i/playground/mens_winter_season",
            "name": "mens_winter_season"
        }
    }
    */
    
Set data:

    // getting set data
    amp.get({"name":"bag_spin","type":"s"},function(data){
        console.log(data);
    });
    // output:
    /*
    {
        "bag_spin": {
            "name": "bag_spin",
            "items": [
                {
                    "type": "img",
                    "src": "http://i1.adis.ws/i/playground/bag-3d_01-01",
                    "width": 3398,
                    "height": 3364,
                    "format": "JPEG",
                    "opaque": "true"
                },
                {
                    "type": "img",
                    "src": "http://i1.adis.ws/i/playground/bag-3d_01-02",
                    "width": 3398,
                    "height": 3364,
                    "format": "JPEG",
                    "opaque": "true"
                },
                {
                    "type": "img",
                    "src": "http://i1.adis.ws/i/playground/bag-3d_01-03",
                    "width": 3398,
                    "height": 3364,
                    "format": "JPEG",
                    "opaque": "true"
                }...
            ],
            "url": "http://i1.adis.ws/s/playground/bag_spin"
        }
    }
    */


Video data:


    // getting video data
    amp.get({"name":"fashion_video_may_13","type":"v"},function(data){
        console.log(data);
    });
    // output:
    /*
    {
       "fashion_video_may_13":{
          "id":"4f435da0-593a-4d99-98da-55e614a856b6",
          "meta":{
             "title":"fashion_video_may_13.mov",
             "updated":"2014-02-07 14:11:15",
             "duration":26693,
             "description":"",
             "mainLink":"",
             "mainThumb":{
                "src":"http://i1.adis.ws/v/playground/fashion_video_may_13/thumbs/38089ad7-f703-4542-a4eb-8b5270722559"
             }
          },
          "media":[
             {
                "src":"http://i1.adis.ws/v/playground/fashion_video_may_13/webm_240p",
                "profile":"webm_240p",
                "profileLabel":"Low",
                "protocol":"http",
                "updated":1391712134,
                "bitrate":"308",
                "width":"426",
                "height":"240",
                "size":"1092904",
                "format":"webm",
                "video.codec":"vp8",
                "audio.codec":"null",
                "audio.channels":"0",
                "aspect":null
             },
             {
                "src":"http://i1.adis.ws/v/playground/fashion_video_may_13/mp4_240p",
                "profile":"mp4_240p",
                "profileLabel":"Low",
                "protocol":"http",
                "updated":1391712131,
                "bitrate":"325",
                "width":"426",
                "height":"240",
                "size":"1091463",
                "format":"mpeg4",
                "video.codec":"h264",
                "audio.codec":"null",
                "audio.channels":"0",
                "aspect":null
             }...
          ],
          "thumbs":[
             {
                "time":0,
                "src":"http://i1.adis.ws/v/playground/fashion_video_may_13/thumbs/frame_0000"
             },
             {
                "time":266,
                "src":"http://i1.adis.ws/v/playground/fashion_video_may_13/thumbs/frame_0001"
             }...
          ],
          "url":"http://i1.adis.ws/v/playground/fashion_video_may_13",
          "name":"fashion_video_may_13"
       }
    }
    */
    
## Using DI

There are many DI transforms we can set, either though the JSON or on an individual URL string.

![width](http://i1.adis.ws/i/playground/mens_winter_season.jpg?w=300)

`amp.di.width(url, 300)`

![crop](http://i1.adis.ws/i/playground/mens_winter_season.jpg?crop=2636,1160,300,200)

`amp.di.crop(url, '2636,1160,300,200')`

![greyscale](http://i1.adis.ws/i/playground/mens_winter_season.jpg?w=1800&cs=gray&crop=1520,60,200,400)

    amp.di.set(url, {
        'width':1800,
        'grayscale':true,
        'crop':'1520,60,200,400'
    })
    
## Generating DOM

Once we have our JSON you can either use the genHTML function to create DOM, or use one of the many templating frameworks.

### genHTML

`genHTML()` can take asset JSON data and output HTML. If also called with a DOM node passed in the generated HTML will automatically be appended to it.

    var contents = document.getElementById('contents');
    amp.get({"name":"bike_set","type":"s"},function(data){
        amp.genHTML(data.bike_set,contents);
    });

    <div id="contents">
        <ul id="bike_set">
            <li><img id="shutterstock_135697520" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_135697520?w=190"></li>
            <li><img id="shutterstock_65540557" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_65540557?w=190"></li>
        </ul>
    </div>

### Handlebars

handlebars.js is a simple yet powerful templating framework.

The Template:

    <script id="navigation" type="text/x-handlebars-template">
        <div id="navContainer">
            <div class="previousThumbnail"></div>
            <ul id="nav">
                {{#items}}
                <li>
                    <img src='{{src}}?w=90' alt='{{ name }}' class="amp-main-img" />
                </li>
                {{/items}}
            </ul>
            <div class="nextThumbnail"></div>
        </div>
    </script>

Rendering and attaching to DOM:

    var contents = $('#contents');
    var template = Handlebars.compile($("#navigation").html());
    amp.get({"name":"bike_set","type":"s"},function(data){
        var dom = template(data.bike_set);
        contents.append(dom);
    });

Result:

    <div id="contents">
        <div id="navContainer">
            <div class="previousThumbnail"></div>
            <ul id="nav">
                <li>
                    <img src="http://i1.adis.ws/i/playground/shutterstock_135697520?w=90" alt="" class="amp-main-img">
                </li>
                <li>
                    <img src="http://i1.adis.ws/i/playground/shutterstock_65540557?w=90" alt="" class="amp-main-img">
                </li>
            </ul>
            <div class="nextThumbnail"></div>
        </div>
    </div>
    
    
# Using the Widgets

Widgets are run on DOM to create interactive components. There are two main ways of using building components, either by initialising each component individually or by using data attributes in combination with ampBuild().

## Individually

Starting HTML:

    <div id="contents">
        <ul id="bike_set" style="width:400px;height:300px;margin:auto">
            <li><img id="shutterstock_135697520" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_135697520?w=400"></li>
            <li><img id="shutterstock_65540557" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_65540557?w=400"></li>
        </ul>
    </div>

Javascript code:

    $('#bike_set').ampCarousel({"autoplay":true});

## Using ampBuild

Starting HTML:

    <div id="contents">
        <ul id="bike_set_2" style="width:400px;height:300px;margin:auto" data-amp-carousel="{&quot;autoplay&quot;:true,&quot;layout&quot;:&quot;carousel3D&quot;}">
            <li><img id="shutterstock_135697520" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_135697520?w=400"></li>
            <li><img id="shutterstock_65540557" class="amp-main-img" src="http://i1.adis.ws/i/playground/shutterstock_65540557?w=400"></li>
        </ul>
    </div>
    
Javascript code:

    $('#contents').ampBuild();
                

# Putting it all together

To see examples of all this in action please visit the [playground website](http://playground.amplience.com/sdk/docs).

# Licence

Copyright 2015 Amplience

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

amplience-client-sdk includes modified code from https://github.com/vidcaster/video-js-resolutions, which is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0).
amplience-client-sdk includes code from https://github.com/jakearchibald/es6-promise, which is licensed under the [MIT license](http://opensource.org/licenses/MIT).
