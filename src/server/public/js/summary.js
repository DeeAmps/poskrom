(function($){
    let invoiceXrate = '';
    let pageDetails = {};
    let current_url = document.URL;
    let order_id = getOrderID(current_url);
    let currentSelectedPaymentEntry = {};
    let default_balance = 0;
    let defaultInvoice = {};
    let summaryAutocompleteFieldsObj = {buyer: {}, seller: {}, currency: {}, depot: {}, credit_bank: {}, debit_bank: {}};


$(document).ready(() => {
    initCheckoutWithDefaults();
});


$(document).on('input focusin focusout', '#select-quantity', (event)=> {
    let inputText = $(event.target).val();
    let addBtn = $('#add-payment-btn');
    let addAllBtn = $('#addall-payment-btn');
    checkQuantityFieldActivateBtn(addBtn, addAllBtn);
});


function checkQuantityFieldActivateBtn(addBtn, addAllBtn) {
    let inputText = $('#select-quantity').val();
    if(inputText.length > 0 && !isNaN(inputText)) {
        activateBtn(addBtn);
        activateBtn(addAllBtn);
    } else {
        deactivateBtn(addBtn);
        deactivateBtn(addAllBtn)
        if(!paymentContainerIsEmpty()) {
            activateBtn(addAllBtn)
        }
    }
}


$(document).on('click', '#add-payment-btn', (event) => {
    let $quantityTextField = $('#select-quantity');
    let count = $quantityTextField.val();
    if(count != '' && !isNaN(count)){
        $('#select-payment').attr({disabled:true});
        $('#select-currency').attr({disabled:true});
        handleAddDenominationsTag();
        resetPaymentForm();
        $('#select-quantity').focus();
    } else {
        Notifier.error('Enter denomination count');
    }
});


$(document).on('click', '.tag-delete',(event) => {
    removeTag(event);
});



$(document).on('click', '.num-key label', (event)=> {
    handleNumberPadClick(event);
    let addBtn = $('#add-payment-btn');
    let addAllBtn = $('#addall-payment-btn');
    checkQuantityFieldActivateBtn(addBtn, addAllBtn);
});


$(document).on('click', '#config-wrapper', togglePaymentConfig);

function togglePaymentConfig(event) {
    let $toggleBtn = $(event.target).closest('#config-wrapper');
    let $configContainer = $('.config-container');
    $configContainer.toggle(500, ()=> {
        let isVisible = $configContainer.is(':visible');
        if(isVisible) {
            $('.fa-angle-down').addClass('hidden');
            $('.fa-angle-up').removeClass('hidden');
        }else {
            $('.fa-angle-up').addClass('hidden');
            $('.fa-angle-down').removeClass('hidden');
        }
    })

    // if(isVisible) {
    //     $configContainer.hide()
    // } else {
    //     $configContainer.slideUp();
    // }
}

$('#receipt-print-direct').click((event)=> {
    handleCheckPrintOption(event);
});


$(document).on('focusin', '#select-quantity', (event)=> {
    $('.calculator-wrapper').removeClass('hidden');
});

$(document).on('click', '#btn-delete-payment-entry-modal', (event)=> {
    let paymentId = $('#confirm-box-payment-entry-id').val()
    $('.modal').modal('hide');
    handleDeletePaymentEntry(paymentId);
    handleConfirmBoxResponse();

})


$(document).on('click', 'body', (event)=> {
    event.stopPropagation();
    let $target = $(event.target).hasClass('num');
    let $target2 = $(event.target).hasClass('quantity-field');
    let $target3 = $(event.target).parent().hasClass('num-key');
    if(!$target3) {
        $('.calculator-wrapper').addClass('hidden');
    }
    if($target2) {
        $('.calculator-wrapper').removeClass('hidden');
    }
});


$(document).on('click', '#addall-payment-btn', (event) => {
  // if(!paymentContainerIsEmpty()) {
  //   addAllTags();
  //   clearModal();
  //   $('#popup-total-label').text('');
  //   $('#payment-modal').modal('hide');
  //   $('.tag-base').empty();
  //   $('#select-payment').attr({disabled:false});
  //   $('#select-currency').attr({disabled:false});
  // }
  // else {
  //   Notifier.error('Cant add empty payment');
  // }
    handleAddPaymentToList();
})

//Delete Functions
function handleConfirmDeletePaymentBox(paymentId) {
    let confirmBox = $('#confirm-payment-delete');
    confirmBox.find('#confirm-box-payment-entry-id').val(paymentId);
    confirmBox.modal({
        show:true,
        backdrop:false,
        keyboard:false
    })
}


function handleConfirmBoxResponse() {
    $('#confirm-box-payment-entry-id').val('');
}


function handleDeletePaymentEntry(paymentId) {
    let entry = event
    let url = `${App.ROOT_URL}/pos/payment-entries`;
    let payments = [];
    payments.push(paymentId);
    let data = {payment_ids:payments};
    let reqObj = {type:'delete', url:url, dataType:'json', data:JSON.stringify(data), contentType:'application/json; charset=utf-8'};
    let loaders = {first:$('#mainCoverScreen')};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        $selectEntry = $(`#${paymentId}`).parent();
        let xrate = $selectEntry.find('.list-currency-xrate').val();
        let defaultXrate = getDefaultCurrencyData().xrate;
        let amount = $selectEntry.find('.quantity-display').text();
        let convertedAmount = convertAmountToDefaultCurrency(amount, xrate, defaultXrate);
        $selectEntry.remove();
        updateTotalPaid(-convertedAmount);
        updateBalance(convertedAmount);
    });
}


function handleNumberPadClick(event) {
    $('#select-quantity').focus();
    let padId = $(event.target).attr('id');
    let padValue = $(event.target).text();
    let padIsNumber = $(event.target).hasClass('num');
    let $quantityField = $('#select-quantity');
    // let quantityValue = $quantityField.val();
    if(padIsNumber) {
        let quantityString = $quantityField.val();
        if(isDecimal(event) && padValue == '.') {
            $quantityField.val(quantityString);
            Notifier.error('Invalid entry');
        } else {
          $quantityField.val(quantityString+String(padValue));
        }

    } else {
        if(padId == 'num-back') {
            let result = $quantityField.val().slice(0,-1);
            $quantityField.val(result);
        }
        if(padId == 'num-decimal') {
            let qString = $quantityField.val();
            let result = qString + '.';
            $quantityField.val(result);
        }
    }
}


function handleCheckPrintOption(event) {
      let $target = $(event.target);
      let printStatus = $target.is(':checked');
      let url = `${App.ROOT_URL}/customers`;
      let data = {};
      data.print = printStatus;
      sessionStorage.setItem('print_user_bibiara_app', JSON.stringify(data))
}


