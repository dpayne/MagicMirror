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
  if (lastfm.coverPrevious != cover) {
    lastfm.coverPrevious = cover;

    if (cover) {
      $('#lastfm #cover').attr('src', cover);
      $('#lastfm #cover').show();
    } else {
      $('#lastfm #cover').hide();
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
    }
  } else {
    delete lastfm.cover.src;
    lastfm.updateCover();
  }

  $('#lastfm #title').text(title || '');
  $('#lastfm #artist').text(artist || '');
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
          musicPlaying = true;

          var cover = track.image[track.image.length - 1]['#text'];
          var title = track.name;
          var artist = track.artist['#text'];
          var link = track.url;

          lastfm.updateLastfmMetadata(cover, title, artist, link);
        }
      }
    }

    if (!playing) {
      musicPlaying = false;
      lastfm.updateLastfmMetadata();
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

