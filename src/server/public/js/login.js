(function($) {
    $(document).ready(() => {

        $(document).ajaxStart( () => {
                $("#coverScreen").show();
		});

		//Hide loader on ajax stop
		// $(document).ajaxStop( () => {
		// 	$("#coverScreen").hide();
		// });


      $('#login-form').on('submit', (event) => {
        event.preventDefault();
        let $d = new Date();
        let $timestamp = $d.getTime();
        let $passwordField = $('#password-field');
        let $usernameField = $('#username-field');
        let $timestampField = $('#timestamp-field');
        let $authhashField = $('#authhash-field');
        let $loginHash = App.generateLoginHash($usernameField.val(), $passwordField.val());
        let $authHash = App.generateAuthHash($loginHash, $timestamp);
        App.private_key = $loginHash;
        $timestampField.val($timestamp);
        $authhashField.val($authHash);
        // mess-up the password before sending
        $password = $authHash.substring(0, $passwordField.val().length);
        $passwordField.val($authHash.substring(0, $passwordField.val().length));
        let data = {username: $usernameField.val(), authhash: $authHash, timestamp: $timestamp, signature: $password};
        login(data);
      });
    });

  function login(data) {
      let url = `${App.ROOT_URL}/login`;
      let reqObj = {url: url, type: 'POST', dataType: 'json', data: data, noPing: true}
      let loaders = {domElementError: $('#login-error')};
      App.performAjaxRequest(reqObj, loaders, (result)=> {
        $('#login-error').text('');
        setSessionUserInfo(result.user);
        setSessionCurrencyInfo(result.currency);
        window.location.href = `${App.ROOT_URL}/pos/orders/sale`;
      });
  }

  function setSessionUserInfo(userData) {
      localStorage.setItem('user_bibiara_app', JSON.stringify(userData));
  }

  function setSessionCurrencyInfo(currencyData) {
      localStorage.setItem('currency_bibiara_app', JSON.stringify(currencyData))
  }

}
)(jQuery);