function getPrintStatusFromSession() {
  if(sessionStorage.print_user_bibiara_app) {
      let result = JSON.parse(sessionStorage.print_user_bibiara_app);
      return result.print;
  }
    return false;
}


function handleDirectPrint(handler) {
    getInvoiceFromCheckout(handler);
}


function handleAddPaymentToList() {
    let creditBankId = $('#select-credit-bank-id').val();
    let $quantityField = $('#select-quantity').val();
    if($quantityField != '') {
        clickAddDenominationBtn();
    }
    if(creditBankId != '') {
        if(!paymentContainerIsEmpty()) {
            handleAddPaymentEntriesToList();
        } else {
            Notifier.error('you cant add empty payment');
        }
    } else {
        Notifier.info('please set credit bank');
    }

}


$(document).on('click', '#cedi-close', (event) => {
    $(this).addClass('hidden');
});


$(document).on('change', '#select-payment', (event) => {
  let paymentId = getSelectedPaymentChannel();
  handlePaymentChannelChange(paymentId);
});


$(document).on('change', '#select-currency', (event) => {
    let currency = getCurrencyData()[getSelectedCurrencyID()];
    if(App.internetConnectionAvailable()) {
        getCurrencyDenominations();
        $('#popup-caption-label-symbol').text(currency.symbol);
        $('#popup-caption-label').text(currency.cap);
    } else {
        Notifier.error(App.INTERNET_ERROR_MSG);
    }
});


$(document).on('click', '.delete-payment-entry', (event) => {
    let $select = $(event.target).closest('.cash-wrapper');
    let paymentId = $select.find('.paymentIds').val();
    handleConfirmDeletePaymentBox(paymentId, $select);
});




$('#checkout-id').on('submit', (event) => {
    event.preventDefault();
    let creditBankId = $('#select-credit-bank-id').val();
    if(!paymentContainerIsEmpty() || $('#select-quantity').val()!='') {
        if($('#select-quantity').val()!='') {
            clickAddDenominationBtn();
        }
        let data = getDenominationDataFromTagsContainer() || {};
        let channel = data.channel;
        let currency = data.currency;
        let amount = data.amount;
        let denominationList = data.denominatioList;
        let paymentId = '';
        if(creditBankId != ''){
            addPaymentsToPaymentEntriesList(channel, currency, amount, denominationList, paymentId, submitPaymentComplete);
        } else {
            Notifier.info('Please set credit bank');
        }
    } else {
        submitPaymentComplete(null);
    }
});


$('.checkout-to-status').on('submit', (event)=> {
    console.log('to status')
    let orderId = ($.getUrlIdParam()) || '';
    location.href = `${App.ROOT_URL}/pos/orders/${orderId}/status`;
})


function makeOrderCloseBtnStatusBtn() {
    let $closeOrderBtn = $('#btn-submit');
    $closeOrderBtn.html('status');
}


function paymentEntriesListIsEmpty() {
    let $paymentEntries = $('.dynamic-base').find('.cash-wrapper');
    let paymentEntriesLength = $paymentEntries.length;
    return paymentEntriesLength == 0 ? true : false;
}


function submitPaymentComplete(result) {
    let orderId = $.getUrlIdParam();
    let url = `${App.ROOT_URL}/pos/orders/${orderId}`;
    let data = {};
    data.closed_on = new Date();
    let reqObj = {url:url, type:'put', data:JSON.stringify({sales_order:data}), dataType:'json', contentType:'application/json; charset=utf-8'};
    let loaders = {first:$('#mainCoverScreen')};
    let closeOrderBtn = $('#btn-submit');
    let btnText = closeOrderBtn.html();
    if(btnText === 'status') {
        console.log('status');
        location.href = `${App.ROOT_URL}/pos/orders/${orderId}/status`;
    } else {
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            makeOrderCloseBtnStatusBtn();
            Notifier.success('order closed successfully!');
            clearDenominationTagContainer(null);
            if(!getPrintStatusFromSession()) {
                location.href = `${App.ROOT_URL}/pos/orders/${orderId}/status`;
            }else {
                handleDirectPrint(redirectToOrderStatus);
            }
        });
    }
}


function redirectToOrderStatus() {
    let orderId = $.getUrlIdParam()
    location.href = `${App.ROOT_URL}/pos/orders/${orderId}/status`;
}

$('#select-seller').autocomplete({
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
        let url = `${App.ROOT_URL}/inventory/customer/search-seller?order_id=${$.getUrlIdParam()}&filter=${filter}&limit=5`
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            if (result.customers.length != 0) {
              response(result.customers);
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
            } else {
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                Notifier.info('no results found');
            }
        });
    },
    select: (event, ui) => {
            event.stopPropagation();
            $select = $(event.target);
            let value = (ui.item.label) || '';
            let id = (ui.item.id) || '';
            $('#select-seller-id').val(id);
            $select.val(value);
            saveAutocompleteFieldValue('seller', id, value)
            handleSellerChange(event);
    },
    change: (event, ui) => {
            let target = $(event.target).val();
            if(target == '') {
                handleSellerChange(event);
            } else {
                checkAutocompleteInput(event, ui, $('#select-seller-id'), 'seller');
            }
        }
    })
    .keyup((event, ui)=> {
        if($(event.target).val() == '') {
            let id = '';
            let value = '';
            $('#select-seller-id').val('');
            saveAutocompleteFieldValue('seller', id, value);
        }
    });


