class DateSelector{
  formerY;
  formerM;
  formerD;
  newY;
  newM;
  newD;

  constructor(option){

    let nowDate = new Date();
    this.formElem = option.formElem;
    this.yearElem = option.yearElem || $(this.formElem).find(".year");
    this.monthElem = option.monthElem || $(this.formElem).find(".month");
    this.dateElem = option.dateElem || $(this.formElem).find(".date");
    this.commitElem = option.commitElem || $("#commit");
    this.minYear = option.minYear || 2000;
    this.maxYear = option.maxYear || nowDate.getFullYear();

    if(this.yearElem){
      for(let y=this.minYear; y<=this.maxYear; y++){
        let gengo;
        if(y < 1868){
          gengo = "";
        }else if(y == 1868){
          gengo = "明治元年";
        }else if(y < 1912){
          gengo = "明治" + (y-1867) + "年";
        }else if(y == 1912){
          gengo = "明治45年/大正元年";
        }else if(y < 1926){
          gengo = "大正" + (y-1911) + "年";
        }else if(y == 1926){
          gengo = "大正15年/昭和元年";
        }else if(y < 1989){
          gengo = "昭和" + (y-1925) + "年";
        }else if(y == 1989){
          gengo = "昭和64年/平成元年";
        }else if(y < 2019){
          gengo = "平成" + (y-1988) + "年";
        }else if(y == 2019){
          gengo = "平成31年/令和元年";
        }else{
          gengo = "令和" + (y-2018) + "年";
        }

        let opt = $("<option>", {value: y, text: y + "年(" + gengo + ")"});
        $(this.yearElem).append(opt);
      }
    }

    if(this.monthElem){
      for(let m=1; m<=12; m++){
        let opt = $("<option>", {value: m, text: m + "月"});
        $(this.monthElem).append(opt);
      }
    }

    if(this.dateElem){
      for(let d=1; d<=31; d++){
        let opt = $("<option>", {value: d, text: d + "日"});
        $(this.dateElem).append(opt);
      }
    }

    this.formerY = $(this.yearElem).val();
    this.formerM = $(this.monthElem).val();
    this.formerD = $(this.dateElem).val();
    this.newY = this.formerY;
    this.newM = this.formerM;
    this.newD = this.formerD;

    $(this.yearElem).change(this.yearChanged.bind(this));
    $(this.monthElem).change(this.monthChanged.bind(this)); //bind(this)がないとthisでクラスを呼び出せない
    $(this.dateElem).change(this.dateChanged.bind(this));

    $(this.commitElem).addClass("commitButton");

  }

  yearChanged(){
    this.newY = $(this.yearElem).val();
    if(this.newM == "2"){
      let maxDate = 28;
      if(this.isLeap(this.newY)){
        maxDate = 29;
      }
      this.rewriteDate(maxDate);
    }
    this.commitBtnClass();
  }

  monthChanged(){
    this.newM = $(this.monthElem).val();
    let maxDate = 31;
    if(["4", "6", "9", "11"].includes(this.newM)){
      maxDate = 30;
    }else if(this.newM == "2"){
      if(this.isLeap(this.newY)){
        maxDate = 29;
      }else{
        maxDate = 28;
      }
    }
    this.rewriteDate(maxDate);
    this.commitBtnClass();
  }

  dateChanged(){
    this.newD = $(this.dateElem).val();
    this.commitBtnClass();
  }

  commitBtnClass(){
    if(this.formerY != this.newY || this.formerM != this.newM || this.formerD != this.newD){
      $(this.commitElem).removeClass("commitButton");
      $(this.commitElem).addClass("uncommitButton");
    }else{
      $(this.commitElem).removeClass("uncommitButton");
      $(this.commitElem).addClass("commitButton");
    }
  }

  rewriteDate(maxDate){
    if(this.newD > maxDate){
      this.newD = maxDate;
    }
    $(this.dateElem).empty();
    for(let d=1; d<=maxDate; d++){
      let opt = $("<option>", {value: d, text: d + "日"});
      $(this.dateElem).append(opt);
    }
    $(this.dateElem).val(this.newD);
  }

  commit(){
    let newFullDate = new Date(this.newY, (this.newM - 1), this.newD);
    this.formerY = this.newY;
    this.formerM = this.newM;
    this.formerD = this.newD;
    $(this.commitElem).removeClass("uncommitButton");
    $(this.commitElem).addClass("commitButton");
    return newFullDate;
  }

  cancel(){
    this.newY = this.formerY;
    this.newM = this.formerM;
    this.newD = this.formerD;
    $(this.yearElem).val(this.formerY);
    $(this.monthElem).val(this.formerM);
    this.monthChanged();
  }

  isLeap(year){
    if(year%4 != 0){
      return false;
    }else{
      if(year%100 != 0){
        return true;
      }else{
        if(year%400 !=0){
          return false
        }else{
          return true;
        }
      }
    }
  }

}
