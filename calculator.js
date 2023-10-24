let map;
let polygonLayer;
let lineLayer;

let colorPicker = [];
let chart = [];
let mouseChart;
let dialog_reset;
let dialog_delete;
let dialog_changeDataset;
let dialog_groupMenu;

let selectedFeatures = [];

let currentDataset; //選択中のデータセット(国勢調査2015など)[obj]
let currentCategory; //選択中のサブデータセット(DID人口など)[obj]
let currentGroup = 0; //選択中のグループ
let currentColumn; //選択中のカラム(選択済み地物テーブル表示用)[obj]
let currentSelectFromto = {A: "cursor", B: "cursor"};
let sortCol = "default";

let cursorObj;
let dragging = false;
let dragStart = {x:0, y:0};

let saveDataArr = [];
let currentSave;
let saveModal_prevTab = "tab1";

let geojsonFiles = {};
let csvObjs = {};


class Group{
  static groups = [];
  static newGroupNo = 1;
  static DefaultColorNo = [112, 138, 149, 115, 76, 199, 98, 238] //red, blue, green, yellow, purple, lightblue, orange, pink
  static template;

  constructor(option){
    this.id = Group.groups.length;
    this.name = "グループ" + Group.newGroupNo;
    this.colorNo = Group.DefaultColorNo[Group.newGroupNo - 1] || 238;
    Group.newGroupNo++;

    let newGroup = $(Group.template).clone(false);
    $(newGroup).attr("id", "group" + this.id);
    $(newGroup).find(".groupName").text(this.name);
    $(newGroup).on("click", this.click.bind(this));
    $(newGroup).find(".columnName").on("change", columnChange);
    if(sortCol === "default"){
      $(newGroup).find(".sortbtn[value='column']").css({color: "#888888"});
    }else{
      $(newGroup).find(".sortbtn[value='default']").css({color: "#888888"});
    }
    $(newGroup).find(".sortbtn").on("click", e=>{
      if($(e.target).attr("value") === "default"){
        sortCol = "default";
        $(".sortbtn[value='default']").css({color: ""});
        $(".sortbtn[value='column']").css({color: "#888888"});
      }else{
        sortCol = currentColumn;
        $(".sortbtn[value='default']").css({color: "#888888"});
        $(".sortbtn[value='column']").css({color: ""});
      }
      sortFeatures(sortCol);
      Group.groups.forEach(g=>{
        rewriteSumTable(g.id);
      });
    });
    $(newGroup).find(".menuBtn").on("click", this.menuOpen.bind(this));
    let menu = $(newGroup).find(".popupMenu");
    $(menu).find(".resetGroup").on("click", function(){
      //グループ内に選択済みの地物が存在するときのみ発動
      if(selectedFeatures[this.id].length > 0){
        dialog_reset.msg = Group.getName(this.id) + "の選択を全て解除しますか？";
        dialog_reset.buttons = [{id: "determ", text: "OK", onclick: this.reset.bind(this)}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
        dialog_reset.show();
      }
    }.bind(this));
    $(menu).find(".deleteGroup").on("click", function(){
      dialog_delete.msg = Group.getName(this.id) + "を削除しますか？";
      dialog_delete.buttons = [{id: "determ", text: "OK", onclick: this.delete.bind(this)}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
      dialog_delete.show();
    }.bind(this));
    $(menu).find(".changeGroupColor").on("click", function(){
      colorPicker[this.id].show();
    }.bind(this));
    $(menu).find(".changeGroupName").on("click", this.changeName.bind(this));
    $(newGroup).show();

    $("#groupsContainer").append(newGroup);

    selectedFeatures.push([]);
    Group.groups.push(this);
    
    colorPicker[this.id] = new EightBitColorPicker({el: $(newGroup).find(".colorPicker")[0], color: this.colorNo});
    //円グラフ初期化処理
    let labels = currentCategory.data.map(obj => {return obj.label});
    let colors = currentCategory.data.map(obj => {return obj.color});
    chart[this.id] = new Chart($(newGroup).find(".groupChart"), {type: "pie", data:{labels: labels, datasets:[{backgroundColor: colors}]}});

    colorPicker[this.id].addEventListener("colorChange", this.colorChanged.bind(this));
    this.colorCode = (colorPicker[this.id].getHexColor());

    $(newGroup).find(".columnName").val(currentColumn.name);
    rewriteSumTable(this.id);
    if(currentDataset.fromto){
      fromtoSelectorSet();
    }
    
    this.element = $(newGroup);
    this.click();

    //idチェック
    if(Group.groups.length - 1 != this.id){
      console.log("WARNING:グループIDが不正です");
    }
  }

  static setTemplate(el){
    Group.template = el;
  }

  /*
  static init(){
    let g = Group.groups[0];
    $("#group0").on("click", g.click.bind(g));
    $("#group0").find(".menuBtn").on("click", g.menuOpen.bind(g));
    let menu = $("#group0").find(".popupMenu");
    $(menu).find(".resetGroup").on("click", g.reset.bind(g));
    $(menu).find(".deleteGroup").on("click", g.delete.bind(g));
    $(menu).find(".changeGroupColor").on("click", function(){
      colorPicker[0].show();
    });
    $(menu).find(".changeGroupName").on("click", g.changeName.bind(g));

    colorPicker[0] = new EightBitColorPicker({el: $("#group0").find(".colorPicker")[0], color: 112});
    colorPicker[0].addEventListener("colorChange", e=> selectColor(e));
    Group.groups[0].colorCode = colorPicker[0].getHexColor();
    Group.groups[0].element = $("#group0");

    $("#group0").find(".columnName").on("change", columnChange);
    $("#group0").find(".columnName").val("POPULATION");
    currentColumn = currentCategory.data[0];
    $("#group0").trigger("click"); //groupSelectを実行
  }
  */

  static getName(n){
    if(isNaN(n)){
      return Group.groups.map((g)=>{return g.name});
    }else{
      return Group.groups[n].name;
    }
  }

  static getColorNo(n){
    if(isNaN(n)){
      return Group.groups.map((g)=>{return g.colorNo});
    }else{
      return Group.groups[n].colorNo;
    }
  }

  static getColor(n){
    if(isNaN(n)){
      return Group.groups.map((g)=>{return g.colorCode});
    }else{
      return Group.groups[n].colorCode;
    }
  }

  static getElement(n){
    if(isNaN(n)){
      return Group.groups.map((g)=>{return g.element});
    }else{
      return Group.groups[n].element;
    }
  }

  static resetAll(){
    //地図上の色をリセット
    selectedFeatures.flat().forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    Group.groups.forEach((g)=>{
      $("#group" + g.id).remove();
    });
    Group.groups = [];
    colorPicker = [];
    chart = [];
    selectedFeatures = [];
    Group.newGroupNo = 1;
    currentSelectFromto = {A: "cursor", B: "cursor"};
  }

  click(){
    //元のグループの枠線を灰色に戻す
    Group.getElement().forEach((el)=>{
      $(el).css({border: "3px solid #777", backgroundColor: ""});
    });

    //クリックされたグループの枠線を赤くする
    $(this.element).css({border: "3px solid #a00", backgroundColor: "#feffde"});
    currentGroup = this.id;
  }

  reset(){
    let n = this.id;
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    selectedFeatures[n].splice(0);

    rewriteSumTable(n);
  }

  delete(){
    let n = this.id;
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });

    selectedFeatures.splice(n, 1);
    colorPicker.splice(n, 1);
    chart.splice(n, 1);
    $(Group.getElement(n)).remove();
    Group.groups.splice(n, 1);
    Group.groups.forEach((g, i)=>{g.id = i});
    //後続のグループのidを変更
    for(let i=(n+1); i<=selectedFeatures.length; i++){
      $("#group" + i).attr("id", "group" + (i-1));
    }

    //全グループを削除した場合
    if(!Group.groups.length){
      Group.newGroupNo = 1;
      new Group;
    }
    
    if(!Group.groups[n]){ //最後のグループを削除した場合
      currentGroup--;
    }

    if(currentDataset.fromto){
      if(n <= currentSelectFromto.A && currentSelectFromto.A != 0){
        currentSelectFromto.A --;
      }
      if(n <= currentSelectFromto.B && currentSelectFromto.B != 0){
        currentSelectFromto.B --;
      }
      fromtoSelectorSet();
    }

    Group.groups[currentGroup].click();

  }

