<?php

function getDetails()
{
    $details = '{
   "m":"json",
   "status":{
      "code":200
   },
   "feed":{
      "feedUrl":"/controllers/background_rss.php",
      "title":"Background Wallpapers",
      "link":"/index.php",
      "author":"Darby Payne",
      "description":"Background wallpapers",
      "type":"rss20",';

    return $details;
}

function getItems($folder)
{
    $images = glob('../' . $folder . "/*");
    $items = '"entries":[';

    $prefix = '';
    foreach($images as $image) {
        $imagePath = $folder . "/" . basename($image);

        $items .= $prefix;
        $items .= '
{
    "title":"Photo",
    "link":"'. $imagePath . '",
    "author":"",
    "publishedDate":"Wed, 01 Apr 2015 15:46:45 -0700",
    "contentSnippet":"",
    "content":"<img src=\"' . $imagePath . '\"><br><br>",
    "categories":[
       "wallpaper"
    ]
 }';
$prefix = ',';
    }

    $items .= ']}}';
    return $items;
}

$folder = 'wallpapers';

if (isset($_GET['folder']) && ctype_alnum($_GET['folder'])) {
    $folder = $_GET['folder'];
}

header("Content-Type: text/javascript; charset=utf-8");
echo getDetails() . getItems($folder);

?>
