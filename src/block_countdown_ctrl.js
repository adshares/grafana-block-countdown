import {PanelCtrl} from 'app/plugins/sdk'
import _ from 'lodash'

const panelDefaults = {
  bgColor: null,
  launchTimestamp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  blockLength: 512,
  fontSize: '40px',
  showLabels: false
}

export class CountdownTracker {
  constructor (label, value) {
    const el = document.createElement('span')

    el.className = 'flip-clock__piece'
    el.innerHTML = '<b class="flip-clock__card card"><b class="card__top"></b><b class="card__bottom"></b><b class="card__back"><b class="card__bottom"></b></b></b>'
    if (label) {
      el.innerHTML += '<span class="flip-clock__slot">' + label + '</span>'
    }

    this.el = el

    this.top = el.querySelector('.card__top')
    this.bottom = el.querySelector('.card__bottom')
    this.back = el.querySelector('.card__back')
    this.backBottom = el.querySelector('.card__back .card__bottom')

    this.update(value)
  }

  update (value) {
    const val = ('0' + value).slice(-2)
    if (val !== this.currentValue) {
      if (this.currentValue >= 0) {
        this.back.setAttribute('data-value', this.currentValue)
        this.bottom.setAttribute('data-value', this.currentValue)
      }
      this.currentValue = val
      this.top.innerText = this.currentValue
      this.backBottom.setAttribute('data-value', this.currentValue)

      this.el.classList.remove('flip')
      void this.el.offsetWidth
      this.el.classList.add('flip')
    }
  }
}

export class BlockCountdownCtrl extends PanelCtrl {
  constructor ($scope, $injector) {
    super($scope, $injector)
    _.defaultsDeep(this.panel, panelDefaults)

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this))
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this))
    this.events.on('panel-initialized', this.render.bind(this))
  }

  onInitEditMode () {
    this.addEditorTab('Options', 'public/plugins/block-countdown-panel/editor.html', 2)
  }

  onPanelTeardown () {
    this.$timeout.cancel(this.nextTickPromise)
  }

  getTimeRemaining (endtime) {
    const t = Date.parse(endtime) - Date.parse(new Date())

    let ret = {}

    const days = Math.floor(t / (1000 * 60 * 60 * 24))
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((t / 1000 / 60) % 60)
    const seconds = Math.floor((t / 1000) % 60)

    ret.Total = t
    if (days || this.panel.blockLength >= 60 * 60 * 24) {
      ret.Days = days
    }
    if (hours || this.panel.blockLength >= 60 * 60) {
      ret.Hours = hours
    }
    if (minutes || this.panel.blockLength >= 60) {
      ret.Minutes = minutes
    }
    ret.Seconds = seconds

    return ret
  }

  getEndDate () {
    const now = Math.floor(Date.now() / 1000)
    let countdown = this.panel.launchTimestamp

    if (now >= this.panel.launchTimestamp) {
      countdown = Math.ceil(now / this.panel.blockLength) * this.panel.blockLength
    }

    return new Date(countdown * 1000)
  }

  renderClock () {
    this.trackers = {}
    const t = this.getTimeRemaining(this.getEndDate())

    this.el.empty()
    for (const key in t) {
      if (key === 'Total') {
        continue
      }
      const label = this.panel.showLabels ? key : null
      this.trackers[key] = new CountdownTracker(label, t[key])
      this.el.append(this.trackers[key].el)
    }

    this.updateClock()
  }

  updateClock () {
    const t = this.getTimeRemaining(this.getEndDate())
    for (const key in this.trackers) {
      if (t[key] != null) {
        this.trackers[key].update(t[key])
      }
    }

    this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 500)
  }

  link (scope, elem) {
    this.initStyles()
    this.el = elem.find('.flip-clock')
    this.events.on('render', () => {
      this.renderClock()
    })
  }

  initStyles () {
    window.System.import(this.panelPath + 'css/panel.base.css!')
    if (grafanaBootData.user.lightTheme) {
      window.System.import(this.panelPath + 'css/panel.light.css!')
    } else {
      window.System.import(this.panelPath + 'css/panel.dark.css!')
    }
  }

  get panelPath () {
    if (this._panelPath === undefined) {
      this._panelPath = `/public/plugins/${this.pluginId}/`
    }
    return this._panelPath
  }
}

BlockCountdownCtrl.templateUrl = 'module.html'