  changeName(){
    let nameArea = $(this.element).find(".groupName");
    $(nameArea).text("");
    $(nameArea).append($("<input>").attr({type: "text", name: "groupName", placeholder: this.name}).keypress(function(e){
      if(e.which == 13){
        $(this).next().click();
      }
    }));
    let submitBtn = $("<input>").attr({type: "button", value: "OK"}).on("click", function(){
      if($("input[name='groupName']").val()){
        this.setName($("input[name='groupName']").val());
      }
      $("#sidebar").off("click.changeName");
    }.bind(this));
    $(nameArea).append(submitBtn);
    $("input[name='groupName']").focus();
    
    //名前変更をキャンセル
    $("#sidebar").on("click.changeName", function(e){
      //グループ名表示位置クリック時は作動させない
      if(!$(e.target).closest(".h3").length){
        let nameArea = $(this.element).find(".groupName")
        $(nameArea).empty();
        $(nameArea).text(this.name);
        $("#sidebar").off("click.changeName");
      }
    }.bind(this));
  }

  menuOpen(e){
    //各グループのメニュー・名前変更をリセット
    Group.getElement().forEach((el, index)=>{
      $(el).find(".popupMenu").hide();
      $(el).find(".groupName").empty();
      $(el).find(".groupName").text(Group.getName(index));
    });
    $("#sidebar").off("click.changeName");

    $(this.element).find(".popupMenu").show();
    $("#sidebar").on("click.groupmenu", (e)=>{
      //メニューボタンクリック時は作動させない
      if(!e.target.closest("button") || e.target.closest("button").className !== "menuBtn"){
        $(".popupMenu").each(function(){
          $(this).hide();
        });
        $("#sidebar").off("click.groupMenu");
      }
    });
  }


  colorChanged(){
    this.colorNo = colorPicker[this.id].get8BitColor();
    this.colorCode = colorPicker[this.id].getHexColor();
    if(selectedFeatures[this.id]){
      let color = this.colorCode;
      selectedFeatures[this.id].forEach(function(f){
        polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:color ,fillOpacity:0.4, opacity:0});
      });
    }
  }

  addFeatures(features){
    //引数は地物コードの配列
    features.forEach((code)=>{
      let match = geojsonFiles[currentDataset.polygonObj].features.find((f)=>{
        return(f.properties.CODE5 === code);
      });
      if(match){
        let feature = match.properties;
        let csvData = getCsvData(csvObjs[currentDataset.csvObj], (feature.CODE || feature.CODE5));
        if(currentDataset.fromto){
          let fromtoData = getCsvData(csvObjs[currentDataset.fromtoObj], (feature.CODE || feature.CODE5), true);
          csvData.FROMTO = fromtoData;
        }
        //polygonのデータとcsvのデータを合体
        Object.assign(feature, csvData);
        if(!feature.NODATA){
          selectedFeatures[this.id].push(feature);
          polygonLayer.setFeatureStyle(match.properties.uid, {fill: true, fillColor:(Group.getColor(this.id)) ,fillOpacity:0.4, opacity:0});
        }
      }
    });
  }

  setName(name){
    this.name = name;
    if(currentDataset.fromto){
      fromtoSelectorSet();
    }
    let nameArea = $(this.element).find(".groupName");
    $(nameArea).empty();
    $(nameArea).text(this.name);
  }

  setColor(colorNo){
    colorPicker[this.id].updateColor(colorNo);
  }
}


async function getJson(name, date){
  let path = "./json/" + name;
  return $.getJSON(path, function(json){
    let features = json.features;
    if(date){
      features = features.filter(function(f){
        return new Date(f.properties.START) <= new Date(date) & new Date(f.properties.END) > new Date(date);
      });
    }

    if (json.name === "polygon"){
      features = features.filter(f=>{return f.properties.TYPE !== "湖";});
    }

    if (json.name === "line" || json.name === "line_calc" || json.name === "2015shorai_l"){
      let mura = features.filter(function(f){return f.properties.TYPE === "村"});
      let ku = features.filter(function(f){return f.properties.TYPE === "区"});
      let sp_ku  = features.filter(function(f){return f.properties.TYPE === "特別区"});
      let gun = features.filter(function(f){return f.properties.TYPE === "郡"});
      let shicho = features.filter(function(f){return f.properties.TYPE === "支庁"});
      let ken = features.filter(function(f){return f.properties.TYPE === "県"});
      let mizu = features.filter(function(f){return f.properties.TYPE === "湖"});
      let umi = features.filter(function(f){return f.properties.TYPE === "海"});
      features = mura.concat(ku, sp_ku, gun, shicho, ken, mizu, umi);

    }

    if (json.name === "2020kokusei_old_l"){
      let old = features.filter(function(f){return f.properties.TYPE === "旧"});
      let mura = features.filter(function(f){return f.properties.TYPE === "村"});
      let ku = features.filter(function(f){return f.properties.TYPE === "区"});
      let sp_ku  = features.filter(function(f){return f.properties.TYPE === "特別区"});
      let gun = features.filter(function(f){return f.properties.TYPE === "郡"});
      let shicho = features.filter(function(f){return f.properties.TYPE === "支庁"});
      let ken = features.filter(function(f){return f.properties.TYPE === "県"});
      let mizu = features.filter(function(f){return f.properties.TYPE === "湖"});
      let umi = features.filter(function(f){return f.properties.TYPE === "海"});
      features = old.concat(mura, ku, sp_ku, gun, shicho, ken, mizu, umi);
    }

    if (json.name === "2021shosenkyoku_l"){

      let mura = features.filter(function(f){return f.properties.type === "市区町村"});
      let shosenkyoku = features.filter(function(f){return f.properties.type === "小選挙区"});
      let ken = features.filter(function(f){return f.properties.type === "県"});
      let hirei = features.filter(function(f){return f.properties.type === "比例"});
      let umi = features.filter(function(f){return f.properties.type === "海"});
      features = mura.concat(shosenkyoku, ken, hirei, umi);

    }

    features.forEach(function(f, i){
      f.properties.uid = i;
    });
    json.features = features
  });
}

async function getCsv(filename, idcolumn="CODE"){
  let path = "./csv/" + filename;
  let csvText = await $.get(path);
  let tempArr = csvText.split(/\r\n|\r|\n/g);
  let csvArr = [];
  tempArr.forEach((item, i)=>{
    csvArr[i] = item.split(",");
  });

  let mainObj = {};
  let idIndex = csvArr[0].indexOf(idcolumn)
  mainObj.header = csvArr[0].filter((i)=>{return i != idcolumn});

  let indexCol = new Set(); //インデックスの重複チェック用
  csvArr.forEach((row, i)=>{
    if((i > 0) && row[idIndex]){
      if(indexCol.has(row[idIndex])){
        console.log("注意：インデックス列に重複を検知しました。");
        console.log("行:"+ i + " 値:" + row[idIndex]);
      }
      indexCol.add(row[idIndex]);

      mainObj[row[idIndex]] = row;
      mainObj[row[idIndex]].splice(idIndex, 1);
    }
  });

  return mainObj;
}

function getCsvData(mainObj, index, ignoreZero = false){
  let returnObj = {};
  mainObj.header.forEach((col, i)=>{
    if(mainObj[index]){
      if(!ignoreZero || Number(mainObj[index][i])){
        returnObj[col] = mainObj[index][i];
      }
    }else{
      returnObj[col] = "-";
    }
  });
  return returnObj;
}

