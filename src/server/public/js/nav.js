(function($) {
	let autocompleteFields = {client: {}};
	let historyNavigationCode = 2;
	let urlNavigationCode = 0;

	$(document).ready(() => {
				// loadMainNav();
				if(performance.navigation.type == historyNavigationCode){
					   location.reload(true);
				} else {
						getLoginInfo();
						loadModules();
				}

				window.addEventListener('offline', (event)=> {
					if(App.IS_LOCALHOST) {
							Notifier.error('No internet connection!');
					}
				});

				window.addEventListener('online', (event)=> {
						Notifier.info('Internet connection available');
				});
	});


	$('#product-search-form').on('submit', (event) => {
			event.preventDefault();
			let isOnCartView = (($('#order-entry-table').html() || '') != '');
			if(!isOnCartView){
				let filter = $('#product-search-field').val();
				let reqObj = {url: `${App.ROOT_URL}/pos/get-user-cart`, type: 'get', dataType: 'json', contentType: 'json/application'};
				let loaders = {first: $('#mainCoverScreen')};
				App.performAjaxRequest(reqObj, loaders, (result)=> {
					let url = `${App.ROOT_URL}/pos/orders/${result.cart_id}?filter=${filter}`;
					window.location.href = url;
				});
			}
	});


	$('#client-search-field').autocomplete({
			autoFocus:true,
			classes: {
					"ui-autocomplete": "auto-style"
			},
			position: {
					collision:"fit flip"
			},
			minLength: 1,
			source: (request, response) => {
				let filter = request.term;
				let url = `${App.ROOT_URL}/inventory/customer/search-client?filter=${filter}&limit=5`;
				let reqObj = {url:url, type:'GET', dataType:'json'};
				let loaders = {first:$('.ui-autocomplete-loading'), isAutocomplete:true};
					App.performAjaxRequest(reqObj, loaders, (result)=> {
						let customers = (result.customers) || {};
						let res = [];
						customers.forEach((customer)=> {
							let cus ={}
							cus.id = customer.id || '';
							cus.value = customer.label || '';
							res.push(cus);
						});
						if(res.length != 0) {
							$('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading')
							response(res);
						} else {
							$('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
							Notifier.info('no results found');
						}
				});
				},
			select: (event, ui) => {
				event.stopPropagation();
				$select = $(event.target);
				let value = ui.item.label;
				let id = ui.item.id;
				$('#client-search-id').val(id);
				$select.val(value);
				navSaveAutocompleteFieldValue('client', id, value);
				updateClientUserInfo(value, id);
			},
			change: (event, ui) => {
							event.stopImmediatePropagation();
							console.log('change event');
							let targetVal = $(event.target).val();
							if (targetVal == '') {
									let id = '';
									let value = '';
									updateClientUserInfo(value, id);
							} else {
									navCheckAutocompleteInput(event, ui, $('#client-search-id'), 'client')
							}
						}
			}).focusout((event, ui) => {
					console.log('focus out')
					let $field = $('#client-search-wrapper-id');
					$field.removeClass('client-search-wrapper-open')
					$field.addClass('client-search-wrapper');
			}).keyup((event, ui)=> {
					if($(event.target).val() == '') {
						$('client-search-id').val('');
						let id = '';
						let value = '';
						navSaveAutocompleteFieldValue('client', id, value);
						$(event.target).removeClass('ui-autocomplete-loading');
						}
				}).focusin((event, ui) => {
						console.log('focus in')
						let searchWrapper = $('#client-search-wrapper-id');
						searchWrapper.removeClass('client-search-wrapper');
						searchWrapper.addClass('client-search-wrapper-open');
						}
				);


function updateClientUserInfo(clientName, clientID) {
				let url = `${App.ROOT_URL}/pos/set-user-client`;
				let data = {client_id: clientID};
				let contentType = 'application/json; charset=utf-8';
				let clientLoader = $('.client-active-loader');
				let objData = {type: 'put', data: JSON.stringify(data), dataType: 'json', url: url, contentType: contentType, domElement:2};
				let loaders = {first: clientLoader};
				App.performAjaxRequest(objData, loaders,(result)=> {
					let userInfo = (result.client) || {};
					saveClientInfoToSession(userInfo);
					window.location.reload();
				});
			}


function saveClientInfoToSession(userInfo) {
	if(localStorage.user_bibiara_app) {
		let sessionData = JSON.parse(localStorage.user_bibiara_app);
		sessionData.client_id = userInfo.id;
		sessionData.client_nickname = userInfo.nickname;
		
		localStorage.setItem('user_bibiara_app', JSON.stringify(sessionData));
	}
}


$(document).on('click', '#navigate-pos', (event) => {
	event.preventDefault();
	window.location.href = `${App.ROOT_URL}/pos/orders/sale`;
});

$(document).on('click', '#navigate-report', (event) => {
	event.preventDefault();
	window.location.href = `${App.ROOT_URL}/reports`;
});

$(document).on('click', '#navigate-inventory', (event) => {
		event.preventDefault();
		window.location.href = `${App.ROOT_URL}/inventory/stock-in`;
});

$(document).on('click', '#menu-purchases', (event)=> {
		let url = `${App.ROOT_URL}/pos/orders/purchase`;
		window.location.href = url;
});

$(document).on('click', '#menu-sales', (event)=> {
		let url = `${App.ROOT_URL}/pos/orders/sale`;
		window.location.href = url;
});

$(document).on('click', '#menu-transfer', (event)=> {
		let url = `${App.ROOT_URL}/pos/orders/transfer`;
		window.location.href = url;
});

$(document).on('click', '.menu-stocks', (event)=> {
		let url = `${App.ROOT_URL}/pos/stock`;
		window.location.href = url;
});

$(document).on('click', '#menu-stock-in', (event)=> {
	let url = `${App.ROOT_URL}/inventory/stock-in/`;
	window.location.href = url;
})

$(document).on('click', '#menu-bank', (event)=> {
		let url = `${App.ROOT_URL}/inventory/bank/`;
		window.location.href = url;
});

$(document).on('click', '#menu-depot', (event)=> {
		let url = `${App.ROOT_URL}/inventory/depot/`;
		window.location.href = url;
});


$(document).on('click', '.cart-icon', (event) => {
			event.preventDefault();
			let clientID = $('#client-search-id').val();
			let baseUrl = `${App.ROOT_URL}/pos/orders/`;
					let orderId = $.getUrlIdParam();
					if(!isNaN(parseInt(orderId))) {
					let url = baseUrl+orderId;
					window.location.href = url;
					}	else {
								let reqObj = {url: `${App.ROOT_URL}/pos/get-user-cart`, type: 'GET', dataType: 'json', contentType: 'json/application'};
								let loaders = {first: $('#mainCoverScreen')};
								App.performAjaxRequest(reqObj, loaders, (result)=> {
									let cartId = (result.cart_id) || '';
									let url = baseUrl+result.cart_id;
									window.location.href = url;
								});
						}
				});


	$(document).on('mouseup', 'body', (event)=> {
			let $target = $(event.target);
			let $match = $target.hasClass('module-overlay-box');
			if(!$match) {
					let $div = $('.module-overlay');
					if(!$div.hasClass('hidden') && !$target.hasClass('toggle-overlay')) {
							$('.module-overlay').addClass('hidden');
							if($('.module-overlay').hasClass('hidden')) {
									$('.overlay-show').removeClass('hidden');
									$('.overlay-hide').addClass('hidden');
							} else {
									$('.overlay-show').addClass('hiden');
									$('.overlay-hide').removeClass('hidden');
							}
					}
			} else {
					$('.module-overlay').removeClass('hidden')
			}
	});


	$(document).on('click', '.toggle-overlay', (event)=> {
		if(!$('.module-overlay').hasClass('hidden')) {
			$('.module-overlay').removeClass('hidden');
		}
	});


	$(document).on('click', '.logout', (event)=> {
			logout();
	});


	$(document).on('focus', '#product-search', (event) => {
			$(event.target).addClass('input-focus');
	});


	$(document).on('focusout', '#product-search', (event) => {
			$(event.target).removeClass('input-focus');
	});


	$(document).on('click', '.toggle-overlay', toggleOverlay);


	$(document).on('click', '.user-caret', (event) => {
			$('.user-dropdown-container').toggleClass('hidden');
	});


	$(document).on('keyup', '#product-search-field', (event) => {
			let $select = $(event.target);
			if($select.val() !== ''|| null) {
					$('.search-symbol').addClass('hidden');
					$('.reset-search').removeClass('hidden');
			} else {
					$('.search-symbol').removeClass('hidden');
					$('.reset-search').addClass('hidden');
			}
	});


	$(document).on('click', '.reset-search', function(event) {
			$('#product-search-field').val('');
			$(event.target).addClass('hidden');
			$('.search-symbol').removeClass('hidden');
	});


  $(document).on('click', '.reset-client', function (event) {
      let id = '';
      let value = '';
      $('#client-search-field').focus();
			$('#client-search-field').val('');
      $('#client-search-id').val('');
      navSaveAutocompleteFieldValue('client', id, value);
			$(event.target).addClass('hidden');
			$('.client-symbol').removeClass('hidden');
		});


	$(document).on('keyup', '#client-search-field', (event) => {
			let $select = $(event.target);
			if($select.val() !== ''|| null) {
					$('.client-symbol').addClass('hidden');
					$('.reset-client').removeClass('hidden');
			} else {
					$('.client-symbol').removeClass('hidden');
					$('.reset-client').addClass('hidden');
			}
	});


	$(document).on('click', '.reset-search', function(event) {
			$('.product-search-field').val('');
			$(event.target).addClass('hidden');
			$('.search-symbol').removeClass('hidden');
	});


	function getLoginInfo() {
			let session = `${App.ROOT_URL}_user`;
			if(localStorage.user_bibiara_app) {
					let result = JSON.parse(localStorage.user_bibiara_app);
					let user = result || {};
					let clientID = (user.client_id) || '';
					let clientNickname = (user.client_nickname) || '';
					console.log('fetching from session');
					displayUserClientField(clientNickname, clientID);
					navSaveAutocompleteFieldValue('client', clientID, clientNickname);
					displayLogedInUser(user.nickname, user.user_id);
			} else {
						let url = `${App.ROOT_URL}/get-login-info`;
						let reqObj = {url: url, type: 'get', dataType: 'json'};
						let loaders = {};
						App.performAjaxRequest(reqObj, loaders, (result)=> {
								let user = result.user;
								let clientID = user.client;
								let clientNickname = user.client_nickname;
								let clientSearchField = ('#client-search-field');
								let usernameField = $('.username-dropdown');
								displayUserClientField(clientNickname, clientID);
								navSaveAutocompleteFieldValue('client', clientID, clientNickname);
								displayLogedInUser(user.nickname, user.user_id);
								localStorage.setItem('user_bibiara_app', JSON.stringify(result));
						});
						// $.ajax({
						// 		url: url,
						// 		type: 'get',
						// 		dataType: 'json'
						// })
						// .done((result)=> {
						// 		if(result.code == 0) {
						// 				let user = result.user;
						// 				let clientID = user.client;
						// 				let clientNickname = user.client_nickname;
						// 				let clientSearchField = ('#client-search-field');
						// 				let usernameField = $('.username-dropdown');
						// 				displayUserClientField(clientNickname, clientID);
						// 				navSaveAutocompleteFieldValue('client', clientID, clientNickname);
						// 				displayLogedInUser(user.nickname, user.user_id);
						// 				localStorage.setItem('user_bibiara_app', JSON.stringify(result));
						// 		} else {
						// 				Notifier.error(result.error_message);
						// 				//window.location.href = `${App.ROOT_URL}/login`;
						// 		}
						// })
						// .fail((req, status, err)=>{
						// 		Notifier.error(err)
						// })
			}
	}


	function displayUserClientField(clientNickname, clientID) {
			$('.client-symbol').addClass('hidden');
			$('.reset-client').removeClass('hidden');
			$('#client-search-field').val(clientNickname);
			// $('#client-search-field').css("margin-left", calcMargin(clientNickname.length));
			$('#client-search-id').val(clientID);
	}


	function displayLogedInUser(username, userID) {
			$('.username-dropdown').text(username);
			$('#username-id').val(userID);
	}


	function calcMargin(lenght){
		let margin = 300
		if(lenght == 6){
			return margin + "px";
		}
		else{
			let div = lenght / 6;
			return Math.floor(margin - (25 * 2)) + "px";
		}
	}


	function logout() {
			let url = `${App.ROOT_URL}/logout`;
			let reqObj = {url:url, type:'get', dataType:'json', contentType: 'json/application'};
			let loaders = {first: $('.main-cover-screen')};
			App.performAjaxRequest(reqObj, loaders, (result)=> {
					console.log(result);
					localStorage.removeItem('user_bibiara_app');
					localStorage.removeItem('currency_bibiara_app');
					window.location.href = `${App.ROOT_URL}/login`;
			});
	}


	function toggleOverlay(event) {
		$('.module-overlay').toggleClass('hidden');
		hideShowOverlayButton();
	}


	function hideShowOverlayButton() {
		let $select = $('.module-overlay');
		let $overlayShow = $('.overlay-show');
		let $overlayHide = $('.overlay-hide');

		if($($select).hasClass('hidden')){
				$($overlayShow).removeClass('hidden')
				$('.overlay-hide').addClass('hidden')
		} else {
				$('.overlay-show').addClass('hidden')
				$('.overlay-hide').removeClass('hidden')
		}
	}


	$.getUrlParameter = function(sParam) {
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
					sURLVariables = sPageURL.split('&'),
					sParameterName,
					i;
			for (i = 0; i < sURLVariables.length; i++) {
					sParameterName = sURLVariables[i].split('=');
					if (sParameterName[0] === sParam) {
							return sParameterName[1] === undefined ? true : sParameterName[1];
					}
			}
	};


	$.getUrlIdParam = function () {
		let url = document.URL;
		let prefix = App.ROOT_URL
						+(App.ROOT_URL.endsWith('/') ? '' : '/')
						+'pos/orders/';
		let urlData = url.split(prefix);
		if(urlData[0] != ''){
			return null;
		}
		let cartId = urlData[1].split('/')[0];
		try{
			cartId = parseInt(cartId);
		}catch(err){
			cartId = null;
		}
		return cartId;
	}


	function navSaveAutocompleteFieldValue(fieldName, id, value) {
	    let fieldObj = autocompleteFields;
	    fieldObj[fieldName].id = id || '';
	    fieldObj[fieldName].value = value || '';
	}


	function navCheckAutocompleteInput(event, ui, selectIdField, fieldName) {
	    let previousId = (autocompleteFields[fieldName].id) || '';
	    let previousValue = (autocompleteFields[fieldName].value) || '';
      let $target = $(event.target);
      console.log(ui.item);
      if (ui.item == null) {
            Notifier.info('Please search and select from list');
	        	$target.val(previousValue);
            selectIdField.val(previousId);
	  		}
			}


function loadModules() {
		let $row =   `<div id="navigate-pos" class="box">
		    							<div class="icon-image-container"><img class="module-icon" src="/imgs/pos1.png" alt="pos"></div>
		    							<div class="icon-label-container"><span class="icon-label-text">POS</span></div>
		    					</div>

	    						<div id="navigate-report" class="box">
	    								<div class="icon-image-container"><img class="module-icon" src="/imgs/report.png" alt="pos"></div>
	    								<div class="icon-label-container"><span class="icon-label-text">REPORTS</span></div>
	    						</div>

	    						<div id="navigate-inventory" class="box">
	    								<div class="icon-image-container"><img class="module-icon" src="/imgs/inventory.png" alt="pos"></div>
	    								<div class="icon-label-container"><span class="icon-label-text">INVENTORY</span></div>
	    						</div>`;

		let $selectBase = $('.module-overlay-box');
		$selectBase.append($row);
}


function loadMainNav() {
		console.log('appending mainnav');
		let $row = `
					<div class="main-nav row">
						<div class="col-md-2 left-wrapper">
							<div class="row pt-2">
								<div class="col-sm-12">
									<img class="logo ml-1" src="/imgs/logo.png">
								</div>
							</div>

							<div class="row">
								<div class="current-nav ml-1 mt-2 col-sm-12">
									<label class="nav-list toggle-overlay">POS</label>
									<span>
										<i class="fas fa-caret-down overlay-show toggle-overlay"></i>
										<i class="fas fa-times overlay-hide hidden toggle-overlay"></i>
									</span>
								</div>
							</div>
						</div>


						<div class="col-md-5 middle-wrapper">
							<div class="row">
									<form id="product-search-form" class="mt-4">
										<div class="input-group col-sm-12 mt-3 product-search-wrapper">
											<input type="text" class="form-control" placeholder="Search product....." id="product-search-field">
											<div class="input-group-append">
												<span class="input-group-text" id="search-options">
													<i class="fas fa-search search-symbol"></i>
													<i class="fas fa-times reset-search hidden"></i>
												</span>
											</div>
										</div>
									</form>
							</div>
						</div>

						<div class="col-md-5 right-wrapper">
							<div class="row">
								<div class="dropdown nav-item col-sm-8 offset-4">
									<a class="dropdown-toggle username-dropdown" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">

									</a>
									<input type="text" val="" class="hidden" id="username-id">
									<div class="dropdown-menu" aria-labelledby="navbarDropdown">
										<a class="dropdown-item" href="#">Profile</a>
										<div class="dropdown-divider"></div>
										<a class="dropdown-item logout" href="#">Logout</a>
									</div>
								</div>
							</div>

							<div class="row mt-2">
								<div class="col-sm-12">
									<div class="input-group client-search-wrapper" id="client-search-wrapper-id" style="position: relative;">
										<img src="/imgs/spin2.gif" class="mt-2 mr-1 client-active-loader hidden"/>
										<input type="text" class="form-control nav-autocomplete" placeholder="Client..." id="client-search-field">
										<input type="text" name="" value="" class="hidden" id="client-search-id">
										<div class="input-group-append">
											<span class="input-group-text" id="search-options">
												<i class="fas fa-search client-symbol"></i>
												<i class="fas fa-times reset-client hidden"></i>
											</span>
										</div>
									</div>
								</div>
							</div>

						</div>
					</div>		<!--Main navaber end-->

					<div class="row module-overlay hidden">
						<div class="module-overlay-box col-md-12">
							<!-- <div id="navigate-pos" class="box">
								<div class="icon-image-container"><img class="module-icon" src="/imgs/pos1.png" alt="pos"></div>
								<div class="icon-label-container"><span class="icon-label-text">pos</span></div>
							</div>

							<div id="navigate-report" class="box">
									<div class="icon-image-container"><img class="module-icon" src="/imgs/report.png" alt="pos"></div>
									<div class="icon-label-container"><span class="icon-label-text">reports</span></div>
							</div>

							<div id="navigate-inventory" class="box">
									<div class="icon-image-container"><img class="module-icon" src="/imgs/inventory.png" alt="pos"></div>
									<div class="icon-label-container"><span class="icon-label-text">inventory</span></div>
							</div> -->
						</div>
					</div>

					<div class="row menu-wrapper">
						<div class="col-sm-8 menu-left">
							<ul class="menu-list">
									<li id="menu-sales">sales</li>
									<li id="menu-purchases">purchases</li>
									<li id="menu-transfer">transfer</li>
							</ul>
						</div>
						<div class="col-sm-4 submenu-icon menu-right">
								<button class="icon-logo icon-filter float-right menu-stocks">ICON</button>
						</div>
					</div>
				`;

				let $selectBase = $('.nav-container-fluid');
				console.log($row);
				$selectBase.append($row);
}





})(jQuery)
