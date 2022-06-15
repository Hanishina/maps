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
selectedFeatures[0] = [];

let currentDataset; //選択中のデータセット(国勢調査2015など)[obj]
let currentCategory; //選択中のサブデータセット(DID人口など)[obj]
let currentGroup = 0; //選択中のグループ
let currentColumn; //選択中のカラム(選択済み地物テーブル表示用)[obj]

let csvFields = []; //csvのフィールド名一覧。func:customの時用いる

let cursorObj;
let dragging = false;
let dragStart = {x:0, y:0};

const DefaultColorNo = [112, 138, 149, 115, 76, 199, 98, 238] //red, blue, green, yellow, purple, lightblue, orange, pink
let newGroupNo = 2; //新規グループ作成時の表示名(indexではない)
let groupNames = ["グループ1"];
let groupColors = ["#cc0000"];

let geojsonFiles = {};
let csvObjs = {};


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

async function getCsv(name){
  let path = "./csv/" + name;
  let csvText = await $.get(path);
  return $.csv.toObjects(csvText);
}

async function init(){

  /*--- mapの初期化処理 ---*/

  map = L.map("map", {zoomControl: false});
  map.setView([35, 137], 8);
  map.setMinZoom(5);
  L.control.zoom({position: "topright"}).addTo(map);
  map.createPane("base").style.zIndex = 100;
  map.createPane("polygon").style.zindex = 150;
  map.createPane("line").style.zindex = 400;

  //ドラッグ時にクリックイベントを呼び出さないようにする(iOS用)
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

  dialog_reset = new Dialog;
  dialog_delete = new Dialog;
  dialog_changeDataset = new Dialog;

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

  $("#dataset").on("change", datasetChange);
  $("#category").on("change", categoryChange);


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
  chart[0] = new Chart($("#group0").find(".groupChart"), {
    type: "pie",
    options: {
      maintainAspectRatio: false,
    }
  });

  /*--- グループ内コンテンツの初期化処理 ---*/

  $("#group0").on("click", groupSelect);
  $("#group0").find(".menuBtn").on("click", groupMenu);
  let menu = $("#group0").find(".popupMenu");
  $(menu).find(".resetGroup").on("click", resetGroup);
  $(menu).find(".deleteGroup").on("click", deleteGroup);
  $(menu).find(".changeGroupColor").on("click", function(e){
    let n = $(this).parents(".group").attr("id").substr(5);
    colorPicker[n].show();
  });
  $(menu).find(".changeGroupName").on("click", changeGroupName);

  colorPicker[0] = new EightBitColorPicker({el: $("#group0").find(".colorPicker")[0], color: 112});
  colorPicker[0].addEventListener("colorChange", e=> selectColor(e));


  $("#group0").find(".columnName").on("change", columnChange);
  $("#group0").find(".columnName").val("POPULATION");
  currentColumn = currentCategory.data[0];
  $("#group0").trigger("click"); //groupSelectを実行

  /*--- モーダルウィンドウ初期化処理 ---*/

  $('.inline').modaal({
    content_source: '#inline',
    before_open: openTable,
    before_close: closeTable
  });

  $('input[name="tableType"]').change(function(){
    closeTable();
    openTable();
  });

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

  /*--- 地図データ・統計データ読み込み ---*/

  geojsonFiles.polygon2020 = await getJson("polygon.geojson", "2020-10-01");
  geojsonFiles.line2020 = await getJson("line.geojson", "2020-10-01");

  csvObjs.kokusei2020 = await getCsv("2020kokusei.csv");

  polygonRedraw(geojsonFiles.polygon2020);
  lineRedraw(geojsonFiles.line2020);

  //フィールド一覧を取得
  csvFields = Object.keys(csvObjs.kokusei2020[0]);

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
  }).on("mouseup", obj => {
    if(!dragging){
      clickEvent(obj);
    }
  }).on("mouseover mousedown", obj => {
    cursorObj = obj.layer.properties;
    rewriteCursorTable(cursorObj);
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
    let csvData = csvObjs[currentDataset.csvObj].filter(f=>{return (f.CODE || f.CODE5) === (feature.CODE || feature.CODE5);})[0];
    //polygonのデータとcsvのデータを合体
    Object.assign(feature, csvData);
    selectedFeatures[currentGroup].push(feature);
    polygonLayer.setFeatureStyle(feature.uid, {fill: true, fillColor:(groupColors[currentGroup]) ,fillOpacity:0.4, opacity:0});

  }else{  //クリックした地物が未選択の場合(クリックした地物を追加)
    if(!obj.layer.properties.NODATA){
      let feature = obj.layer.properties;
      let csvData = csvObjs[currentDataset.csvObj].filter(f=>{return (f.CODE || f.CODE5) === (feature.CODE || feature.CODE5);})[0];
      //polygonのデータとcsvのデータを合体
      Object.assign(feature, csvData);
      selectedFeatures[currentGroup].push(feature);
      polygonLayer.setFeatureStyle(feature.uid, {fill: true, fillColor:(groupColors[currentGroup]) ,fillOpacity:0.4, opacity:0});
    }
  }

  rewriteSumTable(currentGroup);

}