async function init(){

  /*--- mapの初期化処理 ---*/

  map = L.map("map", {zoomControl: false, doubleClickZoom: false});
  map.setView([35, 137], 8);
  map.setMinZoom(5);
  map.setMaxBounds([[10, 100], [60, 180]]);
  L.control.zoom({position: "topright"}).addTo(map);
  map.createPane("base").style.zIndex = 100;
  map.createPane("polygon").style.zindex = 150;
  map.createPane("line").style.zindex = 400;


  //ドラッグ時にクリックイベントを呼び出さないようにする
  map.on("mousedown", function(e){
    dragging = false;
    dragStart.x = e.originalEvent.clientX;
    dragStart.y = e.originalEvent.clientY;
    $(document).on("mousemove", (e)=>{
      let deltaX = e.originalEvent.clientX - dragStart.x;
      let deltaY = e.originalEvent.clientY - dragStart.y;
      let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      if(distance > 5){
        dragging = true;
      }
    });
    $(document).on("mouseup", (e)=>{
      dragging = false;
      $(document).off("mousemove");
    });
  });

  let paleMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base"
  });
  let standardMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base"
  });
  let shadeMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base",
      opacity: 0.5
  });
  let photo = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base",
      opacity: 0.7
  });
  let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors",
      pane: "base"
  });
  let googleRoads = L.gridLayer.googleMutant({
      type: "roadmap",
      attribution: "Google"
  });

  let blank = L.tileLayer('', {pane:"base"});

  let baseMaps = {
    "淡色地図(地理院地図)": paleMap,
    "標準地図(地理院地図)": standardMap,
    "陰影起伏図": shadeMap,
    "航空写真": photo,
    "OpenStreetMap": osm,
    "GoogleMap": googleRoads,
    "背景非表示":blank
  };

  L.control.layers(baseMaps).addTo(map);

  //背景地図一覧(文字列)
  let baseMapNames = {
    "淡色地図(地理院地図)": "paleMap",
    "標準地図(地理院地図)": "standardMap",
    "陰影起伏図": "shadeMap",
    "航空写真": "photo",
    "OpenStreetMap": "osm",
    "GoogleMap": "googleRoads",
    "背景非表示": "blank"
  }

  map.addLayer(paleMap);

  L.control.scale({imperial: false, maxWidth: 300, position: "bottomright"}).addTo(map);

  let sidebar = L.control.sidebar({container: "sidebar", closeButton: false}).addTo(map);
  sidebar.open("home");

  /*--- ダイアログ初期化処理 ---*/

  dialog_reset = new Dialog();
  dialog_delete = new Dialog();
  dialog_changeDataset = new Dialog();
  dialog_saveConfirm = new Dialog();

  /*--- データセット・カテゴリの初期化処理 ---*/

  currentDataset = Dataset[0];
  Dataset.forEach(e=>{
    $("#dataset").append("<option value='" + e.name + "'>" + e.label + "</option>");
  });
  $("#dataset").val("kokusei2020");

  currentCategory = currentDataset.category[0];
  currentDataset.category.forEach(e=>{
    if(e.name !== "csv"){
      $("#category").append("<option value='" + e.name + "'>" + e.label + "</option>");
    }
  });
  $("#category").val("population");

  $("#dataset").on("change", datasetOnchange);
  $("#category").on("change", categoryChange);

  currentColumn = currentCategory.data[0];


  /*--- chartの初期化処理 ---*/

  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.position = "right";
  Chart.defaults.plugins.legend.labels.padding = 5;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.overrides.pie.plugins.tooltip.callbacks.label = function(context){
    let value = context.parsed;
    let totalValue = context.dataset.data.reduce((sum, el)=>{return sum + parseFloat(el)}, 0);
    let percent = value / totalValue * 100;
    let unit = currentCategory.unit;
    return [context.label, context.formattedValue + unit + "(" + percent.toFixed(1) + "%)"];
  }
  Chart.overrides.pie.plugins.legend.onClick = null;
  mouseChart = new Chart($("#mouseChart"), {
    type: "pie",
    options: {
      maintainAspectRatio: false,
    }
  });
  chart[0] = new Chart($("#groupTemplate").find(".groupChart"), {
    type: "pie",
    options: {
      maintainAspectRatio: false,
    }
  });

  /*--- グループ内コンテンツの初期化処理 ---*/
  Group.setTemplate($("#groupTemplate"));
  Group.groups[0] = new Group();

  /*--- fromtoテーブル ---*/
  $("#selectFrom").append($("<option>").attr({value: "cursor"}).text("カーソル位置"));
  $("#selectFrom").append($("<option>").attr({value: "0"}).text("グループ1"));
  $("#selectTo").append($("<option>").attr({value: "cursor"}).text("カーソル位置"));
  $("#selectTo").append($("<option>").attr({value: "0"}).text("グループ1"));

  /*let tableColumn = currentDataset.category.find((f)=>{return f.name === "fromto"});
  tableColumn.data.forEach((f, i)=>{
    let tr = $("<tr>");
    $(tr).append($("<th>").attr({class: "fromtoCol_name" + i}).text(f.label));
    $(tr).append($("<td>").attr({class: "fromtoCol_data" + i}));
    $(tr).appendTo(".fromtoTable");
  });*/

  $("#selectFrom").on("change", ()=>{
    currentSelectFromto.A = $("#selectFrom").val();
    rewriteFromtoTable();
  });
  $("#selectTo").on("change", ()=>{
    currentSelectFromto.B = $("#selectTo").val();
    rewriteFromtoTable();
  });

  //$("#fromto").show();

  /*--- モーダルウィンドウ初期化処理 ---*/

  $('#tableOpen').modaal({
    content_source: '#csvModal',
    before_open: openTable,
    before_close: closeTable
  });

  $('input[name="tableType"]').change(function(){
    closeTable();
    openTable();
  });

  $("#savebtn").modaal({
    content_source: "#saveModal",
    before_open: saveOpen
  });

  $("#loadbtn").modaal({
    content_source: "#saveModal",
    before_open: loadOpen
  });

  $(".backupMenu").on("click", function(e){
    $("#tab1").hide();
    $("#tab2").hide();
    $("#tab3").show();
    saveModal_prevTab = $(e.currentTarget).parent().parent().attr("id");
  });

  $("#backupMenu_back").on("click", function(){
    $("#" + saveModal_prevTab).show();
    $("#tab3").hide();
  });

  $("#backupFileImport").on("change", importFileOnChange);

  /*--- トースト初期化処理 ---*/

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-center",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  /*--- 保存ウインドウ処理 ---*/
  if(window.localStorage.getItem("calc_saveData")){
    saveDataArr = JSON.parse(window.localStorage.getItem("calc_saveData"));
  }
  let table = $("#saveTable,#loadTable");
  saveDataTableRedraw();

  table.on("click", ".slot", e=>{
    table.children().removeAttr("style selected");
    $(e.currentTarget).css({backgroundColor: "#feffde", "box-shadow": "inset 0px 0px 0px 2px #ff0000"}).attr({selected: 1});
  });

  table.on("click", ".slot .delete", e=>{
    let id = $(e.currentTarget).parent().attr("value");
    let saveDataName = saveDataArr[id].name;
    let dialog = new Dialog({msg: "「" + saveDataName + "」を削除しますか？", buttons: [{id: "determ", text: "OK", onclick: function(){
      saveDataArr.splice(id, 1);
      window.localStorage.setItem("calc_saveData", JSON.stringify(saveDataArr));
      saveDataTableRedraw();
      if($(e.delegateTarget).attr("id") === "saveTable"){
        $("#saveTable").find("[value='" + saveDataArr.length + "']").click();
      }else if($(e.delegateTarget).attr("id") === "loadTable"){
        $("#loadTable").find("[value='0']").click();
      }
    }}, {id: "cancel", text: "キャンセル", onclick: "cancel"}]});
    dialog.show();
  });

  $("#importDataTable").on("click", ".slot", e=>{
    if($(e.currentTarget).attr("selected")){
      $(e.currentTarget).removeAttr("style selected");
    }else{
      $(e.currentTarget).css({backgroundColor: "#feffde", "box-shadow": "inset 0px 0px 0px 2px #ff0000"}).attr({selected: 1});
    }

    if($("#importDataTable").find("[selected]").length){
      $("#importBtn").attr({"valid": 1});
    }else{
      $("#importBtn").attr({"valid": 0});
    }
  });

  $("#saveModal").find(".cancel").on("click", ()=>{
    $("#savebtn").modaal("close");
    $("#loadbtn").modaal("close");
  });

  $("#saveModal").find(".save").on("click", function(){
    function determ(){
      let saveDataName = $("[name='saveDataName']").val();
      let saveData = makeSavedata(saveDataName);
      console.log(saveData);
      let index = $("#saveTable").children("[selected]").attr("value");
      saveDataArr[index] = saveData;
      saveDataArr.sort((a, b)=>{return new Date(b.createTime) - new Date(a.createTime)});
      window.localStorage.setItem("calc_saveData", JSON.stringify(saveDataArr));
      currentSave = saveData;

      saveDataTableRedraw();
      $("#saveTable").find("[value='0']").click();
    }

    if($("#saveTable").children("[selected]").attr("value") == saveDataArr.length){
      determ();
    }else{
      new Dialog({msg: "ファイル「" + saveDataArr[$("#saveTable").children("[selected]").attr("value")].name + "」に現在の選択を上書きしますか？", buttons: [{id: "determ", text: "OK", onclick: determ}, {id: "cancel", text: "キャンセル", onclick: "cancel"}]}).show();
    }
    
  });

  $("#saveModal").find(".load").on("click", function(){
    let index = $("#loadTable").children("[selected]").attr("value");
    if(!isNaN(index)){
      currentSave = saveDataArr[index];
      $("#loadbtn").modaal("close");
      loadData(currentSave);
    }
  });

  $("#importBtn").on("click", e=>{
    if($("#importBtn").attr("valid")){
      for(file of $("#backupFileImport")[0].files){
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = ()=>{
          data = JSON.parse(reader.result);
          data = data.filter((d,i)=>{
            return $($("#importDataTable").children()[i]).attr("selected");
          });
          new Dialog({msg: "ファイルのデータをブラウザに保存します。", buttons: [{id: "determ", text: "OK", onclick: function(){importBackup(data);}}, {id: "cancel", text: "キャンセル", onclick: "cancel"}]}).show();
        }
      }
    }
  });

  /*--- 地図データ・統計データ読み込み ---*/

  geojsonFiles.polygon2020 = await getJson("polygon.geojson", "2020-10-01");
  geojsonFiles.line2020 = await getJson("line.geojson", "2020-10-01");

  csvObjs.kokusei2020 = await getCsv("2020kokusei.csv");

  polygonRedraw(geojsonFiles.polygon2020);
  lineRedraw(geojsonFiles.line2020);

  $(".loader, .loaderBG, .loaderCover").css("display", "none");

}

