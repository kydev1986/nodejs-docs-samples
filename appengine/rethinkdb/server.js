// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var Promise = require('bluebird');
var r = require('rethinkdbdash')(require('./config'));

require('./setup')(r);

var koa = require('koa');
var router = require('koa-router')();
var send = require('koa-send');
var app = koa();

app.use(require('koa-bodyparser')());
app.use(router.routes());

router
  .get('/api/polls', function *() {
    this.body = yield r.table('polls').coerceTo('array');
  })
  .post('/api/polls', function *() {
    var result = yield r.table('polls').insert(this.request.body, {
      returnChanges: true
    });
    if (result.inserted === 1) {
      this.body = result.changes[0].new_val;
      this.status = 201;
    } else {
      this.status = 500;
    }
  })
  .get('/api/polls/:id', function *() {
    this.body = yield r.table('polls').get(this.params.id);
  })
  .get('/api/messages', function *() {
    this.body = yield r.table('messages')
      .getAll(this.query.poll_id, { index: 'poll_id' })
      .coerceTo('array');
  })
  .get('/api/votes', function *() {
    this.body = yield r.table('votes')
      .getAll(this.query.poll_id, { index: 'poll_id' })
      .coerceTo('array');
  })
  .get('/*', function *(next) {
    if (yield send(this, this.path, { root: __dirname + '/public' })) {
      return;
    } else {
      yield send(this, './public/index.html');
    }
  })

if (module === require.main) {
  app.listen(process.env.PORT || 3000);
}

module.exports = app;
