/**
 * Poll fitbit's API to get stats on a user
 */

var fitbit = {
    deviceId: config.fitbit.deviceId || 0,
    blacklistedBadgeCategorys: config.fitbit.blacklistedBadgeCategorys || {"Weight Goal":true},
    updateInterval: config.fitbit.interval || 300000, // update every 5 mins
    fadeInterval: config.fitbit.fadeInterval || 4000,
    dailyHeartRateApi:  'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json',
    dailyActivitiesApi: 'https://api.fitbit.com/1/user/-/activities/date/today.json',
    dailySleepApi:      'https://api.fitbit.com/1/user/-/sleep/date/today.json',
    badgesApi:          'https://api.fitbit.com/1/user/-/badges.json',
    devicesApi:         'https://api.fitbit.com/1/user/-/devices.json',
    apiRequestUri:      '/controllers/fitbit_request.php?api_url=',

    badgesApiTtl: 60 * 60, // 1 hour
    devicesApiTtl: 60 * 60, // 1 hour
    dailyHeartRateApiTtl: 10 * 60, // 10 mins
    dailySleepApiTtl: 30 * 60, // 30 mins
    dailyActivitiesApiTtl: 5 * 60, // 5 mins

    intervalId: null
};

fitbit.apiCall = function(apiUrl, callback, ttl) {
    apiUrl = fitbit.apiRequestUri + encodeURI(apiUrl);

    var cacheKey = apiUrl;
    var cacheKeyTimestamp = cacheKey + 'Timestamp';

    var cacheTimestamp = localStorage.getItem(cacheKeyTimestamp);
    var cacheData = localStorage.getItem(cacheKey);

    if (((Date.now()/1000) - ttl) <= cacheTimestamp && cacheData !== null)
    {
        parsedCacheData = jQuery.parseJSON(cacheData);
        callback(parsedCacheData);
    }
    else
    {
        $.ajax({
            url: apiUrl,
            success: function (data)
            {
                localStorage.setItem(cacheKeyTimestamp, (Date.now()/1000));
                localStorage.setItem(cacheKey, JSON.stringify(data));

                callback(data);
            }
        });
    }
}

fitbit.updateBadges = function (data) {
    badgesData = jQuery.parseJSON( data );
    var uniqueWeeklyBadges = {};
    var uniqueLifetimeBadges = {};
    for (i = 0; i < badgesData.badges.length; i++)
    {
        badge = badgesData.badges[i];
        // remove unwanted badge types
        if (!(badge.category in fitbit.blacklistedBadgeCategorys))
        {
            badgeDateTime = new Date(badge.dateTime) / 1000;
            // show only badges from the last week
            if ( badgeDateTime >= ((Date.now()/1000) - (7 * 24 * 60 * 60)))
            {
                // show top badges in a category to avoid duplicates
                if ( uniqueWeeklyBadges[badge.badgeType] === undefined || uniqueWeeklyBadges[badge.badgeType].value < badge.value )
                {
                    uniqueWeeklyBadges[badge.badgeType] = badge;
                }
            }
            // show lifetime badges
            else if (badge.badgeType.startsWith('LIFETIME_'))
            {
                // show top badges in a category to avoid duplicates
                if ( uniqueLifetimeBadges[badge.badgeType] === undefined || uniqueLifetimeBadges[badge.badgeType].value < badge.value )
                {
                    uniqueLifetimeBadges[badge.badgeType] = badge;
                }
            }
        }
    }

    badges = [];

    // add this week's badges
    for (var property in uniqueWeeklyBadges) {
        if (uniqueWeeklyBadges.hasOwnProperty(property)) {
            badges.push(uniqueWeeklyBadges[property].image75px);
        }
    }

    // add lifetime badges
    for (var property in uniqueLifetimeBadges) {
        if (uniqueLifetimeBadges.hasOwnProperty(property)) {
            badges.push(uniqueLifetimeBadges[property].image75px);
        }
    }

    tableHtml = '<table><tr>';
    row = 0;
    column = 0;

    // get number of badges that will fit on a screen
    var width = $(document).width();
    var badgesWidth = Math.round((width/75)/3);

    for(i=0; i < badges.length;)
    {
        tableHtml += '<td><img src="' + badges[i] + '"></td>';

        i++;
        column = (column + 1) % badgesWidth;
        // we've rolled over to the next row
        if ( column == 0 )
        {
            tableHtml += '</tr>';
            row++;
            if ( i < badges.length )
            {
                tableHtml += '<tr>';
            }
        }
        else if ( i >= badges.length )
        {
            tableHtml += '</tr>';
        }
    }

    tableHtml += '</table>';
    $('#fitbit #badges').html(tableHtml);
}

fitbit.updateActivities = function (data) {
    activitiesData = jQuery.parseJSON( data );

    var steps = activitiesData.summary.steps;
    var calories = activitiesData.summary.caloriesOut;
    var activeMins = activitiesData.summary.veryActiveMinutes;

    $('#fitbit #calories').text('  ' + calories + ' kcals');
    $('#fitbit #active').text('  ' + activeMins + ' active mins');
    $('#fitbit #steps').text('  ' + steps + ' steps');
}