function polygonRedraw(json){
  polygonLayer = L.vectorGrid.slicer(json, {
    vectorTileLayerStyles: {
      sliced:function(properties){
        if(properties.NODATA){
          return {fill: true, fillColor:"#757575" ,fillOpacity:0.5, opacity:0}
        }else{
          return {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0}
        }
      }
    },
    maxZoom: 18,
    interactive: true,
    getFeatureId: function(f){
      return f.properties.uid;
    },
    pane: "polygon"
  }).on("mouseup", (e)=>{
    if(!dragging){
      clickEvent(e);
    }
  }).on("mouseover mousedown", (e)=>{
    cursorObj = e.layer.properties;
    rewriteCursorTable(cursorObj);
    if(currentDataset.fromto){
      rewriteFromtoTable();
    }
  });

  polygonLayer.addTo(map);
}

function lineRedraw(json){
  lineLayer = L.vectorGrid.slicer(json, {
    vectorTileLayerStyles: {
      sliced: function(properties){
        if(json.name === "line" || json.name === "line_calc" || json.name === "2015shorai_l"){
          switch(properties.TYPE){
            case '村': return{color:"#639394", weight:2}
            case '区': return{color:"#857944", weight:2}
            case '特別区': return{color:"#326333", weight:2}
            case '郡': return{color:"#326333", weight:2}
            case '支庁': return{color:"#995514", weight:2}
            case '県': return{color:"#8a2725", weight:2}
            case '湖': return{color:"#5363b5", weight:2}
            case '海': return{color:"#223c8a", weight:2}
         }
       }else if(json.name === "2020kokusei_old_l"){
         switch(properties.TYPE){
           case '旧': return{color:"#555555", weight:1.5, dashArray:"3 3"}
           case '村': return{color:"#639394", weight:2}
           case '区': return{color:"#857944", weight:2}
           case '特別区': return{color:"#326333", weight:2}
           case '郡': return{color:"#326333", weight:2}
           case '支庁': return{color:"#995514", weight:2}
           case '県': return{color:"#8a2725", weight:2}
           case '湖': return{color:"#5363b5", weight:2}
           case '海': return{color:"#223c8a", weight:2}
       }
       }else if(json.name === "2021shosenkyoku_l"){
         switch(properties.type){
           case '市区町村': return{color:"#808080", weight:2}
           case '小選挙区': return{color:"#0c7482", weight:2.5}
           case '県': return{color:"#c95b5b", weight:2.5}
           case '比例': return{color:"#632a70", weight:3}
           case '海': return{color:"#223c8a", weight:2}
        }
       }
      }
    },
    maxZoom: 18,
    pane: "line"
  });
  lineLayer.addTo(map);
}

//fromtoテーブルのセレクタリセット
function fromtoSelectorSet(){
  $("#selectFrom").empty();
  $("#selectTo").empty();

  $("#selectFrom").append($("<option>").attr({value: "cursor"}).text("カーソル位置"));
  $("#selectTo").append($("<option>").attr({value: "cursor"}).text("カーソル位置"));

  Group.getName().forEach((name, i)=>{
    $("#selectFrom").append($("<option>").attr({value: i}).text(name));
    $("#selectTo").append($("<option>").attr({value: i}).text(name));
  });

  $("#selectFrom").val(currentSelectFromto.A);
  $("#selectTo").val(currentSelectFromto.B);
}

//選択地物並び替え
function sortFeatures(){
  if(sortCol === "default"){
    selectedFeatures.forEach(g=>{
      g.sort((a,b)=>{if(a.CODE5<b.CODE5){return -1}else if(a.CODE5>b.CODE5){return 1}else{return 0}});
    });
  }else{
    selectedFeatures.forEach(g=>{
      g.sort((a,b)=>{return calc(b, sortCol.func, sortCol.prec, sortCol.args) - calc(a, sortCol.func, sortCol.prec, sortCol.args)});
    });
  }
}

//地物クリック時の処理
function clickEvent(obj){
  if(selectedFeatures[currentGroup].some(f => f.uid === obj.layer.properties.uid)){  //クリックした地物が選択済みの場合(クリックした地物を削除)
    selectedFeatures[currentGroup] = selectedFeatures[currentGroup].filter(f => f.uid !== obj.layer.properties.uid);
    polygonLayer.resetFeatureStyle(obj.layer.properties.uid);

  }else if(selectedFeatures.flat().some(f => f.uid === obj.layer.properties.uid)){  //クリックした地物が他のグループで選択されている場合(クリックした地物のグループを変更)
    let locA, locB;  //selectedFeatures[locA][locB]がクリックしたした地物の位置
    selectedFeatures.some(function(group, groupNo){
      if(group.findIndex(f => f.uid === obj.layer.properties.uid) !== -1){
        locA = groupNo;
        locB = group.findIndex(f => f.uid === obj.layer.properties.uid);
        return true;
      }else{
        return false;
      }
    });
    selectedFeatures[locA].splice(locB, 1);
    rewriteSumTable(locA);

    let feature = obj.layer.properties;
    let csvData = getCsvData(csvObjs[currentDataset.csvObj], (feature.CODE || feature.CODE5));
    if(currentDataset.fromto){
      let fromtoData = getCsvData(csvObjs[currentDataset.fromtoObj], (feature.CODE || feature.CODE5), true);
      csvData.FROMTO = fromtoData;
    }
    //polygonのデータとcsvのデータを合体
    Object.assign(feature, csvData);
    selectedFeatures[currentGroup].push(feature);
    polygonLayer.setFeatureStyle(feature.uid, {fill: true, fillColor:(Group.getColor(currentGroup)) ,fillOpacity:0.4, opacity:0});

  }else{  //クリックした地物が未選択の場合(クリックした地物を追加)
    if(!obj.layer.properties.NODATA){  //NODATAはクリック不可
      let feature = obj.layer.properties;
      let csvData = getCsvData(csvObjs[currentDataset.csvObj], (feature.CODE || feature.CODE5));
      if(currentDataset.fromto){
        let fromtoData = getCsvData(csvObjs[currentDataset.fromtoObj], (feature.CODE || feature.CODE5), true);
        csvData.FROMTO = fromtoData;
      }
      //polygonのデータとcsvのデータを合体
      Object.assign(feature, csvData);
      selectedFeatures[currentGroup].push(feature);
      polygonLayer.setFeatureStyle(feature.uid, {fill: true, fillColor:(Group.getColor(currentGroup)) ,fillOpacity:0.4, opacity:0});
    }
  }

  sortFeatures();
  rewriteSumTable(currentGroup);
  if(currentDataset.fromto){
    rewriteFromtoTable();
  }

}

