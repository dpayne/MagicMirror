<html>
<head>
    <title>Magic Mirror</title>
    <style type="text/css">
        <?php include('css/main.css') ?>
    </style>
    <link rel="stylesheet" type="text/css" href="css/weather-icons.css">
    <link rel="stylesheet" type="text/css" href="css/font-awesome.css">
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>

    <script type="text/javascript">
        var gitHash = '<?php echo trim(`git rev-parse HEAD`) ?>';

        google.load("feeds", "1");
    </script>
    <meta name="google" value="notranslate" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
</head>
<body>

<img src="https://41.media.tumblr.com/a8737c93b6605ece4290c0896acafaae/tumblr_ng36upYjYI1u55wl2o1_500.jpg" id="bgimg"></img>

<!-- tvos's aerial screen saver looks great but the raspberry pi cannot keep up with the rendering
<video autoplay loop poster="http://images.apple.com/home/images/og.jpg" id="bgvid">
    <source src="http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/b1-1.mov" type="video/webm">
    <source src="http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/b1-1.mov" type="video/mp4">
    <source src="http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/b1-1.mov" type="video/quicktime">
</video>
-->

<div class="top right"><div class="windsun small dimmed"></div><div class="temp"></div><div class="forecast small dimmed"></div></div>

<div class="top left"><div class="date small dimmed"></div><div class="time" id="time"></div><div class="calendar xxsmall"></div></div>

<div class="center-ver center-hor"><div class="news medium"></div></div>

<div class="left bottom">
    <div id="fitbit" class="fitbit xsmall">
        <div id="heartrate" style="float: left" class="xsmall fa fa-heartbeat"></div>
        <div id="steps" style="float: right"  class="xsmall fa"></div>
        <div style="clear: both"></div>


        <div id="sleep" style="float: left"  class="xsmall fa fa-bed"></div>
        <div id="calories" style="float: right"  class="xsmall fa"></div>
        <div style="clear: both"></div>

<!--
        <div id="active" style="float: left"  class="xsmall fa"></div>
        <div style="clear: both"></div>
-->

        <div id="heartrate_graph" class=""></div>
        <div id="badges" style="float: left" class="xsmall fa"></div>
        <div id="device" style="float: right" class="xsmall fa"></div>
        <div style="clear: both"></div>
    </div>
</div>

<div class="right bottom">
    <div id="lastfm" class="lastfm">
        <img id="cover"></img>
        <div id="info">
            <div id="title" style="text-overflow: ellipsis; width: 200px; white-space: nowrap; overflow: hidden" class="small"></div>
            <div id="artist" style="text-overflow: ellipsis; width: 200px; white-space: nowrap; overflow: hidden" class="small dimmed"></div>
        </div>
    </div>
</div>

<!-- div class="lower-third center-hor"><div class="compliment light"></div></div-->

<script src="js/jquery.js"></script>
<script src="js/d3.v3.min.js"></script>
<script src="js/jquery.feedToJSON.js"></script>
<script src="js/ical_parser.js"></script>
<script src="js/moment-with-locales.min.js"></script>
<script src="https://www.google.com/jsapi"></script>
<script src="js/config.js"></script>
<script src="js/rrule.js"></script>
<script src="js/version/version.js"></script>
<script src="js/calendar/calendar.js"></script>
<script src="js/compliments/compliments.js"></script>
<script src="js/weather/weather.js"></script>
<script src="js/lastfm/lastfm.js"></script>
<script src="js/fitbit/hmac-sha1.js"></script>
<script src="js/fitbit/enc-base64-min.js"></script>
<script src="js/fitbit/fitbit_oauth.js"></script>
<script src="js/fitbit/fitbit.js"></script>
<script src="js/background/background.js"></script>
<script src="js/time/time.js"></script>
<script src="js/news/news.js"></script>
<script src="js/main.js?nocache=<?php echo md5(microtime()) ?>"></script>
<!-- <script src="js/socket.io.min.js"></script> -->
<?php  include(dirname(__FILE__).'/controllers/modules.php');?>
</body>
</html>
