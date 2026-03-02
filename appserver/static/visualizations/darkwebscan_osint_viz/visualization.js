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

            this.$el.append('<h3>Darkwebscan OSINT</h3>');
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

			let countEmailAddresses = data.rows[0][0];
			let countSubdomains = data.rows[0][1];
			let industry = data.rows[0][2];
			let externalSecurityScore = data.rows[0][3];
			let domain = data.rows[0][4];
			let emailAddressPattern = data.rows[0][5];
			let companyId = data.rows[0][6];

			let htmlViz = `
				<div style="display: grid; gap: 15px; grid-template-columns: repeat(2, 1fr); padding: 15px;">
					<div class="darkwebscan_box" style="min-height: 261px;">
						<div class="darkwebscan_box_content">
							<div class="darkwebscan_box_heading">External Security Score</div>
							<div class="darkwebscan-rating-meter">
								<div class="darkwebscan-rating-needle" style="--score:${externalSecurityScore}">
									<span class="darkwebscan-rating-score">${externalSecurityScore}</span>
								</div>
							</div>
						</div>
					</div>

					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div class="darkwebscan_box_heading">General info</div>
							<table class="table table-chrome table-stripe">
								<tr>
									<td style="font-weight: bold;">Domain</td>
									<td>${domain}</td>
								</tr>
								<tr>
									<td style="font-weight: bold;">Email pattern</td>
									<td>${emailAddressPattern}</td>
								</tr>
								<tr>
									<td style="font-weight: bold;">Industry</td>
									<td>${industry}</td>
								</tr>
							</table>
						</div>
					</div>

					<div class="darkwebscan_box">
						<div class="darkwebscan_box_content">
							<div class="darkwebscan_box_heading">OSINT: Subdomains</div>
							The scan discovered ${countSubdomains} subdomains that can easily be found using OSINT software.
							<br>
							<a target="_blank" href="./search?q=|%20darkwebscanosint%20companyId%3D${companyId}%20|%20mvexpand%20subdomains%20|%20spath input%3Dsubdomains%20|%20table%20subdomain%2Cdescription&display.page.search.mode=smart">
								Learn more
							</a>
						</div>
					</div>

					<div class="darkwebscan_box" style="border-left: 1px solid #999; padding-left: 15px;>
						<div class="darkwebscan_box_content">
							<div class="darkwebscan_box_heading">OSINT: Email addresses</div>
							The scan discovered ${countEmailAddresses} email addresses that can easliy be discovered through web searches.<br>
							<br>
							<a target="_blank" href="./search?q=|%20darkwebscanosint%20companyId%3D${companyId}%20|%20mvexpand%20emailAddresses%20|%20spath%20input%3DemailAddresses%20|%20table%20email&display.page.search.mode=smart">
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