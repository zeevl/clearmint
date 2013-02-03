

(function() {
  var CLEARED_TAG = "Cleared";

  var _clearedTagId = null,
      _token = $('#javascript-token').val();

  $(document)
    .on("change", ".checkboxes :checkbox", onCheckboxChange)
    .on("keydown", updateChecked);

  initClearedTagId();
  updateCleared();
  addClearButton();


  function setClearedTagId(val) {
    _clearedTagId = val;
  }

  function initClearedTagId() {
    var val = $("#localnav-tags li[title='" + CLEARED_TAG + "']").prop("id");
    if (val) {
      setClearedTagId(val.replace("-", ""));
      return;      
    }  

    createClearedTag();
  }

  function createClearedTag() {
    $.post('https://wwws.mint.com/updateTag.xevent', 
      {
        nameOfTag: CLEARED_TAG, 
        task: 'C', 
        token: _token
      }, 
      function(data) {
        setClearedTagId('tag' + $(data).find("tagId").text());
      })
  }

  function updateCleared() {
    $.get('https://wwws.mint.com/app/getJsonData.xevent?' +
             'comparableType=8&query=tag%3A' + CLEARED_TAG + '&offset=0' +
             '&task=transactions,merchants,txnfilters', 
      function(data) {
        var cleared = data.set[0].data;
        $.each(cleared, function(i, val) {
          $("#transaction-" + val.id).addClass("cleared");
        });
      }
    );
  }

  function addClearButton() {
    $("<a value='Clear Transactions' " + 
        "class='button disabled' id='clear-transactions'>Clear transactions</a>")
      .appendTo("#controls-top")
      .on("click", onClearTransactions);

    updateChecked();
  }

  function onClearTransactions() {
    if($(this).hasClass("disabled"))
      return;

    clearTransactions();
  }

  function onCheckboxChange() { 
    // delay a moment so other event handlers have time to run
    setTimeout(updateChecked, 100);
  }

  function updateChecked() {
    $("#clear-transactions").toggleClass("disabled", $("#transaction-list-body .checked").length == 0);
  }


  //clear the selected transactions
  function clearTransactions() {

    // clear all checkboxes
    var txns = [];
    $("#transaction-list-body .checked").each(function() {
      txns.push($(this).prop("id").replace("transaction-", ""));
      $(this).find(":checkbox").click();
    });

    // get other tags
    var otherTags = []
    $("#localnav-tags li").each(function() {
      if ($(this).prop('title') == CLEARED_TAG)
        return true;

      otherTags.push($(this).prop("id").replace("-", "") + "=1");
    });

    // submit to server
    $.post("https://wwws.mint.com/updateTransaction.xevent", 
       "isInvestment=false&note=&price=&symbol=&" + 
       _clearedTagId + "=2&task=txnedit&txnId=" + txns.join(",") + "&token=" + _token + "&" +
       otherTags.join("&"),

       function() { 
        updateCleared();
       });
  }

})();
