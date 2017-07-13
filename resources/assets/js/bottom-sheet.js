(function ($) {

  "use strict";

  var DATA_KEY = 'ca.bsheet';
  var EVENT_KEY = DATA_KEY+'.';

  var Event = {
    HIDE: EVENT_KEY+'hide',
    HIDDEN: EVENT_KEY+'hidden',
    SHOW: EVENT_KEY+'show',
    SHOWN: EVENT_KEY+'shown',
    CLICK_DISMISS: EVENT_KEY+'click.dismiss'
  };

  var Selector = {
    BSHEET: '.md-bottom-sheet',
    DATA_TOGGLE: '[data-toggle="bottom-sheet"]'
  };

  var MaterialBottomSheet = function () {

    var MaterialBottomSheet = function (element, config) {
      this.$bsheet_ = $(element);
      this.isShown_ = false;
      this.isAnimating_ = false;
      this.startY_ = 0;
      this.currentY_ = 0;
      this.touchingBSheet_ = false;
      this.init_(config);
    };

    MaterialBottomSheet.prototype.VERSION = '1.0';

    MaterialBottomSheet.prototype.Default = {
      show: true,
      permanent: false,
      fullHeight: false,
      fullWidth: false,
      persistent: false,
      touch: true,
      swipe: true
    };

    MaterialBottomSheet.prototype.Classes_ = {
      BSHEET_SURFACE: 'md-bottom-sheet__surface',
      SHADOW: 'md-bottom-sheet__shadow',
      IS_VISIBLE: 'md-bottom-sheet--visible',
      IS_SWIPING: 'md-bottom-sheet--swiping',
      BSHEET_ANIMATING: 'md-bottom-sheet--animating',
      PERSISTENT: 'md-bottom-sheet--persistent',
      FULL_HEIGHT: 'md-bottom-sheet--full-height',
      FULL_WIDTH: 'md-bottom-sheet--full-width',
      BODY_CLASS: 'is-bsheet-open',
      BODY_PERSISTENT: 'has-bsheet-persistent'
    };

    MaterialBottomSheet.prototype.init_ = function (config) {
      if (this.$bsheet_.length) {
        this.config = $.extend({}, this.Default, config);
        this.$bSheetSurface_ = this.$bsheet_.find('.' + this.Classes_.BSHEET_SURFACE);
        this.$bSheetShadow_ = this.$bsheet_.find('.' + this.Classes_.SHADOW);
        this.boundHideBSheet_ = this.hide.bind(this);
        this.boundOnTransitionEnd_ = this.onTransitionEnd_.bind(this);
        this.update_ = this.update_.bind(this);
        this.$bSheetShadow_.on('click', this.boundHideBSheet_);
        this.bSheetHeight_ = Math.min(this.$bSheetSurface_.height(), $(window).height());
        this.setTouchFeature_();
        (this.config.show && config !== 'string') ? this.show() : '';
        this.setBSheetClass_();
        this.setBodyClass_();
        this.setDismissAction_();
      }
    };

    MaterialBottomSheet.prototype.show = function () {
      if (this.isShown_ || this.isAnimating_)
        return;
      this.$bsheet_.trigger(Event.SHOW);
      this.$bsheet_.addClass(this.Classes_.BSHEET_ANIMATING).addClass(this.Classes_.IS_VISIBLE);
      this.isAnimating_ = true;
      this.isShown_ = true;
      var $body = $('body');
      $body.addClass(this.Classes_.BODY_CLASS);
      this.$bsheet_.on('transitionend', this.boundOnTransitionEnd_);
    };
    MaterialBottomSheet.prototype['show'] = MaterialBottomSheet.prototype.show;

    MaterialBottomSheet.prototype.hide = function () {
      if (!this.isShown_ || this.isAnimating_)
        return;
      this.$bsheet_.trigger(Event.HIDE);
      this.isShown_ = false;
      this.setBodyClass_();
      this.$bsheet_.addClass(this.Classes_.BSHEET_ANIMATING)
          .removeClass(this.Classes_.IS_VISIBLE);
      var $body = $('body');
      $body.removeClass(this.Classes_.BODY_CLASS);
      this.$bsheet_.on('transitionend', this.boundOnTransitionEnd_)
    };
    MaterialBottomSheet.prototype['hide'] = MaterialBottomSheet.prototype.hide;

    MaterialBottomSheet.prototype.toggle = function () {
      this.isShown_ ? this.hide() : this.show();
    };
    MaterialBottomSheet.prototype['toggle'] = MaterialBottomSheet.prototype.toggle;

    MaterialBottomSheet.prototype.setBSheetClass_ = function () {
      if (this.config.persistent) {
          this.$bsheet_.addClass(this.Classes_.PERSISTENT);
      }
      if (this.config.fullHeight) {
          this.$bsheet_.addClass(this.Classes_.FULL_HEIGHT);
      }
      if (this.config.fullWidth) {
          this.$bsheet_.addClass(this.Classes_.FULL_WIDTH);
      }
    };

    MaterialBottomSheet.prototype.setBodyClass_ = function () {
      var $body = $('body');
      if (this.config.persistent) {
          $body.addClass(this.Classes_.BODY_PERSISTENT);
      }
    };

    MaterialBottomSheet.prototype.setTouchFeature_ = function(){
      if (this.config.touch) {
        this.boundOnTouchStart_ = this.onTouchStart_.bind(this);
        this.boundOnTouchMove_ = this.onTouchMove_.bind(this);
        this.boundOnTouchEnd = this.onTouchEnd_.bind(this);

        this.$bSheetShadow_.on('touchstart', this.boundOnTouchStart_);
        this.$bSheetShadow_.on('touchmove', this.boundOnTouchMove_);
        this.$bSheetShadow_.on('touchend', this.boundOnTouchEnd);
      }
    };

    MaterialBottomSheet.prototype.setDismissAction_ = function(){
      var dismissButton = this.$bsheet_.find('[data-dismiss="bhseet"]');
      if(!dismissButton.length){
        return ;
      }
      dismissButton.on('click', this.boundHideBSheet_);
    };

    MaterialBottomSheet.prototype.onTouchStart_ = function (e) {
      this.xDown_ = e.originalEvent.touches[0].clientX;
      this.yDown_ = e.originalEvent.touches[0].clientY;
      this.bSheetHeight_ = Math.min(this.$bSheetSurface_.height(), $(window).height());
      this.startTime_ = Math.floor(Date.now());
      if (!this.$bsheet_.hasClass(this.Classes_.IS_VISIBLE))
        return;
      this.startY_ = e.originalEvent.touches[0].pageY;
      this.currentY_ = this.startY_;
      this.touchingBSheet_ = true;
      requestAnimationFrame(this.update_);
    };

    MaterialBottomSheet.prototype.onTouchMove_ = function (e) {
      this.currentXUp_ = e.originalEvent.touches[0].clientX;
      this.currentYUp_ = e.originalEvent.touches[0].clientY;
      if (!this.touchingBSheet_)
        return;
      this.currentY_ = e.originalEvent.touches[0].pageY;
    };

    MaterialBottomSheet.prototype.onTouchEnd_ = function (e) {
      if (!this.touchingBSheet_)
        return;
      this.touchingBSheet_ = false;
      var translateY = Math.min(0, Math.max(-this.bSheetHeight_, this.startY_ - this.currentY_));
      this.$bSheetSurface_.css('transform', '');
      this.$bSheetShadow_.css('opacity', '');
      this.endTime_ = Math.floor(Date.now());
      if (!this.xDown_ || !this.yDown_) {
        return;
      }
      if ((translateY < - (this.bSheetHeight_/2))) {
        this.hide();
      } else {
        this.$bsheet_.addClass(this.Classes_.BSHEET_ANIMATING);
        this.$bsheet_.on('transitionend', this.boundOnTransitionEnd_)
      }
      //reset time
      this.startTime_ = 0;
      this.endTime_ = 0;
      this.xDown_ = 0;
    };

    MaterialBottomSheet.prototype.onTransitionEnd_ = function () {
      this.$bsheet_.removeClass(this.Classes_.BSHEET_ANIMATING);
      this.isAnimating_?this.isAnimating_=false:'';
      this.$bSheetSurface_.unbind('transitionend', this.boundOnTransitionEnd_);
      if (this.isShown_) {
        this.$bsheet_.trigger(Event.SHOWN);
        this.$bSheetSurface_.attr('aria-hidden', false);
      } else {
        this.$bsheet_.trigger(Event.HIDDEN);
        this.$bSheetSurface_.attr('aria-hidden', true);
      }
    };

    MaterialBottomSheet.prototype.update_ = function () {
      if (!this.touchingBSheet_)
        return;
      requestAnimationFrame(this.update_);
      var translateY = Math.min(0, Math.max(-this.bSheetHeight_, this.startY_ - this.currentY_));
      var opacityPercentage = 0;
      if (Math.abs(translateY) <= this.bSheetHeight_) {
        opacityPercentage = (this.bSheetHeight_ - Math.abs(translateY)) / (this.bSheetHeight_);
      }
      this.$bSheetSurface_.css('transform', 'translateY(' + -translateY + 'px');
      this.$bSheetShadow_.css('opacity', opacityPercentage);
    };

    MaterialBottomSheet.Plugin_ = function Plugin_(config) {
      return this.each(function () {
        var $this = $(this);
        var data  = $this.data(DATA_KEY);
        if (!data){
          $this.data(DATA_KEY, (data = new MaterialBottomSheet(this, config)));
        }
        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };
    return MaterialBottomSheet;
  }();

  /**
   * -----------------------
   * Data Api
   * -----------------------
   */
  $(document).on('click', Selector.DATA_TOGGLE, function (event) {
    var $this = $(this);
    if (this.tagName === 'A') {
      event.preventDefault();
    }
    var target = $this.attr('data-target');
    if(typeof target === typeof undefined){
      throw new Error('Target Bottom Sheet not specified.');
      return;
    }
    var config = $(target).data(DATA_KEY) ? 'toggle' : $.extend({}, $(target).data(), $(this).data());
    MaterialBottomSheet.Plugin_.call($(target), config);
  });

  $.fn.MaterialBottomSheet = MaterialBottomSheet.Plugin_;
  $.fn.MaterialBottomSheet.Constructor = MaterialBottomSheet;
  $.fn.MaterialBottomSheet.noConflict = function () {
    $.fn.MaterialBottomSheet = MaterialBottomSheet;
    return MaterialBottomSheet.Plugin_;
  };
}( jQuery ));