//カーソル位置の地物情報表示
function rewriteCursorTable(obj){
  if(obj){
    let csvData = csvObjs[currentDataset.csvObj].filter(f=>{return (f.CODE || f.CODE5) === (obj.CODE || obj.CODE5);})[0];
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
        currentCategory.data.forEach(function(f, i){
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
    let expression = "";
    args.forEach((arg)=>{
      if(["+", "-", "*", "/", "(", ")"].includes(arg)){
        expression = expression + arg;
      }else if(!isNaN(arg)){
        expression = expression + String(arg);
      }else if(csvFields.includes(arg)){
        expression = expression + "sum(features, '" + arg + "')";
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
  let newId = selectedFeatures.length;
  let newGroup = $("#group0").clone(true);
  $(newGroup).attr("id", "group" + newId);
  $(newGroup).find(".groupName").text("グループ" + newGroupNo);
  $("#groupsContainer").append(newGroup);
  selectedFeatures.push([]);
  groupNames.push("グループ" + newGroupNo);
  colorPicker[newId] = new EightBitColorPicker({el: $("#group" + newId).find(".colorPicker")[0], color: (DefaultColorNo[newGroupNo - 1] || 238)});
  //円グラフ初期化処理
  let labels = currentCategory.data.map(obj => {return obj.label});
  let colors = currentCategory.data.map(obj => {return obj.color});
  chart[newId] = new Chart($("#group" + newId).find(".groupChart"), {type: "pie", data:{labels: labels, datasets:[{backgroundColor: colors}]}});

  newGroupNo++
  colorPicker[newId].addEventListener("colorChange", e=> selectColor(e));
  groupColors.push(colorPicker[newId].getHexColor());
  $("#group" + newId).find(".columnName").val(currentColumn.name);
  rewriteSumTable(newId);
  $("#group" + newId).trigger("click");
}

//グループをクリックしたときの処理
function groupSelect(){
  let n = $(this).attr("id").substr(5);
  //元のグループの枠線を灰色に戻す
  if(selectedFeatures[currentGroup] !== undefined){
    $("#group" + currentGroup).css({border: "3px solid #777", backgroundColor: ""});
  }  //最後のクループをdeleteした場合は実行されない

  //クリックされたグループの枠線を赤くする
  if(selectedFeatures[n] !== undefined){
    $("#group" + n).css({border: "3px solid #a00", backgroundColor: "#feffde"});
    currentGroup = n;
  }else{ //最後のクループをdeleteした場合
    $("#group" + (n-1)).css({border: "3px solid #a00", backgroundColor: "#feffde"});
    currentGroup = (n-1);
  }
}

//地物一覧テーブルのカテゴリ変更
function columnChange(e){
  currentColumn = currentCategory.data.find(f => {return f.name === e.target.value;});
  for(let i=0; i < selectedFeatures.length; i++){
    rewriteSumTable(i);
    $("#group" + i).find(".columnName").val(currentColumn.name);
  }
}

//色変更時
function selectColor(e){
  //グループ番号nを取得(親要素のidから)
  let n = parseInt($(e.target).parent().parent().attr("id").substr(5));
  groupColors[n] = colorPicker[n].getHexColor();
  if(selectedFeatures[n]){
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:groupColors[n] ,fillOpacity:0.4, opacity:0});
    });
  }

}

//グループメニュー
function groupMenu(e){
  $(".popupMenu").each(function(){
    $(this).hide();
  });
  let n = $(this).parents(".group").attr("id").substr(5);
  $("#group" + n).find(".popupMenu").show();
  $("#sidebar").on("click", closeGroupMenu);
}

function closeGroupMenu(e){
  //メニューボタンクリック時は作動させない
  if(!e.target.closest("button") || e.target.closest("button").className !== "menuBtn"){
    $(".popupMenu").each(function(){
      $(this).hide();
    });
    $("#sidebar").off("click", closeGroupMenu);
  }
}

//グループの名称変更
function changeGroupName(){
  $(".groupName").each(function(){
    let n = $(this).parents(".group").attr("id").substr(5);
    $(this).empty();
    $(this).text(groupNames[n]);
  });
  let n = $(this).parents(".group").attr("id").substr(5);
  let nameArea = $("#group" + n).find(".groupName");
  $(nameArea).text("");
  $(nameArea).append($("<input>").attr({type: "text", name: "groupName", placeholder: groupNames[n]}).keypress(function(e){
    if(e.which == 13){
      $(this).next().click();
    }
  }));
  let submitBtn = $("<input>").attr({type: "button", value: "OK"}).on("click", function(){
    let n = $(this).parents(".group").attr("id").substr(5);
    if($("input[name='groupName']").val()){
      groupNames[n] = $("input[name='groupName']").val();
    }
    let nameArea = $("#group" + n).find(".groupName");
    $(nameArea).empty();
    $(nameArea).text(groupNames[n]);
  });
  $(nameArea).append(submitBtn);
  $("input[name='groupName']").focus();

  $("#sidebar").on("click", cancelGroupName);

}

function cancelGroupName(e){
  //グループ名表示位置クリック時は作動させない
  if($(e.target).closest(".h3").length == 0){
    $(".groupName").each(function(){
      let n = $(this).parents(".group").attr("id").substr(5);
      $(this).empty();
      $(this).text(groupNames[n]);
    });
    $("#sidebar").off("click", cancelGroupName);
  }
}

//リセットボタン処理
function resetGroup(){
  let n = $(this).parents(".group").attr("id").substr(5);
  //グループ内に選択済みの地物が存在するときのみ発動
  if(selectedFeatures[n].length > 0){
    function determ(){
      selectedFeatures[n].forEach(function(f){
        polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
      });
      selectedFeatures[n].splice(0);

      rewriteSumTable(n);
    }

    dialog_reset.msg = groupNames[n] + "の選択を全て解除しますか？";
    dialog_reset.buttons = [{id: "determ", text: "OK", onclick: determ}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
    dialog_reset.show();
  }
}

//デリートボタン処理
function deleteGroup(){
  let n = parseInt($(this).parents(".group").attr("id").substr(5));
  function determ(){
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    //グループ数が1の場合、そのグループのリセットのみ行う
    if(selectedFeatures.length === 1){
      selectedFeatures[n].splice(0);
      groupNames[n] = "グループ1";
      $("#group" + n).find(".groupName").text(groupNames[n]);
      newGroupNo = 2;
      colorPicker[n].updateColor(112);
      groupColors[n] = "#cc0000";
      rewriteSumTable(n);
    }else{
      selectedFeatures.splice(n, 1);
      groupNames.splice(n, 1);
      groupColors.splice(n, 1);
      colorPicker.splice(n, 1);
      chart.splice(n, 1);
      $("#group" + n).remove();
      //後続のグループのidを変更
      for(let i=(n+1); i<=selectedFeatures.length; i++){
        $("#group" + i).attr("id", "group" + (i-1));
      }

      if(selectedFeatures.length <= n){ //最後のグループを削除した場合
        currentGroup--;
      }

      $("#group" + currentGroup).trigger("click");
    }
  }

  dialog_delete.msg = groupNames[n] + "を削除しますか？";
  dialog_delete.buttons = [{id: "determ", text: "OK", onclick: determ}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
  dialog_delete.show();

}


//表示カテゴリ変更
function categoryChange(e){
  currentCategory = currentDataset.category.find(f => {return f.name === e.target.value;});

  //カーソル位置地物情報テーブルの書き換え
  if(!currentCategory.pie){
    $("#mouseTable").show();
    $("#mouseChartContainer").hide();
    let mouseTable = document.getElementById("mouseTable");
    while (mouseTable.rows[0]) {
      mouseTable.deleteRow(0);
    }
    for(i=0; i<currentCategory.data.length/2; i++){
      let tr = document.createElement("tr");
      for(j=0; j<2; j++){
        let th = document.createElement("th");
        th.id = "mouseCol_name" + (i*2+j);
        th.innerText = currentCategory.data[i*2+j].label || "";
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

  //グループの書き換え
  selectedFeatures.forEach((group, groupIdx) => {
    if(!currentCategory.pie){ //円グラフ以外
      $("#group" + groupIdx).find(".groupTable").show();
      $("#group" + groupIdx).find(".chartContainer").hide();
      let groupTable = $("#group" + groupIdx).find(".groupTable");
      $(groupTable).empty();
      for(i=0; i<currentCategory.data.length; i++){
        let th = $("<th>").attr("class", "groupCol_name" + i);
        if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum"){ //currentCategory.data[i]が空でない場合
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
        if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum"){ //currentCategory.data[i]が空でない場合
          $(td).text("");
        }else{
          $(td).css({display: "none"});
        }
        $(groupTable).append($("<tr>").append(th, td));
      }
    }else{ //円グラフ
      $("#group" + groupIdx).find(".groupTable").hide();
      $("#group" + groupIdx).find(".chartContainer").show();

      let labels = currentCategory.data.map(obj => {return obj.label});
      let colors = currentCategory.data.map(obj => {return obj.color});
      chart[groupIdx].data.labels = labels;
      chart[groupIdx].data.datasets = [{
        backgroundColor: colors
      }];
      chart[groupIdx].update();
    }

    //個別地物テーブルの更新
    let columnSelector = $("#group" + groupIdx).find(".columnName");
    $(columnSelector).empty();
    currentCategory.data.forEach(e => {
      let option = $("<option>");
      if(Object.keys(e).length){
        $(option).attr({value: e.name}).text(e.label).appendTo(columnSelector);
      }else{
        //iOSではoptionに対してdisplay:noneが効かないので、spanで囲む
        $(option).css({display: "none"});
        $(columnSelector).append($("<span>", {style: "display: none;"}).append(option));
      }
    });
    currentColumn = currentCategory.data[0];
    rewriteSumTable(groupIdx);


  });

}

//データセット変更
function datasetChange(e){
  // データ保持・破棄共通処理
  async function common(formerFeatures){
    $(".loader, .loaderBG, .loaderCover").css("display", "inline");
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

    //フィールド一覧を取得
    csvFields = Object.keys(csvObjs[currentDataset.csvObj][0]);

    //---以下、選択地物保持の場合のみ実行---
    if(formerFeatures){
      formerFeatures.forEach((e)=>{
        let match = geojsonFiles[currentDataset.polygonObj].features.find((f)=>{
          return(f.properties.CODE5 === e.code);
        });
        if(match){
          let feature = match.properties;
          let csvData = csvObjs[currentDataset.csvObj].filter(f=>{return (f.CODE || f.CODE5) === (feature.CODE || feature.CODE5);})[0];
          //polygonのデータとcsvのデータを合体
          Object.assign(feature, csvData);
          if(!feature.NODATA){
            selectedFeatures[e.group].push(feature);
            polygonLayer.setFeatureStyle(match.properties.uid, {fill: true, fillColor:(groupColors[e.group]) ,fillOpacity:0.4, opacity:0});
          }
        }
      });
    }
    //---ここまで---

    currentCategory = currentDataset.category[0];
    currentColumn = currentCategory.data[0];

    //カテゴリ選択部の更新
    let categorySelector = document.getElementById("category");
    while (categorySelector.firstChild) {
      categorySelector.removeChild(categorySelector.firstChild);
    }
    currentDataset.category.forEach(f => {
      if(f.name !== "csv"){ //csv用のカテゴリセットは除く
        let option = document.createElement("option");
        option.value = f.name;
        option.innerText = f.label;
        categorySelector.appendChild(option);
      }
    });
    if(currentDataset.category.length === 2){
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

    //グループの再描画
    let event = new Event("change");
    categorySelector.dispatchEvent(event);
    rewriteCursorTable();

    $(".loader, .loaderBG, .loaderCover").css("display", "none");
  }
  //「選択地物を保持してデータセット変更」
  async function save(){
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    //selectedFeaturesをコピー
    let formerFeatures = [];
    selectedFeatures.forEach((group, groupIdx)=>{
      group.forEach((feature)=>{
        formerFeatures.push({code: feature.CODE5, group: groupIdx});
      });
      group.length = 0;
    });

    await common(formerFeatures);
  }
  //「選択地物を破棄してデータセット変更」
  async function discard(){
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    //地図上の色をリセット
    selectedFeatures.flat().forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    for(let i=1; i < selectedFeatures.length; i++){
      $("#group" + i).remove();
    }
    colorPicker.splice(1);
    chart.splice(1);
    selectedFeatures.splice(1);
    selectedFeatures[0] = [];
    $("#group0").find(".groupName").text("グループ1");
    //group0を再選択
    $("#group0").css({border: "3px solid #a00", backgroundColor: "#feffde"});
    currentGroup = 0;
    //値リセット
    newGroupNo = 2;
    groupNames = ["グループ1"];
    groupColors = ["#cc0000"];
    colorPicker[0].updateColor(112);

    await common();

  }

  dialog_changeDataset.msg = "データセットを「" + $("#dataset option:selected").text() +  "」に変更しますか？";
  dialog_changeDataset.cancel = ()=>{$("#dataset").val(currentDataset.name);};
  dialog_changeDataset.buttons = [{id: "save", text: "選択地物を保持して変更", onclick: save}, {id: "discard", text: "選択地物をリセットして変更", onclick: discard}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
  dialog_changeDataset.show();
}

//csv生成用テーブルを開く
function openTable(){
  let tableType = $('input[name="tableType"]:checked').val();
  let csvCate = currentDataset.category.slice(-1)[0].data; //categoryの最後の要素
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
      selectedFeatures[i].forEach(fts => {
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
    $("<td>", {text: groupNames[i]}).appendTo(tr3);
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
