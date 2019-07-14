#!/usr/bin/env python

from junitparser import JUnitXml, Element, TestCase, Attr
from junitparser.junitparser import Skipped, Failure, Error
from typing import List, Set, Dict, Tuple, Optional
import pymongo
import datetime

client = pymongo.MongoClient("mongodb://admin:password@mongo:27017/")

db = client["cihistory"]

xml = JUnitXml.fromfile('sample_data/results.xml')


class TestCaseBase(TestCase):
    file = Attr()
    line = Attr()

def build_dict_out_of_properties(suite: Element, properties: List[str]):
    return {p: getattr(suite, p) for p in properties}

for suite in xml:
    suite_dict = build_dict_out_of_properties(suite, ['name', 'skipped', 'time', 'failures', 'tests'])
    suite_dict['time_ingested'] = datetime.datetime.utcnow()
    suite_record = db.suite.insert_one(suite_dict)

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

        case_dict['time_ingested'] = suite_dict['time_ingested']
        case_dict['testsuite_ref'] = suite_record.inserted_id
        test_cases.append(case_dict)

    db.case.insert_many(test_cases)
