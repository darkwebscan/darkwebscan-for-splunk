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

            this.$el.append('<h3>Darkwebscan Email Security</h3>');
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

			function getWarning(item){ return item[0]; }
			function getWarningColor(item){ return item[1]; }

			// Clear div
			this.$el.empty();

			let spf = data.rows[0];
			let dmarc = data.rows[1];
			let dane = data.rows[2];
			let companyId = data.rows[0][7];

			let htmlViz = `
				<div style="display: grid; gap: 15px; grid-template-columns: repeat(2, 1fr); padding: 15px;">
					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div style="display: flex; gap: 10px;">
								<div class="darkwebscan_email_warning_color dwsa-color-${getWarningColor(spf)}"></div>
								<div class="darkwebscan_box_heading">SPF</div>
							</div>
							${getWarning(spf)}<br>
							<a target="_blank" href="./search?q=%7C%20darkwebscanemailsecurity%20companyId%3D${companyId}%20%7C%20table%20warning%2CwarningColor%2Csummary%2Cparts%2CspfRecord%20%7C%20head%201&display.page.search.mode=fast">
								Learn more
							</a>
						</div>
					</div>

					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div style="display: flex; gap: 10px;">
								<div class="darkwebscan_email_warning_color dwsa-color-${getWarningColor(dmarc)}"></div>
								<div class="darkwebscan_box_heading">DMARC</div>
							</div>
							${getWarning(dmarc)}<br>
							<a target="_blank" href="./search?q=%7C%20darkwebscanemailsecurity%20companyId%3D${companyId}%20%7C%20table%20warning%2CwarningColor%2Csummary%2Cparts%2CdmarcRecord%20%7C%20head%202%20%7C%20tail%201&display.page.search.mode=fast">
								Learn more
							</a>
						</div>
					</div>

					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div style="display: flex; gap: 10px;">
								<div class="darkwebscan_email_warning_color dwsa-color-${getWarningColor(dane)}"></div>
								<div class="darkwebscan_box_heading">DANE</div>
							</div>
							${getWarning(dane)}<br>
							<a target="_blank" href="./search?q=%7C%20darkwebscanemailsecurity%20companyId%3D${companyId}%20%7C%20table%20warning%2CwarningColor%2Csummary%2CemailHosts%20%7C%20head%203%20%7C%20tail%201&display.page.search.mode=smart">
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