#!/usr/bin/env python3
#
#   Copyright 2026 Bechtle GmbH IT-Systemhaus Rheinland
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

import json
from typing import Any, Dict

def get_headers(service) -> Dict[str, Any]:
    # Fetch credentials from app's realm
    creds = service.storage_passwords.list()
    dwsa_creds = None

    for cred in creds:
        if cred.content.get("realm") == "darkwebscan_app_realm":
            dwsa_creds = cred
            headers = dwsa_creds.content['clear_password']
            break
        else:
            raise Exception("No API key configured. Please run app setup.")
    
    if not headers:
        raise Exception("API Key not configured")
    
    jsonHeaders = json.loads(headers)
    return jsonHeaders
