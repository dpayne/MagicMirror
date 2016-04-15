/**
 *
 * Much of this code was taken from https://github.com/JasonPuglisi/lastfm-now
 *
 */
var lastfm = {
    updateInterval: config.lastfm.interval || 30000,
    fadeInterval: config.lastfm.fadeInterval || 4000,
    intervalId: null,
    tracksApi: 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=%USER%&api_key=%KEY%&limit=1&format=json',
    blankImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    coverPrevious: '',
    coverRefresh: false,
    cover: new Image()
};

lastfm.updateCover = function (cover) {
  if (cover && lastfm.coverPrevious != cover) {
    lastfm.coverPrevious = cover;

    if (cover) {
      $('#lastfm #cover').attr('src', cover);
    }
  }
}

lastfm.updateLastfmMetadata = function (cover, title, artist, link) {
  if (cover) {
    if (lastfm.cover.src.substring(lastfm.cover.length) !== cover ||
        lastfm.coverRefresh) {
      lastfm.coverRefresh = false;
      lastfm.cover.src = cover;
      lastfm.updateCover(cover);

      var width = $(document).width();

      $('#lastfm #title').width(width/3).text(title || '');
      $('#lastfm #artist').width(width/3).text(artist || '');
    }
  }
}

lastfm.updateLastfm = function (url) {
  $.get(url, function(data) {
    var playing;
    if (data) {
      var tracks = data.recenttracks;
      if (tracks) {
        var track = tracks.track[0];

        playing = track['@attr'] && track['@attr'].nowplaying;
        if (playing) {
          var cover = track.image[track.image.length - 1]['#text'];
          var title = track.name;
          var artist = track.artist['#text'];
          var link = track.url;

          lastfm.updateLastfmMetadata(cover, title, artist, link);
        }
        // if no current song playing fallback to last played
        else
        {
            //TODO: fallback to mpc/mpd or some other service like libre.fm
          var cover = track.image[track.image.length - 1]['#text'];
          var title = track.name;
          var artist = track.artist['#text'];
          var link = track.url;

          lastfm.updateLastfmMetadata(cover, title, artist, link);
        }
      }
    }
  });
}

/**
 * Updates the last fm now playing widget
 */
lastfm.updateNowPlaying = function (url) {
    lastfm.updateCover(lastfm.cover.src);
    lastfm.updateLastfm(url);
}

lastfm.init = function () {

    var nowPlayingApi = lastfm.tracksApi.replace('%USER%', config.lastfm.user).replace('%KEY%', config.lastfm.apiKey);

    this.updateNowPlaying(nowPlayingApi);

    this.intervalId = setInterval(function () {
        this.updateNowPlaying(nowPlayingApi);
    }.bind(this), this.updateInterval)
}