$('#select-buyer').autocomplete({
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
        let url = `${App.ROOT_URL}/inventory/customer/search-buyer?order_id=${$.getUrlIdParam()}&filter=${filter}&limit=5`;
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            if(result.customers.length != 0) {
                response(result.customers);
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
            } else {
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                Notifier.info('no results found');
            }
        })
    },
    select: (event, ui) => {
        event.stopPropagation()
        $select = $(event.target);
        let value = (ui.item.label) || '';
        let id = (ui.item.id) || '';
        if(ui.item != null) {
            $('#select-buyer-id').val(id);
            $select.val(value);
            saveAutocompleteFieldValue('buyer', id, value)
            handleBuyerChange(event);
        }
    },
    change: (event, ui) => {
        let target = $(event.target).val();
        if(target == '') {
            handleBuyerChange(event);
        } else {
            checkAutocompleteInput(event, ui, $('#select-buyer-id'), 'buyer');
        }
      }
  })
  .keyup((event, ui) => {
      if($(event.target).val() == '') {
          let id = '';
          let value = '';
          $('#select-buyer-id').val('');
          saveAutocompleteFieldValue('buyer', id, value);
      }
  })



  $('#select-depot').autocomplete({
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
      let orderId = $.getUrlIdParam();
      let url = `${App.ROOT_URL}/inventory/depot/search-stock-in-depot?order_id=${orderId}&filter=${filter}&limit=5`;
      let reqObj = {url:url, type:'GET', dataType:'json'};
      let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
      App.performAjaxRequest(reqObj, loaders, (result)=> {
          if(result.depots.length != 0) {
                response(result.depots);
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
            } else {
                $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                Notifier.info('no results found');
            }
      });
    },
      select: (event, ui) => {
            event.stopPropagation()
            $select = $(event.target);
            let value = (ui.item.label) || '';
            let id = (ui.item.id) || '';
            if(ui.item != null) {
                $('#select-depot-id').val(id);
                $select.val(value);
                saveAutocompleteFieldValue('depot', id, value)
                handleDepotChange(event);
            }
      },
    change: (event, ui) => {
            let target = $(event.target).val();
            if(target == '') {
                handleDepotChange(event);
            } else {
                checkAutocompleteInput(event, ui, $('#select-depot-id'), 'depot');
            }
        }
  })
  .keyup((event) => {
          if($(event.target).val() == '') {
              let id = '';
              let value = '';
              $('#select-depot-id').val('');
              saveAutocompleteFieldValue('depot', id, value);
          }
    });



    $('#select-default-currency').autocomplete({
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
        let url = `${App.ROOT_URL}/inventory/currency?filter=${filter}&limit=5`;
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
                if(result.currencies.length != 0) {
                        response(result.currencies);
                        $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                } else {
                        $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                        Notifier.info('no results found');
                }
        });
        },
        select: (event, ui) => {
            let invoiceData = getDefaultCurrencyData();
            event.stopPropagation();
            $select = $(event.target);
            let initial_currency = getDefaultCurrencyData();
            let currency = ui.item;
            let value = currency.label;
            let id = currency.id;
            let xrate = currency.xrate;
            let symbol = currency.symbol;
            let currencyData = {};
            currencyData.id = id;
            currencyData.xrate = xrate;
            currencyData.symbol = symbol;
            currencyData.label = value;
            saveAutocompleteFieldValue('currency', id, value);
            if(id != '') {
                  $('#select-currency-id').val(id);
                  $select.val(value);
                  bindDataToDOMELement($('#select-default-currency'), 'defaultCurrencyData', ui.item);
                  let defaultCurrencyID = $('#select-currency-id').val();
                  let defaultCurrency = getCurrencyData()[defaultCurrencyID];
                  handleDefaultCurrencyChange(invoiceData);
                  //convertAmountToDefaultCurrency()

                  //performCurrencyCalculation(defaultCurrency);
                  //resetBalance(id);
          } else {
                  $('#select-currency-id').val('');
                  $select.val('');
          }
        },
        change: (event, ui) => {
                  checkAutocompleteInput(event, ui, $('#select-currency-id'), 'currency');
        }
        })
        .keyup((event, ui) => {
            if($(event.target).val() == '') {
                let id = '';
                let value = '';
                $('#select-currency-id').val('');
                saveAutocompleteFieldValue('currency', id, value);
            }
        });



$('#select-credit-bank').autocomplete({
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
        let bankType = 'credit';
        let orderId = $.getUrlIdParam();
        let url = `${App.ROOT_URL}/inventory/bank/search-payment-bank?filter=${filter}&order_id=${orderId}&toggle=${bankType}&limit=5`;
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
              if(result.banks.length != 0) {
                  response(result.banks);
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
        let id = (ui.item.id) || '';
        $('#select-credit-bank-id').val(id);
        saveAutocompleteFieldValue('credit_bank', id, value);
        $select.val(value);
    },
    change: (event, ui) => {
        checkAutocompleteInput(event, ui, $('#select-credit-bank-id'), 'credit_bank');
    }
    })
    .keyup((event, ui) => {
        if($(event.target).val() == '') {
            let id = '';
            let value = '';
            $('#select-credit_bank-id').val('');
            saveAutocompleteFieldValue('credit_bank', id, value);
        }
    });


$('#select-debit-bank').autocomplete({
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
        let bankType = 'debit';
        let orderId = $.getUrlIdParam();
        let url = `${App.ROOT_URL}/inventory/bank/search-payment-bank?filter=${filter}&order_id=${orderId}&toggle=${bankType}&limit=5`;
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first: $('.ui-autocomplete-loading'), isAutocomplete: true};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            if(result.banks.length != 0) {
                response(result.banks);
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
        let id = (ui.item.id) || '';
        $('#select-debit-bank-id').val(id);
        saveAutocompleteFieldValue('debit_bank', id, value);
        $select.val(value);
        let bankData = {};
        bankData.debit_bank_id = id;
        //handleBankChange(bankData);
    },
    change: (event, ui) => {
        checkAutocompleteInput(event, ui, $('#select-currency-id'), 'debit_bank');
    }
    })
    .keyup((event, ui) => {
        if($(event.target).val() == '') {
            let id = '';
            let value = '';
            $('#select-bank-id').val('');
            saveAutocompleteFieldValue('debit_bank', id, value);
        }
    });


function handleBankChange(bankData) {
    let paymentId = '';
    let url = `${App.ROOT_URL}/pos/payment-entries/${paymentId}`;
    // let debitBank = $('#select-debit-bank-id').val() || '';
    // let creditBank = $('#select-cresit-bank-id').val() || '';
    let paymentEntries = {};
}


function setAutocompleteHiddenFieldID(event, ui, hiddenField, text) {
    if(ui.item !== null) {
        hiddenField.val(ui.item.id);
    } else {
        //$(event.target).val(text);
        Notifier.error('hey');
    }
}


function saveAutocompleteFieldValue(fieldName, id, value) {
    let fieldObj = summaryAutocompleteFieldsObj;
    fieldObj[fieldName].id = id || '';
    fieldObj[fieldName].value = value || '';
}


function handleDefaultCurrencyChange(invoiceData) {
    // let currentInvoiceData = defaultInvoice || {};
    // let currentXrate = (currentInvoiceData.xrate) || '';
    // let currentInvoiceAmount = (currentInvoiceData.invoice_price) || '';

    // let defaultXrate = defaultCurrency.xrate;
    // let defaultCurrencySymbol = defaultCurrency.symbol;
    // let defaultId = defaultCurrency.id; 
    // let convertedInvoice = convertAmountToDefaultCurrency(currentInvoiceAmount, currentXrate, defaultXrate);
    // console.log(convertedInvoice);

    let invoicePrice = $('#invoice-amount-value').text();
    let invoiceRate = invoiceData.xrate;
    let defaultCurrencyData = getDefaultCurrencyData();
    let toXrate = defaultCurrencyData.xrate;
    let defaultCurrencySymbol = defaultCurrencyData.symbol;
    let convertedInvoice = convertAmountToDefaultCurrency(invoicePrice, invoiceRate, toXrate);
    let invoiceDict = {};
    invoiceDict.amount = invoicePrice;
    invoiceDict.xrate = invoiceRate;
    let balanceData = {}
    balanceData.symbol = defaultCurrencySymbol;
    balanceData.amount = convertedInvoice;
    setInvoicePriceField(invoiceDict);
    resetBalanceField(balanceData);
    let total = (getPaymentEntriesCurrencyConvertTotal(toXrate)) || '';
    resetTotalPaid(total);
    updateBalance(-total);
}


