export default function (Vue, options) {
  const _ = Vue.util

  if (options.showProgress) {
    Vue.component('preloading', {
      data() {
        return {
          show: false
        }
      },
      template: `
        <div class="vue-preload" transition="vue-preload" v-show="show">
          <div class="vue-preload-progress"></div>
        </div>
      `,
      methods: {
        toggle(show) {
          this.show = show
        }
      },
      ready() {
        this.$on('preloading', this.toggle)
      }
    })
  }

  function isMobile() {
    return navigator.userAgent.indexOf('Windows Phone') > -1
      || navigator.userAgent.indexOf('Android') > -1
      || navigator.userAgent.indexOf('iPad') > -1
      || navigator.userAgent.indexOf('iPhone') > -1
      || navigator.userAgent.indexOf('Mobile') > -1
  }

  Vue.directive('preload', {
    bind() {
      this.preLoading = false
      this.tmp = null
      this.clickToPreload = false
      this.handleMouseOver = (e) => {
        if (this.preLoading) {
          if (options.onPreloading) {
            options.onPreLoading()
          }
          return
        }
        this.preLoading = true
        this.vm[this.expression].call(null, this, e)
      }
      this.handleClick = (e) => {
        e.preventDefault()
        this.showBar()
        if (!this.tmp && !this.preLoading) {
          this.clickToPreload = true
          return this.handleMouseOver(e)
        }
        this.setState(this.tmp)
      }
      if (isMobile()) {
        _.on(this.el, 'touchstart', this.handleMouseOver)
      } else {
        _.on(this.el, 'mouseover', this.handleMouseOver)
        _.on(this.el, 'click', this.handleClick)
      }
    },
    set(obj) {
      this.tmp = obj
    },
    setState(state) {
      for(const key in state) {
        this.vm.$set(key, state[key])
      }
      this.hideBar()
      this.tmp = null
    },
    end() {
      this.preLoading = false
      this.hideBar()
      if (this.clickToPreload || isMobile()) {
        this.setState(this.tmp)
        this.clickToPreload = false
      }
    },
    showBar() {
      if (options.showProgress) {
        this.vm.$broadcast('preloading', true)
      }
      if (typeof options.onStart === 'function') {
       options.onStart()
     }
    },
    hideBar() {
      if (options.showProgress && !this.preLoading) {
        this.vm.$broadcast('preloading', false)
      }
      if (typeof options.onStart === 'function') {
        options.onEnd()
      }
    },
    reset() {
      if (isMobile()) {
        _.off(this.el, 'touchstart', this.handleMouseOver)
      } else {
        _.off(this.el, 'mouseover', this.handleMouseOver)
        _.off(this.el, 'click', this.handleClick)
      }
    },
    unbind() {
      this.reset()
    }
  })
}
