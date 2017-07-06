// TODO
// Scale values based on height
// Remove hard reference to #value
// Add second background color for second range
// Integrate with knockout.js
// External .css

// https://jqueryboilerplate.com/
// https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/jQuery-boilerplate-and-demo
; (function ($, window, document, undefined) {

    var pluginName = "histogramSlider",
        dataKey = "plugin_" + pluginName;

    var updateHistogram = function (leftHandleValue, rightHandleValue, isLeftSlider, sliderMin, rangePerBin, histogramName) {
        $( "#value" ).html(  "$" + leftHandleValue + " - $" + rightHandleValue );

        // set opacity per bin based on the slider values
        $("#"+ histogramName + " .in-range").each(function (index, bin) {
            maxBinValue = rangePerBin * (index + 1);
            minBinValue = (rangePerBin * index) + sliderMin;

            if (isLeftSlider && maxBinValue < rightHandleValue) {
                // Set opacity based on left (min) slider
                if (leftHandleValue > maxBinValue) {
                    setOpacity(bin, 0);
                } else if (leftHandleValue < minBinValue) {
                    setOpacity(bin, 1);
                } else {
                    setOpacity(bin, 1 - (leftHandleValue - minBinValue) / rangePerBin);
                }
            } else if (!isLeftSlider && minBinValue > leftHandleValue) {
                // Set opacity based on right (max) slider value
                if (rightHandleValue > maxBinValue) {
                    setOpacity(bin, 1);
                } else if (rightHandleValue < minBinValue) {
                    setOpacity(bin, 0);
                } else {
                    setOpacity(bin, (rightHandleValue - minBinValue) / rangePerBin);
                }
            }
        });
    };

    var setOpacity = function(bin, val) {
        $(bin).css("opacity", val);
    };

    var Plugin = function (element, options) {
        this.element = element;

        this.options = {
            sliderMin: 0,
            sliderMax: 1000000,
            leftHandleValue: 150000,
            rightHandleValue: 550000,
            backgroundColorInRange: "#0079BA",
            backgroundColorOutOfRange: "#DBE0E2",
            height: 200
        };

        this.init(options);
    };

    Plugin.prototype = {
        init: function (options) {
            $.extend(this.options, options);

            var self = this,
                histoData = self.options.data,
                bins = new Array(histoData.numberOfBins).fill(0),
                widthPerBin = 100 / histoData.numberOfBins,
                range = self.options.sliderMax - self.options.sliderMin,
                rangePerBin = range / histoData.numberOfBins,
                maxValue = 0,
                heightRatio = 1,
                histogramName = self.element.attr('id') + "-histogram",
                sliderName = self.element.attr('id') + "-slider";

            // iterate through data and increment the correct bin based on items.value
            for (i = 0; i < histoData.items.length; i++) {
                var index = parseInt(histoData.items[i].value / rangePerBin),
                    increment = 1;
                
                if (histoData.items[i].count) {
                    increment = parseInt(histoData.items[i].count);
                }

                bins[index] += increment;
            }

            for (i = 0; i < bins.length; i++) {
                if (bins[i] > maxValue) {
                    maxValue = bins[i];
                }
            }

            if (parseInt(5 * maxValue + 1) > self.options.height) {
                heightRatio = parseInt(5 * maxValue + 1) / self.options.height;
            }

            var wrapHtml = "<div id='" + histogramName + "' style='height:" + self.options.height + "px;'></div>" +
                "<div id='" + sliderName + "'></div>";

            self.element.html(wrapHtml);

            // create histogram based on bins. 10px of height for every item in that bin.
            for (i = 0; i < bins.length; i++) {
                var rh = parseInt(bins[i] * heightRatio),
                    h = parseInt(5 * rh + 1),
                    b = parseInt(self.options.height - h),
                    bb = parseInt(self.options.height - h * 2);

                var binHtml = "<div style='float:left!important;width:" + widthPerBin + "%;'>" +
                    "<div class='bin in-range' style='z-index:1;height:" + h + "px;bottom:-" + b + "px;'></div>" +
                    "<div class='bin out-of-range' style='z-index:0;height:" + h + "px;bottom:-" + bb + "px;'></div>" +
                    "</div>";

                $("#" + histogramName).append(binHtml);
            }

            $("#" + sliderName).slider({
                range: true,
                min: self.options.sliderMin,
                max: self.options.sliderMax,
                values: [self.options.leftHandleValue, self.options.rightHandleValue],
                slide: function (event, ui) {
                    updateHistogram(ui.values[0], ui.values[1], Boolean(ui.handle.nextSibling), self.options.sliderMin, rangePerBin, histogramName);
                }
            });

            updateHistogram(self.options.leftHandleValue, self.options.rightHandleValue, false, self.options.slideMin, rangePerBin, histogramName);
            updateHistogram(self.options.leftHandleValue, self.options.rightHandleValue, true, self.options.sliderMin, rangePerBin, histogramName);
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