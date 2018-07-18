(function() {
    let currentSelectedOrderEntry = {};
    let deleteEntryEvent = '';
    $(document).ready(()=> {
          handleInitOrdersList();
    });

    //Events
    $(document).on('click', '.view-sale-order-btn', handleViewSaleOrder);

    $(document).on('dblclick', '.order-page-entry', handleViewSaleOrder);

    $(document).on('click', '.open-sale-order-btn', handleOpenSaleOrder);

    $(document).on('click', '.delete-sale-order-btn', handleDeleteConfirm);

    $(document).on('click', '.create-sale-order-btn', handleCreateNewSaleOrder);

    $(document).on('click', '#btn-delete-modal', (event)=>{
      handleDeleteSaleOrder(event, deleteEntryEvent)
    })


    function handleDeleteConfirm(event) {
        deleteEntryEvent = event;
        let select = $(event.target).closest('tr');
        let orderEntry = (select.data('orderEntryData')) || {};
        let orderRef = (orderEntry.reference) || '';
        $('#delete-order-ref').text(orderRef);
        $('#confirm-delete').modal({
            show: true,
            backdrop: false
        })
    }



    function removeActiveClassOnEntries() {
        currentSelectedOrderEntry.removeClass('order-listing-active');
    }


    function toggleActiveOrderListing(event) {
        let $select = $(event.target).closest('tr');
        $('.orders-table-body').find('tr').each(function() {
                let closestTr = $(this).closest('tr');
                if(closestTr.hasClass('order-listing-active')) {
                    $(this).closest('tr').removeClass('order-listing-active')
                }
        });
        $select.addClass('order-listing-active');
        setTimeout(()=>{currentSelectedOrderEntry = $select;}, 50);
    }



    function handleCreateNewSaleOrder() {
        let url = `${App.ROOT_URL}/pos/orders`;
        let userId = $('#username-id').val();
        let clientId = $('#client-search-id').val();
        let sellerId = clientId || userId;
        let buyerId = null;
        let salesOrder = {};
        salesOrder.seller_id = sellerId;
        salesOrder.buyer_id = buyerId;
        let data = {};
        data.sales_order = salesOrder;
        let reqObj = {type: 'post', url: url, dataType: 'json', data:JSON.stringify(data), contentType:'application/json; charset=utf-8'};
        let loaders = {first: $('.main-cover-screen')};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            Notifier.success('Sale order created successfully');
            let orderId = (result.order_id) || null;
            if(orderId == null) {
                Notifier.error('Order ID cant be null');
                return;
            }
            window.location.href = `${App.ROOT_URL}/pos/orders/${orderId}/summary`;
        });
    }

    function getOrderEntryID(event) {
        let closestTr = $(event.target).closest('tr');
        let orderId = closestTr.data('orderEntryData').order_id;
        return orderId;
    }



    function handleOpenSaleOrder(event) {
        let closestTr = $(event.target).closest('tr');
        let orderId = getOrderEntryID(event);
        let menuDiv = closestTr.find('.dropdown');
        let loader = closestTr.find('.btn-loader')
        let url = `${App.ROOT_URL}/pos/set-user-cart`;
        let nextUrl =`${App.ROOT_URL}/pos/orders/${orderId}`;
        data = {}
        data.order_id = orderId;
        let reqObj = {type: 'PUT', url: url, dataType: 'json', data:JSON.stringify(data), contentType:'application/json; charset=utf-8'};
        let loaders = {first: loader, last: menuDiv};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            if(result.cart_id == orderId) {
                window.location.href = nextUrl;
            } else {
                Notifier.error('setting of cart was denied!');
            }

        });
    }


    function handleViewSaleOrder(event) {
      let orderId = getOrderEntryID(event);
      let nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}/`;
      window.location.href = nextUrl;
    }


    function handleDeleteSaleOrder(btnEvent, event) {
        let orderRow = $(event.target).closest('tr');
        let orderId = getOrderEntryID(event);
        let closestTr = $(event.target).closest('tr');
        let menuDiv = closestTr.find('.dropdown');
        let loader = closestTr.find('.btn-loader')
        let url = `${App.ROOT_URL}/pos/orders/${orderId}`;
        $('#confirm-delete').modal('hide');
        let reqObj = {type: 'DELETE', url: url}
        let loaders = {first: loader, last: menuDiv};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
              closestTr.remove();
              if(App.isOrdersListEmpty()) {
                  App.handleNoOrders();
              }
              Notifier.success(App.DELETE_SUCCESS);
        });
    }



    function handleInitOrdersList() {
        let url = `${App.ROOT_URL}/pos/get-sales`;
        let reqObj = {type: 'get', dataType: 'json', url: url}
        let loaders = {first: $('#ordersCoverScreen')}
        App.performAjaxRequest(reqObj, loaders, (result)=> {
            let salesOrders = result.sales_orders;
            if(salesOrders.length > 0) {
                salesOrders.forEach((order)=> {
                    addEntryForOrder(order);
                })
            } else {
                App.handleNoOrders();
            }
        });
    }


    function addEntryForOrder(order) {
        let paid = order.paid || '';
        let amount = order.amount || '';
        let $selectBase = $('.orders-table-body');
        let $row = $('<tr></tr>').html(`<td class='order-ref'>${order.reference}</td>
                  <td class="order-buyer">${((order.client) || {}).label}</td>
                  <td class="order-buyer">${((order.buyer) || {}).label}</td>
                  <td class="order-creator">${(((order.creator) || {}).label) || ''}</td>
                  <td class="order-date">${new Date(order.created_on).toLocaleTimeString()}</td>
                  <td class="order-status">${order.status}</td>
                  <td class="order-payment-wrapper"><span class="order-paid">${parseFloat(paid || 0).toFixed(2)}</span> / <span class="order-amount">${parseFloat(amount||0).toFixed(2)}</span></td>
                  <td class="order-action"><div class="dropdown">
        <a class="dropdown-togle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        </a>
        <div class="dropdown-menu dropdown-menu-right dropdown-order" aria-labelledby="dropdownMenuLink">
            <a class="dropdown-item open-sale-order-btn" href="#">cart</a>
            <a class="dropdown-item view-sale-order-btn" href="#">view</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item delete-sale-order-btn" href="#">delete</a>
        </div>
        </div><img src="/imgs/spin2.gif" class="btn-loader hidden"></td>`).addClass('order-page-entry');
                  // <button class="open-order-entry-btn"><i class="fas fa-shopping-cart"></i></button>
        $row.data({orderEntryData: order});
        $($row.find('.dropdown-togle')).parent().on('hide.bs.dropdown', ()=> {
            removeActiveClassOnEntries();
        });
        $($row.find('.dropdown-togle')).on('click', toggleActiveOrderListing);
        let salesOrderIsClosed = order.status == 'closed' ? true : false;
        let openCartLink = $row.find('.open-sale-order-btn');
        if(salesOrderIsClosed) {
            openCartLink.addClass('order-closed');
            openCartLink.removeClass('open-sale-order-btn');
        }
        $($row.find('.dropdown-togle')).parent().on('hide.bs.dropdown', ()=> {
            removeActiveClassOnEntries();
        });
        $selectBase.append($row);

    }

})(jQuery)
