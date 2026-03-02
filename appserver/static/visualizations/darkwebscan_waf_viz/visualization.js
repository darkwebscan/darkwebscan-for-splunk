/*
 * Visualization source
 */
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            vizUtils
        ) {
  
    return SplunkVisualizationBase.extend({
  
        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.$el = $(this.el);

            this.$el.append('<h3>Darkwebscan WAF Detection</h3>');
            this.$el.append('<p>Initializing...</p>');
        },

		
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {
			// Check for an empty data object
			if(data.rows.length < 1){
				return false;
			}

            return data;
        },
  
		//  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(data, config) {
			if(!data){ return }

			// Clear div
			this.$el.empty();

			let wafWarning = data.rows[0][0];
			let wafWarningColor = data.rows[0][1];
			let wafSummary = data.rows[0][2];
			let companyId = data.rows[0][4];

			if(wafSummary !== "Unknown"){ wafWarning = wafSummary; }

			let htmlViz = `
				<div style="padding: 15px;">
					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div style="display: flex; gap: 10px;">
								<div class="darkwebscan_waf_warning_color dwsa-color-${wafWarningColor}"></div>
								<div class="darkwebscan_box_heading">WAF (Web Application Firewall)</div>
							</div>
							${wafWarning}<br>
							<a target="_blank" href="./search?q=%7C%20darkwebscanwaf%20companyId%3D${companyId}%20%7C%20table%20warning%2CwarningColor%2Csummary%2Cproduct&display.page.search.mode=fast">
								Learn more
							</a>
						</div>
					</div>
				</div>
				`;

			this.$el.append(htmlViz);
        },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        // Override to respond to re-sizing events
        reflow: function() {}
    });
});