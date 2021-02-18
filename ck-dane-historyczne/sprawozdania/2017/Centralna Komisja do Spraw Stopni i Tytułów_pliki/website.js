(function() {
	function Contentia() {
		this.loadGoogleCallback = [];
		this.loadGoogleMapsCallback = [];
	}

	Contentia.prototype = {
		/**
		 * @type {boolean} Has the <script> tag been appended to head
		 */
		loadGoogleStarted : false,

		/**
		 * @type {boolean} Has the Google JSApi been loaded
		 */
		loadGoogleReady : false,

		/**
		 * @type {Array.<Function>} callbacks to call after loading Google JSApi
		 */
		loadGoogleCallback : undefined,

		/**
		 * @param {Function} callback Callback to call after library is loaded
		 * @return {undefined}
		 */
		loadGoogle : function(callback) {
			if (this.loadGoogleReady) {
				callback();
				return;
			}

			this.loadGoogleCallback.push(callback);
			//this.loadGoogleCallback.push(callbackMarkers);

			if (this.loadGoogleStarted) {
				return;
			}

			var self = this;
			window['jsapiLoadCallback'] = function() {
				self.loadGoogleReady = true;

				for (var i = 0; i < self.loadGoogleCallback.length; ++i) {
					self.loadGoogleCallback[i]();
				}

				self.loadGoogleCallback = [];
			}

			this.loadGoogleStarted = true;

			/**
			 * @type {Node} <script> tag to append into head
			 */
			script = document.createElement("script");
			script.src = "https://www.google.com/jsapi?callback=jsapiLoadCallback";
			script.type = "text/javascript";
			document.getElementsByTagName("head")[0].appendChild(script);
		},

/*

		loadGoogleMaps : function(callback) {
			this.loadGoogle(
				function() {
					google.load('maps', '3.9', {
						'other_params' : 'sensor=false&language=' + (window['displayLang'] || 'pl'),
						'callback' : callback
					});
				}
			);
		}

*/

		loadGoogleMapsStarted : false,
		loadGoogleMapsReady : false,
		loadGoogleMapsCallback : undefined,

		loadGoogleMaps : function(callback) {
			if (this.loadGoogleMapsReady) {
				callback();
				return;
			}

			var callbackMarkers = function() {
				var script = document.createElement("script");
				script.src = "/cdn/js/empty.js";//"https://googlemaps.github.io/js-marker-clusterer/src/markerclusterer.js";
				script.type = "text/javascript";
				script.onload = callback;
				document.getElementsByTagName("head")[0].appendChild(script);
			};

			//this.loadGoogleMapsCallback.push(callback);
			this.loadGoogleMapsCallback.push(callbackMarkers);

			if (this.loadGoogleMapsStarted) {
				return;
			}

			this.loadGoogleMapsStarted = true;

			var self = this;

			this.loadGoogle(
				function() {
					google.load('maps', '3.9', {
						'other_params' : 'sensor=false&language=' + (window['displayLang'] || 'pl'),
						'callback' : function() {
							self.loadGoogleMapsReady = true;

							for (var i = 0; i < self.loadGoogleMapsCallback.length; ++i) {
								self.loadGoogleMapsCallback[i]();
							}

							self.loadGoogleMapsCallback = [];
						}
					});
				}
			);
		}


	};

	window['Contentia'] = new Contentia;
})();(function($) {

	function ContentiaFormMap(_options) {
		this.options = $.extend({}, this.defaults, _options)

		this._findElements();

		var self = this;
		window['ContentiaGoogleLibrary']('maps', function() {
			self._create();
		});

	}

	ContentiaFormMap.prototype = {
		defaults : {
			"element" : undefined,
			"interface" : undefined,

			"mapTypeId": 'ROADMAP',

			"defaultValue" : {"latitude": 52.19766897515079, "longitude": 20.994190216064453, "zoom": 6}
		},

		map: null,

		elementMap : null,

		value : undefined,
		lastValue : undefined,

		_create : function() {
			this.googleMaps = window['google'].maps;

			this._bindEvents();

			this._loadValue(); // this.element.trigger('change');
		},

		_findElements: function() {

			this.element = $(this.options['element']);
			if (!this.element.length) {
				throw "ContentiaFormMap. Element not found.";
			}

			this.element.get(0).googlemap = this;

			this.interface = $(this.options['interface']);
			if (!this.interface.length) {
				throw "ContentiaFormMap. Interface not found.";
			}

			this.elementMap = {};

			this.elementMap.mapwindow = this.interface.find('.mapFieldWindow');

			this.elementMap['latitude'] = this.interface.find('.mapLatitude');
			this.elementMap['longitude'] = this.interface.find('.mapLongitude');
			this.elementMap['zoom'] = this.interface.find('.mapZoom');

			this.elementMap.geoCoder = this.interface.find('.geoCoder');
			this.elementMap.geoSearch = this.interface.find('.geoSearch');

			this.elementMap.mapShow = this.interface.find('.mapFieldShow');
			this.elementMap.mapHide = this.interface.find('.mapFieldHide');
		},


		_createMap: function() {
			var startValue = this.value || this.options['defaultValue'];

			var center = new this.googleMaps.LatLng(startValue['latitude'], startValue['longitude']);
			var zoom = startValue['zoom'];

			var mapOptions = {
				'center' : center,
				'mapTypeId' : this.googleMaps.MapTypeId[this.options['mapTypeId']],
				'zoom' : zoom
			};

			this.map = new this.googleMaps.Map(this.elementMap.mapwindow[0], mapOptions);

			this.marker = new this.googleMaps.Marker(
				{
					"position": this.center,
					"map": this.map,
					"draggable": true
				}
			);


			var self = this;

			this.googleMaps.event.addListener(this.map, 'zoom_changed', function(event) { self._mapZoomChangeCallback(event); });

			this.googleMaps.event.addListener(this.map, 'rightclick', function(event) { self._mapRightClickCallback(event); });

			this.googleMaps.event.addListener(this.marker, 'drag', function(event) { self._markerDragCallback(event); });
		},

		_mapRightClickCallback: function(event) {
			this._setLocation(event.latLng, true);
		},

		_markerDragCallback: function(event) {
			this._setLocation(event.latLng);
		},

		_mapZoomChangeCallback: function(event) {
			this._updateValue({'zoom' : this.map['getZoom']()});
		},





		_bindEvents: function() {
			var self = this;

			this.element.bind('change', function() { self._loadValue(); });
/*
			$(self.elementMap.latitude).bind('change', function() { self._updateLocation(); });
			$(self.elementMap.longitude).bind('change', function() { self._updateLocation(); });
			$(self.elementMap.zoom).bind('change', function() { self._updateLocation(); });
*/
			$(self.elementMap.mapShow).bind('click', function() { self._enable(); });
			$(self.elementMap.mapHide).bind('click', function() { self._disable(); });

			$(self.elementMap.geoSearch).bind('click', function() { self._search(); });
		},


		_saveValue: function() {
			this.element.val(this.value?window['JSON'].stringify(this.value):'');
		},

		_loadValue: function() {
			this.value = false;

			try {
				if (this.element.val()) {
					var v = window['JSON'].parse(this.element.val());

					this.value = v;

					for (var i in v) {
						if (this.elementMap[i]) {
							this.elementMap[i].val(v[i]);
						}
					}
				}
			} catch (e) {
				console.debug("Unable to parse value.", this.element.val(), e);
			}

			this._updateInterface();
		},

		_updateValue : function(values) {
			if (!this.value) {
				return;
			}

			$.extend(this.value, values);

			for (var i in values) {
				if (this.elementMap[i]) {
					this.elementMap[i].val(values[i]);
				}
			}

			this._saveValue();
		},




		_setLocation: function(geoLocation, updateMarker) {
			console.log('geoLocation', geoLocation);
			this._updateValue({'latitude' : geoLocation['lat'](), 'longitude' : geoLocation['lng']()});

			if (updateMarker) {
				this.marker['setPosition'](geoLocation);
			}
		},



/*
		_updateLocation: function() {
			var latitude = this.elementMap.latitude.val();
			var longitude = this.elementMap.longitude.val();

			if (latitude != '' && longitude != '') {
				this.geoPos = new this.googleMaps['LatLng'](latitude, longitude);

				if (this.map) {
					this.map['setCenter'](this.geoPos);
					this.marker['setPosition'](this.geoPos);
				}
			}

			var zoom = this.elementMap.zoom.val();
			if (zoom != '') {
				var newZoom = parseInt(zoom, 10);

				if (newZoom != this.geoZoom) {
					this.geoZoom = newZoom;
					if (this.map) {
						this.map['setZoom'](this.geoZoom);
					}
				}
			}
		},
*/



		geocoder : null,

		_search: function() {
			if (!this.value) return;

			var self = this;

			if (!this.geocoder) {
				this.geocoder = new this.googleMaps['Geocoder']();
			}

			var address = self.elementMap.geoCoder.val();
			if (address == '') {
				console.debug("Nothing to search for.");
				return;
			}

			self.geocoder.geocode( { 'address': address }, function(results, status) {
				if (status == self.googleMaps.GeocoderStatus.OK) {
					var resultItem = results[0]['geometry'];

					self._setLocation(resultItem['location'], true);

					if (resultItem['viewport']) {
						self.map['fitBounds'](resultItem['viewport']);
					} else {
						self.map['setCenter'](resultItem['location']);
					}

					return;
				}

				console.log("ContentiaFormMap. Geocode failed.", status);
			});
		},

		_disable : function() {
			if (this.value) {
				this.lastValue = this.value;
			}
			this.value = false;
			this._saveValue();

			this._updateInterface();
		},

		_enable : function() {
			this.value = this.value || this.lastValue || this.options['defaultValue'];
			this._saveValue();

			this._updateInterface();
		},

		_updateInterface : function() {
			if (!this.map) {
				this._createMap();
			}

			if (this.value) {
				this.elementMap['latitude'].prop('disabled', false);
				this.elementMap['longitude'].prop('disabled', false);
				this.elementMap['zoom'].prop('disabled', false);

				this.elementMap.geoCoder.prop('disabled', false);

				var center = new this.googleMaps['LatLng'](this.value['latitude'], this.value['longitude']);
				this.map['setZoom'](this.value.zoom);

				this.map['setCenter'](center);
				this.marker['setPosition'](center);

				this.marker.setMap(this.map);
			} else {
				this.elementMap['latitude'].prop('disabled', true).val('');
				this.elementMap['longitude'].prop('disabled', true).val('');
				this.elementMap['zoom'].prop('disabled', true).val('');
				this.elementMap.geoCoder.prop('disabled', true).val('');

				this.marker['setMap'](null);
			}
		}
	};

	window['ContentiaFormMap'] = ContentiaFormMap;


})(jQuery);
(function( ){
	/**
	 * @type {Array.<Function>} callbacks to call after loading Google JSApi
	 */
 	var libraryCallbacks = [];

	/**
	 * @type {boolean} Has the <script> tag been appended to head
	 */
	var libraryLoadStarted = false;

	/**
	 * @type {boolean} Has the Google JSApi been loaded
	 */
	var libraryLoaded = false;


	/**
	 * @param {Function} callback Callback to call after library is loaded
	 * @return {undefined}
	 */
	function loadMainLibrary(callback) {
		if (libraryLoaded) {
			callback();
			return;
		}

		libraryLoadStarted = true;
		libraryCallbacks.push(callback);

		window['jsapiLoadCallback'] = function() {
			libraryLoaded = true;

			for (var i = 0; i < libraryCallbacks.length; ++i) {
				libraryCallbacks[i]();
			}
			libraryCallbacks = null;
		}

		/**
		 * @type {Node} <script> tag to append into head
		 */
		var script = document.createElement("script");
		script.src = "https://www.google.com/jsapi?callback=jsapiLoadCallback";
		script.type = "text/javascript";
		document.getElementsByTagName("head")[0].appendChild(script);
	}


	function loadGoogleLibrary(type, callback) {
		switch (type) {
			case 'maps':
				loadGoogleMaps(callback);
				break;
		}
	}

	function loadGoogleMaps(callback) {
		loadMainLibrary(
			function() {
				google.load('maps', '3.9', {
					'other_params' : 'sensor=false&language=' + (window['displayLang'] || 'pl'),
					'callback' : callback
				});
			}
		);
	}

	window['ContentiaGoogleLibrary'] = loadGoogleLibrary;

})();
/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
	if (!window.console) {
		window.console = {};
	}
	// union of Chrome, FF, IE, and Safari console methods
	var m = [
		"log", "info", "warn", "error", "debug", "trace", "dir", "group",
		"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
		"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
	];
	// define undefined methods as noops to prevent errors
	for (var i = 0; i < m.length; i++) {
		if (!window.console[m[i]]) {
			window.console[m[i]] = function() {};
		}
	}
})();
/** @license 
 * jQuery lightBox plugin
 * This jQuery plugin was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * @name jquery-lightbox-0.5.js
 * @author Leandro Vieira Pinho - http://leandrovieira.com
 * @version 0.5
 * @date April 11, 2008
 * @category jQuery plugin
 * @copyright (c) 2008 Leandro Vieira Pinho (leandrovieira.com)
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/deed.en_US
 * @example Visit http://leandrovieira.com/projects/jquery/lightbox/ for more informations about this jQuery plugin
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function($) {
	/**
	 * $ is an alias to jQuery object
	 *
	 */
	$.fn['lightBox'] = function(settings) {
		// Settings to configure the jQuery lightBox plugin how you like
		settings = jQuery.extend({
			// Configuration related to overlay
			'overlayBgColor': 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			'overlayOpacity':			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
			// Configuration related to navigation
			'fixedNavigation':		false,		// (boolean) Boolean that informs if the navigation (next and prev button) will be fixed or not in the interface.
			// Configuration related to images
			'imageLoading':			false,		// (string) Path and the name of the loading icon
			'imageBtnPrev':			false,			// (string) Path and the name of the prev button image
			'imageBtnNext':			false,			// (string) Path and the name of the next button image
			'imageBtnClose':			false,		// (string) Path and the name of the close btn
			'imageBlank':				false,			// (string) Path and the name of a blank image (one pixel)
			// Configuration related to container image box
			'containerBorderSize':	10,			// (integer) If you adjust the padding in the CSS for the container, #lightbox-container-image-box, you will need to update this value
			'containerResizeSpeed':	400,		// (integer) Specify the resize duration of container image. These number are miliseconds. 400 is default.
			// Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
			'txtImage':				'Image',	// (string) Specify text "Image"
			'txtOf':					'of',		// (string) Specify text "of"
			// Configuration related to keyboard navigation
			'keyToClose':				'c',		// (string) (c = close) Letter to close the jQuery lightBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			'keyToPrev':				'p',		// (string) (p = previous) Letter to show the previous image
			'keyToNext':				'n',		// (string) (n = next) Letter to show the next image.
			// Don´t alter these variables in any way
			'imageArray':				[],
			'activeImage':			0
		},settings);
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
		
		var viewPortDimensions = ___getPageSize(); // Added by Sunimal Kaluarachchi to obtain Width and Height of current computer's screen (Viewport)
		
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}
		/**
		 * Start the jQuery lightBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			// Unset total images in imageArray
			settings['imageArray'].length = 0;
			// Unset image active information
			settings['activeImage'] = 0;
			// We have an image set? Or just an image? Let´s see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings['imageArray'].push(new Array(objClicked.getAttribute('rel'),objClicked.getAttribute('title')));
			} else {
				// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the images references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings['imageArray'].push(new Array(jQueryMatchedObj[i].getAttribute('rel'),jQueryMatchedObj[i].getAttribute('title')));
				}
			}
			while ( settings['imageArray'][settings['activeImage']][0] != objClicked.getAttribute('rel') ) {
				settings['activeImage']++;
			}
			// Call the function that prepares image exibition
			_set_image_to_view();
		}
		/**
		 * Create the jQuery lightBox plugin interface
		 *
		 * The HTML markup will be like that:
			<div id="jquery-overlay"></div>
			<div id="jquery-lightbox">
				<div id="lightbox-container-image-box">
					<div id="lightbox-container-image">
						<img src="../fotos/XX.jpg" id="lightbox-image">
						<div id="lightbox-nav">
							<a href="#" id="lightbox-nav-btnPrev"></a>
							<a href="#" id="lightbox-nav-btnNext"></a>
						</div>
						<div id="lightbox-loading">
							<a href="#" id="lightbox-loading-link">
								<img src="../images/lightbox-ico-loading.gif">
							</a>
						</div>
					</div>
				</div>
				<div id="lightbox-container-image-data-box">
					<div id="lightbox-container-image-data">
						<div id="lightbox-image-details">
							<span id="lightbox-image-details-caption"></span>
							<span id="lightbox-image-details-currentNumber"></span>
						</div>
						<div id="lightbox-secNav">
							<a href="#" id="lightbox-secNav-btnClose">
								<img src="../images/lightbox-btn-close.gif">
							</a>
						</div>
					</div>
				</div>
			</div>
		 *
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<div id="jquery-overlay"></div><div id="jquery-lightbox"><div id="lightbox-container-image-box"><div id="lightbox-container-image"><img id="lightbox-image"><div style="" id="lightbox-nav"><a href="#" id="lightbox-nav-btnPrev"></a><a href="#" id="lightbox-nav-btnNext"></a></div><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"><img src="' + settings['imageLoading'] + '"></a></div></div></div><div id="lightbox-container-image-data-box"><div id="lightbox-container-image-data"><div id="lightbox-image-details"><span id="lightbox-image-details-caption"></span><span id="lightbox-image-details-currentNumber"></span></div><div id="lightbox-secNav"><a href="#" id="lightbox-secNav-btnClose"><img src="' + settings['imageBtnClose'] + '"></a></div></div></div></div>');	
			// Get page sizes
			var arrPageSizes = ___getPageSize();
			// Style overlay and show it
			$('#jquery-overlay').css({
				backgroundColor:	settings['overlayBgColor'],
				opacity:			settings['overlayOpacity'],
				width:				arrPageSizes[0],
				height:				arrPageSizes[1]
			}).fadeIn();
			// Get page scroll
			var arrPageScroll = ___getPageScroll();
			// Calculate top and left offset for the jquery-lightbox div object and show it
			$('#jquery-lightbox').css({
				
				
				// top: Display lightbox 5% of viewport size. Eg: if Viewport height is 653px, then the lightbox will be displayed 5% of the Viewport Height from top. 5% of Viewport height is around 32px. So the lightbox will be displayed 32px down from the "top" -   Sunimal Kaluarachchi 
				top:	arrPageScroll[1] + (arrPageSizes[3] * (5/100)),
				
				//top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
				left:	arrPageScroll[0]
			}).show();
			// Assigning click events in elements to close overlay
			$('#jquery-overlay,#jquery-lightbox').click(function() {
				_finish();									
			});
			// Assign the _finish function to lightbox-loading-link and lightbox-secNav-btnClose objects
			$('#lightbox-loading-link,#lightbox-secNav-btnClose').click(function() {
				_finish();
				return false;
			});
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
				// Get page sizes
				var arrPageSizes = ___getPageSize();
				// Style overlay and show it
				$('#jquery-overlay').css({
					width:		arrPageSizes[0],
					height:		arrPageSizes[1]
				});
				// Get page scroll
				var arrPageScroll = ___getPageScroll();
				// Calculate top and left offset for the jquery-lightbox div object and show it
				$('#jquery-lightbox').css({
				
					// top: Display lightbox 5% of viewport size. Eg: if Viewport height is 653px, then the lightbox will be displayed 5% of the Viewport Height from top. 5% of Viewport height is around 32px. So the lightbox will be displayed 32px down from the "top" - IF User has scrolled down -   Sunimal Kaluarachchi 
					top:	arrPageScroll[1] + (arrPageSizes[3] * (5/100)),
				
					//top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
					left:	arrPageScroll[0]
				});
			});
		}
		/**
		 * Prepares image exibition; doing a image´s preloader to calculate it´s size
		 *
		 */
		function _set_image_to_view() { // show the loading
			// Show the loading
			$('#lightbox-loading').show();
			if ( settings['fixedNavigation'] ) {
				$('#lightbox-image,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();
			} else {
				// Hide some elements
				$('#lightbox-image,#lightbox-nav,#lightbox-nav-btnPrev,#lightbox-nav-btnNext,#lightbox-container-image-data-box,#lightbox-image-details-currentNumber').hide();
			}
			// Image preload process
			var objImagePreloader = new Image();
			objImagePreloader.onload = function() {
				$('#lightbox-image').attr('src',settings['imageArray'][settings['activeImage']][0]);
				
				var arrNewImgDimension = ___calculateImageDimension(viewPortDimensions[2], viewPortDimensions[3], objImagePreloader.width, objImagePreloader.height); // Sunimal Kaluarachchi

				
				
				// Perfomance an effect in the image container resizing it
				//_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);
				
				_resize_container_image_box(arrNewImgDimension[0],arrNewImgDimension[1]); // Arguments added by Sunimal Kaluarachchi

				
				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			};
			objImagePreloader.src = settings['imageArray'][settings['activeImage']][0];
		};
		/**
		 * Perfomance an effect in the image container resizing it
		 *
		 * @param integer intImageWidth The image´s width that will be showed
		 * @param integer intImageHeight The image´s height that will be showed
		 */
		function _resize_container_image_box(intImageWidth,intImageHeight) {
			// Get current width and height
			var intCurrentWidth = $('#lightbox-container-image-box').width();
			var intCurrentHeight = $('#lightbox-container-image-box').height();
			// Get the width and height of the selected image plus the padding
			var intWidth = (intImageWidth + (settings['containerBorderSize'] * 2)); // Plus the image´s width and the left and right padding value
			var intHeight = (intImageHeight + (settings['containerBorderSize'] * 2)); // Plus the image´s height and the left and right padding value
			// Diferences
			var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;
			
			
			$('#lightbox-image').height(intImageHeight);   // Sunimal Kaluarachchi
			$('#lightbox-image').width(intImageWidth); 	// Sunimal Kaluarachchi 

			
			
			// Perfomance the effect
			$('#lightbox-container-image-box').animate({ width: intWidth, height: intHeight },settings['containerResizeSpeed'],function() { _show_image(); });
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( $.browser.msie ) {
					___pause(250);
				} else {
					___pause(100);	
				}
			} 
			$('#lightbox-container-image-data-box').css({ width: intImageWidth });
			$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({ height: intImageHeight + (settings['containerBorderSize'] * 2) });
		};
		/**
		 * Show the prepared image
		 *
		 */
		function _show_image() {
			$('#lightbox-loading').hide();
			$('#lightbox-image').fadeIn(function() {
				_show_image_data();
				_set_navigation();
			});
			_preload_neighbor_images();
		};
		/**
		 * Show the image information
		 *
		 */
		function _show_image_data() {
			$('#lightbox-container-image-data-box').slideDown('fast');
			$('#lightbox-image-details-caption').hide();
			if ( settings['imageArray'][settings['activeImage']][1] ) {
				$('#lightbox-image-details-caption').html(settings['imageArray'][settings['activeImage']][1]).show();
			}
			// If we have a image set, display 'Image X of X'
			if ( settings['imageArray'].length > 1 ) {
				$('#lightbox-image-details-currentNumber').html(settings['txtImage'] + ' ' + ( settings['activeImage'] + 1 ) + ' ' + settings['txtOf'] + ' ' + settings['imageArray'].length).show();
			}		
		}
		/**
		 * Display the button navigations
		 *
		 */
		function _set_navigation() {
			$('#lightbox-nav').show();

			// Instead to define this configuration in CSS file, we define here. And it´s need to IE. Just.
			$('#lightbox-nav-btnPrev,#lightbox-nav-btnNext').css({ 'background' : 'transparent url(' + settings['imageBlank'] + ') no-repeat' });
			
			// Show the prev button, if not the first image in set
			if ( settings['activeImage'] != 0 ) {
				if ( settings['fixedNavigation'] ) {
					$('#lightbox-nav-btnPrev').css({ 'background' : 'url(' + settings['imageBtnPrev'] + ') left 15% no-repeat' })
						.unbind()
						.bind('click',function() {
							settings['activeImage'] = settings['activeImage'] - 1;
							_set_image_to_view();
							return false;
						});
				} else {
					// Show the images button for Next buttons
					$('#lightbox-nav-btnPrev').unbind().hover(function() {
						$(this).css({ 'background' : 'url(' + settings['imageBtnPrev'] + ') left 15% no-repeat' });
					},function() {
						$(this).css({ 'background' : 'transparent url(' + settings['imageBlank'] + ') no-repeat' });
					}).show().bind('click',function() {
						settings['activeImage'] = settings['activeImage'] - 1;
						_set_image_to_view();
						return false;
					});
				}
			}
			
			// Show the next button, if not the last image in set
			if ( settings['activeImage'] != ( settings['imageArray'].length -1 ) ) {
				if ( settings['fixedNavigation'] ) {
					$('#lightbox-nav-btnNext').css({ 'background' : 'url(' + settings['imageBtnNext'] + ') right 15% no-repeat' })
						.unbind()
						.bind('click',function() {
							settings['activeImage'] = settings['activeImage'] + 1;
							_set_image_to_view();
							return false;
						});
				} else {
					// Show the images button for Next buttons
					$('#lightbox-nav-btnNext').unbind().hover(function() {
						$(this).css({ 'background' : 'url(' + settings['imageBtnNext'] + ') right 15% no-repeat' });
					},function() {
						$(this).css({ 'background' : 'transparent url(' + settings['imageBlank'] + ') no-repeat' });
					}).show().bind('click',function() {
						settings['activeImage'] = settings['activeImage'] + 1;
						_set_image_to_view();
						return false;
					});
				}
			}
			// Enable keyboard navigation
			_enable_keyboard_navigation();
		}
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}
		/**
		 * Disable the support to keyboard navigation
		 *
		 */
		function _disable_keyboard_navigation() {
			$(document).unbind();
		}
		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if ( objEvent == null ) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			} else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			// Verify the keys to close the ligthBox
			if ( ( key == settings['keyToClose'] ) || ( key == 'x' ) || ( keycode == escapeKey ) ) {
				_finish();
			}
			// Verify the key to show the previous image
			if ( ( key == settings['keyToPrev'] ) || ( keycode == 37 ) ) {
				// If we´re not showing the first image, call the previous
				if ( settings['activeImage'] != 0 ) {
					settings['activeImage'] = settings['activeImage'] - 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
			// Verify the key to show the next image
			if ( ( key == settings['keyToNext'] ) || ( keycode == 39 ) ) {
				// If we´re not showing the last image, call the next
				if ( settings['activeImage'] != ( settings['imageArray'].length - 1 ) ) {
					settings['activeImage'] = settings['activeImage'] + 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
		}
		/**
		 * Preload prev and next images being showed
		 *
		 */
		function _preload_neighbor_images() {
			if ( (settings['imageArray'].length -1) > settings['activeImage'] ) {
				objNext = new Image();
				objNext.src = settings['imageArray'][settings['activeImage'] + 1][0];
			}
			if ( settings['activeImage'] > 0 ) {
				objPrev = new Image();
				objPrev.src = settings['imageArray'][settings['activeImage'] -1][0];
			}
		}
		/**
		 * Remove jQuery lightBox plugin HTML markup
		 *
		 */
		function _finish() {
			$('#jquery-lightbox').remove();
			$('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });
		}
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
				pageWidth = xScroll;		
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		};
		/**
		 / THIRD FUNCTION
		 * getPageScroll() by quirksmode.com
		 *
		 * @return Array Return an array with x,y page scroll values.
		 */
		function ___getPageScroll() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		};
		
		
		
		
		
		// Most important function '___calculateImageDimension'. This will resize the image height and width to fit into the
		// screen (Viewport) without losing the aspect ratio - Sunimal Kaluarachchi
		function ___calculateImageDimension(viewPortWidth, viewPortHeight, imageWidth, imageHeight)  
		{
			// obtain 82% of ViewPort Height
			var viewPortHeightPercent = viewPortHeight * (82/100);
			
			var newImageHeight = imageHeight;
			var newImageWidth = imageWidth;
			var newViewPortWidth = viewPortWidth;
			var scaleHeight =0;
			var scaleWidth = 0;
			
			if ( newViewPortWidth > viewPortHeight ) // if viewport width > viewport height
			{
				// Get 80% of current viewport width so the image width will be displayed within this 80% of viewport width size
				newViewPortWidth = viewPortWidth * (80/100);
			}
			
			// image width check
			if ( newImageWidth > newViewPortWidth )
			{
				newImageWidth = newViewPortWidth;				
				scaleWidth = imageHeight/imageWidth;				
				newImageHeight = scaleWidth * newImageWidth;				
			}
			// image height check
			if ( newImageHeight > viewPortHeightPercent )
			{
				newImageHeight = viewPortHeightPercent;				
				//calculate scale to set width
				scaleHeight = imageWidth/imageHeight;				
				newImageWidth = scaleHeight * newImageHeight;	
			}
			arrayNewImageSize = new Array(newImageWidth,newImageHeight);
			return arrayNewImageSize;			
		}
		
		
		
		
		 /**
		  * Stop the code execution from a escified time in milisecond
		  *
		  */
		 function ___pause(ms) {
			var date = new Date(); 
			curDate = null;
			do { var curDate = new Date(); }
			while ( curDate - date < ms);
		 };
		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
})(jQuery); // Call and execute the function immediately passing the jQuery object

