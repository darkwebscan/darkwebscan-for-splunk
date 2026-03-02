"use strict";

const appName = "darkwebscan_app";
const appNamespace = {
    owner: "nobody",
    app: appName,
    sharing: "app",
};
const pwRealm = "darkwebscan_app_realm";
const dwsaheadersName = "dwsaheaders";

// Splunk Web Framework Provided files
require([
    "jquery", "splunkjs/splunk",
], function($, splunkjs) {
    console.log("setup_page.js require(...) called");

    document.querySelector('#additional_headers_input').placeholder = 
        "header:value\notherHeader:otherValue\nOne header per line";

    checkExistingSetup();

    // Register .on( "click", handler ) for "Complete Setup" button
    $("#setup_button").click(completeSetup);

    async function checkExistingSetup() {
        // Initialize a Splunk Javascript SDK Service instance
        const http = new splunkjs.SplunkWebHttp();
        const service = new splunkjs.Service(
            http,
            appNamespace,
        );

        // Get app.conf configuration
        let stage = 'Retrieving configurations SDK collection';
        const configCollection = service.configurations(appNamespace);
        await configCollection.fetch();
        stage = `Retrieving app.conf values for ${appName}`;
        const appConfig = configCollection.item('app');
        await appConfig.fetch();
        stage = `Retrieving app.conf [install] stanza values for ${appName}`;
        const installStanza = appConfig.item('install');
        await installStanza.fetch();

        // Verify that app is not already configured
        const isConfigured = installStanza.properties().is_configured;
        if (isTrue(isConfigured)) {
            console.warn(`App is configured already (is_configured=${isConfigured})`);
            document.querySelector('.dwsa_already_configured_warning').style.display = "block";
        }
    }

    // onclick function for "Complete Setup" button from setup_page_dashboard.xml
    async function completeSetup() {
        console.log("setup_page.js completeSetup called");
        const newApiKey = $('#apikey_input').val();
        const newAdditionalHeaders = $('#additional_headers_input').val();
        let stage = 'Initializing the Splunk SDK for Javascript';
        try {
            // Initialize a Splunk Javascript SDK Service instance
            const http = new splunkjs.SplunkWebHttp();
            const service = new splunkjs.Service(
                http,
                appNamespace,
            );

            // Get app.conf configuration
            let stage = 'Retrieving configurations SDK collection';
            const configCollection = service.configurations(appNamespace);
            await configCollection.fetch();
            stage = `Retrieving app.conf values for ${appName}`;
            const appConfig = configCollection.item('app');
            await appConfig.fetch();
            stage = `Retrieving app.conf [install] stanza values for ${appName}`;
            const installStanza = appConfig.item('install');
            await installStanza.fetch();
            
            // The storage passwords key = <realm>:<name>:
            stage = 'Retrieving storagePasswords SDK collection';
            const passwords = service.storagePasswords(appNamespace);
            await passwords.fetch();

            const dwsaheadersKey = `${pwRealm}:${dwsaheadersName}:`;
            stage = `Checking for existing dwsaheaders for realm and password name = ${dwsaheadersKey}`;
            const existingHeaders = passwords.item(dwsaheadersKey);
            await existingHeaders;

            
            // Check if additional headers are valid
            const lines = newAdditionalHeaders.split(/\r?\n/);
            const headers = {};
            let isValid = true;
            // Only parse if textarea is not empty
            const hasContent = lines.some(line => line.trim() !== "");
            if(hasContent){
                lines.forEach((line, index) => {
                    line = line.trim();
                    if (!line) return; //skip empty lines

                    const parts = line.split(":");
                    if (parts.length !== 2){
                        alert(`Invalid format on additional headers line ${index + 1}`);
                        isValid = false;
                        return;
                    }

                    const key = parts[0].trim();
                    const value = parts[1].trim();

                    if (!key || !value){
                        alert(`Empty key or value on additional headers line ${index + 1}`);
                        isValid = false;
                        return;
                    }

                    headers[key] = value;
                });

                if (!isValid) return;
            }

            // Always add apiKey
            headers.apiKey = newApiKey;
            const jsonHeaders = JSON.stringify(headers);



            function passwordCallback(err, resp) {
                if (err) throw err;
                stage = 'Setting app.conf [install] is_configured = 1'
                setIsConfigured(installStanza, 1);
                stage = `Reloading app ${appName} to register is_configured = 1 change`
                reloadApp(service);
                $('.success').show();
                stage = 'Redirecting to app home page'
                redirectToApp();
            }

            if (!existingHeaders) {
                // Secret doesn't exist, create new one
                console.log("Saving headers...");
                stage = `Creating a new password for realm = ${pwRealm} and password name = ${dwsaheadersName}`;
                passwords.create(
                    {
                        name: dwsaheadersName,
                        password: jsonHeaders,
                        realm: pwRealm,
                    }, passwordCallback);
            } else {
                // Secret exists, update to new value
                stage = `Updating existing password for realm = ${pwRealm} and password name = ${dwsaheadersName}`;
                console.log(`Updating headers to ${jsonHeaders}`);
                existingHeaders.update(
                    {
                        password: jsonHeaders,
                    }, passwordCallback);
            }

            
        } catch (e) {
            console.warn(e);
            $('.error').show();
            $('#error_details').show();
            let errText = `Error encountered during stage: ${stage}<br>`;
            errText += (e.toString() === '[object Object]') ? '' : e.toString();
            if (e.hasOwnProperty('status')) errText += `<br>[${e.status}] `;
            if (e.hasOwnProperty('responseText')) errText += e.responseText;
            $('#error_details').html(errText);
        }
    }

    async function setIsConfigured(installStanza, val) {
        await installStanza.update({
            is_configured: val
        });
    }

    async function reloadApp(service) {
        // In order for the app to register that it has been configured
        // it first needs to be reloaded
        var apps = service.apps();
        await apps.fetch();

        var app = apps.item(appName);
        await app.fetch();
        await app.reload();
    }

    function redirectToApp(waitMs) {
        setTimeout(() => {
            window.location.href = `/app/${appName}`;
        }, 800); // wait 800ms and redirect
    }

    function isTrue(v) {
        if (typeof(v) === typeof(true)) return v;
        if (typeof(v) === typeof(1)) return v!==0;
        if (typeof(v) === typeof('true')) {
            if (v.toLowerCase() === 'true') return true;
            if (v === 't') return true;
            if (v === '1') return true;
        }
        return false;
    }
});