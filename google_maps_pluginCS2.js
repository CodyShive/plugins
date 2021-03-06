(function () {
    var googleMapWidget = function (settings) {
        var self = this;
        var currentSettings = settings;
        var map;
        var marker;
        var currentPosition = {};

        this.render = function (element) {
            function initializeMap() {
                var mapOptions = {
                    zoom: Number(currentSettings.initZoom),
					center: new google.maps.LatLng(Number.parseFloat(currentSettings.centerLat), Number.parseFloat(currentSettings.centerLng)),					
                    disableDefaultUI: true,
                    draggable: true
                };
                element.style.height = "800px";
                map = new google.maps.Map(element, mapOptions);

                // force a resize event to make sure the window gets drawn correctly
                google.maps.event.addListenerOnce(map, "idle", function () {
                    google.maps.event.trigger(map, "resize");
                });

                google.maps.event.addDomListener(element, 'mouseenter', function (e) {
                    e.cancelBubble = true;
                    if (!map.hover) {
                        map.hover = true;
                        map.setOptions({
                            zoomControl: true
                        });
                    }
                });

                google.maps.event.addDomListener(element, 'mouseleave', function (e) {
                    if (map.hover) {
                        map.setOptions({
                            zoomControl: false
                        });
                        map.hover = false;
                    }
                });
            }

            if (window.google && window.google.maps) {
                initializeMap();
            } else {
                window.gmap_initialize = initializeMap;
                head.js("https://maps.googleapis.com/maps/api/js?key=" + currentSettings.apikey + "&callback=gmap_initialize");
            }
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }
        this.getHeight = function () {
            return Number(currentSettings.height);
        }
        window.__gMapsOpenDashboard = function (storeNumber) {
            var accessVar = {
                source: {
                    name: "monitor-db-source-store-stats",
                    settings: {
                        thing_id: "monitor-db-source-" + storeNumber + "-store-stats"
                    }
                },
                dashboard: Number(currentSettings.dashboard_id)
            }
            window.open('/insights/freeboard/index-dev.html#access=' + btoa(JSON.stringify(accessVar)));
        }
        this.onCalculatedValueChanged = function (settingName, newValue) {
            var obj = newValue;
            var contents = [newValue];
            if (obj["content"] != null) { // certain versions of the dweetpro plugin wrap the response
                obj = obj["content"];
            }
            
                for (var store in obj) {
                    let _store = obj[store];
					if (_store.alertState == false) {
						//Set pin color green for okay.
						//var pinColor = "FE7569"; //problem
						var pinColor = "33ff52"; //green okay
						var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,	
							new google.maps.Size(21, 34),
							new google.maps.Point(0,0),
							new google.maps.Point(10, 34));
						var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
							new google.maps.Size(40, 37),
							new google.maps.Point(0, 0),
							new google.maps.Point(12, 35));
						//Place the marker
						_store.marker = new google.maps.Marker({
                            position: {
                                lat: Number.parseFloat(_store.latitude),
                                lng: Number.parseFloat(_store.longitude)
                            },
                            map: map,
                            title: _store.retailerName + " (#" + _store.storeNumber + "). No alerts.",
							icon: pinImage							
                        });
					};
                    if (_store.alertState == true) {
                        _store.marker = new google.maps.Marker({
                            position: {
                                lat: Number.parseFloat(_store.latitude),
                                lng: Number.parseFloat(_store.longitude)
                            },
                            map: map,
                            title: _store.retailerName + " (#" + _store.storeNumber + ").  Click for Problem Summary."
                        });

						if(_store.storeDashboardAvailable == true) {
							_store.contentString = '<div id="content">' +
								'<div id="siteNotice">' +
								'</div>' +
								'<h1 id="firstHeading" class="firstHeading">Store Alert</h1>' +
								'<div id="bodyContent">' + _store.storeNumber + " - " + _store.retailerName + '<br/><strong>' + _store.problemSummary + '</strong><br/><br/>' +
								'<button onclick="__gMapsOpenDashboard(' + _store.storeNumber + ')">Open Store Dashboard</button>' +
								'</div>';
						}

						if(_store.storeDashboardAvailable == false) {
							_store.contentString = '<div id="content">' +
								'<div id="siteNotice">' +
								'</div>' +
								'<h1 id="firstHeading" class="firstHeading">Store Alert</h1>' +
								'<div id="bodyContent">' + _store.storeNumber + " - " + _store.retailerName + '<br/><strong>' + _store.problemSummary + '</strong><br/><br/>' 
								+	'No Store Dashboard Available.</div>';
						}
						
						
                        _store.infowindow = new google.maps.InfoWindow({
                            content: _store.contentString
                        });

                        _store.marker.addListener('click', function (e) {
                            // build the data source target for the dashboard .. the 
                            _store.infowindow.open(map, _store.marker);
                        });
                    }
                }
            
        }

        this.onDispose = function () {}

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "google_map_ext_CS2",
        display_name: "Google Map CS2",
        fill_size: true,
        settings: [{
                name: "apikey",
                display_name: "Google Maps API Key",
                type: "text"
            },
            {
                name: "locations",
                display_name: "Location source node",
                type: "calculated"
            },
            {
                name: "height",
                display_name: "Vertical blocks consumed",
                type: "number"
            },
            {
                name: "dashboard_thing_template",
                display_name: "Dashboard thing datasource",
                type: "text"
            },
			{
				name: "centerLat",
				display_name: "Center Latitude",
				type: "text"
			},
			{
				name: "centerLng",
				display_name: "Center Longitude",
				type: "text"
			},
			{
				name: "initZoom",
				display_name: "Initial Zoom Level (4-12)",
				type: "text"
			},
            {
                name: "dashboard_id",
                display_name: "Dashboard ID to be invoked from marker",
                type: "number"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new googleMapWidget(settings));
        }
    });

}());