// Storage polyfill by Remy Sharp
// https://gist.github.com/350433
// Needed for IE7-

// Dependencies:
//  JSON (use json2.js if necessary)

// Tweaks by Joshua Bell (inexorabletash@gmail.com)
//  * URI-encode item keys
//  * Use String() for stringifying
//  * added length

if (!window.localStorage || !window.sessionStorage) (function() {

    var Storage = function(type) {
        function createCookie(name, value, days) {
            var date, expires;

            if (days) {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        }

        function readCookie(name) {
            var nameEQ = name + "=",
                ca = document.cookie.split(';'),
                i, c;

            for (i = 0; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }

                if (c.indexOf(nameEQ) == 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }

        function setData(data) {
            data = JSON.stringify(data);
            if (type == 'session') {
                window.name = data;
            } else {
                createCookie('localStorage', data, 365);
            }
        }

        function clearData() {
            if (type == 'session') {
                window.name = '';
            } else {
                createCookie('localStorage', '', 365);
            }
        }

        function getData() {
            var data = type == 'session' ? window.name : readCookie('localStorage');
            return data ? JSON.parse(data) : {};
        }


        // initialise if there's already data
        var data = getData();

        function numKeys() {
            var n = 0;
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    n += 1;
                }
            }
            return n;
        }

        return {
            clear: function() {
                data = {};
                clearData();
                this.length = numKeys();
            },
            getItem: function(key) {
                key = encodeURIComponent(key);
                return data[key] === undefined ? null : data[key];
            },
            key: function(i) {
                // not perfect, but works
                var ctr = 0;
                for (var k in data) {
                    if (ctr == i) return decodeURIComponent(k);
                    else ctr++;
                }
                return null;
            },
            removeItem: function(key) {
                key = encodeURIComponent(key);
                delete data[key];
                setData(data);
                this.length = numKeys();
            },
            setItem: function(key, value) {
                key = encodeURIComponent(key);
                data[key] = String(value);
                setData(data);
                this.length = numKeys();
            },
            length: 0
        };
    };

    if (!window.localStorage) window.localStorage = new Storage('local');
    if (!window.sessionStorage) window.sessionStorage = new Storage('session');

})();
var converto = {

	convertString : function ( cfg  , canvas , ctx ){
		ctx.font  = cfg.style + ' ' + cfg.size + ' ' + cfg.font;
		ctx.fillStyle = (cfg.color != undefined )? cfg.color : ' black';
		ctx.textAlign = "center";
		ctx.fillText(cfg.string , cfg.x , cfg.y);

		ctx.lineWidth = (cfg.strokeWidth != undefined ) ? cfg.strokeWidth : 0;
		ctx.strokeStyle = (cfg.strokeColor != undefined ) ? cfg.strokeColor : cfg.color;
		ctx.strokeText(cfg.string , cfg.x , cfg.y);
		
		return converto.getUrl(canvas , cfg.type);
	},

	init : function (callback , cfg ){
		$('#' + cfg.particle.canvasId).width = cfg.particle.canvasWidth;
		$('#' + cfg.particle.canvasId).height = cfg.particle.canvasHeight;

		var canvas = document.createElement('canvas');
		canvas.width = cfg.particle.canvasWidth;
		canvas.height = cfg.particle.canvasHeight;
		//document.body.appendChild(canvas);
		var ctx = canvas.getContext('2d');

		if(callback && cfg){
			return callback(cfg , canvas , ctx);
		}else{
			console.log('No callback');
		}
		
	},

	getUrl : function (canvas , type){
		return canvas.toDataURL(type);
	}

};
/* Polish initialisation for the jQuery UI date picker plugin. */
/* Written by Jacek Wysocki (jacek.wysocki@gmail.com). */
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "../widgets/datepicker" ], factory );
	} else {

		// Browser globals
		factory( jQuery.datepicker );
	}
}( function( datepicker ) {

datepicker.regional.pl = {
	closeText: "Zamknij",
	prevText: "&#x3C;Poprzedni",
	nextText: "NastÄ™pny&#x3E;",
	currentText: "DziÅ›",
	monthNames: [ "StyczeÅ„","Luty","Marzec","KwiecieÅ„","Maj","Czerwiec",
	"Lipiec","SierpieÅ„","WrzesieÅ„","PaÅºdziernik","Listopad","GrudzieÅ„" ],
	monthNamesShort: [ "Sty","Lu","Mar","Kw","Maj","Cze",
	"Lip","Sie","Wrz","Pa","Lis","Gru" ],
	dayNames: [ "Niedziela","PoniedziaÅ‚ek","Wtorek","Åšroda","Czwartek","PiÄ…tek","Sobota" ],
	dayNamesShort: [ "Nie","Pn","Wt","Åšr","Czw","Pt","So" ],
	dayNamesMin: [ "N","Pn","Wt","Åšr","Cz","Pt","So" ],
	weekHeader: "Tydz",
	dateFormat: "dd.mm.yy",
	firstDay: 1,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: "" };
datepicker.setDefaults( datepicker.regional.pl );

return datepicker.regional.pl;

} ) );
(function( ){
	/**
	 * @constructor
	 */
	function gPointMap(_element, _optionCallback) {
		this.element = _element;
		if (!this.element) {
			throw "gPointMap::gPointMap Element required.";
		}

		this.optionCallback = _optionCallback;

		var self = this;
		window['Contentia'].loadGoogleMaps(
			function() {
				self._init();
			}
		);
	}

	gPointMap.gmapLoadStage = 0;
	gPointMap.gmapLoadCallback = [];


	gPointMap.prototype = {
		/**
		 * @type {Node}
		 */
		element : null,

		defaults : {

		},

		_init : function() {
			// Simple extend
			this.options = $.extend({}, this.defaults, this.optionCallback());

			this._createMap();

			this._createMarker();

			this._createInfoBox();

			if (this.options['ready']) {
				this.options['ready'].apply(this);
			}
		},


		/**
		 * @type {google.maps.Map}
		 */
		map : null,

		_createMap : function() {
			if (!this.options['mapOptions']) {
				throw "gPointMap::_createMap mapOptions are required.";
			}

			var mapOptions = /** @type {google.maps.MapOptions} */({});
			mapOptions['zoom'] = 7;

			$.extend(mapOptions, this.options['mapOptions']);

			this.map = new google.maps.Map(this.element, mapOptions);
		},

		/**
		 * @type {google.maps.Marker}
		 */
		markerItem: null,

		_createMarker : function() {
			if (!this.options['markerOptions']) return;

			var markerOptions = /** @type {google.maps.MarkerOptions} */({});

			markerOptions['map'] = this.map;
			markerOptions['position'] = this.options['mapOptions']['center'];
			markerOptions['draggable'] = false;

			if (this.options['markerOptions'] !== true) $.extend(markerOptions, this.options['markerOptions']);

			this.markerItem = new google.maps.Marker(markerOptions);

			var self = this;
			google.maps.event.addListener(this.markerItem, "click",
				function() {
					self._markerClicked();
				}
			);
		},

		_markerClicked : function() {
			if (!this.infoBox) return;

			if (this.infoBoxVisible) {
				this.infoBox.close();
				this.infoBoxVisible = false;
				return;
			}
			this.infoBox.open(this.map);
			this.infoBoxVisible = true;
		},


		/**
		 * @type {google.maps.InfoWindow}
		 */
		infoBox : null,

		/**
		 * @type {boolean}
		 */
		infoBoxVisible : false,

		/**
		 * Prepare InfoWindow for later use
		 * @return {undefined}
		 */
		_createInfoBox : function() {
			if (!this.options['infowindowOptions']) {
				return;
			}

			if (!this.markerItem) {
				throw "gPointMap::_createInfoBox InfoWindow requires a marker.";
			}

			var infowindowOptions = {
				'position' : this.markerItem.getPosition(),
			};

			$.extend(infowindowOptions, this.options['infowindowOptions']);

			this.infoBox = new google.maps.InfoWindow(infowindowOptions);

			var self = this;
			google.maps.event.addListener(this.infoBox, "closeclick", function() {
				self.infoBoxVisible = false;
			});
		},


		/**
		 * @type {google.maps.DirectionsService}
		 */
		gDirections : null,

		/**
		 * @param {string} searchString Origin address
		 * @return {boolean}
		 */
		_search : function(searchString) {
			this._clearMessage();

			if (this.infoBox) {
				this.infoBox.close();
				this.infoBoxVisible = false;
			}

			if (!searchString) {
				// TODO: Display Notice?
				return false;
			}

			/**
			 * @type {google.maps.DirectionsRequest}
			 */
 			var request = new google.maps.DirectionsRequest();
			request['origin'] = searchString;
			request['destination'] = this.markerItem.getPosition();
			request['travelMode'] = google.maps.TravelMode.DRIVING;

			if (this.options['directionsrequestOptions']) $.extend(DirectionsRequest, this.options['directionsrequestOptions']);

	// Initialize Route Search
			if (!this.gDirections) {
				this.gDirections = new google.maps.DirectionsService();
			}

			var self = this;
			this.gDirections.route(request, function(response, status) { self._searchCallback(response, status); } );

			return true;
		},

		/**
		 * @type {google.maps.DirectionsRenderer}
		 */
		dirRenderer : null,


		/**
		 * @param {google.maps.DirectionsResult} response
		 * @param {google.maps.DirectionsStatus} status
		 * @return {undefined}
		 */
		_searchCallback : function(response, status) {
	// Display Info.
			switch (status) {
				case google.maps.DirectionsStatus.INVALID_REQUEST :
					this._setMessage("The KmlLayer is invalid.");
					return;
				case google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED :
					this._setMessage("Too many DirectionsWaypoint s were provided in the DirectionsRequest .");
					return;
				case google.maps.DirectionsStatus.NOT_FOUND :
					this._setMessage("At least one of the origin, destination, or waypoints could not be geocoded.");
					return;
				case google.maps.DirectionsStatus.OK :
					break;
				case google.maps.DirectionsStatus.OVER_QUERY_LIMIT :
					this._setMessage("The webpage has gone over the requests limit in too short a period of time.");
					return;
				case google.maps.DirectionsStatus.REQUEST_DENIED :
					this._setMessage("The webpage is not allowed to use the geocoder.");
					return;
				case google.maps.DirectionsStatus.UNKNOWN_ERROR :
					this._setMessage("The request could not be successfully processed, yet the exact reason for failure is unknown.");
					return;
				case google.maps.DirectionsStatus.ZERO_RESULTS :
					this._setMessage("There are no nearby panoramas.");
					return;
			}

			// Hide Marker?
			if (this.markerItem) this.markerItem.setMap(null);

			if (this.options['searchSuccess']) this.options['searchSuccess'].apply(this);

			if (!this.dirRenderer) {

				/**
				 * @type {google.maps.DirectionsRendererOptions}
				 */
				var renderOptions = new google.maps.DirectionsRendererOptions();
				renderOptions['map'] = this.map;
				renderOptions['draggable'] = true;

				if (this.options['renderOptions']) $.extend(renderOptions, this.options['renderOptions']);

				this.dirRenderer = new google.maps.DirectionsRenderer(renderOptions);
			}

			this.dirRenderer.setDirections(response);
		},

		_clearMessage : function() {
		},

		/**
		 *
		 * @param {string} msg Message to display
		 * @return {undefined}
		 */
		_setMessage : function(msg) {
			alert(msg);
		},


		_repaint : function() {
			google.maps.event.trigger(this.map, 'resize');
		}

	};

	gPointMap.prototype['search'] = gPointMap.prototype._search;
	gPointMap.prototype['repaint'] = gPointMap.prototype._repaint;
	gPointMap.prototype['getMap'] = function() { return this.map; };

	window['gPointMap'] = gPointMap;
})();