function resetTotalPaid(total) {
    let $totalPaidField = $('#paid-value');
    $totalPaidField.text((Number(total)).toFixed(2));
}


function updateDefaultInvoiceData(id, invoicePrice, xRate) {
    defaultInvoice.id = id;
    defaultInvoice.invoice_price = invoicePrice;
    defaultInvoice.xrate = xRate;
}


function updateInvoicePriceField(invoiceData) {
    let $invoiceAmountField = $('#paid-value');
    let $defaultCurrencySymbolField = $('#paid-cash-label');
    let symbol = invoiceData.symbol;
    let convertedAmount = Number(invoiceData.amount);
    $defaultCurrencySymbolField.text(symbol);
    $invoiceAmountField.text(convertedAmount.toFixed(2));
}


function resetBalanceField(balanceData) {
    let $balanceField = $('#balance-value');
    let $balanceSymbolField = $('#balance-cash-label');
    let symbol = balanceData.symbol;
    let balance = Number(balanceData.amount);
    $balanceSymbolField.text(symbol);
    $balanceField.text(balance.toFixed(2))
}



function checkAutocompleteInput(event, ui, selectIdField, fieldName) {
  let previousId = (summaryAutocompleteFieldsObj[fieldName].id) || '';
  let previousValue = (summaryAutocompleteFieldsObj[fieldName].value) || '';
  let $target = $(event.target);
  if(ui.item == null) {
      $target.val(previousValue);
      selectIdField.val(previousId);
      Notifier.info('Please search and select from list');
  }
}



function initCheckoutWithDefaults() {
    let orderId = $.getUrlIdParam();
    let sellerId = $.getUrlParameter('seller_id');
    let buyerId = $.getUrlParameter('buyer_id');
    let queryList = [`order_id=${ orderId }`];
    if (sellerId != null) {
        queryList.push(`seller_id=${sellerId}`);
    }
    if (buyerId != null) {
        queryList.push(`buyer_id=${buyerId}`);
    }
    let url = `${App.ROOT_URL}/pos/get-checkout-details?${queryList.join('&')}`;
    let reqObj = {type: 'GET', url:url, dataType: 'json'};
    let loaders = {first:$('#mainCoverScreen')};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        updateDefaultFields(result);
    });
      }



function returnFocusToField(event, ui, selectIdField) {
  if((selectIdField.val() == '') && ($(event.target).val() != '')) {
      $(event.target).focus();
  }
}



function updateDefaultFields(response) {
    deactivateBtn($('#addall-payment-btn'));
    deactivateBtn($('#add-payment-btn'));
    let data = response || {};
    console.log(data)
    let salesOrder = (data.sales_order || {});
    let seller = salesOrder.seller || {};
    let buyer = salesOrder.buyer || {};
    let depot = salesOrder.stock_in_depot || {};
    let defaultCheckoutCurrency = data.default_checkout_currency || {};
    let creditBank = data.default_credit_bank || {};
    let debitBank = data.default_debit_bank || {};
    let payments = data.payments;
    let $printCheckbox = $('#receipt-print-direct');
    let defaultSalesOrder = data.sales_order;
    handleCloseOrderButtonOrderStatus((defaultSalesOrder.status) || '');
    
    $('#select-seller').val(seller.label);
    $('#select-seller-id').val(seller.id);
    saveAutocompleteFieldValue('seller', seller.id, seller.label);

    $('#select-buyer').val(buyer.label);
    $('#select-buyer-id').val(buyer.id);
    saveAutocompleteFieldValue('buyer', buyer.id, buyer.label);

    $('#select-depot').val(depot.label);
    $('#select-depot-id').val(depot.id);
    saveAutocompleteFieldValue('depot', depot.id, depot.label);

    $('#select-default-currency').val(defaultCheckoutCurrency.label)
    $('#select-currency-id').val(defaultCheckoutCurrency.id);
    saveAutocompleteFieldValue('currency', defaultCheckoutCurrency.id, defaultCheckoutCurrency.label);

    $('#select-credit-bank').val(creditBank.label);
    $('#select-credit-bank-id').val(creditBank.id);
    saveAutocompleteFieldValue('credit_bank', creditBank.id, creditBank.label);

    $('#select-debit-bank').val(debitBank.label);
    $('#select-debit-bank-id').val(debitBank.id);
    saveAutocompleteFieldValue('debit_bank', debitBank.id, debitBank.label);

    updateDefaultInvoiceData(defaultCheckoutCurrency.id, data.invoice_price, defaultCheckoutCurrency.xrate);

    if(getPrintStatusFromSession()) {
          $printCheckbox.attr('checked', 'checked');
    }

    let defaultPaymentChannel = data.payment_config.default_payment_channel;
    let paymentChannels = data.payment_config.payment_channel;

    let defaultCurrency = data.payment_config.default_payment_channel_currency.default_currency;
    let currencySets = data.payment_config.default_payment_channel_currency.currency;
    let denominationSets = data.payment_config.default_payment_channel_currency_denominations;
    let currencyData = {default_currency_id: defaultCurrency, currency_set: currencySets};

    bindDataToDOMELement($('#select-denomination'), 'denominationData', denominationSets);
    bindDataToDOMELement($('#select-default-currency'), 'defaultCurrencyData', defaultCheckoutCurrency);
    buildPaymentChannelSelect(paymentChannels, defaultPaymentChannel, currencyData);


    setBalanceField(data.invoice_price);
    setInvoicePriceField(data.invoice_price);
    

    handleDefaultPayments(payments);
}



function setInvoicePriceField(invoiceData) {
    let defaultCurrencyData = getDefaultCurrencyData();
    let defaultSymbol = defaultCurrencyData.symbol;
    let xrate = defaultCurrencyData.xrate;
    let invoiceXrate = (invoiceData.xrate) || '';
    let invoiceValue = (invoiceData.amount) || '';
    let convertedAmount = convertAmountToDefaultCurrency(invoiceValue, invoiceXrate, xrate)
    $('#invoice-amount-value').text(convertedAmount.toFixed(2));
    invoiceXrate = xrate;
    $('#invoice-price-xrate').text(xrate);
    $('#paid-cash-label').text(defaultSymbol);
}


