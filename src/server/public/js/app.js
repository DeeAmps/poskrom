
let App = {
	ROOT_URL: 'http://127.0.0.1:8080', //'http://172.104.225.181:8080',

	IS_LOCALHOST: (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === ''),

	CLIENT_INFO_KEY: 'CLIENT_INFO',

	ACTIVE_AJAX_REQUESTS: [],

	ACCESS_TOKEN_KEY: 'ACCESS_TOKEN',

	INTERNET_ERROR_MSG: 'Please check your internet settings and try again',


	DELETE_SUCCESS: 'Delete successful!',


	DELETE_FAIL: 'Delete failed!',

    // sent to set authentication hash
    // TODO encrypt this with public key of server before sending
    generateLoginHash: (username, password) => {
		let sha = new jsSHA('SHA-256', 'TEXT');
		sha.update(password + (username.toLowerCase()));
		return sha.getHash('HEX');
	},

    // sent to authenticate
	generateAuthHash: (login_hash, timestamp) => {
		let sha = new jsSHA('SHA-256', 'TEXT');
		sha.update(login_hash + timestamp);
		return sha.getHash('HEX');
	},

	generateRequestSignature: (url, data, timestamp, key) => {
		let hmac = new jsSHA('SHA-256', 'TEXT');
		hmac.setHMACKey(key, 'TEXT');
		let _data = (typeof data === 'string' ? data : JSON.stringify(data));
        _data += url + timestamp;
		sha.update(_data);
		return sha.getHMAC('HEX');
	},

	notifyAjaxRequestTimeout: (req, status, err) => {
		if(status == 'timeout') {
				Notifier.error('Request timedout, please check your internet settings');
		}
	},

	internetConnectionAvailable: () => {
			let server = location.hostname;
			let isOffline = server == 'localhost' || ''
			return navigator.onLine;
	},

	isLocalServer: () => {

	},


	isOrdersListEmpty: () => {
	    let entries = $('.orders-table-body').find('.order-page-entry').length;
	    return entries < 1 ? true : false;
	},


	handleNoOrders: () => {
	    // $('.orders-table').addClass('hidden');
	    $('#no-order-info').removeClass('hidden');
	},


	performAjaxRequest: (requestObject, loaders, handler) => {
			let res = {};
			let request =requestObject;
			let requestDict = {}
			requestDict.type = requestObject.type;
			requestDict.url = requestObject.url || null;
			requestDict.dataType = (requestObject.dataType) || 'json';
			if(requestObject.contentType) {
					requestDict.contentType = (requestObject.contentType) || 'json/application';
			}
			let reqTypeGlobalLoader= ['put', 'post', 'delete'];
			if(reqTypeGlobalLoader.includes((requestObject.type).toLowerCase())) {
					loaders.first = $('#mainCoverScreen');
					loaders.last = jQuery({});
			}
			requestDict.data = requestObject.data;
			requestDict.beforeSend = (xhr) => {
					App.ACTIVE_AJAX_REQUESTS.push(xhr);
					App.showLoader(loaders)
				}
			requestDict.complete = (xhr) => {
					App.hideLoader(loaders);
					let index = App.ACTIVE_AJAX_REQUESTS.indexOf(xhr);
					if (index > -1) {
							 App.ACTIVE_AJAX_REQUESTS.splice(index, 1);
					 }
			 }
			if(!App.IS_LOCALHOST && !navigator.onLine) {
					Notifier.error('No internet connection!');
			}
			//App.pingUrl(requestObject.url);
			$.ajax(requestDict).
								done((result)=>{
									if(result.code == 0) {
										handler(result);
									} else {
										let errorMessage = (result.error_message) || '';
										if(loaders.domElementError) {
											loaders.domElementError.text(errorMessage).show();
										} else {
											if(loaders.isAutocomplete) {
												loaders.first.removeClass('ui-autocomplete-loading');
											}
											Notifier.error(errorMessage);
										}
									}
								})
								.fail((xhr, status, err)=> {
									if(loaders.isAutocomplete) {
										loaders.first.removeClass('ui-autocomplete-loading');
									}
									if(status == 'timeout') {
										Notifier.error('Network timeout');
									} else {
										Notifier.error(status);
									}
								})
		},


	showLoader: (loaders)=> {
			if(loaders.isAutocomplete){
					//loaders.first.removeClass('ui-autocomplete-loading');
			} else {
				let loaderF = (loaders.first) || jQuery({});
				let loaderS = (loaders.last) || jQuery({});
				loaderS.addClass('hidden');
				loaderF.removeClass('hidden');
			}
	},

	hideLoader: (loaders)=> {
			if(loaders.isAutocomplete) {
				loaders.first.removeClass('ui-autocomplete-loading');
			} else {
				let loaderF = (loaders.first) || jQuery({});
				let loaderS = (loaders.last) || jQuery({});
				loaderF.addClass('hidden');
				loaderS.removeClass('hidden');
			}
		},


	pingUrl: (url)=> {
		$.ajax({
				type: 'head',
				contentType: 'json/application',
				url: url,
				timeout: 2000
			}).done((result)=> {
			}).fail((xhr, status, err)=> {
					if(status == 'timeout') {
							Notifier.error('No internet connection!');
							App.ACTIVE_AJAX_REQUESTS.forEach((request)=> {
									request.abort();
							});
					}
			})
	}
};
