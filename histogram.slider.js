; (function ($, window, document, undefined) {
    var pluginName = "histogramSlider",
        dataKey = "plugin_" + pluginName;

    var updateHistogram = function (selectedRange, leftSliderChanged, sliderMin, rangePerBin, histogramName, sliderName) {
        var leftValue = selectedRange[0],
            rightValue = selectedRange[1];

        $("#" + sliderName + "-value").html(leftValue + " - " + rightValue);

        // set opacity per bin based on the slider values
        $("#"+ histogramName + " .in-range").each(function (index, bin) {
            maxBinValue = rangePerBin * (index + 1);
            minBinValue = (rangePerBin * index) + sliderMin;

            if (leftSliderChanged && maxBinValue < rightValue) {
                // Set opacity based on left (min) slider
                if (leftValue > maxBinValue) {
                    setOpacity(bin, 0);
                } else if (leftValue < minBinValue) {
                    setOpacity(bin, 1);
                } else {
                    //setOpacity(bin, 1);
                    setOpacity(bin, 1 - (leftValue - minBinValue) / rangePerBin);
                }
            } else if (!leftSliderChanged && minBinValue > leftValue) {
                // Set opacity based on right (max) slider value
                if (rightValue > maxBinValue) {
                    setOpacity(bin, 1);
                } else if (rightValue < minBinValue) {
                    setOpacity(bin, 0);
                } else {
                    //setOpacity(bin, 1);
                    setOpacity(bin, (rightValue - minBinValue) / rangePerBin);
                }
            }
        });
    };

    var setOpacity = function(bin, val) {
        $(bin).css("opacity", val);
    };

    var calculateHeightRatio = function(bins, height) {
        var heightRatio = 1, maxValue = 0;

        for (i = 0; i < bins.length; i++) {
            if (bins[i] > maxValue) {
                maxValue = bins[i];
            }
        }

        if (parseInt(5 * maxValue + 1) > height) {
            heightRatio = (height) / (5 * maxValue + 1);
        }

        return heightRatio;
    }

    var Plugin = function (element, options) {
        this.element = element;

        this.options = {
            sliderRange: [0, 1000000], // Min and Max slider values
            optimalRange: [0, 0], // Optimal range to select within
            selectedRange: [0, 0], // Min and Max slider values selected
            height: 200,
            numberOfBins: 40,
            showTooltips: false,
            showSelectedRange: false
        };

        this.init(options);
    };

    Plugin.prototype = {
        init: function (options) {
            $.extend(this.options, options);

            var self = this,
                dataItems = self.options.data.items,
                bins = new Array(this.options.numberOfBins).fill(0),
                range = self.options.sliderRange[1] - self.options.sliderRange[0],
                rangePerBin = range / this.options.numberOfBins;;

            // iterate through data and increment the correct bin based on items.value
            for (i = 0; i < dataItems.length; i++) {
                var index = parseInt(dataItems[i].value / rangePerBin),
                    increment = 1;

                if (dataItems[i].count) {
                    // Handle grouped data structure
                    increment = parseInt(dataItems[i].count);
                }

                bins[index] += increment;
            }

            var histogramName = self.element.attr('id') + "-histogram",
                sliderName = self.element.attr('id') + "-slider";

            var wrapHtml = "<div id='" + histogramName + "' style='height:" + self.options.height + "px; overflow: hidden;'></div>" +
                "<div id='" + sliderName + "'></div>";

            self.element.html(wrapHtml);

            var heightRatio = calculateHeightRatio(bins, self.options.height),
                widthPerBin = 100 / this.options.numberOfBins;

            // create histogram based on bins. 5px of height for every item in that bin.
            for (i = 0; i < bins.length; i++) {
                var rh = parseInt(bins[i] * heightRatio),   // set the relative height
                    h = parseInt(5 * rh + 1),               // set the actual height using the relative height
                    b = parseInt(self.options.height - h),  // set the bottom offset for the in-range bin
                    bb = -parseInt(self.options.height - h * 2),  // set the bottom offset for the out-of-range bin
                    minBinValue = (rangePerBin * i) + this.options.sliderRange[0],
                    maxBinValue = rangePerBin * (i + 1) - 1,
                    inRangeStyling = ((self.options.optimalRange[1] > minBinValue) ? "bin-color-optimal-selected" : "bin-color-selected"),
                    outRangeStyling = ((self.options.optimalRange[1] > minBinValue) ? "bin-color-optimal" : "bin-color");

                var toolTipHtml = self.options.showTooltips ? "<span class='tooltiptext'>" + minBinValue + " - " + maxBinValue + "</br>count: " + bins[i] + "</span>" : "";

                var binHtml = "<div class='tooltip' style='float:left!important;width:" + widthPerBin + "%;'>" +
                    toolTipHtml +
                    "<div class='bin in-range " + inRangeStyling + "' style='height:" + h + "px;bottom:-" + b + "px;position: relative;'></div>" +
                    "<div class='bin out-of-range " + outRangeStyling + "' style='height:" + h + "px;bottom:" + bb + "px;position: relative;'></div>" +
                    "</div>";

                $("#" + histogramName).append(binHtml);
            }

            $("#" + sliderName).slider({
                range: true,
                min: self.options.sliderRange[0],
                max: self.options.sliderRange[1],
                values: self.options.selectedRange,
                slide: function (event, ui) {
                    updateHistogram(ui.values, Boolean(ui.handle.nextSibling), self.options.sliderRange[0], rangePerBin, histogramName, sliderName);
                }
            });

            if (self.options.showSelectedRange){
                $("#" + sliderName).after("<p id='" + sliderName + "-value' class='selected-range'></p>");
            }

            updateHistogram(self.options.selectedRange, false, self.options.sliderRange[0], rangePerBin, histogramName, sliderName);
            updateHistogram(self.options.selectedRange, true, self.options.sliderRange[0], rangePerBin, histogramName, sliderName);
        }
    };

    $.fn[pluginName] = function (options) {
        var plugin = this.data(dataKey);

        if (plugin instanceof Plugin) {
            if (typeof options !== 'undefined') {
                plugin.init(options);
            }
        } else {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };

}(jQuery, window, document));
