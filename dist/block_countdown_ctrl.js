'use strict';

System.register(['app/plugins/sdk', 'lodash'], function (_export, _context) {
  "use strict";

  var PanelCtrl, _, _createClass, panelDefaults, CountdownTracker, BlockCountdownCtrl;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        bgColor: null,
        launchTimestamp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        blockLength: 512,
        fontSize: '40px',
        showLabels: false
      };

      _export('CountdownTracker', CountdownTracker = function () {
        function CountdownTracker(label, value) {
          _classCallCheck(this, CountdownTracker);

          var el = document.createElement('span');

          el.className = 'flip-clock__piece';
          el.innerHTML = '<b class="flip-clock__card card"><b class="card__top"></b><b class="card__bottom"></b><b class="card__back"><b class="card__bottom"></b></b></b>';
          if (label) {
            el.innerHTML += '<span class="flip-clock__slot">' + label + '</span>';
          }

          this.el = el;

          this.top = el.querySelector('.card__top');
          this.bottom = el.querySelector('.card__bottom');
          this.back = el.querySelector('.card__back');
          this.backBottom = el.querySelector('.card__back .card__bottom');

          this.update(value);
        }

        _createClass(CountdownTracker, [{
          key: 'update',
          value: function update(value) {
            var val = ('0' + value).slice(-2);
            if (val !== this.currentValue) {
              if (this.currentValue >= 0) {
                this.back.setAttribute('data-value', this.currentValue);
                this.bottom.setAttribute('data-value', this.currentValue);
              }
              this.currentValue = val;
              this.top.innerText = this.currentValue;
              this.backBottom.setAttribute('data-value', this.currentValue);

              this.el.classList.remove('flip');
              void this.el.offsetWidth;
              this.el.classList.add('flip');
            }
          }
        }]);

        return CountdownTracker;
      }());

      _export('CountdownTracker', CountdownTracker);

      _export('BlockCountdownCtrl', BlockCountdownCtrl = function (_PanelCtrl) {
        _inherits(BlockCountdownCtrl, _PanelCtrl);

        function BlockCountdownCtrl($scope, $injector) {
          _classCallCheck(this, BlockCountdownCtrl);

          var _this = _possibleConstructorReturn(this, (BlockCountdownCtrl.__proto__ || Object.getPrototypeOf(BlockCountdownCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));
          return _this;
        }

        _createClass(BlockCountdownCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/block-countdown-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'getTimeRemaining',
          value: function getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());

            var ret = {};

            var days = Math.floor(t / (1000 * 60 * 60 * 24));
            var hours = Math.floor(t / (1000 * 60 * 60) % 24);
            var minutes = Math.floor(t / 1000 / 60 % 60);
            var seconds = Math.floor(t / 1000 % 60);

            ret.Total = t;
            if (days || this.panel.blockLength >= 60 * 60 * 24) {
              ret.Days = days;
            }
            if (hours || this.panel.blockLength >= 60 * 60) {
              ret.Hours = hours;
            }
            if (minutes || this.panel.blockLength >= 60) {
              ret.Minutes = minutes;
            }
            ret.Seconds = seconds;

            return ret;
          }
        }, {
          key: 'getEndDate',
          value: function getEndDate() {
            var now = Math.floor(Date.now() / 1000);
            var countdown = this.panel.launchTimestamp;

            if (now >= this.panel.launchTimestamp) {
              countdown = Math.ceil(now / this.panel.blockLength) * this.panel.blockLength;
            }

            return new Date(countdown * 1000);
          }
        }, {
          key: 'renderClock',
          value: function renderClock() {
            this.trackers = {};
            var t = this.getTimeRemaining(this.getEndDate());

            this.el.empty();
            for (var key in t) {
              if (key === 'Total') {
                continue;
              }
              var label = this.panel.showLabels ? key : null;
              this.trackers[key] = new CountdownTracker(label, t[key]);
              this.el.append(this.trackers[key].el);
            }

            this.updateClock();
          }
        }, {
          key: 'updateClock',
          value: function updateClock() {
            var t = this.getTimeRemaining(this.getEndDate());
            for (var key in this.trackers) {
              if (t[key] != null) {
                this.trackers[key].update(t[key]);
              }
            }

            this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 500);
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            var _this2 = this;

            this.initStyles();
            this.el = elem.find('.flip-clock');
            this.events.on('render', function () {
              _this2.renderClock();
            });
          }
        }, {
          key: 'initStyles',
          value: function initStyles() {
            window.System.import(this.panelPath + 'css/panel.base.css!');
            if (grafanaBootData.user.lightTheme) {
              window.System.import(this.panelPath + 'css/panel.light.css!');
            } else {
              window.System.import(this.panelPath + 'css/panel.dark.css!');
            }
          }
        }, {
          key: 'panelPath',
          get: function get() {
            if (this._panelPath === undefined) {
              this._panelPath = '/public/plugins/' + this.pluginId + '/';
            }
            return this._panelPath;
          }
        }]);

        return BlockCountdownCtrl;
      }(PanelCtrl));

      _export('BlockCountdownCtrl', BlockCountdownCtrl);

      BlockCountdownCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=block_countdown_ctrl.js.map
