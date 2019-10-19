#!/usr/bin/env python3

import os
import jenkins
import secrets
from requests import Request

JOB_NAME = 'Ansible_Tower_Integration_Test'

def get_results(server, base_url, artifact_path):
    url = base_url + '/artifact/' + artifact_path

    request = Request(method='POST', url=url)
    res = server.jenkins_request(request)
    print("Found reuslts.xml {}".format(res.content))
    pass

server = jenkins.Jenkins(secrets.host, username=secrets.username, password=secrets.api_key)

builds = server.get_job_info(JOB_NAME)['builds']
for b in builds:
    build_number = b['number']
    build_details = server.get_build_info(JOB_NAME, build_number, depth=2)
    for r in build_details['runs']:
        for a in r['artifacts']:
            if a['fileName'] == 'results.xml':
                get_results(server, r['url'], a['relativePath'])