//カーソル位置の地物情報表示
function rewriteCursorTable(obj){
  if(obj){
    let csvData = getCsvData(csvObjs[currentDataset.csvObj], (obj.CODE || obj.CODE5));
    if(currentDataset.fromto){
      let fromtoData = getCsvData(csvObjs[currentDataset.fromtoObj], (obj.CODE || obj.CODE5), true);
      csvData.FROMTO = fromtoData;
    }
    //polygonのデータとcsvのデータを合体
    Object.assign(obj, csvData);

    let gun = "";
    if(currentDataset.name !== "kokusei2020old"){
      if(obj.GUN){
        gun = obj.GUN.split("(")[0]; //北海道の郡名処理
      }
    }
    let name = (obj.NAME || "-");
    if(obj.CODE5 === "01223X" || obj.CODE === "01223X"){
      name = name + "(歯舞群島)";
    }
    $("#mouse_name").text(obj.KEN + gun + name);

    if(!obj.NODATA){
      if(!currentCategory.pie){
        let categories = currentCategory.data.filter(item => !item.groupOnly);
        categories.forEach(function(f, i){
          $("#mouseCol_data" + i).text(calc(obj, f.func, f.prec, f.args));
          //按分の有無判定
          if(f.args && currentDataset.estimate){
            let a = [...f.args, ...currentDataset.estimate];
            let b = new Set([...f.args, ...currentDataset.estimate]);
            if(obj.ESTIMATE && (a.length !== b.size)){
              $("#mouseCol_data" + i).css({color: "#0000ee"});
            }else{
              $("#mouseCol_data" + i).css({color: "#000000"});
            }
          }else{
            $("#mouseCol_data" + i).css({color: "#000000"});
          }
        });
      }else{
        let datas = [];
        currentCategory.data.forEach(function(f, i){
          datas.push(calc(obj, f.func, f.prec, f.args));
        });
        mouseChart.data.datasets[0].data = datas;
        mouseChart.update();
      }
    }else{ //NODATA
      if(!currentCategory.pie){
        currentCategory.data.forEach((f, i)=>{
          $("#mouseCol_data" + i).text("-");
        });
      }else{
        mouseChart.data.datasets[0].data = [];
        mouseChart.update();
      }
    }


  }else{
    $("#mouse_name").text("-");
    if(!currentCategory.pie){
      currentCategory.data.forEach(function(f, i){
        $("#mouseCol_data" + i).text("");
      });
    }else{
      mouseChart.data.datasets[0].data = [];
      mouseChart.update();
    }
  }
}

//fromtoテーブル再描画
function rewriteFromtoTable(){
  let objA, objB;
  if(currentSelectFromto.A === "cursor"){
    objA = cursorObj;
  }else{
    objA = selectedFeatures[currentSelectFromto.A];
  }
  if(currentSelectFromto.B === "cursor"){
    objB = cursorObj;
  }else{
    objB = selectedFeatures[currentSelectFromto.B];
  }


  if(objA && objB){
    let move = calcFromto(objA, objB);
    let revMove = calcFromto(objB, objA);

    let tableColumn = currentDataset.category.find((f)=>{return f.name === "fromto"});
    tableColumn.data.forEach(function(data, i){
      let feature;
      if(data.ab === "A"){
        feature = objA;
      }else{
        feature = objB;
      }
      let args = data.args.replaceAll("\move", move).replaceAll("\revMove", revMove);
      $(".fromtoCol_data" + i).text(calc(feature, "custom", data.prec, args));
    });
  }else{ //NODATA
    $(".fromtoCol_data" + i).text();
  }

}

//グループの値合計用
function sum(arr, key){
  if(Array.isArray(arr)){ //arrが配列である場合、配列の合計を返す(非数値は0とみなす)
    return arr.reduce((sum, e) => {
      return sum + (Number(e[key]) || 0);
    },0);
  }else{ //arrが配列でない場合(=カーソル位置テーブル・個別地物テーブル)
    if(isNaN(Number(arr[key]))){ //値が非数値(秘匿値)
      return arr[key];
    }else{ //値が数値(0を含む)
      return Number(arr[key]);
    }
  }

}

//各種計算用関数
//features: 計算に使用するオブジェクトの配列;  func: 計算式の種類;  prec: 小数点以下の桁数;  args: 計算に用いるkeyの名称の配列(要求される数はfuncによる)
function calc(features, func, prec = 0, args){
  let result;
  if(func === "div"){ //割り算　args[0]/args[1]
    result = sum(features, args[0]) / sum(features, args[1]);
    if(isNaN(result) || sum(features, args[1]) == 0){
      return "-";
    }else{
      return result.toFixed(prec);
    }
  }else if(func === "rate"){ //割合(百分率) args[0]/args[1]*100
    result = sum(features, args[0]) / sum(features, args[1]);
    if(isNaN(result) || sum(features, args[1]) == 0){
      return "-";
    }else{
      return (result * 100).toFixed(prec);
    }
  }else if(func === "incr_rate"){ //増加率(百分率) args[0]/(args[1]-args[0])*100
    result = sum(features, args[0]) / (sum(features, args[1]) - sum(features, args[0]));
    if(isNaN(result) || sum(features, args[1]) - sum(features, args[0]) == 0){
      return "-";
    }else{
      return (result * 100).toFixed(prec);
    }
  }else if(func === "sum"){ //足し算 args[0]
    result = sum(features, args[0]);
    if(isNaN(result)){
      return result;
    }else{
      if(prec === "floor"){
        return Math.floor(result);
      }else{
        return result.toFixed(prec);
      }
    }
  }else if(func === "nonsum"){ //合計を行わない(個別地物テーブルにのみ表示)
    if(!Array.isArray(features)){
      return features[args[0]];
    }else{
      return "";
    }
  }else if(func === "pie_other"){ //その他(円グラフ用)
    let total = sum(features, args[0]); //合計値(第一引数)
    let nonOther = 0;
    args.slice(1).forEach(arg => {
      let nextNumber = sum(features, arg);
      if(isNaN(nextNumber)){
        nextNumber = 0;
      }
      nonOther = nonOther + nextNumber;
    });
    return (total - nonOther).toFixed(prec);
  }else if(func === "custom"){
    //argsは配列でも文字列でも可
    let argsArr
    if(Array.isArray(args)){
      argsArr = args;
    }else{
      argsArr = args.split(",");
    }
    let expression = "";
    argsArr.forEach((arg)=>{
      if(["+", "-", "*", "/", "(", ")"].includes(arg)){
        expression = expression + arg;
      }else if(!isNaN(arg)){
        expression = expression + String(arg);
      }else if(csvObjs[currentDataset.csvObj].header.includes(arg)){
        expression = expression + "sum(features, '" + arg + "')";
      }else if(arg === "\domestic"){
        expression = expression + calcFromto(features, features);
      }else{
        expression = expression + "0";
      }
    });
    result = eval(expression);
    if(isNaN(result)){
      return "-";
    }else{
      if(prec === "floor"){
        return Math.floor(result);
      }else{
        return result.toFixed(prec);
      }
    }
  }else{ //空白
    return "";
  }
}

//domesticの計算(選択地物変更時に呼び出し)
function calcFromto(featuresA, featuresB){
  if(!Array.isArray(featuresA)){
    featuresA = [featuresA];
  }
  if(!Array.isArray(featuresB)){
    featuresB = [featuresB];
  }
  if(currentDataset.fromto){
    let result = 0;
    featuresA.forEach((featureA)=>{
      featuresB.forEach((featureB)=>{
        result = result + (Number(featureA.FROMTO[featureB.CODE || featureB.CODE5]) || 0);
      });
    });
    return result
  }
}

