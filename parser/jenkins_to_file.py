#!/usr/bin/env python3

import os
import jenkins
import secrets
from requests import Request

JOB_NAME = 'Test_Tower_Integration_Plain'

def get_results(server, build_id, base_url, artifact_path):
    url = base_url + '/artifact/' + artifact_path

    request = Request(method='POST', url=url)
    res = server.jenkins_request(request)
    script_path = os.path.dirname(os.path.abspath( __file__ ))
    with open(os.path.join(script_path, 'sample_data', 'results_{}.xml'.format(build_id)), 'wb+') as f:
        f.write(res.content)

server = jenkins.Jenkins(secrets.host, username=secrets.username, password=secrets.api_key)

builds = server.get_job_info(JOB_NAME)['builds']
for b in builds:
    build_number = b['number']
    build_details = server.get_build_info(JOB_NAME, build_number, depth=2)

    '''
    Structure for build matrix
    '''
    #for r in build_details['runs']:
    for a in build_details['artifacts']:
        if a['fileName'] == 'results.xml':
            get_results(server, build_details['id'], build_details['url'], a['relativePath'])
