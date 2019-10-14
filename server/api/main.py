#!/usr/bin/env python3

from flask import (
  Flask,
  escape,
  request,
  jsonify,
  send_from_directory,
)
import json
import os
from flask_pymongo import PyMongo
from bson import json_util, ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://admin:password@mongo:27017/"
mongo = PyMongo(app)

def wrap_results(data):
    transform = json.loads(json_util.dumps({
        'results': list(data)
    }))
    transform['count'] = len(transform['results'])
    return transform

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
