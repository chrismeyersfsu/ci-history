#!/usr/bin/env python3

import json
import os
import io
import uuid
import datetime

from flask import (
  Flask,
  escape,
  request,
  jsonify,
  send_from_directory,
)
import pymongo
from flask.json import JSONEncoder
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
from bson.raw_bson import RawBSONDocument

from junitparser import JUnitXml, Element, TestCase, Attr
from junitparser.junitparser import Skipped, Failure, Error
from typing import List, Set, Dict, Tuple, Optional
from bson.objectid import ObjectId

# parse junit xml from str instead of file
try:
    from lxml import etree
except ImportError:
    from xml.etree import ElementTree as etree


class CustomJSONEncoder(JSONEncoder):
    def default(self, obj): return json_util.default(obj)

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://admin:password@mongo:27017/"
app.json_encoder = CustomJSONEncoder
mongo = PyMongo(app)

def wrap_results(data):
    d = list(data)
    c = len(d)
    ret = {
        'count': c,
        'results': d,
    }
    return ret

@app.route('/')
def root():
    return send_from_directory(os.path.join('../../ui/dist/'), 'index.html')

@app.route('/style.css')
def style():
    return send_from_directory(os.path.join('../../ui/dist/'), 'style.css')

@app.route('/main.js')
def webpack():
    return send_from_directory(os.path.join('../../ui/dist/'), 'main.js')

@app.route('/api/v1/runs/', methods=['GET'])
def runs():
    runs = mongo.cx['cihistory']['runs'].find({})
    return wrap_results(runs)

@app.route('/api/v1/cases/', methods=['GET'])
def cases():
    run = ObjectId(request.args.get('run'))
    return wrap_results(mongo.cx['cihistory']['cases'].find({ 'run_ref': run }))

@app.route('/api/v1/runs/import/', methods=['POST'])
def import_results():

    payload = request.get_json()
    # TODO: Verify data exists
    xml = JUnitXml.fromfile(io.StringIO(payload['data']))
    ts = datetime.datetime.utcnow()

    run_dict = {
        'time_created': ts,
        'suites': None,
    }

    class TestCaseBase(TestCase):
        file = Attr()
        line = Attr()

    def build_dict_out_of_properties(suite: Element, properties: List[str]):
        return {p: getattr(suite, p, None) for p in properties}

    suite = xml
    suite_dict = build_dict_out_of_properties(suite, ['name', 'skipped', 'time', 'failures', 'tests'])

    # TODO: results.xml may contain multiple suites; but not our sample set
    suite_dict['uuid'] = str(uuid.uuid4())
    run_dict['suites'] = [suite_dict]
    run_record = mongo.cx['cihistory']['runs'].insert_one(run_dict)

    test_cases = []
    for case in suite:
        case = TestCaseBase.fromelem(case)
        case_dict = build_dict_out_of_properties(case, ['classname', 'file', 'line', 'name', 'time', 'system_err', 'system_out'])
        if type(case.result) is Skipped:
            case_dict['result'] = 'skipped'
            case_dict['skipped_message'] = case.result.message
        elif type(case.result) is Failure:
            case_dict['result'] = 'failure'
            case_dict['failure_message'] = case.result.message
        elif type(case.result) is Error:
            case_dict['result'] = 'error'
            case_dict['failure_message'] = case.result.message
        else:
            case_dict['result'] = 'unknown'

        case_dict['time_created'] = ts
        case_dict['testsuite'] = suite_dict['uuid']
        case_dict['run_ref'] = run_record.inserted_id
        test_cases.append(case_dict)

    mongo.cx['cihistory']['cases'].insert_many(test_cases)
    return {}