function constructGroupTable(n){
  //nは数字または"Template"
  if(!currentCategory.pie){ //円グラフ以外
    $("#group" + n).find(".groupTable").show();
    $("#group" + n).find(".chartContainer").hide();
    let groupTable = $("#group" + n).find(".groupTable");
    $(groupTable).empty();
    for(i=0; i<currentCategory.data.length; i++){
      let th = $("<th>").attr("class", "groupCol_name" + i);
      if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum" && !currentCategory.data[i].singleOnly){ //currentCategory.data[i]が空でない場合
        $(th).text(currentCategory.data[i].label || "");
        if(currentCategory.data[i].desc !== undefined){ //ツールチップを付加
          let div = $("<div>", {class: "tooltip"});
          $("<i>", {class: "fas fa-question-circle", style: "color:#0f5f91;"}).appendTo(div);
          $("<div>", {class: "description"}).text(currentCategory.data[i].desc).appendTo(div);
          $(th).append(div);
        }
      }else{
        $(th).css({display: "none"});
      }
      let td = $("<td>").attr("class", "groupCol_data" + i);
      if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum" && !currentCategory.data[i].singleOnly){ //currentCategory.data[i]が空でない場合
        $(td).text("");
      }else{
        $(td).css({display: "none"});
      }
      $(groupTable).append($("<tr>").append(th, td));
    }
  }else{ //円グラフ
    $("#group" + n).find(".groupTable").hide();
    $("#group" + n).find(".chartContainer").show();

    if(!isNaN(n)){
      let labels = currentCategory.data.map(obj => {return obj.label});
      let colors = currentCategory.data.map(obj => {return obj.color});
      chart[n].data.labels = labels;
      chart[n].data.datasets = [{
        backgroundColor: colors
      }];
      chart[n].update();
    }
    
  }

  //個別地物テーブルの更新
  let columnSelector = $("#group" + n).find(".columnName");
  $(columnSelector).empty();
  currentCategory.data.forEach(e => {
    let option = $("<option>");
    if(Object.keys(e).length && !e.groupOnly){
      $(option).attr({value: e.name}).text(e.label).appendTo(columnSelector);
    }else{
      //iOSではoptionに対してdisplay:noneが効かないので、spanで囲む
      $(option).css({display: "none"});
      $(columnSelector).append($("<span>", {style: "display: none;"}).append(option));
    }
  });
  currentColumn = currentCategory.data[0];
  
}

//グループの合計値書き換え
function rewriteSumTable(n){
  if(!currentCategory.pie){ //テーブルの場合
    currentCategory.data.forEach(function(f, i){
      $("#group" + n).find(".groupCol_data" + i).text(calc(selectedFeatures[n], f.func, f.prec, f.args));
    });

  }else{ //円グラフの場合
    let datas = [];
    currentCategory.data.forEach(function(f, i){
      datas.push(calc(selectedFeatures[n], f.func, f.prec, f.args));
    });
    chart[n].data.datasets[0].data = datas;
    chart[n].update();
  }

  $("#group" + n).find(".sel_count").text(selectedFeatures[n].length);
  let table = $("#group" + n).find(".sel_table");
  //地物一覧表を削除(一行目以外)
  $(table).find("tr:gt(0)").remove();
  //新しい地物一覧表を追加
  selectedFeatures[n].forEach(function(f){
    let name = f.NAME || "-";
    if(f.TYPE === "政令区"){
      name = (f.GUN || "") + f.NAME;
    }
    if(f.CODE5 === "01223X" || f.CODE === "01223X"){
      name = name + "(歯舞群島)";
    }
    let value = calc(f, currentColumn.func, currentColumn.prec, currentColumn.args);
    let sumVal = parseInt(calc(selectedFeatures[n], currentColumn.func, currentColumn.prec, currentColumn.args));
    let propotion = "-";
    if(["sum", "pie_other", "custom"].includes(currentColumn.func) && !currentColumn.noprop && sumVal){
      if(isNaN(value)){
        propotion = "0.00";
      }else{
        propotion = (value / sumVal * 100).toFixed(2);
      }
    }
    //按分の有無判定
    let style = "color:#000000;";
    if(currentColumn.args && currentDataset.estimate){
      let a = [...currentColumn.args, ...currentDataset.estimate];
      let b = new Set([...currentColumn.args, ...currentDataset.estimate]);
      if(f.ESTIMATE == true && a.length !== b.size){
        style = "color:#0000ee;";
      }
    }
    let row = $("<tr>");
    row.append($("<td>", {text: name}));
    row.append($("<td>", {text: value, style: style}));
    row.append($("<td>", {text: propotion, style: style}));
    table.append(row);
  });
}

//グループの追加
function addGroup(){
  g = new Group();
}

//地物一覧テーブルのカテゴリ変更
function columnChange(e){
  currentColumn = currentCategory.data.find(f => {return f.name === e.target.value;});
  if(sortCol !== "default"){
    sortCol = currentColumn;
    sortFeatures();
  }
  for(let i=0; i < selectedFeatures.length; i++){
    rewriteSumTable(i);
    $("#group" + i).find(".columnName").val(currentColumn.name);
  }
}

//表示カテゴリ変更
function categoryChange(e){
  currentCategory = currentDataset.category.find(f => {return f.name === e.target.value;});
  sortCol = "default";
  sortFeatures();
  $(".sortbtn[value='default']").css({color: ""});
  $(".sortbtn[value='column']").css({color: "#888888"});

  //カーソル位置地物情報テーブルの書き換え
  if(!currentCategory.pie){
    $("#mouseTable").show();
    $("#mouseChartContainer").hide();
    let mouseTable = document.getElementById("mouseTable");
    while (mouseTable.rows[0]) {
      mouseTable.deleteRow(0);
    }
    let categories = currentCategory.data.filter(item => !item.groupOnly);
    for(i=0; i<categories.length/2; i++){
      let tr = document.createElement("tr");
      for(j=0; j<2; j++){
        let th = document.createElement("th");
        th.id = "mouseCol_name" + (i*2+j);
        th.innerText = categories[i*2+j].label || "";
        tr.appendChild(th);
        let td = document.createElement("td");
        td.id = "mouseCol_data" + (i*2+j);
        tr.appendChild(td);
      }
      mouseTable.appendChild(tr);
    }
  }else{
    $("#mouseTable").hide();
    $("#mouseChartContainer").show();
    let labels = currentCategory.data.map(obj => {return obj.label});
    let colors = currentCategory.data.map(obj => {return obj.color});
    mouseChart.data.labels = labels;
    mouseChart.data.datasets = [{
      backgroundColor: colors,
      data: []
    }];
    mouseChart.update();
  }
  if(cursorObj){
    rewriteCursorTable(cursorObj);
  }

  //fromtoテーブルの書き換え
  if(currentDataset.fromto){
    $("fromto").show();
    $(".fromtoTable").empty();
    let catFromto = currentDataset.category.find(item => item.name == "fromto").data;
    for(i=0; i<catFromto.length; i++){
      let th = $("<th>").attr("class", "fromtoCol_name" + i);
      $(th).text(catFromto[i].label || "");
      if(catFromto[i].desc !== undefined){ //ツールチップを付加
        let div = $("<div>", {class: "tooltip"});
        $("<i>", {class: "fas fa-question-circle", style: "color:#0f5f91;"}).appendTo(div);
        $("<div>", {class: "description"}).text(catFromto[i].desc).appendTo(div);
        $(th).append(div);
      }
      let td = $("<td>").attr("class", "fromtoCol_data" + i);
      $(td).text("");
      $(".fromtoTable").append($("<tr>").append(th, td));
    }

    fromtoSelectorSet();
    rewriteFromtoTable();
  }else{
    $("#fromto").hide();
  }

  //グループの書き換え
  constructGroupTable("Template");
  selectedFeatures.forEach((f,i)=>{
    constructGroupTable(i);
    rewriteSumTable(i);
  });
  
}

