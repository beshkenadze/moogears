/**
 * @author <a href="mailto:beshkenadze@gmail.com">Александр Бешкенадзе</a>
 * @description moo.gears - Mootools плагин для работы с Gears
 * @version $Id: $Rev:$ $Date:$ $Author:$
 */
var MooGears = new Class({
			Implements : [Options],
			options : { // опции по умолчанию
				siteName : null,
                imageUrl: null,
                extraMessage: null,
                installMessage: 'Install Gears support.',
                htmlMessage: '<u>Click to install Gears to enable!</u>',
                installElement: document.body
			},
			initialize : function(factoryname, options) {
				this.setOptions(options);
                this.needPermission=false;
                this.userPermission=false;
                this.factory = false;
                this.cFactory = false;
                this.factoryname = factoryname;
				if(this.init()){
                    this.factoryInit()
                }else{
                    this.install();
                }
				return this;
			}
		});
MooGears.implement({
			init : function() {
				if (window.google && google.gears) {
					// if have gears
					return true;
				}
				var factory = null;
				if (Browser.Engine.gecko) {
					try {
						factory = new GearsFactory();
					} catch (e) {
						return false;
					}
				} else if (Browser.Engine.webkit) {
					factory = document.createElement("object");
					var factory = new Element('object', {
								'type' : 'application/x-googlegears',
								'width' : 0,
								'height' : 0,
								'styles' : {
									'display' : 'none'
								}
							});
				  document.inject(factory, 'inside');
				} else if (Browser.Engine.trident) {
					try {
						factory = new ActiveXObject('Gears.Factory');
						// privateSetGlobalObject is only required and supported
						// on WinCE.
						if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
							factory.privateSetGlobalObject(this);
						}
					} catch (e) {
						return false;
					}
				} else if (Browser.Engine.presto) {
					// Возможно скоро будет и Opera поддерживаться.
					return false;
				} else {
					return false;
				}
				if (!window.google) {
					google = {};
				}
				if (!google.gears) {
					google.gears = {
						factory : factory
					};
				}
				return true;
			},
			factoryInit : function() {
                console.log('Factory name: %s',this.factoryname);
				switch (this.factoryname) {
					case 'beta.database' :
					case 'beta.geolocation' :
					case 'beta.localserver' :
					case 'beta.workerpool' :
						this.needPermission = true;
						break;
					case 'beta.httprequest' :
					case 'beta.desktop' :
					case 'beta.timer' :
						this.needPermission = false;
						break;
					default :
						return false;
				}
                console.log('Factory permission: %s ',this.hasPermission());
                console.log('Factory need permission: %s ',this.needPermission);
                this.factory = google.gears.factory.create(this.factoryname);
			    if(this.needPermission && !this.hasPermission()){
			        this.userPermission = this.getPermission();
			    }else{
			        this.userPermission = true;
			    }
                
			},
            hasPermission : function () {
                if(typeof this.factory.hasPermission=='undefined'){
                    return google.gears.factory.hasPermission;
                }else{
                    return this.factory.hasPermission;
                }
            },
            getPermission : function(){
                var siteName = this.options.siteName;
                var imageUrl = this.options.imageUrl;
                var extraMessage = this.options.extraMessage;
                if(typeof this.factory.hasPermission=='undefined'){
                    return google.gears.factory.getPermission(siteName,imageUrl,extraMessage);
                }else{
                    return this.factory.getPermission(siteName,imageUrl,extraMessage);
                }
                
            },
            install : function(){
                var element = this.options.installElement;
	            var url = 'http://gears.google.com/?action=install' +
		        '&message=' +
		        encodeURIComponent(this.options.installMessage) +
		        '&return=' +
		        encodeURIComponent(window.location.href);
			    if($(element).getProperty('tagName') == "A"){
			        $(element).setProperty('href',url);
			    }else{
			        $(element).setStyle('cursor','pointer').addEvent('click',function(){window.location.href=url});
			    }
		        $(element).set('html',this.options.htmlMessage);
            }
		});
