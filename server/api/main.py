#!/usr/bin/env python3

import json
import os

from flask import (
  Flask,
  escape,
  request,
  jsonify,
  send_from_directory,
)
from flask.json import JSONEncoder
from flask_pymongo import PyMongo
from bson import json_util, ObjectId
from bson.raw_bson import RawBSONDocument

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

@app.route('/api/v1/cases/')
def cases():
    return wrap_results(mongo.cx['cihistory']['cases'].find({}))