//データセット変更
function datasetOnchange(e){
  //「選択地物を保持してデータセット変更」
  async function save(){
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    //selectedFeaturesをコピー
    let formerFeatures = [];
    selectedFeatures.forEach((group)=>{
      formerFeatures.push(group.map((feature)=>{return feature.CODE5}));
      //selectedFeaturesをリセット
      group.length = 0;
    });

    await datasetChange(formerFeatures);
  }
  //「選択地物を破棄してデータセット変更」
  async function discard(){
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    Group.resetAll();
    new Group;
    await datasetChange();

  }

  dialog_changeDataset.msg = "データセットを「" + $("#dataset option:selected").text() +  "」に変更しますか？";
  dialog_changeDataset.cancel = ()=>{$("#dataset").val(currentDataset.name);};
  dialog_changeDataset.buttons = [{id: "save", text: "選択地物を保持して変更", onclick: save}, {id: "discard", text: "選択地物をリセットして変更", onclick: discard}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
  dialog_changeDataset.show();
}

async function loadMapData(){
  polygonLayer.remove();
  lineLayer.remove();
  if(!geojsonFiles[currentDataset.polygonObj]){ //ポリゴンデータの取得が済んでいない場合
    geojsonFiles[currentDataset.polygonObj] = await getJson(currentDataset.polygonFile, currentDataset.date);
  }
  polygonRedraw(geojsonFiles[currentDataset.polygonObj]);
  if(!geojsonFiles[currentDataset.lineObj]){ //ラインデータの取得が済んでいない場合
    geojsonFiles[currentDataset.lineObj] = await getJson(currentDataset.lineFile, currentDataset.date);
  }
  lineRedraw(geojsonFiles[currentDataset.lineObj]);
  if(!csvObjs[currentDataset.csvObj]){ //csvデータの取得が済んでいない場合
    csvObjs[currentDataset.csvObj] = await getCsv(currentDataset.csvFile);
  }
  if(currentDataset.fromto && !csvObjs[currentDataset.fromtoObj]){ //fromtoテーブルの取得
    csvObjs[currentDataset.fromtoObj] = await getCsv(currentDataset.fromtoFile);
  }
}

async function datasetChange(formerFeatures, categoryRenewal = true){
  $(".loader, .loaderBG, .loaderCover").css("display", "inline");

  await loadMapData();

  //---以下、選択地物保持の場合のみ実行---
  if(formerFeatures){
    formerFeatures.forEach((features, idx)=>{
      Group.groups[idx].addFeatures(features);
    });
  }

  //カテゴリを再設定する場合(デフォルト)
  if(categoryRenewal){
    currentCategory = currentDataset.category[0];
    currentColumn = currentCategory.data[0];
  }

  //カテゴリ選択部の更新
  let categorySelector = document.getElementById("category");
  while (categorySelector.firstChild) {
    categorySelector.removeChild(categorySelector.firstChild);
  }
  let catCnt = 0;
  currentDataset.category.forEach(f => {
    if(f.name !== "csv" && f.name !== "fromto"){ //csv用のカテゴリセットは除く
      let option = document.createElement("option");
      option.value = f.name;
      option.innerText = f.label;
      categorySelector.appendChild(option);
      catCnt++;
    }
  });
  if(catCnt <= 1){
    categorySelector.disabled = true;
  }else{
    categorySelector.disabled = false;
  }
  categorySelector.value = currentCategory.name;

  //データ出典書き換え
  $("#attribution").empty();
  $("#attribution").append("データ出典:");
  currentDataset.attr.forEach((attr, i)=>{
    if(attr.link){
      $("<a>", {href: attr.link, text: attr.label, target: "_blank"}).appendTo("#attribution");
    }else{
      $("<span>", {text: attr.label}).appendTo("#attribution");
    }
    if(currentDataset.attr[i+1]){$("#attribution").append("、");}
  });

  //カーソル位置テーブルの再描画
  let event = new Event("change");
  categorySelector.dispatchEvent(event);
  rewriteCursorTable();

  //fromtoテーブル
  if(currentDataset.fromto){
    $("#fromto").show();
  }else{
    $("#fromto").hide();
  }

  $(".loader, .loaderBG, .loaderCover").css("display", "none");
}

//csv生成用テーブルを開く
function openTable(){
  if(!currentDataset.fromto){
    $("input[value='intergroup']").parent().hide();
    if($('input[name="tableType"]:checked').val() === "intergroup"){
      $("input[name='tableType']").val(["all"]);
    }
  }else{
    $("input[value='intergroup']").parent().show();
  }
  let tableType = $('input[name="tableType"]:checked').val();
  if(tableType == "all" || tableType == "group"){
    let csvCate = currentDataset.category.find(i=>{return i.name=="csv"}).data;
  $("#csvTableHeader").text("データ: " + currentDataset.label);
  //表一行目
  let tr1 = $("<tr>");
  $("#csvTable").append(tr1);
  $("<th>", {text: "コード"}).appendTo(tr1);
  $("<th>", {text: "名前"}).appendTo(tr1);
  if(tableType === "all"){$("<th>", {text: "グループ"}).appendTo(tr1);}else{$("<th>", {text: "選択地物数"}).appendTo(tr1);}
  csvCate.forEach(cate => {
    if(cate.func){
      $("<th>", {text: cate.label}).appendTo(tr1);
    }
  });

  for(i=0; i<selectedFeatures.length; i++){
    //各地物のデータ
    if(tableType === "all"){
      [...selectedFeatures[i]].sort((a,b)=>{return a.CODE5 > b.CODE5}).forEach(fts => {
        let tr2 = $("<tr>");
        let name = fts.NAME || "-";
        if(fts.TYPE === "政令区"){
          name = fts.GUN + fts.NAME;
        }
        if(fts.CODE5 === "01223X" || fts.CODE === "01223X"){
          name = name + "(歯舞群島)";
        }
        $("#csvTable").append(tr2);
        $("<td>", {text: fts.CODE5}).appendTo(tr2);
        $("<td>", {text: name}).appendTo(tr2);
        $("<td>", {text: "G" + (i + 1)}).appendTo(tr2);
        csvCate.forEach(cate => {
          if(cate.func){
            let tableData = calc(fts, cate.func, cate.prec, cate.args);
            let textAlign = function(){switch(cate.func){case "nonsum": return "left"; default: return "right"}};
            $("<td>", {text: tableData, css:{"textAlign": textAlign}}).appendTo(tr2);
          }
        });
      });
    }

    //グループ合計値
    let tr3 = $("<tr>");
    $(tr3).css("background-color", "#ddf");
    $("#csvTable").append(tr3);
    $("<td>", {text: "G" + (i + 1)}).appendTo(tr3);
    $("<td>", {text: Group.getName(i)}).appendTo(tr3);
    if(tableType === "all"){$("<td>").appendTo(tr3);}else{$("<td>", {text: selectedFeatures[i].length}).appendTo(tr3);}
    csvCate.forEach(cate => {
      if(cate.func){
        let tableData = calc(selectedFeatures[i], cate.func, cate.prec, cate.args);
        $("<td>", {text: tableData, css:{textAlign: "right"}}).appendTo(tr3);
      }
    });
  }

  //全グループ合計
  let tr4 = $("<tr>");
  $(tr4).css("background-color", "#fdd");
  $("#csvTable").append(tr4);
  $("<td>", {text: "Gtotal"}).appendTo(tr4);
  $("<td>", {text: "全グループ"}).appendTo(tr4);
  if(tableType === "all"){$("<td>").appendTo(tr4);}else{$("<td>", {text: selectedFeatures.flat().length}).appendTo(tr4);}
  csvCate.forEach(cate => {
    if(cate.func){
      let tableData = calc(selectedFeatures.flat(), cate.func, cate.prec, cate.args);
      $("<td>", {text: tableData, css:{textAlign: "right"}}).appendTo(tr4);
    }
  });

}else if(tableType == "intergroup"){ //グループ間クロス表
  $("#csvTableHeader").text("データ: " + currentDataset.label);
  let tr1 = $("<tr>");
  $("#csvTable").append(tr1);
  $("<th>").text("A ＼ B").appendTo(tr1);
  Group.getName().forEach((gName, i)=>{
    $("<th>").text(gName).appendTo(tr1);
  });

  Group.getName().forEach((gName, i)=>{
    tr2 = $("<tr>").appendTo("#csvTable");
    $("<td>").append($("<b>").text(gName)).appendTo(tr2);
    selectedFeatures.forEach((g, j)=>{
      let value = calcFromto(selectedFeatures[i], selectedFeatures[j]);
      $("<td>", {text: value, css:{textAlign: "right"}}).appendTo(tr2);
    });
  });
}

}

function closeTable(){
  $("#csvTable").empty();
}

function downloadCsv(){
  //テーブルからcsv用文字列を作成
  let csvData = "データ: " + currentDataset.label + "\n";
  let table = $("#csvTable")[0];
  for(i = 0;  i < table.rows.length; i++){
    for(j = 0; j < table.rows[i].cells.length; j++){
      csvData += table.rows[i].cells[j].innerText;
      if(j == table.rows[i].cells.length-1) {csvData += "\n";}
      else {csvData += ",";}
    }
  }

  //csvダウンロード
  let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  let blob = new Blob([bom, csvData], { type: 'text/csv' });
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  let download = document.createElement("a");
  download.href = url;
  download.download = "populationCalculator.csv";
  download.click();
  (window.URL || window.webkitURL).revokeObjectURL(url);
  csvData = "";
}

function copyTable(){
  let clipBoardData = "";
  let table = $("#csvTable")[0];
  for(i = 0;  i < table.rows.length; i++){
    for(j = 0; j < table.rows[i].cells.length; j++){
      clipBoardData += table.rows[i].cells[j].innerText;
      if(j == table.rows[i].cells.length-1) {clipBoardData += "\n";}
      else {clipBoardData += "\t";}
    }
  }

  let promise = new Promise((resolve, reject) => {
    navigator.clipboard.writeText(clipBoardData);
    resolve();
  });
  promise.then(() => {toastr["success"]("表をクリップボードにコピーしました。");});

}

//セーブデータ関連
function saveOpen(){
  $("#saveModal").find("#tab1").show();
  $("#saveModal").find("#tab2").hide();
  $("#saveModal").find("#tab3").hide();

  $("#saveDataGroup").text(Group.groups.map(g=>{return g.name}));
  if(currentSave){
    $("[name='saveDataName']").val(currentSave.name);
    let value = saveDataArr.findIndex(f=>{
      return f === currentSave;
    });
    $("#saveTable").find("[value='" + value + "']").click();
  }else{
    $("[name='saveDataName']").val("無題");
    $("#saveTable").find("[value='" + saveDataArr.length + "']").click();
  }

  //バックアップメニュー初期化
  $("#backupFileImport").val("");
  $("#importDataTable").text("▲ファイルを選択してください。");
}

function loadOpen(){
  $("#saveModal").find("#tab1").hide();
  $("#saveModal").find("#tab2").show();
  $("#saveModal").find("#tab3").hide();

  if(currentSave){
    let value = saveDataArr.findIndex(f=>{
      return f === currentSave;
    });
    $("#loadTable").find("[value='" + value + "']").click();
  }else{
    $("#loadTable").find("[value='0']").click();
  }

  //バックアップメニュー初期化
  $("#backupFileImport").val("");
  $("#importDataTable").text("▲ファイルを選択してください。");
}

function saveDataTableRedraw(){
  let table = $("#saveTable");
  table.empty();

  $("<div>").attr({class: "slot", value: saveDataArr.length}).append($("<div>").html("<i class='far fa-plus-square'></i>新規セーブデータ")).append($("<div>").css({height: "1em"})).append($("<div>").css({height: "1em"})).appendTo(table);
  saveDataArr.forEach((savedata, i)=>{
    slot = $("<div>").attr({class: "slot", value: i}).appendTo(table);
    $("<div>").text(savedata.name).appendTo(slot);
    $("<div>").text(savedata.groupNames).appendTo(slot);
    $("<div>").text(dateFormat(new Date(savedata.createTime))).appendTo(slot);
    $("<div>").html("<i class='fa-solid fa-trash-can'></i>").attr({class: "delete"}).appendTo(slot);
  });

  table = $("#loadTable");
  table.empty();
  saveDataArr.forEach((savedata, i)=>{
    slot = $("<div>").attr({class: "slot", value: i}).appendTo(table);
    $("<div>").text(savedata.name).appendTo(slot);
    $("<div>").text(savedata.groupNames).appendTo(slot);
    $("<div>").text(dateFormat(new Date(savedata.createTime))).appendTo(slot);
    $("<div>").html("<i class='fa-solid fa-trash-can'></i>").attr({class: "delete"}).appendTo(slot);
  });
}

async function loadData(saveData){
  $(".loader, .loaderBG, .loaderCover").css("display", "inline");

  Group.resetAll();

  currentDataset = Dataset.find((e)=>{return e.name === (saveData.dataset || "kokusei2020")});
  currentCategory = (currentDataset.category.find((e)=>{return e.name === saveData.category})) || currentDataset.category[0];
  currentColumn = currentCategory.data[0];
  $("#dataset").val(currentDataset.name);
  await datasetChange(null, false);
  
  if(!saveData.features){
    saveData.features = [[]];
  }
  saveData.features.forEach((g, idx)=>{
    let group = new Group;
    group.addFeatures(g);
    group.setName(saveData.groupNames[idx] || ("グループ" + idx));
    group.setColor(saveData.groupColors[idx] || DefaultColorNo[idx]);
    sortFeatures();
    rewriteSumTable(idx);
  })

  let latlon = [35, 137];
  if(saveData.mapSettings.y && saveData.mapSettings.x){
    latlon = [saveData.mapSettings.y, saveData.mapSettings.x];
  }
  map.setView(latlon, saveData.mapSettings.z || 8);

  $(".loader, .loaderBG, .loaderCover").css("display", "none");
}

function makeSavedata(name = "セーブデータ1"){
  let saveData = {
    name: name,
    dataset: currentDataset.name,
    category: currentCategory.name,
    groupNames: Group.getName(),
    groupColors: Group.getColorNo(),
    features: selectedFeatures.map(g => g.map(f => f.CODE || f.CODE5)),
    mapSettings: {
      x: Math.round(map.getCenter().lng * 10000)/10000,
      y: Math.round(map.getCenter().lat * 10000)/10000,
      z: map.getZoom(),
      baseMap: ""
    }
  };
  let now = new Date();
  saveData.createTime = now.toISOString();

  return saveData;
}

function exportBackup(){
  let blob = new Blob([JSON.stringify(saveDataArr)], {type: "application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "人口計算機セーブデータ.json";
  a.click();
}

function importFileOnChange(e){
  $("#importDataTable").empty();
  if($(this)[0].files.length){
    for(file of $(this)[0].files){
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = ()=>{
        data = JSON.parse(reader.result);
        console.log(data);

        try{
          if(!Array.isArray(data)){
            throw new Error("invalid data");
          }
          data.forEach((d, i)=>{
            if(d.list != undefined){
              throw new Error("visitlevel");
            }
            else if(!Array.isArray(d.features)){
              throw new Error("invalid data");
            }
            
            slot = $("<div>").attr({class: "slot", value: i}).appendTo($("#importDataTable"));
            $("<div>").text(d.name).appendTo(slot);
            $("<div>").text(d.groupNames).appendTo(slot);
            $("<div>").text(dateFormat(new Date(d.createTime))).appendTo(slot);
            slot.click();
          });
        }catch(err){
          console.error(err);
          if(err.message == "visitlevel"){
            $("#importDataTable").append($("<span>").css({color: "#800"}).text("ファイルを読み込めませんでした。「人口計算機」用のファイルを選択してください。"));
          }else{
            $("#importDataTable").append($("<span>").css({color: "#800"}).text("ファイルを読み込めませんでした。"));
          }
        }
      }
    }
  }
}

function importBackup(data){
  saveDataArr = saveDataArr.concat(data);
  saveDataArr.sort((a, b)=>{return new Date(b.createTime) - new Date(a.createTime)});
  window.localStorage.setItem("calc_saveData", JSON.stringify(saveDataArr));
  saveDataTableRedraw();
  $("#saveTable").find("[value='0']").click();
}

function dateFormat(date){
  return date.getFullYear() + "/" + (date.getMonth() + 1).toString().padStart(2, "0") + "/" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
}

