/**
 * Paralax Plugin
 * @version 1.0.0
 * @author Paweł Twardziak
 * @license The MIT License (MIT)
 */

/* 1, 2 or 3*/
var jmcParalaxType = 1;

;(function($, window, document, undefined) {

	/**
	 * Creates the video plugin.
	 * @class The Paralax Plugin
	 * @param {Owl} carousel - The Owl Carousel
	 */
	var Paralax = function(carousel) {
		/**
		 * Reference to the core.
		 * @protected
		 * @type {Owl}
		 */
		this._core = carousel;

		this._paralax = null;
		this._paralaxSlider = null;
		this._paralaxApi = null;
		this._paralaxItems = {};

		/**
		 * All event handlers.
		 * @protected
		 * @type {Object}
		 */
		this._handlers = {
			/*
			'resize.owl.carousel': $.proxy(function(e) {
				if (this._core.settings.video && !this.isInFullScreen()) {
					e.preventDefault();
				}
			}, this),
			'refresh.owl.carousel changed.owl.carousel': $.proxy(function(e) {
				if (this._playing) {
					this.stop();
				}
			}, this),
			*/
			'initialize.owl.carousel':  $.proxy(function(e) {
				if (!this._core.settings.paralax /*|| 1 === 1*/) {
					return;
				}

				console.log('initialize frame');

				var lastTime = 0;
				var vendors = ['ms', 'moz', 'webkit', 'o'];
				for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
					window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
					window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
				}

				if (!window.requestAnimationFrame) {
					window.requestAnimationFrame = function(callback) {
						var currTime = new Date().getTime();
						var timeToCall = Math.max(0, 16 - (currTime - lastTime));
						var id = window.setTimeout(function() { callback(currTime + timeToCall); },
						timeToCall);
						lastTime = currTime + timeToCall;
						return id;
					};
				}

				if (!window.cancelAnimationFrame)
				window.cancelAnimationFrame = function(id) {
					clearTimeout(id);
				};
			}, this),
			'prepared.owl.carousel': $.proxy(function(e) {
				var $owlItem = $(e.content);
				if (!this._paralaxSlider) {
					this.fetchParalaxSlider();
				}
				this.addToParalaxSlider($owlItem);
			}, this),
			'initialized.owl.carousel': $.proxy(function(e) {
				this.showParalaxSlider();
				this.fetchPlugin();
			}, this)
		};

		// set default options
		this._core.options = $.extend({}, Paralax.Defaults, this._core.options);

		// register event handlers
		this._core.$element.on(this._handlers);
	};

	/**
	 * Default options.
	 * @public
	 */
	Paralax.Defaults = {
		paralax: false,
		paralaxSpeed: 1,
		paralaxBleed: 0,
		paralaxZIndex: -100,
		paralaxImageDuration: 1500,
		paralaxImageMarginRatio: 2,
		paralaxAndroidFix: true,
		paralaxIosFix: true
	};

	/**
	 * Gets the video ID and the type (YouTube/Vimeo only).
	 * @protected
	 * @param {jQuery} target - The target containing the video data.
	 * @param {jQuery} item - The item containing the video.
	 */

	Paralax.prototype.fetchParalaxSlider = function() {
		var self = this;

		if (!self._core.settings.paralax) {
			return;
		}

		if (jmcParalaxType === 3) {
			console.log('Paralax Slider initialize');
			self._paralaxSlider = self.paralaxSlider().getApi();
			self._paralaxSlider.init();
		}
	};

	Paralax.prototype.showParalaxSlider = function() {
		var self = this;

		if (self._paralaxSlider && self._paralaxSlider.is) {
			console.log('Paralax Slider is initialized');
			self._paralaxSlider.triggerElementEvent('initialized');
		}
	};

	Paralax.prototype.addToParalaxSlider = function($owlItem) {
		var self = this;

		if (self._paralaxSlider && self._paralaxSlider.is) {
			console.log('Paralax Slider - add item', $owlItem);
			self._paralaxSlider.addItem($owlItem);
		}
	};

	Paralax.prototype.fetchPlugin = function(/*$items, $targets*/) {
		if (!this._core.settings.paralax) {
			return;
		}

		var self = this;

		self.linkItems();

		if (jmcParalaxType === 1) {
			self._paralax = new jmcParalax(self._core.$element.find('.owl-item .owl-jmcparalax'), self, {});
		} else if (jmcParalaxType === 2) {
			self._paralaxApi = self.slider();
			self._paralaxApi.init();
			console.log('paralaxApi test', self._paralaxApi.getOption());
		}
	};

	Paralax.prototype.linkItems = function(/*$item, link*/) {
		//console.log('link create', slideLink);
		var self = this;

		self._core.$element.find('.owl-item .owl-jmcparalax').each(function(i, target) {
			var $target = $(target);
			var slideLink = $target.attr('data-slide-link') ? $target.attr('data-slide-link') : '';
			if (slideLink.length) {
				$target.closest('.owl-item')
					.css({
						cursor: 'pointer'	
					})
					.bind('click', function(event) {
						//console.log('event', event);
						document.location.href = decodeURIComponent(slideLink);
					});
			};
		});

		return;
	};




	Paralax.prototype.paralaxSlider = function() {

		var plugin = this;

		var $element = null;

		var states = {
			initializeSlider: false,
			initializeMirror: false,
			mobileFixed: true
		};

		var $win = $(window);
		var $doc = $(document);

		var innerApi = {
			checkMobileFixed: function() {
				if (typeof navigator === 'object' && typeof navigator.userAgent === 'string') {
					console.log('navigator.userAgent', navigator.userAgent);
					if (navigator.userAgent.match(/(iPod|iPhone|iPad|xWindows)/) && innerApi.getOption('paralaxIosFix')) {
						return true;
					}

					if (navigator.userAgent.match(/(Android)/)  && innerApi.getOption('paralaxAndroidFix')) {
						return true;
					}
				}

				return false;
			},
			addItem: function(image) {
				$element.$mirrorsBox.append(image);
			},
			getOption: function(name) {
				if (typeof name === 'string') {
					return plugin._core.settings[name];
				}
				return plugin._core.settings;
			},
			addElement: function() {
				$element = $('<div></div>')
					.css({
						position: 'fixed',
						top: '0px',
						left: '0px',
						width: '100%',
						zIndex: innerApi.getOption('paralaxZIndex') - 1
					})
					.addClass('owl-paralax-slider');
				$element.paralaxInBody = false;
			},
			setElementSize: function() {
				$element.css({
					width: $win.width() + 'px',
					height: $win.height() + 'px'
				});
			},
			setElementToBody: function() {
				if (!$element.paralaxInBody) {
					$element
						.prependTo($('body'))
						.paralaxInBody = false;
				}
			},
			updateParalaxSlider: function($currentOwlItem) {
				$element.$mirror.children('img').appendTo($element.$mirrorBox);
				$element.$mirror.append($currentOwlItem.get(0).paralaxImage);
			},
			setElementEvents: function() {
				$element.on('initialized', function(e) {
					states.initializeSlider = states.initializeSlider === 'start' ? true : states.initializeSlider;

					if (states.initializeSlider !== true) {
						return;
					}

					if (!states.mobileFixed) {
						var $currentOwlItem = plugin._core.$element.find('.'+plugin._core.settings.itemClass+'.'+plugin._core.settings.activeClass);

						console.log('currentOwlItem', $currentOwlItem);
						innerApi.updateParalaxSlider($currentOwlItem);

						var windowTop = $(window).scrollTop();
						console.log('windowTop', windowTop);

						$element.$mirror
							.css({
								top: (plugin._core.$element.offset().top - $win.scrollTop()) + 'px',
								height: plugin._core.$element.outerHeight() + 'px'
							})
							.animate({
								opacity: 1
							},{

							});
					}
				});
			},
			triggerElementEvent: function(event) {
				if (!states.mobileFixed) {
					$element.trigger(event);	
				}
			},
			setMirrorToElement: function() {
				if (!states.initializeMirror) {
					states.initializeMirror = true;
					console.log('setMirrorToElement');
					$element.$mirror = $('<div></div>')
						.css({
							position: 'absolute',
							top: '0px',
							left: '0px',
							width: '100%',
							zIndex: innerApi.getOption('paralaxZIndex'),
							overflow: 'hidden',
							opacity: 1
						})
						.addClass('owl-paralax-slider-mirror')
						//.html('<p>jest!</p>')
						.prependTo($element);
					$element.$mirrorsBox = $('<div></div>')
						.css({
							display: 'none',
							position: 'absolute'
						})
						.addClass('owl-paralax-slider-mirrors-box')
						.prependTo($element);
				} else {
					console.log('Parallax Slider Mirror is already initialized');
				}
			},
			itemGetImageSrc: function($paralaxItem) {
				return $paralaxItem.attr('data-image-src').trim() ? $paralaxItem.attr('data-image-src').trim() : null;
			},
			itemGetMobileImageSrc: function($paralaxItem) {
				return $paralaxItem.attr('data-mobileimage-src').trim() ? $paralaxItem.attr('data-mobileimage-src').trim() : null;
			},
		}

		var outerApi = {
			is: true,
			init: function() {
				console.log('init');
				if (states.initializeSlider === false) {
					states.initializeSlider = 'start';

					states.mobileFixed = innerApi.checkMobileFixed();

					if (!states.mobileFixed) {
						//innerApi.add();

						innerApi.addElement();

						innerApi.setElementEvents();
						//innerApi.setElementSize();
						innerApi.setElementToBody();
						innerApi.setMirrorToElement();
					}
				} else {
					console.log('Parallax Slider is already initialized');
				}
			},
			getOption: function(name) {
				return innerApi.getOption(name);
			},
			triggerElementEvent: function(event) {
				innerApi.triggerElementEvent(event);
			},
			addItem: function($owlItem) {
				$paralaxItem = $owlItem.children('.owl-jmcparalax');
				if ($paralaxItem.length) {
					$paralaxItem.children('.jmcparallax-slide').remove();

					if (!states.mobileFixed) {
						var imageSrc = innerApi.itemGetImageSrc($paralaxItem);

						if (imageSrc) {
							var paralaxImage = new Image();
							$owlItem.get(0).paralaxImage = paralaxImage;
							paralaxImage.loaded = false;
							paralaxImage.owlItem = $owlItem.get(0);

							$(paralaxImage).css({
								position: 'relative',
								top: 0 + 'px',
								left: 0 + 'px',
								zIndex: innerApi.getOption('paralaxZIndex') - 2
							})
							.one('load', function() {
								this.loaded = true;
							}).attr('src', imageSrc);
							innerApi.addItem(paralaxImage);
						}
					} else {
						var mobileImageSrc = innerApi.itemGetMobileImageSrc($paralaxItem);

						if (mobileImageSrc) {
							$owlItem.css({
								backgroundImage: "url("+mobileImageSrc+")",
								backgroundPosition: "center center",
								backgroundSize: "cover"
							});
						}
					}
				}
			},
			destroy: function() {
				console.log('destroying Paralax Slider not implemented yet');
			}
		}

		return {
			getApi: function() {
				return outerApi;
			}
		}
	};














	Paralax.prototype.slider = function() {
		//var slides = [];
		var plugin = this;

		var $win = null, $doc = null;

		var config = {

		};

		var mobileFixed = false;

		var innerApi = {
			checkIfMobileFixed: function() {
				if (typeof navigator === 'object' && typeof navigator.userAgent === 'string') {
					console.log('navigator.userAgent', navigator.userAgent);
					if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && innerApi.getOption('paralaxIosFix')) {
						return true;
					}

					if (navigator.userAgent.match(/(Android)/)  && innerApi.getOption('paralaxAndroidFix')) {
						return true;
					}
				}

				return false;
			},
			createGuid: function() {
				function s4() {
					return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				}
				return s4() + s4() + '' + s4() + '' + s4() + '' + s4() + '' + s4() + s4() + s4();
			},
			getOption: function(name) {
				if (typeof name === 'string') {
					return plugin._core.settings[name];
				}
				return plugin._core.settings;
			},
			refresh: function() {
				mobileFixed = innerApi.checkIfMobileFixed();
				console.log('mobileFixed', mobileFixed);
				$win = $(window);
				$doc = $(document);
				plugin._paralaxItems = {};
				plugin._core.$element.find('.owl-item .owl-jmcparalax').each(function(i, item) {
					$item = $(item);
					innerApi.itemInit($item);
				});

				innerApi.setEventsActios();

				console.log(plugin._paralaxItems);
			},
			setEventsActios: function() {
				innerApi.setScrollAction();
				innerApi.setResizeAction();
				innerApi.setPrevNextAction();
			},
			setResizeAction: function() {
				plugin._core.$element.on('resized.owl.carousel', function(e) {
					$.each(plugin._paralaxItems, function(itemGuid, $item) {
						if (!$item.$paralaxSlide.get(0).paralaxReady) {
							return;
						}
						innerApi.itemImageCalculateConfig($item.$paralaxSlide.$image);
						if (innerApi.itemImageSetParalaxSizeAndPosition($item.$paralaxSlide.$image)) {
							var imageTop = innerApi.itemImageCalculateTop($item.$paralaxSlide.$image);
							$item.$paralaxSlide.$image.css({
								top: imageTop + 'px'
							});
						};
					});
				});
			},
			setScrollAction: function() {
				$win.bind('scroll', function(e) {
					//console.log('scroll', e);
					$.each(plugin._paralaxItems, function(itemGuid, $item) {
						if ($item.parent().hasClass('active')) {
							if ($item.$paralaxSlide.get(0).paralaxReady) {
								var imageTop = innerApi.itemImageCalculateTop($item.$paralaxSlide.$image);	
								$item.$paralaxSlide.$image.css({
									top: imageTop + 'px'
								});

								var parentOffsetTop = $item.$paralaxSlide.$image.closest('.owl-item').offset().top;
								console.log('parentOffsetTop', parentOffsetTop);
							} else {
								console.log('paralax is not ready yet');
							}
						}
					});
				});
			},
			setPrevNextAction: function() {
				return;

				plugin._core.$element.on('change.owl.carousel', function(e) {
					console.log('CHANGE');
					console.log('page', plugin._core.items(e.page.index));
				});

				plugin._core.$element.on('changed.owl.carousel', function(e) {
					console.log('CHANGED');
					console.log('page', plugin._core.items(e.page.index));
				});
			},
			itemInitMobileFixed: function($item) {
				if (!innerApi.itemGetMobileImageSrc($item)) {
					//throw new Error('Missing image SRC');
					console.log('Missing mobile image SRC');
				};
			},
			itemInit: function($item) {
				if (mobileFixed) {
					innerApi.itemInitMobileFixed($item);
					return;
				}

				if (!innerApi.itemGetImageSrc($item)) {
					throw new Error('Missing image SRC');
				};

				var $slide = innerApi.itemGetSlideBox($item);

				if (!$slide) {
					throw new Error('Missing `.jmcparallax-slide` box');
				};

				$slide.get(0).paralaxReady = false;

				var itemGuid = innerApi.itemAddGuid($item);
				if (!itemGuid || $item.get(0).paralaxGuid !== itemGuid || typeof plugin._paralaxItems[itemGuid] === 'undefined') {
					throw new Error('Missing paralax item `guid`');
				}

				$item.attr('id', itemGuid);
			
				$item.$paralaxSlide = $slide.css({
					position: 'absolute',
					//backgroundSize: 'cover',
					width: '100%',
					height: '100%',
					top: '0px',
					left: '0px',
					overflow: 'hidden',
					zIndex: innerApi.getOption('paralaxZIndex')
				});

				innerApi.itemCreateImage($item);

				plugin._paralaxItems[itemGuid] = $item;
			},
			itemCreateImage: function($item) {
				var parent = $item.closest('.owl-item');

				var imageSrc = innerApi.itemGetImageSrc($item);

				var $image = $(new Image)
					.css({
						opacity: 0
					})
					.css({
						position: 'absolute',
						top: '0px',
						left: '0px',
						zIndex: innerApi.getOption('paralaxZIndex')
					});

				//$image.get(0).paralaxReady = false;
				$image.get(0).paralaxFirstTime = true;

				$item.$paralaxSlide.$image = $image;

				$image
					.appendTo($item.$paralaxSlide)
					.one('load', function() {
						this.orgHeight =  $(this).height();
						this.orgWidth = $(this).width();
						this.orgRatio = this.orgHeight ? this.orgWidth / this.orgHeight : 0;

						$(this).css({
							width: this.orgHeight + 'px',
							height: this.orgHeight + 'px'
						});

						innerApi.itemImageLoadedSetParalaxReady($(this));
					})
					.attr('src', imageSrc);
			},
			itemImageCalculateConfig: function($image) {
				var image = $image.get(0);
				$parent = $image.closest('.owl-item');
				image.parentWidth = $parent.outerWidth();
				image.parentHeight = $parent.outerHeight();
				image.parentRatio = image.parentHeight ? image.parentWidth / image.parentHeight : NaN;
				image.parentOffsetTop = $image.closest('.owl-item').offset().top;
				image.windowHeight = $win.height();

				console.log('image calculated', image);
			},
			itemImageCalculateTop: function($image) {
				console.log('$image', $image);

				//return;

				//var $image = $item.$paralaxSlide.$image;
				var top = parseInt($image.css('top'));

				var top = $image.get(0).maxTop;

				var windowTop = $win.scrollTop();

				top += windowTop;

				top = top > $image.get(0).minTop ? $image.get(0).minTop : (top < $image.get(0).maxTop ? $image.get(0).maxTop : top);

				console.log('windowTop', windowTop);

				return top;
			},
			itemImageSetParalaxSizeAndPosition: function($image) {
				var image = $image.get(0);
				
				//$item = $image.closest('.owl-jmcparalax');

				var imageWidth = image.orgWidth;
				var imageHeight = image.orgHeight;
				var imageRatio = image.orgRatio;
				var imageTop = 0;
				var imageLeft = 0;
				
				var ratioRatio = innerApi.getOption('paralaxImageMarginRatio');

				if (image.orgRatio && image.parentRatio) {
					if ((imageHeight / image.parentHeight) < ratioRatio) {
						imageHeight = image.parentHeight * ratioRatio;
						imageWidth = imageHeight * imageRatio;
					}
					if (imageWidth < image.parentWidth) {
						imageWidth = image.parentWidth;
						imageHeight = imageWidth / imageRatio;
					}
					if (imageWidth > image.parentWidth) {
						imageLeft = - 0.5 * (imageWidth - image.parentWidth);
					}

					image.calcImageHeight = Math.ceil(imageHeight);
					image.calcImageWidth = Math.ceil(imageWidth);
					//image.calcImageTop = Math.ceil(imageTop);
					image.calcImageLeft = Math.ceil(imageLeft);

					$return = true;

					if (image.calcImageHeight > image.parentHeight) {
						image.maxTop = (image.parentHeight - image.calcImageHeight) + (Number(innerApi.getOption('paralaxBleed')) ? Number(innerApi.getOption('paralaxBleed')) : 0);
						image.minTop = Number(innerApi.getOption('paralaxBleed')) ? -Number(innerApi.getOption('paralaxBleed')) : 0;
						imageTop = innerApi.itemImageCalculateTop($image);//- 0.5 * (imageHeight - image.parentHeight);
					} else {
						imageTop = 0;
						$return = false;
					}

					//var ifFirst = self.$element.data('first');

					var newCss = {
						height: image.calcImageHeight + 'px',
						width: image.calcImageWidth + 'px',
						//top: image.calcImageTop + 'px',
						left: image.calcImageLeft + 'px'
					}
					if (image.paralaxFirstTime) {
						//console.log('first time');
						newCss.top = imageTop + 'px';
						image.paralaxFirstTime = false;
					}
					$image.css(newCss);
					//self.scrollParalaxImage.call(app);

					return $return;
				} else {
					console.log('ratio error');
				}

				return false;
			},
			itemImageLoadedSetParalaxReady: function($image) {
				// ustawienia początkowe obrazka paralaksy
				innerApi.itemImageCalculateConfig($image);
				if (innerApi.itemImageSetParalaxSizeAndPosition($image)) {
					$image.parent().get(0).paralaxReady = true;
					$image.animate({
						opacity: 1
					}, {
						duration: innerApi.getOption('paralaxImageDuration')
					});
				} else {
					console.log('prepare image error');
				};
			},
			itemGetImageSrc: function($item) {
				return $item.attr('data-image-src').trim() ? $item.attr('data-image-src').trim() : null;
			},
			itemGetMobileImageSrc: function($item) {
				return $item.attr('data-mobileimage-src').trim() ? $item.attr('data-mobileimage-src').trim() : null;
			},
			itemGetSlideBox: function($item) {
				var $box = $item.find('.jmcparallax-slide');
				return $box.length ? $box : null;
			},
			itemAddGuid: function($item) {
				var guidExists = false;
				var counter = 0;
				var itemGuid = null;
				do {
					itemGuid = innerApi.createGuid().toString();
					if (typeof plugin._paralaxItems[itemGuid] === 'undefined') {
						plugin._paralaxItems[itemGuid] = new Object();
						//$item.data('paralax_guid', itemGuid);
						$item.get(0).paralaxGuid = itemGuid
					} else {
						itemGuid = null;
						guidExists = true;
					}
					counter++;
				} while (guidExists && counter < 1000);

				return itemGuid;
			}
		};

		var api = {
			getOption: function(name) {
				return innerApi.getOption(name);
			},
			init: function() {
				return innerApi.refresh();
				console.log('plugin', plugin);
			}
		};

		return api;
	}








	/**
	 * Destroys the plugin.
	 */
	Paralax.prototype.destroy = function() {
		var handler, property;

		this._core.$element.off('click.owl.paralax');

		for (handler in this._handlers) {
			this._core.$element.off(handler, this._handlers[handler]);
		}
		for (property in Object.getOwnPropertyNames(this)) {
			typeof this[property] != 'function' && (this[property] = null);
		}
	};








	jmcParalax = function($elements, carousel, options) {
		//console.log('begin paralax plugin', carousel);
		var self = this;

		//self.owl = owl._core;

		self.slides = [];

		self.options = {
			speed:    0.3,
			bleed:    10,
			zIndex:   -100,
			//iosFix:   true,
			//androidFix: true,
			//position: 'center',
			//overScrollFix: false
		};
		if (typeof options == 'object') {
			$.extend(self.options, options);
		}

		self.renderRequest = function() {
			//console.log('renderRequest - start');

			//var newSelf = jQuery.extend(true, {}, self);

			$.each(self.slides, function(prop, slide) {
				//window.requestAnimationFrame(function() {
					//var newSelf = jQuery.extend(true, {}, self);
					slide.render.call(self);
				//});
			});

			//console.log('renderRequest - stop');
		};

		//$(window).load() {
		self.config = new jmcParalaxConfig(self, carousel);

		$elements.each(function(i, el) {
			var item = new jmcParalaxItem($(el), self);
			self.slides.push(item);
		});

		self.renderRequest();

		//console.log('end paralax plugin', self);
		//}

		return self;
	};

	jmcParalaxItem = function($element, paralaxApp) {
		var self = this;

		self.$element = $element;
		//self.$element.data('first', true);
		self.imageSrc = self.$element.attr('data-image-src') ? self.$element.attr('data-image-src').trim() : null;

		self.config = {
			paralaxFirstTime: true
		};

		self.render = function() {
			if (!self.imageSrc) {
				throw new Error('Missing image SRC.');
			}

			//var ifFirstTime = self.$element.data('first');

			if (self.config.paralaxFirstTime) {
				//console.log('create paralax image');
				self.prepareParalaxBox.call(this);
				self.prepareConfig.call(this);
				self.createParalaxImage.call(this);
				//self.initParalaxImage.call(this);
				//self.$element.data('first', false);
			} else {
				if (this.config.afterResize) {
					self.prepareConfig.call(this);
					//console.log('set paralax image position after resize');
					self.setParalaxImageSizeAndPosition.call(this);
				} else {
					self.scrollParalaxImage.call(this);
				}
				//console.log('scroll paralax image');
			}
			//console.log('render item', self, this);
		};

		self.prepareConfig = function() {
			var conf = this.config.getConfig();

			self.config.boxWidth        = self.$element.parent().outerWidth();
			self.config.boxHeight       = self.$element.parent().outerHeight() + this.options.bleed * 2;
			self.config.boxOffsetTop    = self.$element.parent().offset().top - this.options.bleed;
			self.config.boxOffsetBottom = self.config.boxOffsetTop + self.config.boxHeight;
		};

		self.scrollParalaxImage = function(animate) {
			var conf = this.config.getConfig();

			var scrollTo = oldScrollTo = parseInt(self.$element.$paralax.$image.css('top'));
			var scrollImageSpace = self.config.calcImageHeight - self.config.boxHeight;

			if (scrollImageSpace > 0) {
				var meanTop = -parseInt(scrollImageSpace/2);
				//console.log('scrollImageSpace', scrollImageSpace);
				var topRange = {
					mean: meanTop,
					min: meanTop - Math.ceil(scrollImageSpace/2)/* * this.options.speed*/,
					max: meanTop + Math.floor(scrollImageSpace/2)/* * this.options.speed*/
				};
				topRange.space = Math.abs(topRange.max - topRange.min);
				//var boxOffsetTop = self.$element.parent().offset().top;
				//console.log('topRange', topRange);

				if (!topRange.space) {
					//console.log('speed 0');
					self.$element.$paralax.$image
						.css({
							visibility: 'visible'
						});
					return;
				}

				var winTop = this.config.$win.scrollTop();
				var winHeight = this.config.$win.height();
				var docHeight = this.config.$doc.height();

				var boxBottomWinPos = self.config.boxOffsetBottom - winTop;
				var boxTopWinPos = boxBottomWinPos - self.config.boxHeight

				if (boxBottomWinPos > 0 && boxTopWinPos < winHeight) {
					var meanWin = parseInt(winHeight/2);
					var winSpace = winHeight + 2*self.config.boxHeight;
					var winRange = {
						mean: meanWin,
						min: meanWin - Math.ceil(winSpace/2),
						max: meanWin + Math.ceil(winSpace/2)
					}
					winRange.space = Math.abs(winRange.max - winRange.min);

					boxTopWinPos = boxTopWinPos - winRange.min;
					var scrollRatio = boxTopWinPos / winRange.space;

					var scrollTo = scrollRatio * topRange.space + topRange.min/* * this.options.speed*/;
				} else {
					if ((self.config.boxOffsetBottom - winTop) <= 0) {
						scrollTo = topRange.min/* * this.options.speed*/;
					} else {
						scrollTo = topRange.max/* * this.options.speed*/;
					}
				}
			}

			/*
			self.$element.$paralax.$image.css({
				visibility: 'visible'
			});
			*/

			console.log('poszlo');

			if (scrollTo !== oldScrollTo) {
				if (animate) {
					console.log('z animacja');
					self.$element.$paralax.$image.animate({
						top: scrollTo + 'px'
					}, {
						duration: 500,
						complete: function() {
							$(this)
							//.parent()
							.css({
								visibility: 'visible'
							});
						}
					});
				} else {
					console.log('bez animacja');
					self.$element.$paralax.$image
						.css({
							top: scrollTo + 'px'
						})
						//.parent()
						.css({
							visibility: 'visible'
						});
				}
			} else {
				console.log('bez roznicy TOP');
				self.$element.$paralax.$image
					.css({
						visibility: 'visible'
					});
			}
		};

		self.prepareParalaxBox = function() {
			self.$element.$paralax = self.$element.find('.jmcparallax-slide');

			if (!self.$element.$paralax.length) {
				throw new Error('Missing `.jmcparallax-slide` DIV.');
			}

			self.$element.$paralax.css({
				//visibility: 'hidden',
				position: 'absolute',
				backgroundSize: 'cover',
				width: '100%',
				height: '100%',
				top: '0px',
				left: '0px',
				overflow: 'hidden',
				zIndex: this.options.zIndex
			});
		};

		self.createParalaxImage = function() {
			var paralaxApp = this;

			var imgTag = new Image();
			imgTag.src = self.imageSrc;
			self.$element.$paralax.$image = $(imgTag)
				.css({
					visibility: 'hidden'
				})
				.css({
					position: 'absolute',
					top: '0px',
					left: '0px',
					zIndex: this.options.zIndex
				});					

			self.$element.$paralax.$image.one('load', function() {
				this.orgHeight =  $(this).height();
				this.orgWidth = $(this).width();
				this.orgRatio = this.orgHeight ? this.orgWidth / this.orgHeight : 0;

				self.config.orgImageRatio = this.orgRatio;
				self.config.orgImageHeight = this.orgHeight;
				self.config.orgImageWidth = this.orgWidth;

				$(this).css({
					width: this.orgHeight + 'px',
					height: this.orgHeight + 'px'
				});

				self.$element
					.css({
						backgroundColor: '',
						backgroundImage: '',
						backgroundRepeat: '',
						backgroundPosition: '',
						backgroundSize: ''
					});

				self.initParalaxImage.call(paralaxApp);
			});

			self.$element.$paralax.append(self.$element.$paralax.$image);
		};

		self.initParalaxImage = function() {
			var conf = this.config.getConfig();

			self.setParalaxImageSizeAndPosition.call(this);
		};

		self.setParalaxImageSizeAndPosition = function() {
			var app = this;
			var conf = this.config.getConfig();

			var parentWidth = self.config.boxWidth;//self.$element.parent().outerWidth();
			var parentHeight = self.config.boxHeight;//self.$element.parent().outerHeight();
			var parentRatio = parentHeight ? parentWidth / parentHeight : 0;
			var image = self.$element.$paralax.$image.get(0);
			var imageWidth = image.orgWidth;
			var imageHeight = image.orgHeight;
			var imageRatio = image.orgRatio;
			var imageTop = 0;
			var imageLeft = 0;
			
			var ratioRatio = 2;

			if (image.orgRatio && parentRatio) {
				//ratioRatio = ratioRatio < parentRatio/image.orgRatio ? parentRatio/image.orgRatio : ratioRatio;
				if ((imageHeight / parentHeight) < ratioRatio) {
					imageHeight = parentHeight * ratioRatio;
					imageWidth = imageHeight * imageRatio;
				}
				if (imageWidth < parentWidth) {
					imageWidth = parentWidth;
					imageHeight = imageWidth / imageRatio;
				}
				if (imageWidth > parentWidth) {
					imageLeft = - 0.5 * (imageWidth - parentWidth);
				}
				if (imageHeight > parentHeight) {
					imageTop = - 0.5 * (imageHeight - parentHeight);
				}

				self.config.calcImageHeight = Math.ceil(imageHeight);
				self.config.calcImageWidth = Math.ceil(imageWidth);
				self.config.calcImageTop = Math.ceil(imageTop);
				self.config.calcImageLeft = Math.ceil(imageLeft);

				//var ifFirst = self.$element.data('first');

				var newCss = {
					height: self.config.calcImageHeight + 'px',
					width: self.config.calcImageWidth + 'px',
					//top: self.config.calcImageTop + 'px',
					left: self.config.calcImageLeft + 'px'
				}
				if (self.config.paralaxFirstTime) {
					//console.log('first time');
					newCss.top = self.config.calcImageTop + 'px';
					self.config.paralaxFirstTime = false;
				} else {
					/*
					console.log('not first time');
					
					self.$element.$paralax.$image.animate(newCss, {
						duration: 500, 
						complete: function() {
							self.scrollParalaxImage.call(app);
						}
					});
					*/
				}
				self.$element.$paralax.$image.css(newCss);
				self.scrollParalaxImage.call(app);
			}

			//console.log('config for set image size & pos', conf);
		};

		return self;
	};


	jmcParalaxConfig = function(paralaxApp, carousel) {
		var self = this;

		self.afterResize = false;

		//self.owl = paralaxApp.owl;

		self.$win = $(window);
		self.$doc = $(document);

		self.config = {};

		self.loadDimensions = function() {
			self.setConfig('winHeight', self.$win.height());
			self.setConfig('winWidth', self.$win.width());
			self.setConfig('docHeight', self.$doc.height());
			self.setConfig('docWidth', self.$doc.width());
		}

		self.loadScrollPosition = function() {
			//self.setConfig('winScrollTop', self.$win.scrollTop());
			//console.log('self.$win.scrollTop()', self.$win.scrollTop());
			//self.setConfig('scrollTopMax', self.getConfig('docHeight') - self.getConfig('winHeight'));
			//self.setConfig('scrollLeftMax', self.getConfig('docWidth') - self.getConfig('winWidth'));
			//self.setConfig('scrollTop', Math.max(0, Math.min(self.getConfig('scrollTopMax'), self.getConfig('winScrollTop'))));
			//self.setConfig('scrollLeft', Math.max(0, Math.min(self.getConfig('scrollLeftMax'), self.$win.scrollLeft())));
			//self.setConfig('overScroll', Math.max(self.getConfig('winScrollTop') - self.getConfig('scrollTopMax'), Math.min(self.getConfig('winScrollTop'), 0)));

			//console.log('scroll conf', self.getConfig());
		}

		//self.$win.bind('resize', function() {
			//self.afterResize = true;
			//self.loadDimensions();
			//paralaxApp.renderRequest.call(paralaxApp);
		//});
		//console.log('paralaxApp', paralaxApp);
		carousel._core.$element.on('resized.owl.carousel', function() {
			//console.log('aaaa!');
			self.afterResize = true;
			self.loadDimensions();
			paralaxApp.renderRequest.call(paralaxApp);
		});

		self.$win.bind('scroll', function() {
			self.afterResize = false;
			self.loadScrollPosition();
			paralaxApp.renderRequest.call(paralaxApp);
		});
		

		self.loadConfig = function() {
			self.loadDimensions();
			self.loadScrollPosition();
		};

		self.setConfig = function(name, value) {
			delete this.config[name];
			this.config[name] = value;
		};

		self.getConfig = function(name) {
			if (typeof name === 'string' && name.length) {
				return self.config[name];
			} else {
				return self.config;
			}
		};

		self.loadConfig();

		return self;
	};









	$.fn.owlCarousel.Constructor.Plugins.Paralax = Paralax;

})(window.Zepto || window.jQuery, window, document);
