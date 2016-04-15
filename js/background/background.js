var background = {
    updateInterval: config.background.interval || 30000,
    backgroundFeed: config.background.backgroundFeed || 'http://aerialwallpapers.tumblr.com/rss',
    useGoogleFeeds: config.background.useGoogleFeeds || false,
    numberOfEntries: config.background.numberOfEntries || 10,
};

background.updateBackgroundJsonFeed = function (data)
{
    var container = $("#bgimg");
    var index = Math.floor((Math.random() * data.feed.entries.length));

    var entry = data.feed.entries[index];
    var match = /.*src="(.*?)".*/.exec(entry.content);
    container.attr('src', match[1]);
    container.css('src', 'background-image', 'url(' + match[1] + ')');
}

/**
 * Updates the background that is shown on the screen
 */
background.updateBackgroundGoogleFeeds = function () {
    var feed = new google.feeds.Feed(background.backgroundFeed);
    feed.setNumEntries( background.numberOfEntries);
    feed.load(function(result) {
      if (!result.error) {
          background.updateBackgroundJsonFeed(result);
      }
    });
}

background.updateBackgroundFeedUrl = function (feedUrl) {
    $.ajax({
        url: feedUrl,
        dataType: 'json',
        success: function (data)
        {
            background.updateBackgroundJsonFeed(data);
        },
        error: function(xhr, status, error) {
            console.log("Status: " + status);
            console.log("Status: " + error);
            console.log("Failed: " + xhr.responseText);
        }
    });
}

background.updateBackground = function () {
    if ( background.useGoogleFeeds )
    {
        background.updateBackgroundGoogleFeeds(background.backgroundFeed);
    }
    else
    {
        background.updateBackgroundFeedUrl(background.backgroundFeed);
    }
}

background.init = function () {
    this.updateBackground();

    this.intervalId = setInterval(function () {
        this.updateBackground();
    }.bind(this), this.updateInterval)
}

