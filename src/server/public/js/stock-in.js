let clientData = JSON.parse(sessionStorage.getItem("user_bibiara_app"));
let url = `${App.ROOT_URL}/inventory/stock-in/products`;
let prods = null;


$(document).ready(()=> {
    fetchAllClientProducts();
});

$(document).on("click", "#new_product", (event) => {
    window.location.href = `${App.ROOT_URL}/inventory/stock-in/add-product`;
})

function fetchAllClientProducts(){
    if(App.internetConnectionAvailable()) {
        $.ajax({
            url: url,
            type: 'POST',
            data: clientData,
            dataType: 'json',
            beforeSend: ()=> {
                $('.main-cover-screen').show();
            },
            complete: ()=> {
                $('.main-cover-screen').hide();
            }
        })
        .done((result)=> {
            if(result.code == 0) {
                prods = result.products;
                console.log(prods);
                ShowClientProducts(prods)
                
            } else {
                Notifier.error(result.error_message);
            }
        })
        .fail(handleAjaxError);
    } else {
        Notifier.error(App.INTERNET_ERROR_MSG);
    }
}

// // onclick="GetProductStockUnit('${this} , ${product.productId}')" 

function ShowClientProducts(data){
    let treeData = data.map((product) => {
       if( product.barcodeUnit ){
           if(product.barcodeUnit.stockUnit){
                return{
                    "Id" : product.productId, 
                    "text" : product.productName, 
                    "children" : 
                    [
                        {
                            "text" : product.barcodeUnit.barcodeName 
                        },
                        {
                        "children" : [
                            {
                                "text" : product.barcodeUnit.stockUnit.stockName 
                            }
                        ]
                    }
                    ]
                }
            }
            else{
                return{
                    "Id" : product.productId, 
                    "text" : product.productName, 
                    "children" : 
                    [
                        {
                            "text" : product.barcodeUnit.barcodeName 
                        }
                    ]
                }
            }
        }
        else{
            return{
                    "Id" : product.productId, 
                    "text" : product.productName, 
                    "children" : 
                    [
                        {
                            "text" : product.barcodeUnit.barcodeName 
                        }
                    ]
               }
            }
           
       });
    $('#tree').jstree({
        'core' : {
          'data' : treeData
        }
      });
    // data.forEach((product) => {
    //     $("#tree").append(`
    //         <tr style="margin-bottom: 25px;">
    //             <td class="invproducts" style="cursor: pointer">${product.productName}</td>
    //         </tr>
            
    //     `)
    // })
}

// $(document).on('click', 'td.invproducts', (event) => {
//     let clickedEle = $(event.target).closest('tr').html().trim();
//     $(clickedEle).addClass("active");
//     let closestTr = $(event.target).closest('tr').text().trim();
//     let ele = prods.find(x => x.productName == closestTr)
//     console.log(ele)
// })

function handleAjaxError(req, status, err) {
    if(status == 'timeout') {
        Notifier.error(status);
    } else if(err) {
        Notifier.error(err);
    }
}

// function GetProductStockUnit(that , productId){
//     // $(this).addClass("active");
//     console.log($(that));
//     // $(this).css("background-color", "yellow");
//     let url = `${App.ROOT_URL}/inventory/stock-in/${productId}/barcode-unit`;
//     $.ajax({
//         url: url,
//         type: 'POST',
//         data: clientData,
//         dataType: 'json',
//         beforeSend: ()=> {
//             $('.main-cover-screen').show();
//         },
//         complete: ()=> {
//             $('.main-cover-screen').hide();
//         }
//     })
//     .done((result)=> {
//         if(result.code == 0) {
//             renderBarcodeUnits(result.barcodeunit)
//         } else {
//             Notifier.error(result.error_message);
//         }
//     })
//     .fail(handleAjaxError);
// }

// function renderBarcodeUnits(data){
//     $("#barcode-unit-pane").html(``);
//     data.forEach((product) => {
//         $("#barcode-unit-pane").append(`
//             <p class="invproducts" style="margin-bottom: 18px; cursor: pointer">${product.barcodeName}</p>
//         `)
//     })
// }