function setBalanceField(invoiceData) {
    let defaultCurrencyData = getDefaultCurrencyData();
    let defaultSymbol = defaultCurrencyData.symbol;
    let xrate = defaultCurrencyData.xrate;
    let invoiceXrate = (invoiceData.xrate) || '';
    let invoiceValue = (invoiceData.amount) || '';
    let convertedAmount = convertAmountToDefaultCurrency(invoiceValue, invoiceXrate, xrate)
    $('#balance-value').text(convertedAmount.toFixed(2));
    $('#balance-cash-label').text(defaultSymbol);
}

function handleDefaultPayments(payments) {
    let paymentEntries = payments || [];
    paymentEntries.forEach((payment)=> {
        buildDefaultPayment(payment);
    })
}


function buildDefaultPayment(payment) {
    let defaultCurrencyData = getDefaultCurrencyData();
    let defaultXrate = defaultCurrencyData.xrate;
    let channel = payment.channel || {};
    let currency = payment.currency || {};
    let paymentId = payment.id;
    let amount = 0;
    let denominations = payment.denominations;
    denominations.forEach((denomination)=> {
        let factor = denomination.factor;
        let count = denomination.count;
        amount = amount + getDenominationalMoney(factor, count);
    });
    let currencyXrate = currency.xrate;
    let convertedCurrency = convertAmountToDefaultCurrency(amount, currencyXrate, defaultXrate);
    paymentData = {}
    paymentData.debitor = payment.debitor.label;
    paymentData.created_on = payment.created_on;
    paymentData.id = payment.id;
    appendPaymentEntry(channel, currency, amount, denominations, paymentData);
    updateTotalPaid(convertedCurrency);
    updateBalance(-convertedCurrency);
}


function buildPaymentChannelSelect(paymentChannels, defaultPaymentID, currencies) {
    let $select = getPaymentChannelField();
    let defaultChannelID = defaultPaymentID;
    bindDataToDOMELement($select, 'paymentData', paymentChannels);
    let paymentLength = Object.keys(paymentChannels).length;
    for (channel in paymentChannels) {
        $select.append($('<option>', { value: channel, text: paymentChannels[channel].label }));
    }
    if((Object.keys(paymentChannels) || []).length < 2){
        $select.attr('disabled', 'disabled');
    }
    $select.val(defaultPaymentID);
    buildCurrencySelect(currencies.currency_set, currencies.default_currency_id);
}



function buildCurrencySelect(currencies, defaultCurrencyID) {
    let currencySet = currencies || {};
    clearDropdown($('#select-currency'));
    let $select = getCurrencyField();
    bindDataToDOMELement(getCurrencyField(), 'currencyData', currencySet);
    let currencyLength = Object.keys(currencySet).length;
    for (currency in currencySet) {
        $select.append($('<option>', { value: currency, text: currencySet[currency].label }));
    }
    if((Object.keys(currencySet) || []).length < 2){
        $select.attr('disabled', 'disabled');
    }
    $select.val(defaultCurrencyID);
    let currencyData = (currencySet[defaultCurrencyID]) || {};
    $('#cap-symbol').text(currencyData.symbol);
    $('#cap-value').text(currencyData.cap);
    $('#amount-symbol').text(currencyData.symbol);
    let denominationData = getDefaultDenominationData();
    let denoData = getDefaultDenominationData();
    buildDefaultDenominations(denoData);
}


function initDefaultBalance(balance) {
  default_balance = balance;
}



function buildDefaultDenominations(data) {
    let denominations = data.denominations || [];
    let defaultDeno = data.default_denomination;
    buildCurrencyDenominationSelect(denominations, defaultDeno);
    console.log(data);
  }



function buildCurrencyDenominationSelect(denos, defaultDeno) {
    let denominations = denos || [];
    clearDropdown($('#select-denomination'));
    let $select = getDenominationField();
    let defaultDenomination = defaultDeno;
    $select.val(defaultDenomination);
    for(denomination in  denominations) {
        $select.append($('<option>', {value: denominations[denomination].id, text: denominations[denomination].label}));
    }
    if((Object.keys(denominations) || []).length < 2){
        $select.attr('disabled', 'disabled');
    }
}



function handleDepotChange(event) {
    let eventTarget = $(event.target);
    let depotId = $('#select-depot-id').val();
    let orderId = $.getUrlIdParam();
    let data= {};
    data.stock_in_depot_id = depotId;
    let url = `${App.ROOT_URL}/pos/orders/${orderId}`;
    let reqObj = {type:'PUT', dataType:'json', data:{'sales_order': data}, url:url};
    let loaders = {first: $('.main-cover-screen')};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        //location.reload;
    });
}




function handleSellerChange(event) {
  let orderId = $.getUrlIdParam();
  let sellerId = $('#select-seller-id').val();
  let buyerId = $('#select-buyer-id').val();
  let url = `${App.ROOT_URL}/pos/orders/${orderId}`;
  let data = {};
  data.seller_id = sellerId;
  data.buyer_id = buyerId;
  let reqObj = {type:'PUT', url:url, dataType:'json', data: {'sales_order': data}};
  let loaders = {first:$('.main-cover-screen')};
  App.performAjaxRequest(reqObj, loaders, (result)=> {
      $('#select-seller-id').val(sellerId);
  });
}


function handleBuyerChange(event) {
    console.log('am error ooo')
    let buyerId = $('#select-buyer-id').val();
    let sellerId = $('#select-seller-id').val();
    let orderId = $.getUrlIdParam();
    let url = `${App.ROOT_URL}/pos/orders/${orderId}/summary?buyer_id=${buyerId}&seller_id=${sellerId}`;
    window.location.href = url;
}


function handleCreditDepotChange(event) {
    let creditBankId = $('#select-depot-id').val();
    let orderId = $.getUrlIdParam();
    let url = `${App.ROOT_URL}/pos/orders/${orderId}/summary?credit_bank_id=${creditBankId}`;

}


function handlePaymentChannelChange(paymentChannelId) {
    let paymentId = paymentChannelId;
    let orderId = $.getUrlIdParam();
    let url = `${App.ROOT_URL}/pos/get-checkout-payment-channel-currencies?payment_channel_id=${paymentId}&order_id=${orderId}`
    let reqObj = {type:'get', url:url, dataType:'json'};
    let loaders = {};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        let currencyData = (result.channel_currency) || {};
        let defaultCurrency = currencyData.default_currency;
        let currencySet = currencyData.currencies;
        buildCurrencySelect(currencySet, defaultCurrency);
    });
    }