(function($) {
	$().ready(
		function() {
			$('.wysiwygmap').each(
				function() {
					var s = $(this);

					var mapData = s.data('mapinfo');
					if (!mapData) {
						s.replaceWith('<!-- MAP ERROR: ' + this.parentNode.innerHTML + ' -->');
						return;
					}

					if (typeof(mapData) !== 'object') {
						s.replaceWith('<!-- MAP ERROR: DataNotObject "' + this.parentNode.innerHTML + '" -->');
						return;
					}

					var map = document.createElement('div');

					$.each(['align', 'class', 'dir', 'id', 'lang', 'style', 'tabindex', 'title'], function(key, attrname) {
						$(map).attr(attrname, s.attr(attrname));
					});

					s.replaceWith(map);

					var options = function() {
						var opts = {};
						opts['mapOptions'] = {
							'center' : new google.maps.LatLng(mapData['latitude'], mapData['longitude']),
							'zoom' : parseInt(mapData['mapzoom'], 10) || 7
						};
						opts['markerOptions'] = true;
						if (mapData['infobox']) {
							opts['infowindowOptions'] = {
								'content' : mapData['infobox']
							};
						}
						return opts;
					};


					new window['gPointMap'](map, options);
				}
			);
		}
	);
})(jQuery);(function( $ ){

	function HoverBoxes(_element, _options) {
		this.options = {
			"hoverBox" : '.hoverBox',
			"nohoverBox" : '.nohoverBox'
		};

		if (_options) {
			$.extend(this.options, _options);
		}

		this.element = _element;

		this._create();
	}

	HoverBoxes.prototype = {
		_create: function() {
			this.e_noHover = this.element.find(this.options.nohoverBox);
			this.e_withHover = this.element.find(this.options.hoverBox);

			var self = this;

			$(this.element).hover(
				function() {
					self.e_noHover.hide();
					self.e_withHover.show();
				},
				function() {
					self.e_noHover.show();
					self.e_withHover.hide();
				}
			);
		}
	};

	$.fn.hoverBoxes = function(_options) {
		this.each(
			function() {
				this._hoverBoxes = new HoverBoxes($(this), _options);
			}
		);
	};

})( jQuery );
var JMC = JMC || {};

