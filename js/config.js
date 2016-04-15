var config = {
    lang: 'en',
    background: {
        interval: 300000,
        backgroundFeed: 'http://aerialwallpapers.tumblr.com/rss',
        useGoogleFeeds: false,
        numberOfEntries: 10,
    },
    fitbit: {
        deviceId: 45130172,
        interval: 300000,
        fadeInterval: 4000,
    },
    lastfm: {
        apiKey: 'YOUR_LAST_FM_API_KEY',
        user: 'YOUR_LAST_FM_USERNAME',
        interval: 3000,
        fadeInterval: 4000,
    },
    time: {
        timeFormat: 12,
        displaySeconds: true,
        digitFade: false,
    },
    weather: {
        interval: 60000,
        //change weather params here:
        //units: metric or imperial
        params: {
            id: 'YOUR_WEATHER_STATION_ID',
            units: 'imperial',
            // if you want a different lang for the weather that what is set above, change it here
            lang: 'en',
            APPID: 'YOUR_WEATHER_API_KEY'
        }
    },
    compliments: {
        interval: 30000,
        fadeInterval: 4000,
        morning: [
            'Good morning, handsome!',
            'Enjoy your day!',
            'How was your sleep?'
        ],
        afternoon: [
            'Hello, world!',
            'You look sexy!',
            'Looking good today!'
        ],
        evening: [
            'Wow, you look hot!',
            'You look nice!',
            'Hi, sexy!'
        ]
    },
    calendar: {
        maximumEntries: 10, // Total Maximum Entries
		displaySymbol: true,
		defaultSymbol: 'calendar', // Fontawsome Symbol see http://fontawesome.io/cheatsheet/
        urls: [
		{
			symbol: 'calendar-plus-o',
			url: 'https://calendar.google.com/calendar/ical/YOUR_GOOGLE_CALENDAR_ACCOUNT%40gmail.com/private-PRIVATE_CALENDAR/basic.ics'
		},
		{
			symbol: 'calendar-o',
			url: 'https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics',
		},
		]
    },
    news: {
        feed: 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml'
    }
}
