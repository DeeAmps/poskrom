(function() {
    let currentSelectedOrderEntry = {};
    let deleteEntryEvent = '';
    $(document).ready(()=> {
        handleInitPurchasesList();
    })

//Events
$(document).on('click', '.open-purchase-order-btn', handleOpenPurchaseOrder);


$(document).on('click', '.view-purchase-order-btn', handleViewPurchaseOrder);

$(document).on('dblclick', '.order-page-entry', handleViewPurchaseOrder);

$(document).on('click', '.delete-purchase-order-btn', handleDeleteConfirm);


$(document).on('click', '#create-purchase-order-btn', handleCreateNewPurchaseOrder);

$(document).on('click', '#btn-delete-modal', (event)=>{
    handleDeletePurchaseOrder(event, deleteEntryEvent);
})


// $(document).on('click', '.dropdown-togle', toggleActiveOrderListing);




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
    //event.stopImmediatePropagation();
    let $select = $(event.target).closest('tr');
    $('.purchase-table-body').find('tr').each(function() {
            let closestTr = $(this).closest('tr');
            if(closestTr.hasClass('order-listing-active')) {
                $(this).closest('tr').removeClass('order-listing-active')
            }
    });
    $select.addClass('order-listing-active');
    setTimeout(()=>{currentSelectedOrderEntry = $select;}, 50);
}


function handleOpenPurchaseOrder(event) {
    let closestTr = $(event.target).closest('tr');
    let orderId = getOrderEntryID(event) || '';
    let menuDiv = closestTr.find('.dropdown');
    let loader = closestTr.find('.btn-loader');
    let url = `${App.ROOT_URL}/pos/set-user-cart`;
    let nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}`;
    let data = {};
    data.order_id = orderId;
    let reqObj = {type: 'put', url: url, dataType: 'json', data:JSON.stringify(data), contentType:'application/json; charset=utf-8'};
    let loaders = {first: loader, last: menuDiv};
    App.performAjaxRequest(reqObj, loaders, (result)=> {
        window.location.href = nextUrl;
    });
}


function handleViewPurchaseOrder(event) {
    let orderId = getOrderEntryID(event);
    let nextUrl = `${App.ROOT_URL}/pos/orders/${orderId}`;
    window.location.href = nextUrl;
}


function getOrderEntryID(event) {
    let closestTr = $(event.target).closest('tr');
    let orderId = closestTr.data('orderEntryData').order_id;
    return orderId;
}


function handleDeletePurchaseOrder(btnEvent, event) {
    let closestTr = $(event.target).closest('tr');
    let menuDiv = closestTr.find('.dropdown');
    let loader = closestTr.find('.btn-loader');
    let orderId = getOrderEntryID(event) || '';
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


function handleCreateNewPurchaseOrder() {
      let url = `${App.ROOT_URL}/pos/orders`;
      let userId = $('#username-id').val();
      let clientId = $('#client-search-id').val();
      let sellerId = null;
      let buyerId = clientId || userId;
      let salesOrder = {};
      salesOrder.seller_id = sellerId;
      salesOrder.buyer_id = buyerId;
      let data = {};
      data.sales_order = salesOrder;
      let reqObj = {type: 'POST', url: url, dataType: 'json', data: JSON.stringify(data), contentType:'application/json; charset=utf-8'};
      let loaders = {first: $('#mainCoverScreen')};
      App.performAjaxRequest(reqObj, loaders, (result)=> {
          Notifier.success('Purchase order created successfully');
          let orderId = (result.order_id) || null;
          if(orderId == null) {
              Notifier.error('Order ID cant be null');
              return;
          }
          window.location.href = `${App.ROOT_URL}/pos/orders/${orderId}/summary`;
      });
}


function handleInitPurchasesList() {
    let clientId = $('#client-search-id').val() || '';
    let url = `${App.ROOT_URL}/pos/get-purchases`;
    let reqObj = {type: 'get', dataType: 'json', url: url}
    let loaders = {first: $('.orders-cover-screen')}
    App.performAjaxRequest(reqObj, loaders, (result)=> {
          let purchaseOrders = result.purchases || {};
          if(purchaseOrders.length > 0) {
              purchaseOrders.forEach((order)=> {
                  addEntryForPurchase(order);
              })
          } else {
              App.handleNoOrders();
          }
    })
}

function addEntryForPurchase(purchase, appendType) {
      //let userId = $('#username-id').val();
      let paid = purchase.paid;
      let amount = purchase.amount;
      let $selectBase = $('.purchase-table-body');
      let $row = $('<tr></tr>').html(`<td class='order-ref'>${purchase.reference}</td>
                  <td class="order-seller">${((purchase.client) || {}).label}</td>
                  <td class="order-seller">${((purchase.seller) || {}).label}</td>
                  <td class="order-creator">${((purchase.creator) || {}).label}</td>
                  <td class="order-date">${new Date(purchase.created_on).toLocaleTimeString()}</td>
                  <td class="order-status">${purchase.status}</td>
                  <td class="order-payment-wrapper"><span class="order-paid">${parseFloat(paid||0).toFixed(2)}</span> / <span class="order-amount">${parseFloat(amount||0).toFixed(2)}</span></td>
                  <td class="order-action"><div class="dropdown">
      <a class="dropdown-togle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      </a>
      <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
        <a class="dropdown-item open-purchase-order-btn" href="#">cart</a>
        <a class="dropdown-item view-purchase-order-btn" href="#">view</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item delete-purchase-order-btn" href="#">delete</a>
      </div>
    </div><img src="/imgs/spin2.gif" class="btn-loader hidden"></td>`).addClass('order-page-entry');
      $row.data({orderEntryData: purchase});
      $($row.find('.dropdown-togle')).on('click', toggleActiveOrderListing);
      let purchaseOrderIsClosed = purchase.status == 'closed' ? true : false;
      let openCartLink = $row.find('.open-purchase-order-btn');
      if(purchaseOrderIsClosed) {
          openCartLink.addClass('order-closed');
          openCartLink.removeClass('open-purchase-order-btn');
      }
      $($row.find('.dropdown-togle')).parent().on('hide.bs.dropdown', ()=> {
          removeActiveClassOnEntries();
      });
    $selectBase.append($row);
}

})(jQuery)
