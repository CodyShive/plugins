window.dyngaugeCSID = 0;
(function() {
    var dynamicGaugeWidget = function (settings) {
        var self = this;
		var currentSettings = settings;
        var thisDynGaugeCSID = "dyngaugeCS-" + window.dyngaugeID++;
        var titleElement = $('<h2 class="section-title"></h2>');

        //var gaugeElement = $('<div id="' + thisDynGaugeCSID + '" class="200x160px"></div>');

        var gaugeObject;
        var rendered = false;

        var currentValues = {
            value: 0,
            min_value: 0,
            max_value: 0,
            level_colors: ['#f45b5b', '#f9c802', '#a9d70b', '#55BF3B'],
			w_width: 200,
			w_height: 121,
        };

		var gaugeElement = $('<div id="' + thisDynGaugeCSID + '" style="width:' + currentValues.w_width + 'px; height:' + currentValues.w_height + 'px"></div>');		
		
        function createGauge() {
            if (!rendered) {
                return;
            }

            gaugeElement.empty();

            gaugeObject = new JustGage({
                id: thisDynGaugeCSID,
                value: currentValues.value,
                min: currentValues.min_value,
                max: currentValues.max_value,
                label: currentSettings.units,
                showInnerShadow: false,
                valueFontColor: "#d3d4d4",
                levelColors: currentValues.level_colors,
            });
        }

        this.render = function (element) {
            rendered = true;
            $(element).append(titleElement).append($('<div class="gauge-widget-wrapper"></div>').append(gaugeElement));
            createGauge();
        }

        this.onSettingsChanged = function (newSettings) {
            if (newSettings.units != currentSettings.units) {
                currentSettings = newSettings;
                createGauge();
            }
            else {
                currentSettings = newSettings;
            }

            titleElement.html(newSettings.title);
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            currentValues[settingName] = newValue;
            if (!_.isUndefined(gaugeObject)) {
                if (settingName == 'value') {
                    gaugeObject.refresh(Number(newValue));
                } else {
                    createGauge();
                }
            }
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 3;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "dyngaugeCS",
        display_name: "DynamicGaugeCS",
        "external_scripts" : [
            "/freeboard-ui/plugins/thirdparty/raphael.2.1.0.min.js",
            "/freeboard-ui/plugins/thirdparty/justgage.1.0.1.js"
        ],
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            },
            {
                name: "units",
                display_name: "Units",
                type: "text"
            },
            {
                name: "min_value",
                display_name: "Minimum",
                type: "calculated",
                default_value: 0
            },
            {
                name: "max_value",
                display_name: "Maximum",
                type: "calculated",
                default_value: 100
            },
            {
                name: "level_colors",
                display_name: "Level colors",
                type: "calculated",
                default_value: "return ['#f45b5b', '#f9c802', '#a9d70b', '#55BF3B']"
            },
			{
                name: "w_width",
                display_name: "Widget Width in px (e.g. 200)",
                type: "text",
                default_value: "200"
            },
			{
                name: "w_height",
                display_name: "Widget Height in px (e.g. 120)",
                type: "text",
                default_value: "120"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new dynamicGaugeWidget(settings));
        }
    });

}());