function handlePopupTotal() {
    let total = Number($('popup-total-label').val());
    let $total = $('#popup-total-label');
    $('.tag-base').find('.tag').each(() => {
      let quantity = Number($(this).find('.tag-bold').text());
      let factor = Number($(this).find('.tag-factor-value').val());
      let money = getDenominationalMoney(factor, quantity);
      total += Number(money);
    })
}


function clearDropdown(select) {
    select.find('option').remove().end();
}


function getOrderID(url) {
    let url_data = url.split('/');
    let len = url_data.length;
    let id = url_data[len-2];
    return id;
}


function handleAddDenominationsTag() {
    let paymentChanneId = getSelectedPaymentChannel();
    let currencyId = getSelectedCurrencyID();
    let denominationId = $('#select-denomination').val();
    let quantity = Number($('#select-quantity').val());
    let denomination = getdenominationData().denominations.filter((item) => {
      return item.id == denominationId;
    })[0];
    let payments = getpaymentSetData();
    let factor = denomination.factor; //TODO get default denomination factor
    addDenominationTagFor(denomination, payments, quantity, factor);
}


function getDenominationalMoney(factor, quantity) {
  return (Number(quantity)*Number(factor))/100;  //TODO use default denomination factor
}


function updateBalance(amount) {
    let transCurrency = getDefaultCurrencyData();
    let currencySymbol = transCurrency.symbol;
    let $balanceField = $('#balance-value');
    let $balanceCurrencySymbolField = $('#balance-label');
    let currentBalance = $balanceField.text();
    $balanceCurrencySymbolField.text(currencySymbol);
    $balanceField.text((Number(currentBalance)+Number(amount)).toFixed(2));
    if($balanceField.text() < 0 ) {
        $balanceCurrencySymbolField.removeClass('balance-positive');
        $balanceCurrencySymbolField.addClass('balance-negative');
        $balanceField.removeClass('balance-positive');
        $balanceField.addClass('balance-negative');
    } else {
        $balanceCurrencySymbolField.removeClass('balance-negative');
        $balanceCurrencySymbolField.addClass('balance-positive');
        $balanceField.removeClass('balance-negative');
        $balanceField.addClass('balance-positive');
    }
}


function getCustomerID() {
  return $('#select-buyer-id').val();
}


function getDepotID() {
  $('#select-depot-id').val();
}


function getpaymentSetData () {
  return $('#select-payment').data('paymentData');
}


function getDebitorId() {
    return $('#debitor-id').val();
}

function getdenominationData() {
  return $('#select-denomination').data('denominationData');
}


function bindDataToDOMELement(element, variable, data) {
  element.data(variable, data);
}


function getDefaultCurrencyID() {
  return $('#select-currency-id').val();
}


function getDefaultCurrencyData() {
  return $('#select-default-currency').data('defaultCurrencyData');
}


function getCurrencyField() {
  return $('#select-currency');
}


function getCreditBankId() {
  return $('#select-credit-bank-id').val()
}


function getDebitBankId() {
    return $('#select-debit-bank-id').val();
}


function clickAddDenominationBtn() {
    $('#add-payment-btn').click();
}

function getSelectedCurrencyID() {
  return getCurrencyField().val();
}


function getCurrencyData() {
  return getCurrencyField().data('currencyData');
}


function getPaymentChannelField () {
  return $('#select-payment');
}


function clearDenominationTagContainer(result) {
    $('.tag-base').empty();
    let defaultAmount = 0.00;
    $('#amount-value').text(defaultAmount.toFixed(2));
}

function getSelectedPaymentChannel() {
  return getPaymentChannelField().val();
}

function getDenominationField() {
  return $('#select-denomination');
}


function getSelectedDenomination() {
  return getDenominationField().val();
}


function getDefaultDenominationData() {
    let denominationSelect = $('#select-denomination');
    let denominationData = denominationSelect.data('denominationData');
    return denominationData;
}

function getDenominationObject() {
  let denomination = getSelectedDenomination();
  return getdenominationData().denominations.filter((item)=>{return item.id==denomination})[0];
}


function getCurrencyObject() {
  return getpaymentSetData().payment_set.payment_sets[getSelectedPaymentChannel()].currency_set.filter((item) => {
    return item.id == getSelectedCurrencyID();
  })[0];
}


function activateBtn(button) {
    button.prop('disabled', false);
}

function deactivateBtn(button) {
    button.prop('disabled', true);
}

function checkQuantityField() {
    let $quantityField = $('#select-quantity');
    let quantity = $quantityField.val();
    if(quantity > 0) {
        
    }
}

function getQuantityValue() {
  return $('#select-quantity').val();
}


function clearModal() {
  $('#payment-modal').find('#select-quantity').val('');
}


function handleCloseOrderButtonOrderStatus(status) {
    let orderStatus = status || '';
    let $closeOrderBtn = $('#btn-submit');
    if(orderStatus == 'closed') {
        $closeOrderBtn.html('status');
    } else {
        $closeOrderBtn.html('close order');
    }
}

// function performCurrencyCalculation(final) {
//     console.log(final);
//     let to = parseFloat(final.xrate);
//     if(!paymentContainerIsEmpty()){
//         $('#addall-payment-btn').click();
//     }
//     let amount = listedPaymentTotal(to);
//     console.log(amount);
//     //let default_currency_label = getDefaultCurrencyData().symbol;
//     let defaultCurrencyID = $('#select-currency-id').val();
//     let defaultCurrencyLabel = getCurrencyData()[defaultCurrencyID].symbol;
//     $('#paid-value').text(amount.toFixed(2));
//     $('#paid-cash-label').text(defaultCurrencyLabel);
// }


function convertAmountToDefaultCurrency (amount, fromXrate, toXrate) {
    let defaultXrate = Number(toXrate || '');
    let currencyXrate = Number(fromXrate || '');
    let count = Number(amount || '');
    let convertedMoney = (currencyXrate*count)/defaultXrate;
    return convertedMoney;
}


function getPaymentEntriesCurrencyConvertTotal(defaultXrate) {
    let defaultRate = defaultXrate || getDefaultCurrencyData().xrate;
    let total = 0;
    $('.dynamic-base').find('.cash-wrapper').each(function() {
        let amount = $(this).find('.quantity-display').text();
        let currencyId = $(this).find('.list-currency-id').val();
        let currencyData = getCurrencyData()[currencyId];
        let currencyXrate = currencyData.xrate;
        let afterconvert = convertAmountToDefaultCurrency(amount, currencyXrate, defaultXrate);
        total += afterconvert
    })
    return total.toFixed(2);
}


