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

angular.module('app', ['ngRoute'])
  .config(function ($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    $routeProvider
      .when('/', {
        templateUrl: 'home.html'
      })
      .when('/polls', {
        templateUrl: 'polls.html',
        controller: 'PollsCtrl',
        controllerAs: 'PollsCtrl',
        resolve: {
          polls: function ($http) {
            return $http.get('/api/polls').then(function (response) {
              return response.data;
            });
          }
        }
      })
      .when('/new', {
        templateUrl: 'new.html',
        controller: 'NewCtrl',
        controllerAs: 'NewCtrl',
        resolve: {
          poll: function () {
            return {
              name: '',
              choices: []
            };
          }
        }
      })
      .when('/polls/:id', {
        templateUrl: 'poll.html',
        controller: 'PollCtrl',
        controllerAs: 'PollCtrl',
        resolve: {
          poll: function ($route, $http) {
            return $http.get('/api/polls/' + $route.current.params.id).then(function (response) {
              return response.data
            });
          }
        }
      });
  })
  .controller('PollsCtrl', function ($route) {
    this.polls = $route.current.locals.polls;
  })
  .controller('PollCtrl', function ($route) {
    this.poll = $route.current.locals.poll;
    this.vote = function (vote) {
      $http.post('/api/votes', {
        poll_id: vote.poll_id,
        choice: vote.choice
      });
    };
  })
  .controller('NewCtrl', function ($route, $http) {
    this.poll = $route.current.locals.poll;
    this.newChoice = '';
    this.create = function () {
      $http.post('/api/polls', this.poll);
    };
    this.addChoice = function () {
      if (this.newChoice && this.poll.choices.indexOf(this.newChoice) === -1) {
        this.poll.choices.push(this.newChoice);
      }
      this.newChoice = '';
    };
    this.onEnter = function ($event) {
      if ($event && $event.charCode === 13) {
        this.addChoice();
        $event.preventDefault();
        $event.stopPropagation();
      }
    };
  })
  .run(function ($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function () {
      $rootScope.path = $location.path();
      $rootScope.loading = false;
    });
  })