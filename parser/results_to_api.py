#!/usr/bin/env python3

import requests
import os


script_path = os.path.dirname(os.path.abspath( __file__ ))
files = os.listdir(os.path.join(script_path, 'sample_data'))

for f in files:
    if not f.startswith('results_'):
        continue
    print("File {}".format(f))

    with open(os.path.join(script_path, 'sample_data', f), 'r') as f:
        results = f.read()

        d = {
            'data': results,
        }

        res = requests.post('http://localhost:3000/api/v1/runs/import/', json=d)
        print(res.status_code)