function resetBalance(default_currency_id) {
    let paid = Number($('#paid-value').text());
    let currency = getCurrencyData()[getDefaultCurrencyID()];
    default_balance = currency.cap;
    updateBalance(paid);
    $('#balance-cash-label').text(currency.symbol);
}


function initCurrencyLabel() {
  $select = $('#paid-cash-label').text(getCurrencyObject().label);
}


function addDenominationTagFor(denomination, payment, quantity, factor) {
    let defaultCurrencyData = getDefaultCurrencyData();
    let defaultXrate = defaultCurrencyData.xrate;
    let currencyId = getSelectedCurrencyID();
    let currencyData = getCurrencyData();
    let currency = currencyData[currencyId];
    let xrate = currency.xrate;
    let match = $('.tag-base').find(`#${denomination.id}`);
    if(match.length != 0){
        let target = match.find('.tag-bold');
        target.text(Number(target.text()) + Number(quantity));
        // let amount = target.text();
        // let converted = convertAmountToDefaultCurrency(amount, )
    }else{
        let $row = `<div id="${denomination.id}" class="tag">
            <span class="tag-label">${denomination.label}</span>
            <input class=" tag-denomination-id hidden" value="${denomination.id}"/>
            <span class="tag-bold">${quantity}</span><input class="hidden tag-factor-value" value="${factor}"/>
            <span class="tag-delete pull-right">X</span>
            <span class="tag-channel-id hidden">${payment.id}</span>
            <input class="tag-currency-id hidden" value="${getSelectedCurrencyID()}"/>
            </div>`
        $('.tag-base').append($row);
    }
    let amount = getDenominationalMoney(factor, quantity);
    let convertedAmount = convertAmountToDefaultCurrency(amount, xrate, defaultXrate);
    updateAmount(convertedAmount);
}


function updateAmount(amount) {
    let moneyAmount = amount || '';
    let $amountField = $('#amount-value');
    let amountFieldValue = $amountField.text();
    $amountField.text((Number(amountFieldValue)+Number(moneyAmount)).toFixed(2));
}


function removeTag(event) {
    let defaultXrate = getDefaultCurrencyData().xrate;
    let $select = $(event.target).closest('.tag');
    let initial_amount = $('#popup-total-label').text();
    let factor = Number($select.find('.tag-factor-value').val());
    let quantity = Number($select.find('.tag-bold').text());
    let currencyId = $select.find('.tag-currency-id').val();
    let currency = getCurrencyData()[currencyId]
    let amount = getDenominationalMoney(factor, quantity);
    let xrate = currency.xrate;
    let converted = convertAmountToDefaultCurrency(amount, xrate, defaultXrate);
    updateAmount(-converted);
    $select.remove();
    let tags = $('.tag-base').find('.tag');
    if(tags.length == 0){
        $('#select-payment').attr({disabled:false});
        $('#select-currency').attr({disabled:false});
        deactivateBtn($('#addall-payment-btn'))
    }

}


function getDenominationDataFromTagsContainer(paymentId) {
    let data = {};
    let amount = 0;
    let denominations = {}
    let denominationList = [];
    $('.tag-base').find('.tag').each(function(){
        let denominationDict = {}
        let denominationLabel = $(this).find('.tag-label').text();
        let denominationId = $(this).find('.tag-denomination-id').val();
        let quantity = Number($(this).find('.tag-bold').text());
        let factor = Number($(this).find('.tag-factor-value').val());
        amount = amount + getDenominationalMoney(factor, quantity);
        denominationDict.denomination_id = denominationId;
        denominationDict.count = quantity;
        denominationList.push(denominationDict);
        denominations[denominationId] = quantity;
    })
    let currencyData = getCurrencyData()[getSelectedCurrencyID()];
    let xrate = (currencyData.xrate).toFixed(2); 
    let channel = {id: $('#select-payment').val()
                  , label: $('#select-payment').find('option:selected').text()};
    let currency = {id: $('#select-currency').val()
                      , xrate: xrate 
                      , label: $('#select-currency').find('option:selected').text()};
    data.channel = channel;
    data.currency = currency;
    data.amount = amount;
    data.denominatioList = denominationList;
    data.paymentId = paymentId;
    return data;
}


function handleAddPaymentEntriesToList() {
    let data = getDenominationDataFromTagsContainer();
    let channel = data.channel;
    let currency = data.currency;
    console.log(currency)
    let amount = data.amount;
    let denominationList = data.denominatioList;
    let paymentId = data.paymentId;
    addPaymentsToPaymentEntriesList(channel, currency, amount, denominationList, paymentId, clearDenominationTagContainer);
}


function appendPaymentEntry(channel, currency, amount, denominations, paymentData) {
    let paymentId = paymentData.id;
    let createdOn = paymentData.created_on;
    let debitor = paymentData.debitor || 'anonymous';
    let paymentRowId = (channel.id).toString() + currency.id.toString();
    let $base = $('.dynamic-base');
    let $row =  `<div id="${paymentRowId}" class="form-group row cash-wrapper">
                    <input class="paymentIds hidden" id="${paymentId}" readonly value="${paymentId}">
                    <div class='col-sm-4 rmv-pad-mag'>
                        <span>${channel.label}<span> / <span>${currency.label}<span>
                    </div>
                    <input class="list-channel-id hidden" readonly value="${channel.id}">
                    <input id="denomination-id" class="hidden list-currency-id" value="${currency.id}">
                    <input id="currency_xrate" class="hidden list-currency-xrate" value="${currency.xrate}">
                    <div class="col-sm-2 rmv-pad-mag">
                        <span class="quantity-display"">${amount.toFixed(2)}</span>
                    </div>
                    <div class="col-sm-2">
                        <span class="created-on">${new Date(createdOn).toLocaleDateString()}</span>
                    </div>
                    <div class="col-sm-2">
                        <span class="debtor">${debitor}</span>
                    </div>
                    <div class="col-sm-2" style="padding-right:0;">
                        <button type="button" class="btn btn-danger dynamic-btn delete-payment-entry float-right"><i class="far fa-trash-alt"></i></button>
                    </div>
                    </div>`;
    // denominations.forEach((denomination)=> {
    //     $deno_row = `<label class="hidden denominations" id="${denomination.denomination_id}">${denomination.count}</label>`;
    //     $row = $row + $deno_row;
    // })
    // $row = $row + '</div>';
    $base.prepend ($row);
    if(paymentContainerIsEmpty) {
        deactivateBtn($('#addall-payment-btn'));
    } else {
        activateBtn($('#addall-payment-btn'));
    }
    //checkPaymentConfigSelects();
}



