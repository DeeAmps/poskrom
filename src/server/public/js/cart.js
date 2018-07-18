(function($) {
  let productCache = {};
  let url = document.URL;
  let inf = null;
  let default_entry = {};
  let ajaxTimeout = 500;
  let isUpdateEntryActive =false;
  let urlNavigationReloadCode = 1;
  let isPostingEntry = false;

  // TODO convert monetary values to integers before performing calculations

    getActiveOrderEntry = function(){
        return $('.active-order-entry');
    }

    window.onbeforeunload = function () {
        handleOrderEntryToggle(null, (result)=>{});
    };

    $(document).ready(() => {
        if(performance.navigation.type == urlNavigationReloadCode) {
            $('#product-search-field').val('');
            let url = window.location.toString();
            if(url.indexOf("?") > 0) {
                $('#product-search-field').val('');
                let cleanUrl = url.substring(0, url.indexOf("?"));
                window.history.replaceState({}, document.title, cleanUrl);
            }
        }
        handleInitCart();

      	$('#product-search-form').on('submit', (event) => {
      		    event.preventDefault();
      	      let $searchField = $('#product-search-field');
              handleProductSearch($searchField.val());
        });


        $('#checkout-button').on('click', () => {
              checkoutOrder();
        });

        $(document).on('dblclick', '.unit-price', (event) => {
            let closestTr = $(event.target).closest('tr');
            let clientID = $('#client-search-id').val();
            let userID = $('#username-id').val()
            let entryID = closestTr.attr('id');
            let entryStockUnit = closestTr.find('.stock-units option:selected').val() || '';
            let entryUnitPrice = closestTr.find('.unit-price').text();
            let barcodeLabel = closestTr.find('.barcode-units option:selected').text();
            let stockUnitLabel = closestTr.find('.stock-units option:selected').text();
            let productLabel = closestTr.find('.product-name').text();

            $('#popup-stock-unit-label').text();
            $('#old-price-value').text(entryUnitPrice)
            $('#popup-stock-unit-id').val(entryStockUnit);

            $('#price-product-label').text(productLabel);
            $('#price-stock-label').text(stockUnitLabel);
            $('#price-barcode-label').text(barcodeLabel);
            if(clientID == userID) {
                $('#priceModal').modal({
                    show: true,
                    backdrop: 'static',
                    keyboard: false
                })
            } else {
                  Notifier.error('You do not have this privilege!');
            }
        })


        $(document).on('click', '#popup-update-price-btn', (event) => {
            event.preventDefault();
            let price = $('#popup-new-price').val() || '';
            updateStockPrice(price);
        })
    });



    // function showStockQuantityPopover(event) {
    //     let closestTr = $(event.target).closest('tr');
    //     let value = closestTr.find('.quantity-field').val();
    //     let data = closestTr.data('product');
    //     let barcodeSelected = getSelectedBarcodeUnitId(closestTr);
    //     let stockUnitSelected = getSelectedStockUnitId(closestTr);
    //     let barcode = data.barcode_unit[barcodeSelected];
    //     let stockUnit = barcode.stock_unit[stockUnitSelected];
    //     let stockQuantity = stockUnit.stock_quantity;
    //     $(event.target).popover({
    //         container: 'body',
    //         title: 'Stock Quantity',
    //         content: ` ${value} / ${stockQuantity}`,
    //         placement: 'right',
    //         trigger: 'mouseover',
    //         delay: 0
    //     });
    // }


    function updateStockPrice(price) {
        let userSessionInfo = JSON.parse(localStorage.user_bibiara_app);
        let depotId = userSessionInfo.client_default_depot;
        let stockUnitId = $('#popup-stock-unit-id').val();
        let cedisData = {};
        let pesewasData ={};
        let $newPriceField = $('#popup-new-price');
        let currencyData = getUserCurrencyDenominationUnits();
        let denominationValues = convertPriceToDenominationUnits(price);
        let currrencyId = currencyData.currency_id;
        let denominations = currencyData.denominations;
        let firstDenomination = denominations.first;
        let secondDenomination = denominations.second;
        let cedis = denominationValues.cedis;
        let pesewas = denominationValues.pesewas;
        let resCedis = {id: firstDenomination, count: cedis};
        let resPesewas = {id: secondDenomination, count: pesewas}
        cedisData[firstDenomination] = cedis;
        pesewasData[secondDenomination] = pesewas;
        let $quantityField = $('#popup-new-stock-quantity');
        let stockQuantity = $quantityField.val();
        let stock = {};
        let loader = $('#update-price-loader');
        let updateBtn = $('#popup-update-price-btn');
        if(($newPriceField.val() || '') != ''){
            stock.price = [resCedis, resPesewas];
        }
        if(($quantityField.val() || '') != ''){
            stock.quantity = stockQuantity;
        }
        // let stock = {price: ( ? [resCedis,resPesewas] : null), quantity: stockQuantity};
        let url = `${App.ROOT_URL}/inventory/depot/${depotId}/stock/${stockUnitId}`;
        let data = {};
        data.stock = stock;
        let reqObj = {url: url, type: 'put', dataType: 'json', data:JSON.stringify(data), contentType:'application/json; charset=utf-8'};
        let loaders = {first: $('#mainCoverScreen')};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            Notifier.success('the price has been updated');
            $newPriceField.val('');
            $quantityField.val('');
            location.reload();
        });
    }


    function convertPriceToDenominationUnits(price){
        let num = 100 * parseFloat(price);
        let cedis = parseInt(num / 100);
        let pesewas = (num % 100).toFixed();
        return {cedis:cedis, pesewas:pesewas}
    }


    function getUserCurrencyDenominationUnits() {
        let currencyData = JSON.parse(localStorage.currency_bibiara_app);
        let currency = currencyData.id;
        let defaultDenomination = (currencyData.denominations.filter((denomination)=> {
            return denomination.factor == 100;
        })[0] || {}).id;
        let otherDenomination = (currencyData.denominations.filter((denomination)=> {
            return denomination.factor == 1;
        })[0] || {}).id;
        let denomiantionData = {first: defaultDenomination, second: otherDenomination};
        let data = {currency_id: currency, denominations: denomiantionData};
        return data;
    }


    function initSearchFormField() {
         if(url.indexOf('?filter=') !== -1) {
             let $searchFormField = $('#product-search-field');
             let urlArray = url.split('/');
             let newArray = urlArray[urlArray.length-1].split('=');
             let urlfilter = newArray[newArray.length-1];
             let filter = urlfilter.replace(/%20/g, ' ');
             $searchFormField.val(filter);
         }
    }


    function appendCart(result){
        if(result.code == 0) {
            let entries = result.entries;
            for(var idx in entries) {
                let entry = entries[idx];
                addOrderEntryFor(entry.product, entry.id);
            }
        } else {
            Notifier.error(result.error_message);
        }
    };


    function searchByFormFilter(){
        let filter = $.getUrlParameter('filter');
        let $searchFormField = $('#product-search-field');
        if((filter || '') != ''){      // not '' or null
            let formFilter = $searchFormField.val();
            fetchProduct(formFilter, handleProductSearchResult, handleProductSearchFailure);
        }
    };


    function handleInitCart() {
        let orderId = $.getUrlIdParam();
        let $cartStatus = $('.cart-order-status');
        let $cartOrderType = $('.cart-order-type');
        let $cartReference = $('.cart-reference-code');
        let url = `${App.ROOT_URL}/pos/get-cart-entries?order_id=${orderId}`
        let reqObj = {type:'GET', url:url, dataType: 'json'}
        let loaders = {first: $('#entry-table-loader')};
        // TODO manage async requests
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            console.log(result)
            let entries = (result.entries) || [];
            let cartDetails = result || {};
            let cartStatus = (cartDetails.order_status) || '';
            let cartReferenceCode = (cartDetails.reference_code) || '';
            let cartOrderType = (cartDetails.order_type) || '';
            $cartStatus.text(cartStatus);
            $cartOrderType.text(cartOrderType);
            $cartReference.text(cartReferenceCode);
            if(entries.length == 0) {
                $('.empty-cart').removeClass('hidden');
            } else {
                $('.empty-cart').addClass('hidden');
                appendCart(result);
            }
        })
        initSearchFormField();
        searchByFormFilter();
    }


    function checkIfCartIsEmpty() {
        let $cartEntry = $('tbody#order-entries').find('.order-entry');
        if($cartEntry.length == 0) {
            $('.empty-cart').removeClass('hidden');
        } else {
            if(!$('.empty-cart').hasClass('hidden')) {
                $('empty-cart').addClass('hidden');
            }
        }
    }


    function getSalesOrderEntryFromRow(row){
        let $su_id = getSelectedStockUnitId(row);
        let $quantity = getQuantity(row);
        let $entry_id = getEntryId(row);
        let data = {entry_id: $entry_id, stock_unit: $su_id, quantity: $quantity};
        return data;
    }


    function handleDeleteEntryBtnClick(event) {
        event.stopImmediatePropagation();      // TODO stop seletion of order-entry
        let message = 'Delete successful';
        let $entry = $(event.target).closest('tr');
        handleDeleteEntryData($entry, message, (result) => {});
    };


    $(document).on('keydown focusout', '.quantity-field', (event) => {
      let code = event.which;
      // let isDigit = (code >= 48 && code <= 57)
      let isDecimal = (code == 190 && event.target.value.indexOf('.') < 0)
      let isEnter = (code == 13);
      // let isAllowed = ([13, 8, 46].indexOf(code) >= 0);
      if (isEnter || event.type == 'focusout') {
          let quantity = Number(event.target.value);
          let $row = $(event.target).closest('tr');
          let product = $row.data('product');
          $sum = $row.find('.sum');
          let { unit_price: unitPrice } = getStockUnit($row);
          let newSum = (unitPrice * quantity).toFixed(2);
          let delta = newSum - Number($sum.text());
          updatePriceTotal(delta);
          $sum.text(newSum);
      } else if (isDecimal) {
          return;
      }
    });



    $(document).on('mouseup keyup', '.quantity-field', (event)=> {
          let $row = $(event.target).closest('tr');
          let orderQuantity = $row.find('.quantity-field').val();
          let stockQuantity = getEntryStockDetails($row).stockQuantity;
          verifyStockUnitQuantity(stockQuantity, orderQuantity, $row);
          let target = $(event.target);
          let data = {};
          data.stockQuantity = stockQuantity;
          data.orderQuantity = target;
    });

    $(document).on('change', '.barcode-unit-select', handleBarcodeUnitChange);

    $(document).on('change', '.stock-unit-select', handleStockUnitChange);

    $(document).on('click', '.search-result-item', (event) => {
        // TODO use barter_id
        let orderId = $.getUrlIdParam();
        let barterId = $(event.target).data('productId');
        let barterName = $(event.target).data('productName');
        const url = `${App.ROOT_URL}/inventory/get-client-depot-barter-stock`;
        let reqObj = {type: 'GET', url:url, data: { barter_id: barterId, barter_name: barterName, order_id:orderId}, dataType: 'json'};
        let loaders = {first: $('#mainCoverScreen')};
        console.log(reqObj)
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            handleProductSearchResult(barterName, result);
        });
    });


    function getHiddenEntry(){
        return $('#entry-default-id')
    }


    function getHiddenEntryId(){
        let hiddenEntry = getHiddenEntry();
        return hiddenEntry.find('#default-entry-id').text();
    }


    function setHiddenEntry(active_order_entry) {
        let su = $(active_order_entry).find('.stock-units option:selected').val();
        let quantity = $(active_order_entry).find('.quantity-field').val();
        let entryId = $(active_order_entry).find('.entry-id').text();
        let hiddenRow = $('#entry-default-id')
        $(hiddenRow).find('#default-entry-id').text(entryId);
        $(hiddenRow).find('#default-su').text(su);
        $(hiddenRow).find('#default-quantity').text(quantity);
    }


    function getDefaultEntryID(entry) {
      return entry.find('#default-entry-id').text();
    }


    function isChangeInValues(entry) {
        let hiddenEntry = $('#entry-default-id');
        let defaultSu = $(hiddenEntry).find('#default-su').text();
        let defaultQuantity = $(hiddenEntry).find('#default-quantity').text();
        let hiddenEntryId = $(hiddenEntry).find('#default-entry-id').text();

        let id = $(entry).attr('id');
        let stockUnit = $(entry).find('.stock-units option:selected').val();
        let quantity = $(entry).find('.quantity-field').val();

        let isNewEntry = (id == null);
        let idMatch = (!isNewEntry  && hiddenEntryId == id ? true : false);
        let quantityMatch = (defaultQuantity == quantity ? true : false);
        let stockMatch = (defaultSu == stockUnit ? true : false);

        return !(idMatch && quantityMatch && stockMatch);
    }


    function createOrderEntry(active_order_entry, selected_order_entry, then) {
      let su = $(active_order_entry).find('.stock-units option:selected').val();
      let qty = $(active_order_entry).find('.quantity-field').val();
      let data = {order_entries:[{stock_unit:su, quantity:qty}]};
      let url = `${App.ROOT_URL}/pos/orders/${$.getUrlIdParam()}/entries`
      let reqObj = {url: url, type: 'POST', contentType: 'application/json; charset=utf-8', data: JSON.stringify(data),}
      let loaders = {first: $('#mainCoverScreen'), reqFlag:true};
      App.performAjaxRequest(reqObj, loaders, (result)=> {
          let entryId = ((result || {}).order_entry_ids || [])[0];
          let code = 1;
          if(entryId){
            code = 0;
            $(active_order_entry).attr({id:entryId});
            $(active_order_entry).find('.entry-id').text(entryId);
            makeSelectedEntryActive(active_order_entry, selected_order_entry);
          }
          then({code:code});
      });
    }


    function updateOrderEntry(active_order_entry, selected_order_entry, then) {
        // TODO send only fields which have changed
        let su = active_order_entry.find('.stock-units option:selected').val();
        let qty = active_order_entry.find('.quantity-field').val();
        let orderId = $.getUrlIdParam();
        let id = active_order_entry.attr('id');
        let data = {order_id: orderId
                        , order_entries: [{id:id, stock_unit:su, quantity:qty}]};
        let url = `${App.ROOT_URL}/pos/orders/${orderId}/entries`
        let reqObj = {url: url, dataType: 'json', type: 'PUT', contentType: 'application/json; charset=utf-8', data: JSON.stringify(data)};
        let loaders = {first: $('#mainCoverScreen')};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            let code = 1;
            if(result.order_entry_ids.length == 1){
                code = 0;
                makeSelectedEntryActive(active_order_entry, selected_order_entry);
            }else{
                Notifier.info('some entries could not be updated');
            }
            then({code:code});
        });
    }


    function changeOrderEntrySelection(target){
        let currentSelection = $('.order-entry-table-body').find('.active-order-entry');
        $(currentSelection).removeClass('active-order-entry');
        $(target).addClass('active-order-entry');
    }


    function handlecartEntryExist(selected_entry, active_entry, existing_entry, then) {
        // let existingEntrySelectedStockUnit = getSelectedStockUnitId(existing_entry);
        // let existingEntrySelectedBarcodeUnit = getSelectedBarcodeUnitId(existing_entry);
        // let existingData = existing_entry.data('product');
        let existingEntryId = (existing_entry.attr('id')) || null;
        let activeEntryQuantity = Number(active_entry.find('.quantity-field').val() || '');
        let existingEntryQuantityField = existing_entry.find('.quantity-field');
        let existingEntryQuantityValue = Number(existingEntryQuantityField.val() || '');
        let existingEntryUnitPrice  = Number(existing_entry.find('.unit-price').text()) || '';
        let mergedEntriesTotal = Number(activeEntryQuantity + existingEntryQuantityValue);
        let mergedEntriesTotalAmount = (mergedEntriesTotal * existingEntryUnitPrice).toFixed(2);
        handleDeleteEntryData(active_entry, 'product merged to a duplicate entry', (result) => {
            if(result.code == 0){
                // set current value before updates; so changes are registered
                handleOrderEntryToggle(existing_entry, (result)=>{
                    if(result.code == 0){
                        existingEntryQuantityField.val(existingEntryQuantityValue + activeEntryQuantity);
                        $('#order-entries').find(`#${existingEntryId}`).find('.quantity-field').focus();
                        existing_entry.find('.sum').text(mergedEntriesTotalAmount);
                        let activeEntry = existing_entry;
                        updateOrderEntry(activeEntry, selected_entry, then)
                    }else{then({code:2});}
                });
            }else{then({code:1});}
        });
    }


    function handleOrderEntryToggle(selected_order_entry, then){
        handleUpdateEntryRecord(getActiveOrderEntry(), selected_order_entry, then);
    }

    function makeSelectedEntryActive(active_order_entry, selected_order_entry){
        if(selected_order_entry){
            if(!($(selected_order_entry).hasClass('active-order-entry'))) {
                changeOrderEntrySelection(selected_order_entry);
                setHiddenEntry(selected_order_entry);
                // TODO show product info
            }
        }else if(isChangeInValues(active_order_entry)){
            setHiddenEntry(active_order_entry);
        }

    }

    function handleUpdateEntryRecord(active_order_entry, selected_order_entry, then) {
        let activeOrderEntryStockUnitId = active_order_entry.find('.stock-units option:selected').val() || '';
        let stockUnitPrice = active_order_entry.find('.unit-price').text();
        let existingEntry = orderEntryExistInEntries(activeOrderEntryStockUnitId) || {}
        let entryExists = existingEntry.exists || '';
        let cartEntry = existingEntry.entry || {};
        if(active_order_entry.length > 0 && isChangeInValues(active_order_entry)){
            let id = $(active_order_entry).attr('id');
            if(entryExists){
                handlecartEntryExist(selected_order_entry, active_order_entry, cartEntry, then);
            }else if(id == null){
                createOrderEntry(active_order_entry, selected_order_entry, then);
            } else {
                updateOrderEntry(active_order_entry, selected_order_entry, then);
            }
        }else{
            makeSelectedEntryActive(active_order_entry, selected_order_entry);
            then({code:0});
        }
    }

    function updatePriceTotal(value) {
        $priceTotal = $('.price-total');
        $priceTotal.text((Number($priceTotal.text()) + Number(value)).toFixed(2));
    }


    function addOrderEntryFor(product, entry_id) {
        product = product || {};
        console.log(product)
        let $buSelect = createProductBUSelect([product]);
    	  let $row = $('<tr></tr>').html(`<td><button class="row-delete">X</button></td>
    		            <td class="product-name">${product.name}</td>
    		            <td class='barcode-units'></td>
                    <td class="stock-units"></td>
    		            <td><input type="number" value="" class="quantity-field" min="0"/></td>
                    <td class="unit-price">0.00</td>
    		            <td class="sum">0.00</td>
                    <td class="entry-id hidden">${entry_id}</td>`).addClass('order-entry');
        $tableBody = $('.order-entry-table-body');
        $row.find('.barcode-units').append($buSelect);
        $row.prependTo($('.order-entry-table-body'));
        $($row.find('.row-delete')).on('click', handleDeleteEntryBtnClick);
        $row.addClass('show').data({product: product});
        $('.empty-cart').addClass('hidden')
        $row.on('click focusin', handleOrderEntryClick);
        let filter = $.getUrlParameter('filter');
        if((filter || '') == '') {
            $('#product-search-field').val('');
        }
        $buSelect.change();
        $row.attr({id: entry_id});
        checkValidityOfStock($row);
        handleOrderEntryToggle($row, (result)=>{
            
        })

    }


    function showTooltip(order_quantity, stock_quantity, target) {
        let stockQuantity = stock_quantity || (0.00).toFixed(2);
        let orderQuantity = order_quantity;
        target.popover({
            container: 'body',
            title: 'Stock Quantity',
            content: ` ${stockQuantity}`,
            placement: 'right',
            trigger: 'mouseover',
            delay: {
                show: 0,
                hide:0,
            }
        });
    }

    function handleOrderEntryClick(event){
        event.stopPropagation();
        if(!($(this).hasClass('active-order-entry'))){
            handleOrderEntryToggle(this, (result)=>{});
        }
    }


    function checkValidityOfStock($row) {
        let result = getEntryStockDetails($row) || {};
        verifyStockUnitQuantity(result.stockQuantity, result.orderQuantity, $row);
    }

    function getEntryStockDetails($row) {
        let entry = $row.data('product');
        let selectedStockUnit = getStockUnit($row);
        let stockQuantity = selectedStockUnit.stock_quantity;
        let orderQuantity = ($row.find('quantity-field').val()) || selectedStockUnit.order_quantity;
        let result = {stockQuantity: stockQuantity, orderQuantity: orderQuantity};
        return result;
    }

    function verifyStockUnitQuantity(stockQuantity, orderQuantity, $row) {
        let $entryField = $row.find('.quantity-field');
        let isValid = Number(stockQuantity) >= Number(orderQuantity) ? true : false;
        if(!isValid) {
            $entryField.addClass('alert-error');
            showTooltip(orderQuantity, stockQuantity, $entryField);
        } else {
            $entryField.removeClass('alert-error');
        }
    }

    function createStockUnitSelect(stockUnits) {
        let $select = $('<select>').attr({
    		class: 'stock-unit-select'
    	});

        let defaultStockUnit = (stockUnits || {}).default_stock_unit;

        let $order = ((stockUnits || {}).order || []);
        if($order.length < 2){
            $select.attr({disabled:true});
        }
    	$order.forEach((stockUnitId) => {
            let attrs = {value: stockUnitId}
            if (defaultStockUnit == stockUnitId) {
              attrs.selected = true;
            }
            let $option = $('<option></option>')
                          .attr(attrs)
                          .text(stockUnits[stockUnitId].label);
    	    $select.append($option);
    	});

    	return $select;
    }


    function handleStockUnitChange(event) {
        let $select = $(event.target);
        let $closestTr = $select.closest('tr');
        const stockUnitId = $select.val();
        let $entry = $select.closest('.order-entry');
        let stockUnit = getStockUnit($entry);
        let unitPrice = Number(stockUnit.unit_price);
        let orderQuantity = Number(stockUnit.order_quantity);
        //let quantity = $entry.find('.quantity-field').val();
        let product = (($closestTr.data('product')).barcode_unit) || {};
        let productBarcode = (product[Object.keys(product)[0]]).stock_unit;
        let quantity = productBarcode[Object.keys(productBarcode)[0]].order_quantity || 1;
        $closestTr.find('.quantity-field').val(quantity)
        let $sum = $entry.find('.sum');
        let oldSum = Number($sum.text());
        let newSum = (unitPrice * quantity).toFixed(2);
        $entry.find('.unit-price').text(unitPrice);
        if(orderQuantity > 0) {
            $entry.find('.quantity-field').val(orderQuantity);
        }
        $sum.text(newSum);
        updatePriceTotal(newSum - oldSum);
        // $entry.data('activeStockUnit', stockUnitId);
    }


    function orderEntryExistInEntries(stockUnitId) {
        let stockUnit = stockUnitId || '';
        let result = {};
        result.exists = false;
        $('#order-entries').find('.order-entry').each(function(){
            let $entry = $(this);
            let entryActive = $entry.hasClass('active-order-entry');
            let selectedStockUnit = $entry.find('.stock-units option:selected').val() || '';
            if(!entryActive) {
                if(selectedStockUnit == stockUnit) {
                    result.exists = true;
                    result.entry = $entry;
                    return;
                }
            }
        })
        return result;
    }


    function handleProductSearchResult(filter, result){
        productCache[filter] = result;
        let products = (result || {}).products || [];
        if (products.length == 0) {
            // TODO Server must return appropriate error codes for error conditions.
            // These errors are handled in the failure callback.
            Notifier.error(`${filter} did not match any products.`)
        } else if (products.length == 1) {
            addOrderEntryFor(products[0], null);
            $('#product-search-field').focus();
            $('#product-search-field').val('');
        } else if (products.length > 1) {
            return showProductSearchResults(products);
        }
    }


    function handleProductSearchFailure({status}){
        if (status == 404) {
          Notifier.error('not found!');
        } else if (status == 401) {
          Notifier.error('Access denied. Please make sure you are logged in.')
        } else {
          Notifier.error(status+': unknown error');
        }
    }

    function handleProductSearch(identifier) {
        fetchProduct(identifier, handleProductSearchResult, handleProductSearchFailure);
    }

    function createProductBUSelect(products) {
        let $select = $('<select></select>').addClass('barcode-unit-select');
        products.forEach((product) => {
            product = product || {};
            let barcodeUnit = (product.barcode_unit || {});
            let $order = (barcodeUnit.order || []);
            let defaultBarcodeUnit = barcodeUnit.default_barcode_unit;
            if($order.length < 2){
                $select.attr({disabled:true});
            }
            $order.forEach((barcodeUnitId) => {
                let barcodeUnit = product.barcode_unit[barcodeUnitId];
                let attr = {value: barcodeUnitId};
                if (defaultBarcodeUnit == barcodeUnitId) {
                    attr.selected = true;
                }
                let $option = $('<option></option>')
                                .attr(attr)
                                .text(`${barcodeUnit.label}`);
              // $option.data({barcodeUnit: barcodeUnit});
                $select.append($option);
            });
        });
      return $select;
    }


    function handleBarcodeUnitChange(event) {
      let $select = $(event.target);
      // let option = select.options[select.selectedIndex];
      let barcodeUnitId = $select.val();
      // let barcodeUnit = $(option).data('barcodeUnit');
      let $row = $select.closest('.order-entry');
      let product = $row.data('product');
      let barcodeUnit = product.barcode_unit[barcodeUnitId];
      let $stockUnitSelect = createStockUnitSelect(barcodeUnit.stock_unit);
      let $su = $row.find('.stock-unit-select');
      if ($su.length > 0) {
        $su.replaceWith($stockUnitSelect)
      } else {
        $row.find('.stock-units').append($stockUnitSelect);
      }
      // $row.data({product: barcodeUnit});
      $stockUnitSelect.change();
    }


    function showProductSearchResults(products) {
        let $searchResultList = $('.search-result-list');
        products.forEach((product) => {
            let $item = $('<div></div>').addClass('search-result-item')
                        .text(product.name)
                        .data({productId: product.id, productName: product.name});
            $searchResultList.prepend($item);
        });
    }


    function fetchProduct(filter, response_handler, failure_handler) {
        clearPreviousSearchResult();
        let orderId = ($.getUrlIdParam()) || '';
        if (productCache[filter]) {
            response_handler(filter, productCache[filter]);
        } else {
        // TODO user must provide also client_id, and depot_id; user-interface missing!
        const url = `${App.ROOT_URL}/inventory/search-client-depot-stock?filter=${filter}&order_id=${orderId}`;
        let reqObj = {url: url, type: 'get', dataType: 'json', contentType: 'json/application'};
        let loaders = {first: $('#mainCoverScreen')};
        return App.performAjaxRequest(reqObj, loaders, (result)=> {
            response_handler(filter, result);
        });
        }
    }


    function clearPreviousSearchResult() {
        $('.search-result-list').empty();
    }


    function buildOrder() {
        let order = {data: []};
        $('#order-entries').find('.order-entry').each(function() {
            let entry = {};
            let $orderEntry = $(this);
            entry.stock_unit = getSelectedStockUnitId($orderEntry);
            entry.quantity = getQuantity($orderEntry);
            order.data.push(entry);
        });
        return order;
    }


    function checkoutOrder() {
        let orderId = $.getUrlIdParam();
        const nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}/summary`;
        location.href = nextUrl;
    }


    function printOrderSummary() {
        createOrderSummary();
        window.print();
    }

  //function clearPreviousOrderSummary() {
  //  let $orderEntriesPrint = $('#order-entries-print');
  //  let $entryBase = $orderEntriesPrint.find('.entry-base');
  //  $orderEntriesPrint.empty();
  //  $orderEntriesPrint.append($entryBase);
  //}

  function createOrderSummary() {
    let $orderEntries = $('#order-entries-print');
    let $entryBase = $orderEntries.find('.entry-base');
    $('#order-entries').find('.order-entry').each(function() {
      // TODO Bind order entry objects to each entry?
      let $_entry = $(this);
      let $entry = $entryBase.clone();
      let product = $_entry.data('product');
      let name = `${product.name} ${getBarcodeUnit($_entry).label}`;
      let stockUnit = getStockUnit($_entry);
      let quantity = `${getQuantity($_entry)} ${stockUnit.label || ''}`;
      $entry.find('.product-name').text(name);
      $entry.find('.quantity').text(quantity);
      $entry.find('.unit-price').text(stockUnit.unit_price);
      $entry.find('.sum').text(getSum($_entry));
      $entry.removeClass('entry-base');
      $orderEntries.append($entry);
    });
    $('#print-timestamp').text(Date());
    $('#price-total-print').text($('#price-total').text());
  }


  function handleDeleteEntryData($entry, message, then) {
      let entryID = $entry.attr('id') || '';
      let sum = Number($entry.find('.sum').text());
      let url = `${App.ROOT_URL}/pos/orders/${$.getUrlIdParam()}/entries/${entryID}`;
      if((entryID || '') == '') {
          if(!isNaN(sum)) {
              updatePriceTotal(-sum)
              $entry.remove();
              Notifier.success(message || '');
          }
          then({code:0});
          checkIfCartIsEmpty();
      } else {
          let reqObj = {url: url, dataType: 'json', type: 'DELETE', contentType: 'application/json; charset=utf-8'};
          let loaders = {first: $('#mainCoverScreen')};
          App.performAjaxRequest(reqObj, loaders, (result)=> {
              let code = 1;
              if(result.order_entry_ids.length == 1){
                  code = 0;
                  if(!isNaN(sum)) {
                      updatePriceTotal(-sum);
                      $entry.remove();
                      Notifier.success(message || '');
                  }
                }
              then({code:code});
              checkIfCartIsEmpty();
          });
      }
  }


  function getQuantity($entry) {
    return Number($entry.find('.quantity-field').val());
  }
  function getSelectedStockUnitId($entry) {
     return $entry.find('.stock-unit-select').val();
  }
  function getSum($entry) {
    return Number($entry.find('.sum').text());
  }
  function getSelectedBarcodeUnitId($entry) {
    return $entry.find('.barcode-unit-select').val();
  }
  function getBarcodeUnit($entry) {
    return $entry.data('product').barcode_unit[getSelectedBarcodeUnitId($entry)];
  }
  function getStockUnit($entry) {
    return getBarcodeUnit($entry).stock_unit[getSelectedStockUnitId($entry)];
  }
  function getEntryId($entry) {
    let entry_id = $entry.attr('id');
    return (entry_id == null ? null : Number(entry_id));
  }

  function getTableRowID(id) {
    let ans = $('td').filter(() => {
      return $(this).text(id);
    }).closest('tr');
    return ans;
  }



})(jQuery);