(function(wnd, doc, $, NS_JMC, undefined) {

	function password(options) {
		this.options = $.extend({}, this.defaults, options);

		this._init();
		/* return null; */

		return this._api;
	}

	password.prototype = {
		defaults : {
			passInput: $('.pass-input'),
			passRepeatInput: $('.pass-repeat-input'),
			showHidePass: $('.show-hide-pass'),
			generatePass: $('.generate-pass'),
			progressBar: $('.progress-bar-pass'),
			singleBar: false,
			tooltips: true,
			ajaxUrl: false,
			lang: false,
			accountId: false,
			asJs: true,
		},

		_init : function() {
			console.log('init password script');

			this._initGenerate();
			this._initProgressBar();
			this._initOnPassChange();
			this._initShowHide();
			this._initTooltips();
		},

		_initTooltips : function() {
			if (this.options.tooltips) {
				this.options.showHidePass.tooltip();
				this.options.generatePass.tooltip();
			}
		},

		_initShowHide : function() {
			var self = this;

			this.options.showHidePass.on('click', function(event, forceState) {
				console.log('event.data', event);

				forceState = typeof forceState == 'string' ? forceState : false;

				if (self.options.passInput.get(0).type == 'password' || forceState == 'show') {
					self.options.passInput.get(0).type = 'text';
					self.options.passRepeatInput.get(0).type = 'text';
					self.options.showHidePass.removeClass('fa-eye').addClass('fa-eye-slash');
				} else {
					self.options.passInput.get(0).type = 'password';
					self.options.passRepeatInput.get(0).type = 'password';
					self.options.showHidePass.removeClass('fa-eye-slash').addClass('fa-eye');
				}
			});
		},

		_initProgressBar : function() {

		},

		_setProgressBar : function(complexity) {
			if (this.options.progressBar.length) {
				var weak = this.options.progressBar.find('.weak');
				var medium = this.options.progressBar.find('.medium');
				var strong = this.options.progressBar.find('.strong');

				var complexityVal = Math.round(complexity);
				complexityVal = complexityVal > 100 ? 100 : (complexityVal < 0 ? 0 : complexityVal);

				if (!this.options.singleBar) {
					var complexityWeakVal = complexityVal < 34 ? complexityVal : 33;
					
					var complexityMediumVal = complexityVal - complexityWeakVal;
					complexityMediumVal = complexityMediumVal > 34 ? 34 : (complexityMediumVal < 0 ? 0 : complexityMediumVal);
					
					var complexityStrongVal = complexityVal - complexityWeakVal - complexityMediumVal;

					weak.css('width', complexityWeakVal+"%");
					medium.css('width', complexityMediumVal+"%");
					strong.css('width', complexityStrongVal+"%");
				} else {
					medium.hide();
					strong.hide();

					weak.css('width', complexityVal+"%");

					if (complexityVal < 34) {
						weak.addClass('progress-bar-danger').removeClass('progress-bar-warning progress-bar-success');
					} else if (complexityVal >= 34 && complexityVal < 68) {
						weak.addClass('progress-bar-warning').removeClass('progress-bar-danger progress-bar-success');
					} else {
						weak.addClass('progress-bar-success').removeClass('progress-bar-warning progress-bar-danger');
					}
				}
			}
		},

		_initOnPassChange : function() {
			var self = this;

			if (this.options.asJs) {
				this.options.passInput.complexify(function(valid, complexity) {
					self._setProgressBar(complexity);
				});
			} else {
				this.options.passInput.data('prev', this.options.passInput.val());

				this.options.passInput.on('keyup change', function(event) {
					if (self.options.passInput.data('prev') == self.options.passInput.val()) {
						return false;
					}
					self.options.passInput.data('prev', self.options.passInput.val());

					console.log('password ajax check', event);

					$.ajax({
						url: self.options.ajaxUrl,
						method: "get",
						data: {
							action: 'check',
							lang: self.options.lang,
							accountId: self.options.accountId,
							password: self.options.passInput.val()
						},
						dataType: 'json',
						success: function(data) {
							if (data.result) {
								console.log('password ajax checl ok');
								self._setProgressBar(data.complexity);
							} else {
								if (data.message) {
									console.log(data.message);
								} else {
									console.log('password ajax check warning or error');
								}
								self._setProgressBar(data.complexity);
							}
						},
						error: function(jqXHR, textStatus, errorThrown) {
							console.log(textStatus + " :: " + errorThrown);
						}
					})
				});
			}
		},

		_initGenerate : function() {
			var self = this;

			if (this.options.ajaxUrl && this.options.lang) {
				this.options.generatePass.on('click', function(event) {
					console.log('pass ajax');

					$.ajax({
						url: self.options.ajaxUrl,
						method: "get",
						data: {
							action: 'generate',
							lang: self.options.lang,
							accountId: self.options.accountId
						},
						dataType: 'json',
						success: function(data) {
							if (data.result) {
								console.log('password ajax ok');
								self.options.passInput.val(data.password);
								self.options.passRepeatInput.val(data.password);

								self.options.passInput.trigger('keyup');
								self.options.showHidePass.trigger('click', ['show']);
							} else {
								if (data.message) {
									console.log(data.message);
								} else {
									console.log('password ajax warning or error');
								}
							}
						},
						error: function(jqXHR, textStatus, errorThrown) {
							console.log(textStatus + " :: " + errorThrown);
						}
					})
				});
			}
		},

		_api : {

		}
	}

	NS_JMC.password = password;

})(window, document, jQuery, JMC);jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        } 
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};/**
 * jQuery.marquee - scrolling text like old marquee element
 * @author Aamir Afridi - aamirafridi(at)gmail(dot)com / http://aamirafridi.com/jquery/jquery-marquee-plugin
 */

