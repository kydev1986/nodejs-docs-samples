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
var config = require('./config');

module.exports = Promise.coroutine(function*(r) {
  try {
    var result = yield r.branch(
      r.dbList().contains(config.db),
      null,
      r.dbCreate(config.db)
    );
    if (result && result.dbs_created !== 1) {
      throw new Error('failed to create "' + config.db + '" database');
    }
    yield Promise.all([
      'polls',
      'votes',
      'messages'
    ].map(function (table) {
      return r.branch(
        r.db(config.db).tableList().contains(table),
        null,
        r.db(config.db).tableCreate(table)
      );
    }));
    yield Promise.all([
      ['votes', 'poll_id'],
      ['messages', 'poll_id']
    ].map(function (tableIndex) {
      return r.branch(
        r.db(config.db)
          .table(tableIndex[0])
          .indexList()
          .contains(tableIndex[1]),
        null,
        r.db(config.db)
          .table(tableIndex[0])
          .indexCreate(tableIndex[1])
      );
    }));
  } catch (err) {
    console.error(err);
  }
});