fitbit.updateDevice = function (data) {
    deviceData = jQuery.parseJSON( data );
    for (i = 0; i < deviceData.length; i++)
    {
        // if no device id is set, default to the first one
        if ( fitbit.deviceId === 0 )
        {
            fitbit.deviceId = deviceData[i].id;
        }

        if (deviceData[i].id == fitbit.deviceId)
        {
            name = deviceData[0].deviceVersion;
            battery = deviceData[0].battery;

            batteryLevel = $('#fitbit #device');
            if ( battery == 'High' )
            {
                batteryLevel.addClass('fa-battery-three-quarters');
                batteryLevel.removeClass('fa-battery-half');
                batteryLevel.removeClass('fa-battery-quarter');
                batteryLevel.removeClass('fa-battery-empty');
            }
            else if ( battery == 'Medium' )
            {
                batteryLevel.addClass('fa-battery-half');
                batteryLevel.removeClass('fa-battery-three-quarters');
                batteryLevel.removeClass('fa-battery-quarter');
                batteryLevel.removeClass('fa-battery-empty');
            }
            else if ( battery == 'Low' )
            {
                batteryLevel.addClass('fa-battery-quarter');
                batteryLevel.removeClass('fa-battery-three-quarters');
                batteryLevel.removeClass('fa-battery-half');
                batteryLevel.removeClass('fa-battery-empty');
            }
            else if ( battery == 'Empty' )
            {
                batteryLevel.addClass('fa-battery-empty');
                batteryLevel.removeClass('fa-battery-three-quarters');
                batteryLevel.removeClass('fa-battery-half');
                batteryLevel.removeClass('fa-battery-quarter');
            }
            else
            {
                batteryLevel.text(battery);
            }
        }
    }
}

fitbit.updateSleep = function (data) {

    sleepData = jQuery.parseJSON( data );
    totalMinutesAsleep = sleepData.summary.totalMinutesAsleep;

    if (totalMinutesAsleep > 0)
    {
        $('#fitbit #sleep').text( '  ' + (totalMinutesAsleep/60).toFixed(1));
    }
}

fitbit.updateHeartGraph = function (data) {
    heartRateData = jQuery.parseJSON( data );

    //update resting heart rate
    if (heartRateData['activities-heart'].length > 0)
    {
        if ( heartRateData['activities-heart'][0].value.restingHeartRate >= 0 )
        {
            $('#fitbit #heartrate').text( '  ' + heartRateData['activities-heart'][0].value.restingHeartRate);
        }

    }

    if (heartRateData['activities-heart-intraday'].dataset.length > 0)
    {
        var data = [];

        // define dimensions of graph
        var width = $(document).width()/2.5; // width
        var height = 160; // height

        var maxHeartRate = height;
        var minHeartRate = 0;
        for(heartRatePointIndex = 0; heartRatePointIndex < heartRateData['activities-heart-intraday'].dataset.length; heartRatePointIndex++)
        {
            value = heartRateData['activities-heart-intraday'].dataset[heartRatePointIndex];
            if ( value.value != 0 )
            {
                data.push(value.value);
                maxHeartRate= Math.max(value.value, maxHeartRate);
                minHeartRate= Math.min(value.value, minHeartRate);
            }
        }

        // X scale will fit all values from data[] within pixels 0-w
        var x = d3.scale.linear().domain([0, data.length]).range([0, width]);

        // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
        var y = d3.scale.linear().domain([minHeartRate, maxHeartRate]).range([height, 0]);

        // automatically determining max range can work something like this
        // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
        // create a line function that can convert data[] into x and y points
        var line = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d,i) {
                // return the X coordinate where we want to plot this datapoint
                return x(i);
            })
            .y(function(d) {
                // return the Y coordinate where we want to plot this datapoint
                return y(d);
            });

        //clear out old graph
        $("#heartrate_graph").html("");

        // Add an SVG element with the desired dimensions and margin.
        var graph = d3.select("#heartrate_graph").append("svg:svg")
              .attr("width", width)
              .attr("height", height)
              .append("svg:g")
              .attr("transform", "translate(0,0)");

        // create yAxis
        var xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true);
        // Add the x-axis.
        graph.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

        // create left yAxis
        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");

        // Add the y-axis to the left
        graph.append("svg:g")
              .attr("class", "y axis")
              .attr("transform", "translate(-25,0)")
              .call(yAxisLeft);

        // Add the line by appending an svg:path element with the data line we created above
        // do this AFTER the axes above so that the line is above the tick-lines
        graph.append("svg:path").attr("d", line(data));
    }

}

/**
 * Updates the fitbit stats widget
 */
fitbit.updateFitbitStats = function () {
    fitbit.apiCall( fitbit.badgesApi, fitbit.updateBadges, fitbit.badgesApiTtl );
    fitbit.apiCall( fitbit.devicesApi, fitbit.updateDevice, fitbit.devicesApiTtl  );
    fitbit.apiCall( fitbit.dailyHeartRateApi, fitbit.updateHeartGraph, fitbit.dailyHeartRateApiTtl  );
    fitbit.apiCall( fitbit.dailySleepApi, fitbit.updateSleep, fitbit.dailySleepApiTtl  );
    fitbit.apiCall( fitbit.dailyActivitiesApi, fitbit.updateActivities, fitbit.dailyActivitiesApiTtl  );
}

fitbit.init = function () {

    this.updateFitbitStats();

    this.intervalId = setInterval(function () {
        this.updateFitbitStats();
    }.bind(this), this.updateInterval);
}


