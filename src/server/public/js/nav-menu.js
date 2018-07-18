(function($){
	$(document).ready(() => {


        //Show loader on ajax request start
        $( document ).ajaxStart( () => {
          $("#coverScreen").show();
        });

        //Hide loader on ajax stop
        $(document).ajaxStop( () => {
          $("#coverScreen").hide();
        });

        $('#product-search-form').on('submit', (event) => {
            event.preventDefault();
            let isOnCartView = (($('#order-entry-table').html() || '') != '');
            if(!isOnCartView){
                let filter = $('#product-search-field').val();
                return $.get(`${App.ROOT_URL}/pos/get-user-cart`)
                        .done((result) => {
                            let url = `${App.ROOT_URL}/pos/orders/${result.cart_id}?filter=${filter}`;
                            window.location.href = url;
                        });
            }
        });

		$(document).on('click', '#navigate-pos', (event) => {
			event.preventDefault();
			window.location.href = `${App.ROOT_URL}/pos/orders`;
		})

		$(document).on('click', '#navigate-report', (event) => {
			event.preventDefault();
			window.location.href = `${App.ROOT_URL}/reports`;
		})

		$(document).on('click', '.cart-logo', (event) => {
			event.preventDefault();
			$.get(`${App.ROOT_URL}/pos/get-user-cart`)
				.done((result) => {
						let url = `${App.ROOT_URL}/pos/orders/${result.cart_id}`;
						window.location.href = url;
				});
		})
	});

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


	$.getUrlIdParam = function (url) {
			let urlData = url.split('/');
			let rest = urlData[urlData.length-1];
			let cartId = rest.split('?')[0];
			return cartId;
	}
})(jQuery)
