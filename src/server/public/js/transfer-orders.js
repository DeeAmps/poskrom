(function($) {
    let currentSelectedOrderEntry = {};
    let deleteEntryEvent = '';
    $(document).ready(()=> {
        handleInitStockTransferList();
    })

//Events
$(document).on('click', '.open-transfer-order-btn', handleOpenTransferOrder);


$(document).on('click', '.view-transfer-order-btn', handleViewTransferOrder);

$(document).on('dblclick', '.order-page-entry', handleViewTransferOrder);


$(document).on('click', '.delete-transfer-order-btn', handleDeleteConfirm);


$(document).on('click', '.create-transfer-order-btn', handleCreateNewTransferOrder);

$(document).on('click', '#btn-delete-modal', (event)=>{
    handleDeleteTransferOrder(event, deleteEntryEvent);
})


// $(document).on('click', '.dropdown-togle, tbody tr', toggleActiveOrderListing);


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
    $('.stock-transfer-table-body').find('tr').each(function() {
            let closestTr = $(this).closest('tr');
            if(closestTr.hasClass('order-listing-active')) {
                $(this).closest('tr').removeClass('order-listing-active')
            }
    });
    $select.addClass('order-listing-active');
    setTimeout(()=>{currentSelectedOrderEntry = $select;}, 50);
}


function getOrderEntryID(event) {
    let closestTr = $(event.target).closest('tr');
    let orderId = closestTr.data('orderEntryData').order_id;
    return orderId;
}


function handleViewTransferOrder(event) {
  let orderId = getOrderEntryID(event);
  let nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}`;
  window.location.href = nextUrl;
}


function handleCreateNewTransferOrder() {
    let url = `${App.ROOT_URL}/pos/orders`;
    let userId = $('#username-id').val();
    let clientId = $('#client-search-id').val();
    let sellerId = clientId || userId;
    let buyerId = clientId || userId;
    let salesOrder = {};
    salesOrder.seller_id = sellerId;
    salesOrder.buyer_id = buyerId;
    let data = {}
    data.sales_order = salesOrder;
    let reqObj = {type: 'POST', url: url, dataType: 'json', data: JSON.stringify(data), contentType:'application/json; charset=utf-8'};
    let loaders = {first: $('#mainCoverScreen')};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        Notifier.success('Transfer order created successfully');
        let orderId = result.order_id;
        if(orderId == null) {
            Notifier.error('Order ID cant be null');
            return;
        }
        window.location.href = `${App.ROOT_URL}/pos/orders/${orderId}/summary`;
    });
}


function handleOpenTransferOrder(event) {
    //TODO disable on order status complete
    let closestTr = $(event.target).closest('tr');
    let orderId = getOrderEntryID(event);
    let menuDiv = closestTr.find('.dropdown');
    let loader = closestTr.find('.btn-loader');
    let url = `${App.ROOT_URL}/pos/set-user-cart`;
    let nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}`;
    let data = {};
    data.orderId = orderId || '';
    let reqObj = {type: 'put', url: url, dataType: 'json', data: JSON.stringify(data), contentType:'application/json; charset=utf-8'};
    let loaders = {first: loader, last: menuDiv};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        window.location.href = nextUrl;
    })
}


function handleDeleteTransferOrder(btnEvent, event) {
    //TODO disable on order status complete
    let orderId = getOrderEntryID(event);
    let closestTr = $(event.target).closest('tr');
    let menuDiv = closestTr.find('.dropdown');
    let loader = closestTr.find('.btn-loader');
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


function handleInitStockTransferList() {
    let url = `${App.ROOT_URL}/pos/get-transfers`;
    let reqObj = {type: 'get', dataType: 'json', url: url}
    let loaders = {first: $('#ordersCoverScreen')}
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        let transferOrders = (result.transfers) || {};
        if(transferOrders.length > 0) {
            transferOrders.forEach((order)=> {
                  addEntryForOrder(order);
            })
        } else {
            App.handleNoOrders();
        }
    })
}


function addEntryForOrder(order, appendType) {
    let paid = (order.paid) || '';
    let amount = (order.amount) || '';
  let $selectBase = $('.stock-transfer-table-body');
  let $row = $('<tr></tr>').html(`<td class='order-ref'>${order.reference}</td>
              <td class="order-stock-in">${((order.client) || {}).label}</td>
              <td class="order-stock-in">${((order.stock_in_depot) || {}).label}</td>
              <td class="order-creator">${((order.creator) || {}).label}</td>
              <td class="order-date">${new Date(order.created_on).toLocaleTimeString()}</td>
              <td class="order-status">${order.status}</td>
              <td class="order-payment-wrapper"><span class="order-paid">${parseFloat(paid||0).toFixed(2)}</span> / <span class="order-amount">${parseFloat(amount||0).toFixed(2)}</span></td>
              <td class="order-action"><div class="dropdown">
  <a class="dropdown-togle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  </a>
  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
    <a class="dropdown-item open-transfer-order-btn" href="#">cart</a>
    <a class="dropdown-item view-transfer-order-btn" href="#">view</a>
    <div class="dropdown-divider"></div>
    <a class="dropdown-item delete-transfer-order-btn" href="#">delete</a>
  </div>
</div><img src="/imgs/spin2.gif" class="btn-loader hidden"></td>`).addClass('order-page-entry');
              // <button class="open-order-entry-btn"><i class="fas fa-shopping-cart"></i></button>
  $row.data({orderEntryData: order});
  $($row.find('.dropdown-togle')).on('click', toggleActiveOrderListing);
  $($row.find('.dropdown-togle')).parent().on('hide.bs.dropdown', ()=> {
      removeActiveClassOnEntries();
    });
    let transferOrderIsClosed = order.status == 'closed' ? true : false;
    let openCartLink = $row.find('.open-transfer-order-btn');
    if(transferOrderIsClosed) {
        openCartLink.addClass('order-closed');
        openCartLink.removeClass('open-transfer-order-btn');
  }
    $selectBase.append($row);
}

})(jQuery)
