function Dialog(options){
  this.el_dialogCont = $("#dialogCont")[0];
  this.el_dialogBG = $("#dialogBG")[0];
  this.el_dialog = $("#dialog")[0];
  this.el_dialogMsg = $("#dialogMsg")[0];
  this.el_dialogButtons = $("#dialogButtons")[0];
  this.msg = "本当によろしいですか？";
  this.buttons = [{id: "ok", text: "OK", onclick: ok}, {id: "cancel", text: "キャンセル", onclick: cancel}];
  this.removeAllBtn = removeAllBtn;
  this.addBtn = addBtn;
  this.show = show;
  this.hide = hide;
  this.cancel = cancel;

  this.removeBtn = (id)=>{
    let button = $("#dialogButtons").find("#" + id);
    $(button).remove();
  }

  function removeAllBtn(){
    $(this.el_dialogButtons).empty();
  }

  function addBtn(obj){
    let button = $("<div>", {id: "dialog_" + obj.id, class: "dialogBtn"});
    $(button).on("click", (e)=>{
      this.hide();
      if(obj.onclick === "ok"){
        ok();
      }else if(obj.onclick === "cancel"){
        cancel();
      }else{
        obj.onclick(e);
      }
    });
    $(button).text(obj.text);
    $(this.el_dialogButtons).append(button);
  }

  function show(){
    $(this.el_dialogMsg).text(this.msg);
    this.removeAllBtn();
    this.buttons.forEach((o)=>{
      this.addBtn(o);
    });
    $(this.el_dialogBG).on("click", ()=>{
      this.hide();
      this.cancel();
    });
    $(this.el_dialogCont).css({display: "inline"});
  }

  function hide(){
    $(this.el_dialogCont).css({display: "none"});
  }

  function ok(){
    return true;
  }

  function cancel(){
    return false;
  }

}