/*
;(function(d){d.fn.marquee=function(w){return this.each(function(){var a=d.extend({},d.fn.marquee.defaults,w),b=d(this),c,k,p,q,h,l=3,x="animation-play-state",e=!1,B=function(a,b,c){for(var d=["webkit","moz","MS","o",""],e=0;e<d.length;e++)d[e]||(b=b.toLowerCase()),a.addEventListener(d[e]+b,c,!1)},E=function(a){var b=[],c;for(c in a)a.hasOwnProperty(c)&&b.push(c+":"+a[c]);b.push();return"{"+b.join(",")+"}"},g={pause:function(){e&&a.allowCss3Support?c.css(x,"paused"):d.fn.pause&&c.pause();b.data("runningStatus",
"paused");b.trigger("paused")},resume:function(){e&&a.allowCss3Support?c.css(x,"running"):d.fn.resume&&c.resume();b.data("runningStatus","resumed");b.trigger("resumed")},toggle:function(){g["resumed"==b.data("runningStatus")?"pause":"resume"]()},destroy:function(){clearTimeout(b.timer);b.css("visibility","hidden").html(b.find(".js-marquee:first"));setTimeout(function(){b.css("visibility","visible")},0)}};if("string"===typeof w)d.isFunction(g[w])&&(c||(c=b.find(".js-marquee-wrapper")),!0===b.data("css3AnimationIsSupported")&&
(e=!0),g[w]());else{var r;d.each(a,function(c,d){r=b.attr("data-"+c);if("undefined"!==typeof r){switch(r){case "true":r=!0;break;case "false":r=!1}a[c]=r}});a.duration=a.speed||a.duration;q="up"==a.direction||"down"==a.direction;a.gap=a.duplicated?a.gap:0;b.wrapInner('<div class="js-marquee"></div>');var f=b.find(".js-marquee").css({"margin-right":a.gap,"float":"left"});a.duplicated&&f.clone(!0).appendTo(b);b.wrapInner('<div style="width:100000px" class="js-marquee-wrapper"></div>');c=b.find(".js-marquee-wrapper");
if(q){var m=b.height();c.removeAttr("style");b.height(m);b.find(".js-marquee").css({"float":"none","margin-bottom":a.gap,"margin-right":0});a.duplicated&&b.find(".js-marquee:last").css({"margin-bottom":0});var s=b.find(".js-marquee:first").height()+a.gap;a.duration*=(parseInt(s,10)+parseInt(m,10))/parseInt(m,10)}else h=b.find(".js-marquee:first").width()+a.gap,k=b.width(),a.duration*=(parseInt(h,10)+parseInt(k,10))/parseInt(k,10);a.duplicated&&(a.duration/=2);if(a.allowCss3Support){var f=document.body||
document.createElement("div"),n="marqueeAnimation-"+Math.floor(1E7*Math.random()),z=["Webkit","Moz","O","ms","Khtml"],A="animation",t="",u="";f.style.animation&&(u="@keyframes "+n+" ",e=!0);if(!1===e)for(var y=0;y<z.length;y++)if(void 0!==f.style[z[y]+"AnimationName"]){f="-"+z[y].toLowerCase()+"-";A=f+A;x=f+x;u="@"+f+"keyframes "+n+" ";e=!0;break}e&&(t=n+" "+a.duration/1E3+"s "+a.delayBeforeStart/1E3+"s infinite "+a.css3easing,b.data("css3AnimationIsSupported",!0))}var C=function(){c.css("margin-top",
"up"==a.direction?m+"px":"-"+s+"px")},D=function(){c.css("margin-left","left"==a.direction?k+"px":"-"+h+"px")};a.duplicated?(q?c.css("margin-top","up"==a.direction?m:"-"+(2*s-a.gap)+"px"):c.css("margin-left","left"==a.direction?k+"px":"-"+(2*h-a.gap)+"px"),l=1):q?C():D();var v=function(){a.duplicated&&(1===l?(a._originalDuration=a.duration,a.duration=q?"up"==a.direction?a.duration+m/(s/a.duration):2*a.duration:"left"==a.direction?a.duration+k/(h/a.duration):2*a.duration,t&&(t=n+" "+a.duration/1E3+
"s "+a.delayBeforeStart/1E3+"s "+a.css3easing),l++):2===l&&(a.duration=a._originalDuration,t&&(n+="0",u=d.trim(u)+"0 ",t=n+" "+a.duration/1E3+"s 0s infinite "+a.css3easing),l++));q?a.duplicated?(2<l&&c.css("margin-top","up"==a.direction?0:"-"+s+"px"),p={"margin-top":"up"==a.direction?"-"+s+"px":0}):(C(),p={"margin-top":"up"==a.direction?"-"+c.height()+"px":m+"px"}):a.duplicated?(2<l&&c.css("margin-left","left"==a.direction?0:"-"+h+"px"),p={"margin-left":"left"==a.direction?"-"+h+"px":0}):(D(),p={"margin-left":"left"==
a.direction?"-"+h+"px":k+"px"});b.trigger("beforeStarting");if(e){c.css(A,t);var f=u+" { 100%  "+E(p)+"}",g=d("style");0!==g.length?g.filter(":last").append(f):d("head").append("<style>"+f+"</style>");B(c[0],"AnimationIteration",function(){b.trigger("finished")});B(c[0],"AnimationEnd",function(){v();b.trigger("finished")})}else c.animate(p,a.duration,a.easing,function(){b.trigger("finished");a.pauseOnCycle?b.timer=setTimeout(v,a.delayBeforeStart):v()});b.data("runningStatus","resumed")};b.bind("pause",
g.pause);b.bind("resume",g.resume);a.pauseOnHover&&b.bind("mouseenter mouseleave",g.toggle);e&&a.allowCss3Support?v():b.timer=setTimeout(v,a.delayBeforeStart)}})};d.fn.marquee.defaults={allowCss3Support:!0,css3easing:"linear",easing:"linear",delayBeforeStart:1E3,direction:"left",duplicated:!1,duration:5E3,gap:20,pauseOnCycle:!1,pauseOnHover:!1}})(jQuery);
*/function ParticleSlider(a) {
    var b = this;
    b.sliderId = "particle-slider", b.color = "#fff", b.hoverColor = "#88f", b.width = 0, b.height = 0, b.ptlGap = 0, b.ptlSize = 1, b.slideDelay = 10, b.arrowPadding = 10, b.showArrowControls = !0, b.onNextSlide = null, b.onWidthChange = null, b.onHeightChange = null, b.onSizeChange = null, b.monochrome = !1, b.mouseForce = 1e4, b.restless = !0, b.imgs = [];
    if (a) {
        var c = ["color", "hoverColor", "width", "height", "ptlGap", "ptlSize", "slideDelay", "arrowPadding", "sliderId", "showArrowControls", "onNextSlide", "monochrome", "mouseForce", "restless", "imgs", "onSizeChange", "onWidthChange", "onHeightChange"];
        for (var d = 0, e = c.length; d < e; d++) a[c[d]] && (b[c[d]] = a[c[d]])
    }
    b.$container = b.$("#" + b.sliderId), b.$$children = b.$container.childNodes, b.$controlsContainer = b.$(".controls"), b.$$slides = b.$(".slide", b.$(".slides").childNodes, !0), b.$controlLeft = null, b.$controlRight = null, b.$canv = b.$(".draw"), b.$srcCanv = document.createElement("canvas"), b.$srcCanv.style.display = "none", b.$container.appendChild(b.$srcCanv), b.$prevCanv = document.createElement("canvas"), b.$prevCanv.style.display = "none", b.$container.appendChild(b.$prevCanv), b.$nextCanv = document.createElement("canvas"), b.$nextCanv.style.display = "none", b.$container.appendChild(b.$nextCanv), b.$overlay = document.createElement("p"), b.$container.appendChild(b.$overlay), b.imgControlPrev = null, b.imgControlNext = null, b.$$slides.length <= 1 && (b.showArrowControls = !1), b.$controlsContainer && b.$controlsContainer.childNodes && b.showArrowControls == !0 ? (b.$controlLeft = b.$(".left", b.$controlsContainer.childNodes), b.$controlRight = b.$(".right", b.$controlsContainer.childNodes), b.imgControlPrev = new Image, b.imgControlNext = new Image, b.imgControlPrev.onload = function() {
        b.$prevCanv.height = this.height, b.$prevCanv.width = this.width, b.loadingStep()
    }, b.imgControlNext.onload = function() {
        b.$nextCanv.height = this.height, b.$nextCanv.width = this.width, b.loadingStep()
    }, b.imgControlPrev.src = b.$controlLeft.getAttribute("data-src"), b.imgControlNext.src = b.$controlRight.getAttribute("data-src")) : b.showArrowControls = !1, b.width <= 0 && (b.width = b.$container.clientWidth), b.height <= 0 && (b.height = b.$container.clientHeight), b.mouseDownRegion = 0, b.colorArr = b.parseColor(b.color), b.hoverColorArr = b.parseColor(b.hoverColor), b.mx = -1, b.my = -1, b.swipeOffset = 0, b.cw = b.getCw(), b.ch = b.getCh(), b.frame = 0, b.nextFrameTimer = null, b.nextSlideTimer = !1, b.currImg = 0, b.lastImg = 0, b.imagesLoaded = 0, b.pxlBuffer = {
        first: null
    }, b.recycleBuffer = {
        first: null
    }, b.ctx = b.$canv.getContext("2d"), b.srcCtx = b.$srcCanv.getContext("2d"), b.prevCtx = b.$prevCanv.getContext("2d"), b.nextCtx = b.$nextCanv.getContext("2d"), b.$canv.width = b.cw, b.$canv.height = b.ch, b.shuffle = function() {
        var a, b;
        for (var c = 0, d = this.length; c < d; c++) b = Math.floor(Math.random() * d), a = this[c], this[c] = this[b], this[b] = a
    }, Array.prototype.shuffle = b.shuffle, b.$canv.onmouseout = function() {
        b.mx = -1, b.my = -1, b.mouseDownRegion = 0
    }, b.$canv.onmousemove = function(a) {
        function c(a) {
            var c = 0,
                d = 0,
                e = typeof a == "string" ? b.$(a) : a;
            if (e) {
                c = e.offsetLeft, d = e.offsetTop;
                var f = document.getElementsByTagName("body")[0];
                while (e.offsetParent && e != f) c += e.offsetParent.offsetLeft, d += e.offsetParent.offsetTop, e = e.offsetParent
            }
            this.x = c, this.y = d
        }
        var d = new c(b.$container);
        b.mx = a.clientX - d.x, b.my = a.clientY - d.y
    }, b.$canv.onmousedown = function() {
        if (b.imgs.length > 1) {
            var a = 0;
            b.mx >= 0 && b.mx < b.arrowPadding * 2 + b.$prevCanv.width ? a = -1 : b.mx > 0 && b.mx > b.cw - (b.arrowPadding * 2 + b.$nextCanv.width) && (a = 1), b.mouseDownRegion = a
        }
    }, b.$canv.onmouseup = function() {
        if (b.imgs.length > 1) {
            var a = "";
            b.mx >= 0 && b.mx < b.arrowPadding * 2 + b.$prevCanv.width ? a = -1 : b.mx > 0 && b.mx > b.cw - (b.arrowPadding * 2 + b.$nextCanv.width) && (a = 1), a != 0 && b.mouseDownRegion != 0 && (a != b.mouseDownRegion && (a *= -1), b.nextSlideTimer && clearTimeout(b.nextSlideTimer), b.nextSlide(a)), b.mouseDownRegion = 0
        }
    };
    if (b.imgs.length == 0)
        for (var d = 0, e = b.$$slides.length; d < e; d++) {
            var f = new Image;
            b.imgs.push(f), f.src = b.$$slides[d].getAttribute("data-src")
        }
    b.imgs.length > 0 && (b.imgs[0].onload = function() {
        b.loadingStep()
    }), b.nextFrame()
}
var psParticle = function(a) {
    this.ps = a, this.ttl = null, this.color = a.colorArr, this.next = null, this.prev = null, this.gravityX = 0, this.gravityY = 0, this.x = Math.random() * a.cw, this.y = Math.random() * a.ch, this.velocityX = Math.random() * 10 - 5, this.velocityY = Math.random() * 10 - 5
};
psParticle.prototype.move = function() {
    var a = this.ps,
        b = this;
    if (this.ttl != null && this.ttl-- <= 0) a.swapList(b, a.pxlBuffer, a.recycleBuffer), this.ttl = null;
    else {
        var c = this.gravityX + a.swipeOffset - this.x,
            d = this.gravityY - this.y,
            e = Math.sqrt(Math.pow(c, 2) + Math.pow(d, 2)),
            f = Math.atan2(d, c),
            g = e * .01;
        a.restless == !0 ? g += Math.random() * .1 - .05 : g < .01 && (this.x = this.gravityX + .25, this.y = this.gravityY + .25);
        var h = 0,
            i = 0;
        if (a.mx >= 0 && a.mouseForce) {
            var j = this.x - a.mx,
                k = this.y - a.my;
            h = Math.min(a.mouseForce / (Math.pow(j, 2) + Math.pow(k, 2)), a.mouseForce), i = Math.atan2(k, j), typeof this.color == "function" && (i += Math.PI, h *= .001 + Math.random() * .1 - .05)
        } else h = 0, i = 0;
        this.velocityX += g * Math.cos(f) + h * Math.cos(i), this.velocityY += g * Math.sin(f) + h * Math.sin(i), this.velocityX *= .92, this.velocityY *= .92, this.x += this.velocityX, this.y += this.velocityY
    }
}, ParticleSlider.prototype.Particle = psParticle, ParticleSlider.prototype.swapList = function(a, b, c) {
    var d = this;
    a == null ? a = new d.Particle(d) : b.first == a ? a.next != null ? (a.next.prev = null, b.first = a.next) : b.first = null : a.next == null ? a.prev.next = null : (a.prev.next = a.next, a.next.prev = a.prev), c.first == null ? (c.first = a, a.prev = null, a.next = null) : (a.next = c.first, c.first.prev = a, c.first = a, a.prev = null)
}, ParticleSlider.prototype.parseColor = function(a) {
    var b, a = a.replace(" ", "");
    if (b = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(a)) b = [parseInt(b[1], 16), parseInt(b[2], 16), parseInt(b[3], 16)];
    else if (b = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(a)) b = [parseInt(b[1], 16) * 17, parseInt(b[2], 16) * 17, parseInt(b[3], 16) * 17];
    else if (b = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(a)) b = [+b[1], +b[2], +b[3], +b[4]];
    else if (b = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(a)) b = [+b[1], +b[2], +b[3]];
    else return null;
    isNaN(b[3]) && (b[3] = 1), b[3] *= 255;
    return b
}, ParticleSlider.prototype.loadingStep = function() {
    var a = this;
    a.imagesLoaded++;
    if (a.imagesLoaded >= 3 || a.showArrowControls == !1) a.resize(), a.slideDelay > 0 && (a.nextSlideTimer = setTimeout(function() {
        a.nextSlide()
    }, 1e3 * a.slideDelay))
}, ParticleSlider.prototype.$ = function(a, b, c) {
    var d = this;
    if (a[0] == ".") {
        var e = a.substr(1);
        b || (b = d.$$children);
        var f = [];
        for (var g = 0, h = b.length; g < h; g++) b[g].className && b[g].className == e && f.push(b[g]);
        return f.length == 0 ? null : f.length == 1 && !c ? f[0] : f
    }
    return document.getElementById(a.substr(1))
}, ParticleSlider.prototype.nextFrame = function() {
    var a = this;
    if (a.nextFrameTimer == null) {
        a.nextFrameTimer = setTimeout(function() {
            a.nextFrame()
        }, 33), a.mouseDownRegion == 1 && a.mx < a.cw / 2 || a.mouseDownRegion == -1 && a.mx > a.cw / 2 ? a.swipeOffset = a.mx - a.cw / 2 : a.swipeOffset = 0;
        var b = a.pxlBuffer.first,
            c = null;
        while (b != null) c = b.next, b.move(), b = c;
        a.drawParticles();
        if (a.frame++ % 25 == 0 && (a.cw != a.getCw() || a.ch != a.getCh())) {
            var d = a.getCh(),
                e = a.getCw();
            a.ch != e && typeof a.onWidthChange == "function" && a.onWidthChange(a, e), a.ch != d && typeof a.onHeightChange == "function" && a.onHeightChange(a, d), typeof a.onSizeChange == "function" && a.onSizeChange(a, e, d), a.resize()
        }
        a.nextFrameTimer = null
    } else a.nextFrameTimer = setTimeout(function() {
        a.nextFrame()
    }, 10)
}, ParticleSlider.prototype.nextSlide = function(a) {
    var b = this;
    b.nextSlideTimer != null && b.imgs.length > 1 ? (b.currImg = (b.currImg + b.imgs.length + (a ? a : 1)) % b.imgs.length, b.resize(), b.slideDelay > 0 && (b.nextSlideTimer = setTimeout(function() {
        b.nextSlide()
    }, 1e3 * b.slideDelay))) : b.slideDelay > 0 && (b.nextSlideTimer = setTimeout(function() {
        b.nextSlide()
    }, 1e3 * b.slideDelay)), typeof b.onNextSlide == "function" && b.onNextSlide(b.currImg)
}, ParticleSlider.prototype.drawParticles = function() {
    var a = this,
        b = a.ctx.createImageData(a.cw, a.ch),
        c = b.data,
        d, e, f, g, h, i, j = a.pxlBuffer.first;
    while (j != null) {
        e = ~~j.x, f = ~~j.y;
        for (g = e; g < e + a.ptlSize && g >= 0 && g < a.cw; g++)
            for (h = f; h < f + a.ptlSize && h >= 0 && h < a.ch; h++) d = (h * b.width + g) * 4, i = typeof j.color == "function" ? j.color() : j.color, c[d + 0] = i[0], c[d + 1] = i[1], c[d + 2] = i[2], c[d + 3] = i[3];
        j = j.next
    }
    b.data = c, a.ctx.putImageData(b, 0, 0)
}, ParticleSlider.prototype.getPixelFromImageData = function(a, b, c) {
    var d = this,
        e = [];
    for (var f = 0; f < a.width; f += d.ptlGap + 1)
        for (var g = 0; g < a.height; g += d.ptlGap + 1) i = (g * a.width + f) * 4, a.data[i + 3] > 0 && e.push({
            x: b + f,
            y: c + g,
            color: d.monochrome == !0 ? [d.colorArr[0], d.colorArr[1], d.colorArr[2], d.colorArr[3]] : [a.data[i], a.data[i + 1], a.data[i + 2], a.data[i + 3]]
        });
    return e
}, ParticleSlider.prototype.init = function(a) {
    var b = this;
    if (b.imgs.length > 0) {
        b.$srcCanv.width = b.imgs[b.currImg].width, b.$srcCanv.height = b.imgs[b.currImg].height, b.srcCtx.clearRect(0, 0, b.$srcCanv.width, b.$srcCanv.height), b.srcCtx.drawImage(b.imgs[b.currImg], 0, 0);
        var c = b.getPixelFromImageData(b.srcCtx.getImageData(0, 0, b.$srcCanv.width, b.$srcCanv.height), ~~(b.cw / 2 - b.$srcCanv.width / 2), ~~(b.ch / 2 - b.$srcCanv.height / 2));
        if (b.showArrowControls == !0) {
            b.prevCtx.clearRect(0, 0, b.$prevCanv.width, b.$prevCanv.height), b.prevCtx.drawImage(b.imgControlPrev, 0, 0);
            var d = b.getPixelFromImageData(b.prevCtx.getImageData(0, 0, b.$prevCanv.width, b.$prevCanv.height), b.arrowPadding, ~~(b.ch / 2 - b.$prevCanv.height / 2));
            for (var e = 0, f = d.length; e < f; e++) d[e].color = function() {
                return b.mx >= 0 && b.mx < b.arrowPadding * 2 + b.$prevCanv.width ? b.hoverColorArr : b.colorArr
            }, c.push(d[e]);
            b.nextCtx.clearRect(0, 0, b.$nextCanv.width, b.$nextCanv.height), b.nextCtx.drawImage(b.imgControlNext, 0, 0);
            var g = b.getPixelFromImageData(b.nextCtx.getImageData(0, 0, b.$nextCanv.width, b.$nextCanv.height), b.cw - b.arrowPadding - b.$nextCanv.width, ~~(b.ch / 2 - b.$nextCanv.height / 2));
            for (var e = 0, f = g.length; e < f; e++) g[e].color = function() {
                return b.mx > 0 && b.mx > b.cw - (b.arrowPadding * 2 + b.$nextCanv.width) ? b.hoverColorArr : b.colorArr
            }, c.push(g[e])
        }
        if (b.currImg != b.lastImg || a == !0) c.shuffle(), b.lastImg = b.currImg;
        var h = b.pxlBuffer.first;
        for (var e = 0, f = c.length; e < f; e++) {
            var i = null;
            h != null ? (i = h, h = h.next) : (b.swapList(b.recycleBuffer.first, b.recycleBuffer, b.pxlBuffer), i = b.pxlBuffer.first), i.gravityX = c[e].x, i.gravityY = c[e].y, i.color = c[e].color
        }
        while (h != null) h.ttl = ~~(Math.random() * 10), h.gravityY = ~~(b.ch * Math.random()), h.gravityX = ~~(b.cw * Math.random()), h = h.next;
        b.$overlay.innerHTML = b.$$slides[b.currImg].innerHTML
    }
}, ParticleSlider.prototype.getCw = function() {
    var a = this;
    return Math.min(document.body.clientWidth, a.width, a.$container.clientWidth)
}, ParticleSlider.prototype.getCh = function() {
    var a = this;
    return Math.min(document.body.clientHeight, a.height, a.$container.clientHeight)
}, ParticleSlider.prototype.resize = function() {
    var a = this;
    a.cw = a.getCw(), a.ch = a.getCh(), a.$canv.width = a.cw, a.$canv.height = a.ch, a.init()
}, ParticleSlider.prototype.setColor = function(a) {
    var b = this;
    b.colorArr = b.parseColor(a)
}, ParticleSlider.prototype.setHoverColor = function(a) {
    var b = this;
    b.hoverColorArr = b.parseColor(a)
}/*************************************************************
 * This script is developed by Arturs Sosins aka ar2rsawseen, http://code-snippets.co.cc
 * Fee free to distribute and modify code, but keep reference to its creator
 *
 * Marquee class can be used to create horizontal or vertical marquee elements in websites
 * This class rotates all provided html elements, so marquee will never be empty
 * Marquee div element can be customized using css styles
 * There are also customizations for rotating speed and separator, etc
 *
 * For more information, examples and online documentation visit: 
 * http://code-snippets.co.cc/JS-classes/Javascript-marquee
**************************************************************/
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('3 X=m(f){2.6=q.15(f);3 g=2;2.l=[];2.7=[];2.9={A:1,H:10,L:s,E:"",t:P};2.C=m(){2.6.4.Z="1b";3 a=k(2.6,"v");5(a!="I"&&a!="17"){2.6.4.v="1d"}13(2.6.N[0]){3 b=2.6.N[0];2.6.F(b);5(b.19==1){3 c=q.R("T");c.4.v="I";c.4.V="W";c.u(b);2.l.y(c);5(2.9.E!=""){c=q.R("T");c.Y=2.9.E;c.4.v="I";c.4.V="W";2.l.y(c)}}}3 d=0;z(3 i=0;s;i++){2.o=i%2.l.B;3 b=2.l[2.o].G(s);2.6.u(b);3 e=2.7.y(b);2.7[e-1].4[2.8]=d+"r";5(d>2.6[2.n]){12}d+=2.7[e-1][2.n]};5(2.9.t){2.l.1a()}5(2.9.L){j(g.6,"16",m(){5(g.x){1g(g.x)}});j(g.6,"1e",m(){g.x=J(h,g.9.H)})}h()};3 h=m(){3 a;3 b;z(3 i D g.7){5(!a){a=g.7[i]}b=g.7[i];5(!g.9.t){g.7[i].4[g.8]=(p(g.7[i].4[g.8])-g.9.A)+"r"}w{g.7[i].4[g.8]=(p(g.7[i].4[g.8])+g.9.A)+"r"}}5(!g.9.t){5(p(a.4[g.8])+a[g.n]<0){g.7.11();g.6.F(a)}5(p(b.4[g.8])<=g.6[g.n]){g.o=(g.o+1)%g.l.B;3 c=g.l[g.o].G(s);g.6.u(c);c.4[g.8]=(p(b.4[g.8])+b[g.n])+"r";g.7.y(c)}}w{5(p(a.4[g.8])>=0){g.o=(g.o+1)%g.l.B;3 c=g.l[g.o].G(s);g.6.u(c);c.4[g.8]=(p(a.4[g.8])-c[g.n])+"r";g.7.1f(c)}5(p(b.4[g.8])>g.6[g.n]){g.7.18();g.6.F(b)}}g.x=J(h,g.9.H)};3 j=m(a,b,c){5(a.K){a.K(b,c,P)}w{a.1k(\'1i\'+b,c)}};3 k=m(a,b){5(q.O){S q.O.14(a,1h).1l(b)}w{S a.1n[b]}};2.1o=m(a){5(a){z(3 b D a){2.9[b]=a[b]}}2.8="M";2.n="1c";2.U="Q";2.C()};2.1j=m(a){5(a){z(3 b D a){2.9[b]=a[b]}}2.8="Q";2.n="1m";2.U="M";2.C()}}',62,87,'||this|var|style|if|elem|visible|pos|conf||||||||||||children|function|size|cur|parseInt|document|px|true|backwards|appendChild|position|else|timer|push|for|step|length|construct|in|separator|removeChild|cloneNode|interval|absolute|setTimeout|addEventListener|stop_on_hover|left|childNodes|defaultView|false|top|createElement|return|div|apos|whiteSpace|pre|marquee|innerHTML|overflow||shift|break|while|getComputedStyle|getElementById|mouseover|fixed|pop|nodeType|reverse|hidden|offsetWidth|relative|mouseout|unshift|clearTimeout|null|on|vertical|attachEvent|getPropertyValue|offsetHeight|currentStyle|horizontal'.split('|'),0,{}));var globalDebug = true;
loaderElement = null;

