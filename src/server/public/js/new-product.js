$(document).on("click", "#addbarcodeunit", (event) => {
    let guid = guidGenerator();
    $("#productInputs").append(`
        <div id="${guid}_parent" class="form-group">
            <label class="col-md-4 control-label" for="product_name">BARCODE UNIT</label>
            <div class="col-md-4">
            <input id="${guid}" name="barcodeUnit[]" placeholder="BARCODE UNIT" class="form-control input-md" required="" type="text">
            <div id="${guid}_stock"></div>
            <br/>
                <span class="input-group-btn">
                    <button id="${guid}_remove" class="btn btn-danger removebarunit" type="button">Remove</button>
                    <button id="${guid}_addStock" class="btn btn-success addStock" type="button">Add Stock Unit</button>
                </span>
            </div>
        </div>
    `)
});

$(document).on("click", ".removebarunit", (event) => {
    let id = $(event.target)[0].id.split("_")[0];
    $(`#${id}_parent`).remove();
});

$(document).on("click", "#add_product", (event) => {
    let prodBarcode = $("#product_id").val();
    let prodName = $("#product_name").val();
    if(!prodBarcode || !prodName){
        alert("Please provide produc bar code and product name!");
    }

})

$(document).on("click", ".addStock", (event) => {
    let id = $(event.target)[0].id.split("_")[0];
    if(!$(`input#${id}`).val()){
        alert("Please input Barcode Unit Name before adding Stock units");
    }
    else{
        $(`#${id}_stock`).html("");
        $(`#${id}_stock`).html(`
            <div class="form-group">
                <p class="lead text-center">${$(`input#${id}`).val()} Stock Units</p>
                <p style="font-size: 12px; margin-top: -5px" class="text-center">Please enter each stock unit on a new line</p>
                <textarea name="${id}_stockUnit" class="form-control rounded-0" id="exampleFormControlTextarea1" rows="6"></textarea>
            </div>
        `)
    }
});



function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