function addPaymentsToPaymentEntriesList(channel, currency, amount, denominations, paymentId, handler){
    let orderId = $.getUrlIdParam();
    let loaders = {first:$('#mainCoverScreen')};
    let paymentRowId = channel.id + currency.id;
    let paymentEntry = {};
    paymentEntry.payment_channel_id = getSelectedPaymentChannel() || '';
    paymentEntry.credit_bank_id = getCreditBankId() || '';
    paymentEntry.debit_bank = getDebitBankId() || '';
    paymentEntry.order_id = orderId;
    let data = {};
    data.denomination_counts = denominations;
    data.payment_entry = paymentEntry;
    let url = `${App.ROOT_URL}/pos/payment-entries`;
    let reqObj = {type:'post', url:url, data:JSON.stringify(data), dataType:'json', contentType:'application/json; charset=utf-8'};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        paymentData = {};
        paymentData.id = result.payment.id;
        paymentData.created_on = new Date();
        paymentData.debitor = '';
        let paymentEntryId = ((result.payment) || {}).id;
        appendPaymentEntry(channel, currency, amount, denominations, paymentData);
        let currencySelectID = getSelectedCurrencyID();
        let currencyData = getCurrencyData() || {};
        let currentCurrency = currencyData[currencySelectID];
        let currencyXrate = (currentCurrency.xrate) || '';
        let defaultXrate = (getDefaultCurrencyData() || {}).xrate;
        let convertedAmount = convertAmountToDefaultCurrency(amount, currencyXrate, defaultXrate);
        updateTotalPaid(convertedAmount);
        updateBalance(-convertedAmount);
        Notifier.success('payments updated!')
        handler(result);
    });
}



  function handlePaid(amount, currency_xrate) {
      let $paid_field = $('#paid-value');
      let paid_value = $paid_field.val();
      let $balance_field = $('#balance-value');
      let balance_value = $balance_field.val();
      let default_currency_xrate = Number(getDefaultCurrencyData().xrate) || 1;
      let money = (amount * currency_xrate)/default_currency_xrate
      $paid_field.text((Number(paid_value)+Number(money)).toFixed(2));
      let total = $paid_field.val();
      updateBalance(total);
    }


  function updateTotalPaid(amount) {
        let moneyAmount = amount || '';
        let $totalPaidField = $('#paid-value');
        let totalPaidValue = ($totalPaidField.text()) || '';
        $totalPaidField.text((Number(totalPaidValue)+Number(amount)).toFixed(2));
    }

  function resetPaymentForm() {
      let quantityField = $('#select-quantity');
      let currency = getCurrencyField();
      quantityField.val('');
  }


  function paymentContainerIsEmpty() {
    let $match = $('.tag-base').find('.tag').length;
    return $match == 0 ? true : false;
  }


function completePayment() {
    let data = {}
    let depot = $('#select-depot-id').val() || 1;
    let seller = $('#seller-buyer-id').val() || 1;
    let payments = [];

    $('.dynamic-base').find('.cash-wrapper').each( function(){
      let denomination_array = [];
      $(this).find('.denominations').each(function() {
        let denos = {};
        let deno = $(this).attr('id');
        let deno_quantity = $(this).text();
        denos['id'] = deno;
        denos['quantity'] = deno_quantity;
        denomination_array.push(denos)
      })
      payments.push(denomination_array);

    })
    data['depot_id'] = depot
    data['seller_buyer'] = seller;
    data['payments'] = payments;
    return data;
}


$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};


function getOrderIdfromCheckout() {
  let urlArray = document.URL.split('/');
  let order_id = urlArray[urlArray.length-2];
  return order_id;
}


function getInvoiceEntry(response) {
    let result = response || {};
    let orderType = result.order_type;
    let entries = result.entries;
    let totalPaid = result.amount_paid;
    let totalAmount = result.total_cost;
    let balance = (Number(totalPaid) - Number(totalAmount)).toFixed(2);
    let customerBalance = balance > 0 ? balance : 0.00;
    $('#receipt-paid').text(totalPaid);
    $('#receipt-balance').text(customerBalance);
    let entriesLength = entries.length;
    let invoiceReference = result.reference_code;
    let $dateField = $('#print-timestamp');
    let orderStatus = result.order_status;
    let $invoiceField = $('#receipt-invoice-number');
    let $totalField = $('#receipt-total');
    let $orderStatusField = $('#order-status-value');
    $invoiceField.text(invoiceReference);
    $dateField.text(new Date().toLocaleDateString());
    $('#order-entries-print tr').remove();
    let total = 0;
    console.log(result);
    for(let entry = 0; entry <entriesLength; entry++) {
        let invoiceEntry = entries[entry];
        let product = invoiceEntry.product.barcode_unit;
        let barcode = product[Object.keys(product)[0]];
        let stocks = barcode.stock_unit;
        let stock = stocks[Object.keys(stocks)[0]];
        let productName = invoiceEntry.product.name;
        let barcodeName = barcode.label;
        let stockName = stock.label;
        let invoiceEntryQuantity = stock.invoice_quantity;
        let unitPrice = stock.unit_price;
        let sum = (Number(invoiceEntryQuantity) * Number(unitPrice)).toFixed(2);
        total = Number(total) + Number(sum);
        let productNames = `${productName} ${barcodeName} ${stockName}`;
        addInvoiceReceiptFor(productNames, invoiceEntryQuantity, unitPrice, sum);
    }
    $totalField.text(total.toFixed(2));
    window.print();
    //window.location.href = `${App.ROOT_URL}/pos/orders/${orderType}`;
}

function getInvoiceFromCheckout(handler) {
    let orderId = $.getUrlIdParam();
    let url = `${App.ROOT_URL}/pos/get-status-data?order_id=${orderId}`;
    console.log(url);
    let reqObj = {type:'get', url:url, dataType:'json'};
    let loaders = {first:$('.main-cover-screen')};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        getInvoiceEntry(result);
        handler();
    });
}


function addInvoiceReceiptFor(productName, quantity, unitPrice, sum) {
    console.log(quantity)
    let orderQuantity = quantity;
    let quantityString = quantity.toString();
    if(quantityString.indexOf('.') != -1) {
        orderQuantity = Math.round(orderQuantity)
    }
    let $row = $('<tr></tr>').html(`<td class="invoice-product">${productName}</td>
                                    <td class="receipt-quantity">${orderQuantity}</td>
                                    <td>${unitPrice}</td>
                                    <td class="receipt-sum">${sum}</td>`).addClass('entry-base');
    $row.appendTo('#order-entries-print');
}



function isDecimal(event) {
    let value = $('#select-quantity').val();
    let decimalAvailable = value.indexOf('.') === -1 ? false : true;
    return decimalAvailable;
}

})(jQuery)