function showLoaderElement() {
	loaderElement.css({
		zIndex: 9999999,
		opacity: 1
	});
}

function hideLoaderElement() {
	loaderElement.css({
		zIndex: '',
		opacity: 0
	});
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function isTouchDevice() {
	//return true;
	return (('ontouchstart' in window)
		|| (navigator.MaxTouchPoints > 0)
		|| (navigator.msMaxTouchPoints > 0));
}

function isInt(n){
	return( Number(n) === n && n % 1 === 0) || (parseInt(n).toString() == n);
}

function isFloat(n){
	return (n === Number(n) && n % 1 !== 0) || (parseFloat(n).toString() == n);
}

(function($){
	$(function() {
		loaderElement = $('#loaderElement');

		$( '.dropdown-menu-select li' ).on( 'click', function( event ) {
			var $target = $( event.currentTarget );
			$target.closest( '.btn-group' )
			.find( '[data-bind="label"]' ).text( $target.text() )
			.end()
			.children( '.dropdown-toggle' ).dropdown( 'toggle' );
			//return false;
		});

	});
})(jQuery);


$(document).ready(
	function() {
		$(window).bind('scroll', function() {
			var navHeight = $('.headcontainer').height();
			var menuHeight = $('nav.navmenu').height();
			
			if ( $(window).width() > 767) {
				if ($(window).scrollTop() > navHeight) {
					$('nav.navmenu').addClass('fixed');
					$(".headcontainer").css("margin-bottom", menuHeight);
				} else {
					$('nav.navmenu').removeClass('fixed');
					$(".headcontainer").css("margin-bottom", 0);
				}
			}
			
		});
		
		$(".modify-title").click(function(e) {
			e.preventDefault();
			$(this).closest(".modify-panel").find(".collapse").collapse('toggle');
		});
		
		
	}
);


var owlTeamPlayersCarousel;
var owlTeamPlayersCarousel_Options = {
	//startPosition: itemToStartGamesSlider,
	//URLhashListener: false,
	//items: 6,
	//loop: true,
	//center: true,
	dots: false,
	autoplay: false,
	nav: true,
	//navRewind: false,
	navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
	margin: 0,
	responsiveClass: true,
	responsive:{
		0:{
			items:2//,//,
			//nav:false
		},
		767:{
			items:3//,
			//nav:false
		},					
		992:{
			items:4//,
			//nav:false
		},
		1290:{
			items:5,
			//nav:true//,
			//loop:false
		}
	}
};

jQuery(document).ready(
	function() {
		var owlHomeSlider_Class = '#owl-carousel-home-slider-2 .owl-carousel-home-slider';
		var owlHomeSlider = $(owlHomeSlider_Class);
		if ( owlHomeSlider.length ) {
			owlHomeSlider.owlCarousel({
				//center: true,
				loop: true,
				//animateOut: 'fadeOut',
				//animateIn: 'fadeIn',
				items: 1,
				autoplay: true,
				autoplayTimeout: 4000,
				//navSpeed: 400,
				//autoplaySpeed: 400,
				nav: true,
				navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
				margin: 0,
				responsiveClass: true,
				dotsEach: true,
				dots: true,
				autoplayHoverPause: true,
				dotsContainer: '#slider-thumbs .owl-dots'//,
				//info: true//,
				//nestedItemSelector: 'item'
			});

			owlHomeSlider.parent().find('#slider-thumbs.owl-controls .owl-dots .owl-dot a').on('click',function(){
				var slideId = parseInt( $(this).attr('slide-id') );
				//console.log('slideId: ',slideId);
				if ( isInt( slideId ) ) {
					//$(this).addClass('selected').parent().siblings().each(function(i,el){
						//$(el).children('a').removeClass('selected');
					//});
					owlHomeSlider.trigger('to.owl.carousel', [slideId, 400]);
				}
			});

		} else {
			//console.log('nie ma elementu z klasÄ… ' + owlHomeSlider_Class);
		};



		var owlTeamPlayersCarousel_Class = '.owl-carousel-team-players';
		//var 
		owlTeamPlayersCarousel = $(owlTeamPlayersCarousel_Class);
		if ( owlTeamPlayersCarousel.length ) {
			//console.log(typeof window.itemToStartGamesSlider);
			//console.log('itemToStartGamesSlider: '+ window.itemToStartGamesSlider);

			owlTeamPlayersCarousel.owlCarousel(owlTeamPlayersCarousel_Options);
		} else {
			//console.log('nie ma elementu z klasÄ… ' + owlTeamPlayersCarousel_Class);
		};



		var owlHeaderCorousel_Class = '.owl-carousel-header';
		var owlHeaderCorousel = $(owlHeaderCorousel_Class);
		if ( owlHeaderCorousel.length ) {
			//console.log(typeof window.itemToStartGamesSlider);
			if ( (typeof window.itemToStartGamesSlider) === 'undefined' ) {
				window.itemToStartGamesSlider = 0;
			} else if ( (typeof window.itemToStartGamesSlider) !== 'string' && (typeof window.itemToStartGamesSlider) !== 'number' ) {
				window.itemToStartGamesSlider = 0;
			};
			//console.log('itemToStartGamesSlider: '+ window.itemToStartGamesSlider);
			owlHeaderCorousel.owlCarousel({
				startPosition: itemToStartGamesSlider,
				URLhashListener: false,
				//items: 5,
				//loop: true,
				//center: true,
				dots: false,
				autoplay: false,
				nav: true,
				navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
				margin: 0,
				responsiveClass:true,
				responsive:{
					0:{
						items:1//,
						//nav:true
					},
					767:{
						items:2//,
						//nav:false
					},					
					992:{
						items:3//,
						//nav:false
					},
					1290:{
						items:5,
						//nav:true//,
						//loop:false
					}
				}
			});

			var addedGameBoxes_Container = $('#owl-carousel-header-added-boxes');


			if ( addedGameBoxes_Container.length ) {

if ( !isTouchDevice() ) {

				addedGameBoxes_Container.hover(
					function(e) {
						e.preventDefault();
						e.stopPropagation();
					},
					function(e) {
						console.log('box unhover');
						e.preventDefault();
						e.stopPropagation();
						var addedShowedGameBoxes_forItems = $(this).children(':not(.hide)').first();
						if ( addedShowedGameBoxes_forItems.length ) {
							addedShowedGameBoxes_forItems.each(function(i,el){
								var ownerId = $(el).attr('data-ownerid');
								var owner = owlHeaderCorousel.find('.owl-stage-outer .owl-stage .owl-item .item[data-id="' + ownerId + '"]');
								setTimeout(function(){
									if ( !owner.is(':hover') ) {
										owner.removeClass('active');
										$(el).addClass('hide');
									}
								},200);
							});
						}
					}
				);
}
				var drag_InProgress = false;

				var deactivateActiveItems = function() {
					owlHeaderCorousel.find('.owl-item .item.active').each(function(i,el) {
						$(el).removeClass('active');
					});
				};

				var hideAllAddedGameBoxes_forItems = function(click) {
					if ( click )
						inProgress = true;

					$(addedGameBoxes_Container).children('.added-game-box').each(function(i,el) {
						$(el).addClass('hide');
					});
					deactivateActiveItems();

					if ( click )
						inProgress = false;
				};

if ( !isTouchDevice() ) {
				owlHeaderCorousel.on('drag.owl.carousel',function(){
					drag_InProgress = true;
					hideAllAddedGameBoxes_forItems(false);
				});

				owlHeaderCorousel.on('dragged.owl.carousel',function(){
					drag_InProgress = false;
				});


				owlHeaderCorousel.find('.owl-item').hoverIntent({
					over: function(e) {
						e.preventDefault();
						e.stopPropagation();

						if (drag_InProgress)
							return;
						
						var owl_item = this;
						//if ( !$(owl_item).children('.item').hasClass('active') ) {
							gameBox_OnHoverInOut(owl_item, true);
						//}
					},
					out: function (e){
						e.preventDefault();
						e.stopPropagation();
						
						var owl_item = this;
						setTimeout(function(){
							gameBox_OnHoverInOut(owl_item, false);
						}, 0);
					}
				});

				var gameBox_OnHoverInOut = function(item, over) {
					var itemId = parseInt( $(item).children('.item').attr('data-id') );
						if ( isInt( itemId ) ) {
							var addedGameBoxes_forItems = $(addedGameBoxes_Container).children('.added-game-box');
							var addedGameBox_forItem = $(addedGameBoxes_forItems).filter('[data-ownerid="'+itemId+'"]');
							if ( addedGameBox_forItem.length === 1 ) {
								if (over) {
									console.log('item hover');
									var this_width = parseFloat( $(item).css('width') );
									var owl_active_items = owlHeaderCorousel.find('.owl-item.active');
									var owl_active_items_before_item = false;

									var if_last_active_item = false;

									if ( owl_active_items.length ) {
										$(owl_active_items).each(function(i,el) {
											//console.log(i);
											if ( parseInt( $(el).children('.item').attr('data-id') ) === itemId ) {
												owl_active_items_before_item = i;
												if ( owl_active_items_before_item === ( owl_active_items.length - 1 ) ) {
													if_last_active_item = true;
												}
												return;
											}
										});
									}

									if ( (isFloat(this_width) || isInt(this_width) ) && isInt(owl_active_items_before_item) ) {
										//console.log( 0 );
										var cssToSet = {
											width: this_width+'px'
										};

										if ( if_last_active_item ) {
											cssToSet.right = '0px';
											cssToSet.left = 'auto';
										} else {
											cssToSet.left = (owl_active_items_before_item*this_width)+'px';
											cssToSet.right = 'auto';
										}

										addedGameBox_forItem.css(cssToSet);
										addedGameBox_forItem.removeClass('hide');
										$(item).children('.item').addClass('active');
									}
								} else {
									console.log('item unhover');
									if ( !addedGameBoxes_Container.is(":hover") ) {
										$(addedGameBox_forItem).addClass('hide');
										$(item).children('.item').removeClass('active');
									}
								}
							}
						}
				};
}

if ( isTouchDevice() ) {
				var inProgress = false;

				owlHeaderCorousel.on('resize.owl.carousel change.owl.carousel next.owl.carousel prev.owl.carousel', function(event) {
					console.log('event',event);
					hideAllAddedGameBoxes_forItems(true);
				});
				$(document).on('click', function(e) {
					if ( ! $(e.target).closest('.headnews').length ) {
						hideAllAddedGameBoxes_forItems(true);
					};
				});

				owlHeaderCorousel.find('.owl-item' /*'.item'*/).on('click', function(e) {
					console.log( 'event',e );
					e.preventDefault();
					e.stopPropagation();
					if ( !inProgress ) {
						//console.log( -2 );
						inProgress = true;
						var owl_item = this;
						var itemId = parseInt( $(owl_item).children('.item').attr('data-id') );

						if ( isInt( itemId ) ) {
							//console.log( -1 );
							var addedGameBoxes_forItems = $(addedGameBoxes_Container).children('.added-game-box');
							var addedGameBox_forItem = $(addedGameBoxes_forItems).filter('[data-ownerid="'+itemId+'"]');
							var addedShowedGameBox = $(addedGameBoxes_forItems).filter(':not(.hide)');

							if ( addedGameBox_forItem.length === 1 && addedGameBoxes_forItems.length ) {
								//console.log( addedGameBox_forItem );

								var this_width = parseFloat( $(owl_item)/*.parent()*/.css('width') );
								var owl_active_items = owlHeaderCorousel.find('.owl-item.active');
								var owl_active_items_before_item = false;

								//console.log('this_width: '+this_width);
								//console.log(owl_active_items);
								var if_last_active_item = false;
								var active_items_length = 0;
								if ( active_items_length = owl_active_items.length ) {
									$(owl_active_items).each(function(i,el) {
										//console.log(i);
										if ( parseInt( $(el).children('.item').attr('data-id') ) === itemId ) {
											owl_active_items_before_item = i;
											if ( owl_active_items_before_item === ( active_items_length - 1 ) ) {
												if_last_active_item = true;
											}
											return;
										}
									});
								}

								//console.log('if_last_active_item: '+if_last_active_item);
								//console.log('owl_active_items_before_item: '+owl_active_items_before_item);

								if ( (isFloat(this_width) || isInt(this_width) ) && isInt(owl_active_items_before_item) ) {
									//console.log( 0 );
									var cssToSet = {
										width: this_width+'px'
									};
									if ( if_last_active_item ) {
										cssToSet.right = '0px';
										cssToSet.left = 'auto';
									} else {
										cssToSet.left = (owl_active_items_before_item*this_width)+'px';
										cssToSet.right = 'auto';
									}
									$(addedGameBox_forItem).css(cssToSet);
									if ( addedShowedGameBox.length === 1 ) {
										//console.log( 1 );
										if ( $(addedGameBox_forItem).attr('data-ownerid') === $(addedShowedGameBox).attr('data-ownerid') ) {
											//console.log( 2 );
											$(addedGameBox_forItem).addClass('hide');
											$(owl_item).children('.item').removeClass('active');
										} else {
											//console.log( 3 );
											$(addedGameBox_forItem).removeClass('hide');
											deactivateActiveItems();
											$(owl_item).children('.item').addClass('active');
											$(addedShowedGameBox).addClass('hide');
										}
									} else {
										//console.log( 4 );
										$(addedGameBox_forItem).removeClass('hide');
										deactivateActiveItems();
										$(owl_item).children('.item').addClass('active');
									}
								}
							}
						};
						inProgress = false;
					}
				});
}
			};
		} else {
			//console.log('nie ma elementu z klasÄ… ' + owlHeaderCorousel_Class);
		};


		if ( (typeof window.startHomeCalendarEventIndex) === 'undefined' ) {
			window.startHomeCalendarEventIndex = 0;
		} else if ( (typeof window.startHomeCalendarEventIndex) !== 'string' && (typeof window.startHomeCalendarEventIndex) !== 'number' ) {
			window.startHomeCalendarEventIndex = 0;
		}

		var owlCalendarCorousel_Class = '.owl-carousel-calendar';
		var owlCalendarCorouse = $(owlCalendarCorousel_Class);
		if ( owlCalendarCorouse.length ) {
			//console.log('tak');
			owlCalendarCorouse.owlCarousel({
				startPosition: startHomeCalendarEventIndex,
				URLhashListener: false,
				//items: 6,
				//loop: true,
				//center: true,
				dots: false,
				autoplay: false,
				nav: true,
				navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
				margin: 0,
				responsiveClass:true,
				responsive:{
					0:{
						items:2//,
						//nav:true
					},
					767:{
						items:3//,
						//nav:false
					},					
					992:{
						items:4//,
						//nav:false
					},
					1290:{
						items:6,
						nav:true//,
						//loop:false
					}
				}
			});
		} else {
			//console.log('nie ma elementu z klasÄ… ' + owlCalendarCorousel_Class);
		};		
	}
);/**
 * SWFObject v1.4.4: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2006 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * **SWFObject is the SWF embed script formerly known as FlashObject. The name was changed for
 *   legal reasons.
 */
if(typeof deconcept=="undefined"){var deconcept=new Object();}
if(typeof deconcept.util=="undefined"){deconcept.util=new Object();}
if(typeof deconcept.SWFObjectUtil=="undefined"){deconcept.SWFObjectUtil=new Object();}
deconcept.SWFObject=function(_1,id,w,h,_5,c,_7,_8,_9,_a,_b){if(!document.getElementById){return;}
this.DETECT_KEY=_b?_b:"detectflash";
this.skipDetect=deconcept.util.getRequestParameter(this.DETECT_KEY);
this.params=new Object();
this.variables=new Object();
this.attributes=new Array();
if(_1){this.setAttribute("swf",_1);}
if(id){this.setAttribute("id",id);}
if(w){this.setAttribute("width",w);}
if(h){this.setAttribute("height",h);}
if(_5){this.setAttribute("version",new deconcept.PlayerVersion(_5.toString().split(".")));}
this.installedVer=deconcept.SWFObjectUtil.getPlayerVersion();
if(c){this.addParam("bgcolor",c);}
var q=_8?_8:"high";
this.addParam("quality",q);
this.setAttribute("useExpressInstall",_7);
this.setAttribute("doExpressInstall",false);
var _d=(_9)?_9:window.location;
this.setAttribute("xiRedirectUrl",_d);
this.setAttribute("redirectUrl","");
if(_a){this.setAttribute("redirectUrl",_a);}};
deconcept.SWFObject.prototype={setAttribute:function(_e,_f){
this.attributes[_e]=_f;
},getAttribute:function(_10){
return this.attributes[_10];
},addParam:function(_11,_12){
this.params[_11]=_12;
},getParams:function(){
return this.params;
},addVariable:function(_13,_14){
this.variables[_13]=_14;
},getVariable:function(_15){
return this.variables[_15];
},getVariables:function(){
return this.variables;
},getVariablePairs:function(){
var _16=new Array();
var key;
var _18=this.getVariables();
for(key in _18){_16.push(key+"="+_18[key]);}
return _16;},getSWFHTML:function(){var _19="";
if(navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length){
if(this.getAttribute("doExpressInstall")){
this.addVariable("MMplayerType","PlugIn");}
_19="<embed type=\"application/x-shockwave-flash\" src=\""+this.getAttribute("swf")+"\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\"";
_19+=" id=\""+this.getAttribute("id")+"\" name=\""+this.getAttribute("id")+"\" ";
var _1a=this.getParams();
for(var key in _1a){_19+=[key]+"=\""+_1a[key]+"\" ";}
var _1c=this.getVariablePairs().join("&");
if(_1c.length>0){_19+="flashvars=\""+_1c+"\"";}_19+="/>";
}else{if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","ActiveX");}
_19="<object id=\""+this.getAttribute("id")+"\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\">";
_19+="<param name=\"movie\" value=\""+this.getAttribute("swf")+"\" />";
var _1d=this.getParams();
for(var key in _1d){_19+="<param name=\""+key+"\" value=\""+_1d[key]+"\" />";}
var _1f=this.getVariablePairs().join("&");
if(_1f.length>0){_19+="<param name=\"flashvars\" value=\""+_1f+"\" />";}_19+="</object>";}
return _19;
},write:function(_20){
if(this.getAttribute("useExpressInstall")){
var _21=new deconcept.PlayerVersion([6,0,65]);
if(this.installedVer.versionIsValid(_21)&&!this.installedVer.versionIsValid(this.getAttribute("version"))){
this.setAttribute("doExpressInstall",true);
this.addVariable("MMredirectURL",escape(this.getAttribute("xiRedirectUrl")));
document.title=document.title.slice(0,47)+" - Flash Player Installation";
this.addVariable("MMdoctitle",document.title);}}
if(this.skipDetect||this.getAttribute("doExpressInstall")||this.installedVer.versionIsValid(this.getAttribute("version"))){
var n=(typeof _20=="string")?document.getElementById(_20):_20;
n.innerHTML=this.getSWFHTML();return true;
}else{if(this.getAttribute("redirectUrl")!=""){document.location.replace(this.getAttribute("redirectUrl"));}}
return false;}};
deconcept.SWFObjectUtil.getPlayerVersion=function(){
var _23=new deconcept.PlayerVersion([0,0,0]);
if(navigator.plugins&&navigator.mimeTypes.length){
var x=navigator.plugins["Shockwave Flash"];
if(x&&x.description){_23=new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split("."));}
}else{try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}
catch(e){try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
_23=new deconcept.PlayerVersion([6,0,21]);axo.AllowScriptAccess="always";}
catch(e){if(_23.major==6){return _23;}}try{axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}
catch(e){}}if(axo!=null){_23=new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));}}
return _23;};
deconcept.PlayerVersion=function(_27){
this.major=_27[0]!=null?parseInt(_27[0]):0;
this.minor=_27[1]!=null?parseInt(_27[1]):0;
this.rev=_27[2]!=null?parseInt(_27[2]):0;
};
deconcept.PlayerVersion.prototype.versionIsValid=function(fv){
if(this.major<fv.major){return false;}
if(this.major>fv.major){return true;}
if(this.minor<fv.minor){return false;}
if(this.minor>fv.minor){return true;}
if(this.rev<fv.rev){
return false;
}return true;};
deconcept.util={getRequestParameter:function(_29){
var q=document.location.search||document.location.hash;
if(q){var _2b=q.substring(1).split("&");
for(var i=0;i<_2b.length;i++){
if(_2b[i].substring(0,_2b[i].indexOf("="))==_29){
return _2b[i].substring((_2b[i].indexOf("=")+1));}}}
return "";}};
deconcept.SWFObjectUtil.cleanupSWFs=function(){if(window.opera||!document.all){return;}
var _2d=document.getElementsByTagName("OBJECT");
for(var i=0;i<_2d.length;i++){_2d[i].style.display="none";for(var x in _2d[i]){
if(typeof _2d[i][x]=="function"){_2d[i][x]=function(){};}}}};
deconcept.SWFObjectUtil.prepUnload=function(){__flash_unloadHandler=function(){};
__flash_savedUnloadHandler=function(){};
if(typeof window.onunload=="function"){
var _30=window.onunload;
window.onunload=function(){
deconcept.SWFObjectUtil.cleanupSWFs();_30();};
}else{window.onunload=deconcept.SWFObjectUtil.cleanupSWFs;}};
if(typeof window.onbeforeunload=="function"){
var oldBeforeUnload=window.onbeforeunload;
window.onbeforeunload=function(){
deconcept.SWFObjectUtil.prepUnload();
oldBeforeUnload();};
}else{window.onbeforeunload=deconcept.SWFObjectUtil.prepUnload;}
if(Array.prototype.push==null){
Array.prototype.push=function(_31){
this[this.length]=_31;
return this.length;};}
var getQueryParamValue=deconcept.util.getRequestParameter;
var FlashObject=deconcept.SWFObject;
var SWFObject=deconcept.SWFObject;
(function( $ ){

	function Switcher(_element, _options) {
		this.options = {
			"itemClass" : undefined,
			"buttonClass" : undefined,
			"activeClass" : 'active',
			"buttonActive" : false,
			"idPrefix" : undefined,
			"fadeTime" : 100,
			"zIndex" : 100,
			"switchTime" : 6000
		};

		if (_options) {
			$.extend(this.options, _options);
		}

		this.element = _element;

		this._create();
	}

	Switcher.prototype = {
		_create: function() {
			this.e_items = this.element.find('.' + this.options.itemClass);
			this.e_buttons = this.element.find('.' + this.options.buttonClass);

			var self = this;
			this.loopFunction = function() { self._cycleLoop(); };

			$(this.element).hover(
				function() {
					if (self.timeOut) {
						window.clearTimeout(self.timeOut);
						self.timeOut = false;
					}
				},
				function() {
					if (!self.timeOut) {
						self.timeOut = window.setTimeout(self.loopFunction, self.options.switchTime);
					}
				}
			);
			this.timeOut = window.setTimeout(self.loopFunction, self.options.switchTime);
		},

		"prev" : function() {
			this._move(-1);
		},

		"next" : function() {
			this._move(1);
		},

		"_cycleLoop" : function() {
			this.next();

			this.timeOut = setTimeout(this.loopFunction, this.options.switchTime);
		},

		"_move" : function(d) {
			var active = this.e_items.filter('.' + this.options.activeClass);
			var i = this.e_items.index(active);
			i += d;
			if (i < 0) i = this.e_items.length - 1;
			if (i >= this.e_items.length) i = 0;

			this._switchTo(i);
			this._setButtons(i);
		},

		"_setButtons" : function(i) {
			if (this.options.bia) {
				this.e_buttons.attr('src', this.options.bia);
				this.e_buttons.eq(i).attr('src', this.options.ba);
			}

			if (this.options.buttonActive) {
				this.e_buttons.removeClass(this.options.buttonActive);
				this.e_buttons.eq(i).addClass(this.options.buttonActive);
			}
		},

		"_switchTo" : function(i) {
			this.e_items.removeClass(this.options.activeClass).css({'z-index' : this.options.zIndex}).fadeTo(this.options.fadeTime, 0);
			this.e_items.eq(i).addClass(this.options.activeClass).css({'opacity': 0, 'z-index' : this.options.zIndex + 1}).show().fadeTo(this.options.fadeTime, 1);
		},

		"setIndex" : function(itemIndex) {
			itemIndex = parseInt(itemIndex, 10) - 1;

			if (itemIndex < 0 || itemIndex >= this.e_items.length) return;

			var active = this.e_items.filter('.' + this.options.activeClass);
			var i = this.e_items.index(active);

			if (i == itemIndex) return;

			this._switchTo(itemIndex);
			this._setButtons(itemIndex);
		},

		"setItem" : function(itemId) {
			var s = $(this.options.idPrefix + itemId);
			var i = this.e_items.index(s);

			this._switchTo(i);
			this._setButtons(i);
		}
	};

	$.fn.switcher = function(_options) {
		if (typeof(_options) === 'string') {
			var args = Array.prototype.slice.call(arguments, 1);
			this.each(
				function() {
					if (this._switcher && this._switcher[_options]) {
						this._switcher[_options].apply(this._switcher, args);
					}
				}
			);
			return;
		}
		this.each(
			function() {
				this._switcher = new Switcher($(this), _options);
			}
		);
	};

})( jQuery );
