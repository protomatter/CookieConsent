/*
 * jQuery Cookie Consent v1.0.0
 * http://cookieconsent.protomatter.co.uk
 *
 * Copyright 2012, Colin Mc Mahon
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * June 2012
 */
;(function ( $, window, document, undefined ) {
    var pluginName = 'cookieConsent';

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, $.fn[pluginName].defaults, options) ;
        this._defaults = $.fn[pluginName].defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init : function() {
			var elem = $(this.element);
			var opts = this.options;

			// The logic:
			// Firstly we assume that the visitor gives consent, if the consent cookie
			// is not present we create it and set it to 1 denoting consent is given
			this.consentCookieName = opts.consentCookieName;
			this.notificationCookieName = opts.notificationCookieName;
			
			var consentGivenCookie = this._getConsentCookie(),
				notificationShown = this._getNotificationShownCookie();
			this.consentGiven = true;
			
			if(!consentGivenCookie) {
				this._setConsentCookie(opts.compliantMode ? 0 : 1);
			} else {
				this.consentGiven = consentGivenCookie == "1" ? true : false;
			}
			
			// We fire our allowed callback based on whether consent is given or not
			// The onCookiesNotAllowed event is only fired when consent is revoked, 
			// and only once - from that point forward onCookiesAllowed is not fired.
			if(this.consentGiven) {
				opts.onCookiesAllowed();
				this.cookieDisplay = '<div class="cookie-status allowed"><div class="wrapper">' +
					   '<span class="title">Current cookie settings:</span> <span class="status">Cookies are allowed</span>' +
					   '<p>All of the features of this web site will be available to you.</p>' +
					   '</div></div>';
			} else {
				this.cookieDisplay = '<div class="cookie-status blocked"><div class="wrapper">' + 
					   '<span class="title">Current cookie settings:</span> <span class="status">Cookies are blocked!</span>' + 
					   '<p>Some of the features of this site will not be available to you, or may not operate correctly, such as social sharing links.</p>' +
					   '</div></div>';
			}
			
			// The settings panel is always accessible if turned on - build and configure it
			if(opts.showSettings) {
				this._buildSettingsPanel(elem, opts);
			}
				
			// If the notification cookie has not been set build and show
			if(!notificationShown) {
				this._buildNotificationPanel(elem, opts);
				this._setNotificationTimer();
			}
        },
		
		hideSettingsPanel : function() {
			$('#cookie-settings-overlay, #cookie-settings').hide();
		},
		
		showSettingsPanel : function( ) {
			$('#cookie-settings-overlay, #cookie-settings').show();
		},
		
		hideNotificationPanel : function() {
			$('#cookie-notification').hide();
			this._setNotificationShownCookie(1);
		},
		
		revokeConsent : function(opts) { 
			// When consent is given we set the notification cookie
			this._setConsentCookie(0);
			opts.onCookiesNotAllowed();
			this._reloadPage();
		},
		
		setConsent : function( ) { 
			// When consent is given we set the notification cookie
			this._setConsentCookie(1);
			this._reloadPage();
		},
		
		showCurrentCookieSettings : function(elem) {
			$(elem).append(this.cookieDisplay);
		},
		
		_getConsentCookie : function () {
			return this._getCookie(this.consentCookieName);
		},
		
		_setConsentCookie : function(val) {
			this._setCookie(this.consentCookieName, val, 365, '/');
		},
		
        _getNotificationShownCookie : function () {
			return this._getCookie(this.notificationCookieName);
		},
		
		_setNotificationShownCookie : function (val) {
			this._setCookie(this.notificationCookieName, val, 365, '/');
		},
		
		_setCookie : function ( name, value, expires, path, domain, secure ) {
			var today = new Date();
			today.setTime( today.getTime() );
			if ( expires ) {
				expires = expires * 1000 * 60 * 60 * 24;
			}
			var expires_date = new Date( today.getTime() + (expires) );
			document.cookie = name + "=" +escape( value ) +
				( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
				( ( path ) ? ";path=" + path : "" ) +
				( ( domain ) ? ";domain=" + domain : "" ) +
				( ( secure ) ? ";secure" : "" );
		},
		
		_getCookie : function(name) {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = $.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		},
		
		_reloadPage : function() {
			window.setTimeout(function(){
				document.location.reload(true);
			}, 500);
		},
		
		_setNotificationTimer : function() {
			var $this = this;
			var $popup = $('#cookie-notification'),
				onTimeOut = function() {
					$this.hideNotificationPanel();
				},
				timer = setTimeout(onTimeOut, 12000);
			$popup.bind('mouseenter', function() {
				clearTimeout(timer);
			}).bind('mouseleave', function() {
				timer = setTimeout(onTimeOut, 12000);
			});
		},
		
		_buildSettingsPanel : function(obj, opts) {
			var $this = this;
			var settingsContainer = $('<div id="cookie-settings">').hide();
			var settingsOverlay = $('<div id="cookie-settings-overlay">').hide();
			
			var closeButton = $('<span class="close">&times;</span>').click(function(e){
				e.preventDefault();
				$this.hideSettingsPanel();
			});
			
			$('<div class="title"><h3>' + opts.settingsTitle + '</h3></div>')
				.append(closeButton)
				.appendTo(settingsContainer);
			settingsContainer.append(opts.settingsText);
			
			$('<div id="current-settings">')
				.append(this.cookieDisplay)
				.appendTo(settingsContainer);
			
			var actionContainer = $('<div id="settings-actions">');
			// Build the buttons as required
			if($this.consentGiven) {
				var settingsBtn = $('<a href="#" class="block">Remove these cookies</a>').click(function(e){
					e.preventDefault();
					$this.revokeConsent(opts);
				}).appendTo(actionContainer);
			} else {
				var declineBtn = $('<a href="#" class="allow">Allow these cookies</a>').click(function(e){
					e.preventDefault();
					$this.setConsent();
				}).appendTo(actionContainer);
			}
			settingsContainer.append(actionContainer);
			obj.append(settingsOverlay, settingsContainer);
		},
		
		_buildNotificationPanel : function(obj, opts) {
			var $this = this;
			var notificationContainer = $('<div id="cookie-notification">').hide();
			notificationContainer.append(opts.notificationText);
			if(opts.showSettings) {
				var settingsBtn = $('<a href="#">Cookie Settings</a>').click(function(e){
					e.preventDefault();
					$this.hideNotificationPanel();
					$this.showSettingsPanel()
				});
				var declineBtn = $('<a href="#">No Thanks</a>').click(function(e){
					e.preventDefault();
					$this.hideNotificationPanel();
				});
				$('<div id="cookie-actions">').append(settingsBtn, declineBtn).appendTo(notificationContainer);
			}
			
			if(opts.notificationCookiesLink !== '') {
				$('<div id="about-cookies-link">').append(opts.notificationCookiesLink).appendTo(notificationContainer);
			}
			obj.append(notificationContainer);
			notificationContainer.show();
		}
    };

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            });
        }
    }
	
	$.fn[pluginName].defaults = {
		notificationText        : '',
		showSettings            : true,
		compliantMode           : true,
		notificationCookiesLink : '',
		settingsTitle           : '',
		settingsText            : '',
		cookieDomain            : '',
		consentCookieName       : 'CookieConsent',
		notificationCookieName  : 'CookieNotificationShown',
		onCookiesAllowed        : function(){},
		onCookiesNotAllowed     : function(){}
	};
})( jQuery, window, document );