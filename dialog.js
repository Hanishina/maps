class Dialog{
  el_dialogCont;
  el_dialogBG;
  el_dialog;
  el_dialogMsg;
  el_dialogButtons;
  msg;
  buttons;

  constructor(option = {}){
    this.el_dialogCont = $(option.el_dialogCont || "#dialogCont")[0];
    this.el_dialogBG = $(option.el_dialogBG || "#dialogBG")[0];
    this.el_dialog = $(option.el_dialog || "#dialog")[0];
    this.el_dialogMsg = $(option.el_dialogMsg || "#dialogMsg")[0];
    this.el_dialogButtons = $(option.el_dialogButtons || "#dialogButtons")[0];
    this.msg = option.msg || "本当によろしいですか？";
    this.buttons = option.buttons || [{id: "ok", text: "OK", onclick: this.ok}, {id: "cancel", text: "キャンセル", onclick: this.cancel}];

  }

  removeBtn(id){
    let button = $("#dialogButtons").find("#" + id);
    $(button).remove();
  }

  removeAllBtn(){
    $(this.el_dialogButtons).empty();
  }

  addBtn(obj){
    let button = $("<div>", {id: "dialog_" + obj.id, class: "dialogBtn"});
    $(button).on("click", (e)=>{
      this.hide();
      if(obj.onclick === "ok"){
        this.ok();
      }else if(obj.onclick === "cancel"){
        this.cancel();
      }else{
        obj.onclick(e);
      }
    });
    $(button).text(obj.text);
    $(this.el_dialogButtons).append(button);
  }

  show(){
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

  hide(){
    $(this.el_dialogCont).css({display: "none"});
  }

  ok(){
    return true;
  }

  cancel(){
    return false;
  }

}
