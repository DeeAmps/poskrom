(function($){
    let pageDetails = {};
    $(document).ready(()=> {
        initOrderStatusPage();
    })



    $(document).on('click', '#print-receipt', (event)=> {
        printReceipt();
    });



    function initOrderStatusPage() {
        let orderID = getOrderIdFromStatusPage();
        let url = `${App.ROOT_URL}/pos/get-status-data?order_id=${orderID}`;
        let reqObj = {url:url, type:'GET', dataType:'json'};
        let loaders = {first:$('#coverScreen')};
        App.performAjaxRequest(reqObj, loaders, (result)=> {
                console.log(result)
              getInvoiceEntry(result);
        });
    }


    function getOrderIdFromStatusPage() {
        let urlArray = document.URL.split('/');
        let order_id = urlArray[urlArray.length-2];
        return order_id;
    }


    function getInvoiceEntry(response) {
        let result = response || {};
        let orderType = result.order_type;
        pageDetails.order_type = orderType;
        let entries = (result.entries) || [];
        let entriesLength = entries.length;
        let invoiceReference = (result.reference_code) || '';
        let orderStatus = (result.order_status) || '';
        let totalAmount = (result.total_cost) || '';
        let totalAmountPaid = (result.amount_paid) || '';
        let $invoiceField = $('#invoice-number-value');
        let $orderStatusField = $('#order-status-value');
        $('.status-type').text(orderType)
        $invoiceField.text(invoiceReference);
        $orderStatusField.text(orderStatus);
        $('#invoice-total-amount-value').text(totalAmount);
        $('#invoice-total-amount-paid').text(totalAmountPaid);

        for(let entry = 0; entry <entriesLength; entry++) {
            let invoiceEntry = entries[entry];
            console.log(invoiceEntry);
            let product = invoiceEntry.product.barcode_unit;
            let barcode = product[Object.keys(product)[0]];
            let stocks = barcode.stock_unit;
            let stock = stocks[Object.keys(stocks)[0]];
            let productName = invoiceEntry.product.name;
            let barcodeName = barcode.label;
            let stockName = stock.label;
            let orderQuantity = stock.invoice_quantity;
            let unitPrice = stock.unit_price;
            let sum = (Number(orderQuantity) * Number(unitPrice)).toFixed(2);
            addInvoiceEntryFor(productName, barcodeName, stockName, orderQuantity, unitPrice, sum);
        }
    }



    function addInvoiceEntryFor(productName, barcodeName, stockName, quantity, orderEntryPrice, sum) {
        let orderQuantity = quantity;
        let quantityString = quantity.toString();
        if(quantityString.indexOf('.') != -1) {
            orderQuantity = Math.round(orderQuantity);
        }
        let $row = $('<tr></tr>').html(`<td class="invoice-product">${productName}</td>
                                        <td class='invoice-entry-barcode-units'>${barcodeName}</td>
                                        <td class="invoice-entry-stock-units">${stockName}</td>
                                        <td class="invoice-entry-quantity">${orderQuantity}</td>
                                        <td class = "invoice-entry-unit-price">${orderEntryPrice}</td>
                                        <td class="invoice-entry-sum">${sum}</td>`).addClass('invoice-entry');
        $row.appendTo($('#invoice-entry-table-body'));
    }


    function printReceipt() {
        let totalAmount = $('#invoice-total-amount-value').text();
        let totalPaid = $('#invoice-total-amount-paid').text();
        let balance = (Number(totalPaid) - Number(totalAmount)).toFixed();
        let customerBalance = balance > 0 ? balance : 0;
        $('#receipt-paid').text(totalPaid);
        $('#receipt-balance').text(customerBalance);
        $('#order-entries-print tr').remove();
        let invoiceRef = $('#invoice-number-value').text();
        let $receiptField = $('#receipt-invoice-number');
        let $totalField = $('#receipt-total');
        let $dateField = $('#print-timestamp');
        $receiptField.text(invoiceRef);
        $dateField.text(new Date().toLocaleDateString());
        let total = 0;
        $('#invoice-entry-table-body').find('.invoice-entry').each(function() {
            let $entry = $(this);
            let product = $entry.find('.invoice-product').text();
            let barcodeUnit = $entry.find('.invoice-entry-barcode-units').text();
            let stockUnit = $entry.find('.invoice-entry-barcode-units').text();
            let quantity = $entry.find('.invoice-entry-quantity').text();
            let unitPrice = $entry.find('.invoice-entry-unit-price').text()
            console.log(unitPrice)
            let sum = $entry.find('.invoice-entry-sum').text();
            let $row = $('<tr></tr>').html(`<td class="invoice-product">${product} ${barcodeUnit} ${stockUnit}</td>
                                            <td class="receipt-quantity">${quantity}</td>
                                            <td class="receipt-unit-price">${unitPrice}</td>
                                            <td class="receipt-sum">${sum}</td>`).addClass('entry-base');
            $row.appendTo('#order-entries-print');

            if(!isNaN(sum)) {
                total +=Number(sum);
            }

        })
        $totalField.text(total.toFixed(2));
        window.print();
        let orderType = (pageDetails.order_type) || 'sale';
        //window.location.href = `${App.ROOT_URL}/pos/orders/${orderType}`;
    }
})(jQuery)
