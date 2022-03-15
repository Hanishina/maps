var map;
var polygonLayer;
var lineLayer;

var colorPicker = [];
var chart = [];
var mouseChart;
var dialog_reset;
var dialog_delete;
var dialog_changeDataset;

var selectedFeatures = [];
selectedFeatures[0] = [];

var currentDataset; //選択中のデータセット(国勢調査2015など)[obj]
var currentCategory; //選択中のサブデータセット(DID人口など)[obj]
var currentGroup = 0; //選択中のグループ
var currentColumn; //選択中のカラム(選択済み地物テーブル表示用)[obj]

var polygonFields = []; //ポリゴンのフィールド名一覧。func:customの時用いる

var cursorObj;
var dragging = false;
var dragStart = {x:0, y:0};

const DefaultColorNo = [112, 138, 149, 115, 76, 199, 98, 238] //red, blue, green, yellow, purple, lightblue, orange, pink
var newGroupNo = 2; //新規グループ作成時の表示名(indexではない)
var groupNames = ["グループ1"];
var groupColors = ["#cc0000"];


var polygon2015Json;
var polygon2010Json;
var polygon2005Json;
var polygon2000Json;
var keizai2016Json;
var line2015Json;
var line2010Json;
var line2005Json;
var line2000Json;
var line2016Json;
var polygon2020Json;
var line2020Json;
var senkyo2021Json;
var senkyoLine2021Json;
var polygon2020OldJson;
var line2020OldJson;

async function getResources(name, date){
  var path = "./json/" + name;
  return $.getJSON(path, function(json){
    var features = json.features;
    if (json.name === "line" || json.name === "line_calc"){

      var mura = features.filter(function(f){return f.properties.TYPE === "村"});
      var ku = features.filter(function(f){return f.properties.TYPE === "区"});
      var sp_ku  = features.filter(function(f){return f.properties.TYPE === "特別区"});
      var gun = features.filter(function(f){return f.properties.TYPE === "郡"});
      var shicho = features.filter(function(f){return f.properties.TYPE === "支庁"});
      var ken = features.filter(function(f){return f.properties.TYPE === "県"});
      var mizu = features.filter(function(f){return f.properties.TYPE === "湖"});
      var umi = features.filter(function(f){return f.properties.TYPE === "海"});
      var features = mura.concat(ku, sp_ku, gun, shicho, ken, mizu, umi);

      if(date){
        features = features.filter(function(f){
          return new Date(f.properties.START) <= new Date(date) & new Date(f.properties.END) > new Date(date);
        });
      }

    }

    if (json.name === "2020kokusei_old_l"){
      var old = features.filter(function(f){return f.properties.TYPE === "旧"});
      var mura = features.filter(function(f){return f.properties.TYPE === "村"});
      var ku = features.filter(function(f){return f.properties.TYPE === "区"});
      var sp_ku  = features.filter(function(f){return f.properties.TYPE === "特別区"});
      var gun = features.filter(function(f){return f.properties.TYPE === "郡"});
      var shicho = features.filter(function(f){return f.properties.TYPE === "支庁"});
      var ken = features.filter(function(f){return f.properties.TYPE === "県"});
      var mizu = features.filter(function(f){return f.properties.TYPE === "湖"});
      var umi = features.filter(function(f){return f.properties.TYPE === "海"});
      var features = old.concat(mura, ku, sp_ku, gun, shicho, ken, mizu, umi);
    }

    if (json.name === "2021shosenkyoku_l"){

      var mura = features.filter(function(f){return f.properties.type === "市区町村"});
      var shosenkyoku = features.filter(function(f){return f.properties.type === "小選挙区"});
      var ken = features.filter(function(f){return f.properties.type === "県"});
      var hirei = features.filter(function(f){return f.properties.type === "比例"});
      var umi = features.filter(function(f){return f.properties.type === "海"});
      var features = mura.concat(shosenkyoku, ken, hirei, umi);

    }

    features.forEach(function(f, i){
      f.properties.uid = i;
    });
    json.features = features
  });
}

async function init(){

  dialog_reset = new Dialog;
  dialog_delete = new Dialog;
  dialog_changeDataset = new Dialog;

  colorPicker[0] = new EightBitColorPicker({el: 'colorPicker0', color: 112});
  colorPicker[0].addEventListener("colorChange", e=> selectColor(e));

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
      var deltaX = e.originalEvent.clientX - dragStart.x;
      var deltaY = e.originalEvent.clientY - dragStart.y;
      var distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      if(distance > 5){
        dragging = true;
      }
    });
    $(document).on("mouseup", (e)=>{
      dragging = false;
      $(document).off("mousemove");
    });
  });

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

  Chart.defaults.plugins.legend.position = "right";
  Chart.defaults.maintainAspectRatio = false;
  Chart.overrides.pie.plugins.tooltip.callbacks.label = function(context){
    var value = context.parsed;
    var totalValue = context.dataset.data.reduce((sum, el)=>{return sum + parseFloat(el)}, 0);
    var percent = value / totalValue * 100;
    return [context.label, context.formattedValue + "(" + percent.toFixed(1) + "%)"];
  }
  Chart.overrides.pie.plugins.legend.onClick = null;
  mouseChart = new Chart($("#mouseChart"), {
    type: "pie",
    options: {
      maintainAspectRatio: false,
    }
  });
  chart[0] = new Chart($("#groupChart0"), {
    type: "pie",
    options: {
      maintainAspectRatio: false,
    }
  });

  var paleMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base"
  });
  var standardMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base"
  });
  var shadeMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base",
      opacity: 0.5
  });
  var photo = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      pane: "base"
  });
  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors",
      pane: "base"
  });

  var blank = L.tileLayer('', {pane:"base"});

  var baseMaps = {
    "淡色地図(地理院地図)": paleMap,
    "標準地図(地理院地図)": standardMap,
    "陰影起伏図": shadeMap,
    "航空写真": photo,
    "OpenStreetMap": osm,
    "背景非表示":blank
  };

  L.control.layers(baseMaps).addTo(map);

  //背景地図一覧(文字列)
  var baseMapNames = {
    "淡色地図(地理院地図)": "paleMap",
    "標準地図(地理院地図)": "standardMap",
    "陰影起伏図": "shadeMap",
    "航空写真": "photo",
    "OpenStreetMap": "osm",
    "背景非表示": "blank"
  }

  map.addLayer(paleMap);

  L.control.scale({imperial: false, maxWidth: 300, position: "bottomright"}).addTo(map);

  var sidebar = L.control.sidebar({container: "sidebar", closeButton: false}).addTo(map);
  sidebar.open("home");

  var columnSelect = document.getElementById("columnName0")
  columnSelect.addEventListener("change", columnChange);

  currentColumn = currentCategory.data[0];
  columnSelect.value = "POPULATION";
  groupSelect(0);

  document.getElementById("dataset").addEventListener("change", datasetChange);
  document.getElementById("category").addEventListener("change", categoryChange);

  $('.inline').modaal({
    content_source: '#inline',
    before_open: openTable,
    before_close: closeTable
  });

  $('input[name="tableType"]').change(function(){
    closeTable();
    openTable();
  });

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

  polygon2020Json = await getResources("2020kokusei_add.geojson");
  line2020Json = await getResources("line_calc.geojson", "2020-10-01");

  polygonRedraw(polygon2020Json);
  lineRedraw(line2020Json);

  //フィールド一覧を取得
  polygonFields = Object.keys(polygon2020Json.features[0].properties);

  document.querySelector(".loader").style.display = "none";
  document.querySelector(".loaderBG").style.display = "none";
  document.querySelector(".loaderCover").style.display = "none";

}

function polygonRedraw(json){
  polygonLayer = L.vectorGrid.slicer(json, {
    vectorTileLayerStyles: {
      sliced:function(properties){
         return {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0}
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
        if(json.name === "line" || json.name === "line_calc"){
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
    polygonLayer.setFeatureStyle(obj.layer.properties.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
  }else if(selectedFeatures.flat().some(f => f.uid === obj.layer.properties.uid)){  //クリックした地物が他のグループで選択されている場合(クリックした地物のグループを変更)
    var locA, locB;  //selectedFeatures[locA][locB]がクリックしたした地物の位置
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

    selectedFeatures[currentGroup].push(obj.layer.properties);
    polygonLayer.setFeatureStyle(obj.layer.properties.uid, {fill: true, fillColor:(groupColors[currentGroup]) ,fillOpacity:0.4, opacity:0});

  }else{  //クリックした地物が未選択の場合(クリックした地物を追加)
    selectedFeatures[currentGroup].push(obj.layer.properties);
    polygonLayer.setFeatureStyle(obj.layer.properties.uid, {fill: true, fillColor:(groupColors[currentGroup]) ,fillOpacity:0.4, opacity:0});
  }

  rewriteSumTable(currentGroup);

}

//カーソル位置の地物情報表示
function rewriteCursorTable(obj){
  if(obj){
    //北海道の郡名処理
    var gun = "";
    if(currentDataset.name !== "kokusei2020old"){
      if(obj.GUN){
        gun = obj.GUN.split("(")[0];
      }
    }
    $("#mouse_name").text(obj.KEN + gun + (obj.NAME || "-"));

    if(!currentCategory.pie){
      currentCategory.data.forEach(function(f, i){
        $("#mouseCol_data" + i).text(calc(obj, f.func, f.prec, f.args));
        //按分の有無判定
        if(f.args && currentDataset.estimate){
          var a = [...f.args, ...currentDataset.estimate];
          var b = new Set([...f.args, ...currentDataset.estimate]);
          if(obj.ESTIMATE == true && a.length !== b.size){
            $("#mouseCol_data" + i).css({color: "#0000ee"});
          }else{
            $("#mouseCol_data" + i).css({color: "#000000"});
          }
        }else{
          $("#mouseCol_data" + i).css({color: "#000000"});
        }
      });
    }else{
      var datas = [];
      currentCategory.data.forEach(function(f, i){
        datas.push(calc(obj, f.func, f.prec, f.args));
      });
      mouseChart.data.datasets[0].data = datas;
      mouseChart.update();
    }

  }else{
    $("#mouse_name").text("-");
    if(!currentCategory.pie){
      currentCategory.data.forEach(function(f, i){
        $("#mouseCol_data" + i).text("");
      });
    }else{
      mouseChart.update();
    }
  }
}

//リセットボタン処理
function resetGroup(n){
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
function deleteGroup(n){
  function determ(){
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    //グループ数が1の場合、そのグループのリセットのみ行う
    if(selectedFeatures.length === 1){
      selectedFeatures[n].splice(0);
      rewriteSumTable(n);
    }else{
      document.getElementById("group" + currentGroup).style.border = "2px solid #777";
      selectedFeatures.splice(n, 1);
      groupNames.splice(n, 1);
      groupColors.splice(n, 1);
      colorPicker.splice(n, 1);
      chart.splice(n, 1);
      document.getElementById("group" + n).remove();
      //後続のグループのidを変更
      for(var i=(n+1); i<=selectedFeatures.length; i++){
        var groupNode = document.getElementById("group" + i);
        groupNode.setAttribute("onclick", "groupSelect(" + (i - 1) + ")");
        groupNode.id = "group" + (i - 1);
        groupNode.querySelector("#colorPicker" + i).id = "colorPicker" + (i - 1);
        groupNode.querySelector("#groupName" + i).id = "groupName" + (i - 1);
        groupNode.querySelector("#resetBtn" + i).setAttribute("onclick", "resetGroup(" + (i - 1) + ")");
        groupNode.querySelector("#resetBtn" + i).id = "resetBtn" + (i - 1);
        groupNode.querySelector("#deleteBtn" + i).setAttribute("onclick", "deleteGroup(" + (i - 1) + ")");
        groupNode.querySelector("#deleteBtn" + i).id = "deleteBtn" + (i - 1);
        groupNode.querySelector("#groupTable" + i).id = "groupTable" + (i - 1);
        for(j=0; j<currentCategory.data.length; j++){
          groupNode.querySelector("#groupCol_name" + j + "_" + i).id = "groupCol_name" + j + "_" + (i - 1);
          groupNode.querySelector("#groupCol_data" + j + "_" + i).id = "groupCol_data" + j + "_" + (i - 1);
        }
        groupNode.querySelector("#groupChartContainer" + i).id = "groupChartContainer" + (i - 1);
        groupNode.querySelector("#groupChart" + i).id = "groupChart" + (i - 1);
        groupNode.querySelector("#sel_count" + i).id = "sel_count" + (i - 1);
        groupNode.querySelector("#sel_table" + i).id = "sel_table" + (i - 1);
        groupNode.querySelector("#columnName" + i).id = "columnName" + (i - 1);


      }

      if(currentGroup > n){
        currentGroup--;
      }

      groupSelect(currentGroup);
    }
  }

  dialog_delete.msg = groupNames[n] + "を削除しますか？";
  dialog_delete.buttons = [{id: "determ", text: "OK", onclick: determ}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
  dialog_delete.show();

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
  var result;
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
    var total = sum(features, args[0]); //合計値(第一引数)
    var nonOther = 0;
    args.slice(1).forEach(arg => {
      nonOther = nonOther + sum(features, arg);
    });
    return (total - nonOther).toFixed(prec);
  }else if(func === "custom"){
    var expression = "";
    args.forEach((arg)=>{
      if(["+", "-", "*", "/", "(", ")"].includes(arg)){
        expression = expression + arg;
      }else if(!isNaN(arg)){
        expression = expression + String(arg);
      }else if(polygonFields.includes(arg)){
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
      document.getElementById("groupCol_data" + i + "_" + n).innerHTML = calc(selectedFeatures[n], f.func, f.prec, f.args);
    });

  }else{ //円グラフの場合
    var datas = [];
    currentCategory.data.forEach(function(f, i){
      datas.push(calc(selectedFeatures[n], f.func, f.prec, f.args));
    });
    chart[n].data.datasets[0].data = datas;
    chart[n].update();
  }

  document.getElementById('sel_count' + n).innerHTML = selectedFeatures[n].length;
  var table = document.getElementById("sel_table" + n)
  //地物一覧表を削除
  while (table.rows[1]) {
    table.deleteRow(1);
  }
  //新しい地物一覧表を追加
  selectedFeatures[n].forEach(function(f){
    var row = document.createElement("tr");
    var value = calc(f, currentColumn.func, currentColumn.prec, currentColumn.args);
    var sumVal = parseInt(calc(selectedFeatures[n], currentColumn.func, currentColumn.prec, currentColumn.args));
    var propotion = "-";
    if(["sum", "pie_other", "custom"].includes(currentColumn.func) && !currentColumn.noprop && sumVal){
      if(isNaN(value)){
        propotion = "0.00";
      }else{
        propotion = (value / sumVal * 100).toFixed(2);
      }
    }
    //按分の有無判定
    var style = "style='color:#000000;'";
    if(currentColumn.args && currentDataset.estimate){
      var a = [...currentColumn.args, ...currentDataset.estimate];
      var b = new Set([...currentColumn.args, ...currentDataset.estimate]);
      if(f.ESTIMATE == true && a.length !== b.size){
        style = "style='color:#0000ee;'";
      }
    }
    row.innerHTML = "<td>" + (f.NAME || "-") + "</td><td " + style + ">" + value + "</td><td " + style + ">" + propotion + "</td>";
    table.appendChild(row);
  });
}

//グループの追加
function addGroup(){
  var newId = selectedFeatures.length;
  var gCont = document.getElementById('groupsContainer');
  var newGroupNode = document.getElementById('group0').cloneNode(true); //複製元のdiv要素
  newGroupNode.setAttribute("onclick", "groupSelect(" + newId + ")");
  newGroupNode.id = "group" + newId;
  newGroupNode.querySelector("#colorPicker0").id = "colorPicker" + newId;
  newGroupNode.querySelector("#groupName0").textContent = "グループ" + (newGroupNo);
  newGroupNode.querySelector("#groupName0").id = "groupName" + newId;
  newGroupNode.querySelector("#resetBtn0").setAttribute("onclick", "resetGroup(" + newId + ")");
  newGroupNode.querySelector("#resetBtn0").id = "resetBtn" + newId;
  newGroupNode.querySelector("#deleteBtn0").setAttribute("onclick", "deleteGroup(" + newId + ")");
  newGroupNode.querySelector("#deleteBtn0").id = "deleteBtn" + newId;
  newGroupNode.querySelector("#groupTable0").id = "groupTable" + newId;
  for(i=0; i<currentCategory.data.length; i++){
    newGroupNode.querySelector("#groupCol_name" + i + "_0").id = "groupCol_name" + i + "_" + newId;
    newGroupNode.querySelector("#groupCol_data" + i + "_0").id = "groupCol_data" + i + "_" + newId;
  }
  newGroupNode.querySelector("#groupChartContainer0").id = "groupChartContainer" + newId;
  newGroupNode.querySelector("#groupChart0").id = "groupChart" + newId;
  newGroupNode.querySelector("#sel_count0").id = "sel_count" + newId;
  newGroupNode.querySelector("#sel_table0").id = "sel_table" + newId;
  newGroupNode.querySelector("#columnName0").value = currentColumn.name;
  newGroupNode.querySelector("#columnName0").id = "columnName" + newId;
  gCont.appendChild(newGroupNode);
  selectedFeatures.push([]);
  groupNames.push("グループ" + (newGroupNo));
  colorPicker[newId] = new EightBitColorPicker({el: 'colorPicker' + newId, color: (DefaultColorNo[newGroupNo - 1] || 238)});
  //円グラフ初期化処理
  var labels = currentCategory.data.map(obj => {return obj.label});
  var colors = currentCategory.data.map(obj => {return obj.color});
  chart[newId] = new Chart($("#groupChart" + newId), {type: "pie", data:{labels: labels, datasets:[{backgroundColor: colors}]}});

  newGroupNo++

  document.getElementById("columnName" + newId).addEventListener("change", columnChange);
  colorPicker[newId].addEventListener("colorChange", e=> selectColor(e));
  groupColors.push(colorPicker[newId].getHexColor());
  rewriteSumTable(newId);
  groupSelect(newId);
}

//グループをクリックしたときの処理
function groupSelect(n){
  //元のグループの枠線を灰色に戻す
  if(selectedFeatures[currentGroup] !== undefined){
    //document.getElementById("group" + currentGroup).style.border = "2px solid #777";
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
  for(var i=0; i < selectedFeatures.length; i++){
    rewriteSumTable(i);
    document.getElementById("columnName" + i).value = currentColumn.name;
  }
}

//色変更時
function selectColor(e){
  var n = parseInt((e.target.id).substr(11));
  groupColors[n] = colorPicker[n].getHexColor();
  if(selectedFeatures[n]){
    selectedFeatures[n].forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:groupColors[n] ,fillOpacity:0.4, opacity:0});
    });
  }

}

//表示サブデータセット変更
function categoryChange(e){
  currentCategory = currentDataset.category.find(f => {return f.name === e.target.value;});

  //カーソル位置地物情報テーブルの書き換え
  if(!currentCategory.pie){
    $("#mouseTable").show();
    $("#mouseChartContainer").hide();
    var mouseTable = document.getElementById("mouseTable");
    while (mouseTable.rows[0]) {
      mouseTable.deleteRow(0);
    }
    for(i=0; i<currentCategory.data.length/2; i++){
      var tr = document.createElement("tr");
      for(j=0; j<2; j++){
        var th = document.createElement("th");
        th.id = "mouseCol_name" + (i*2+j);
        th.innerText = currentCategory.data[i*2+j].label || "";
        tr.appendChild(th);
        var td = document.createElement("td");
        td.id = "mouseCol_data" + (i*2+j);
        //td.innerText = cursorObj[data[i*2+j].name];
        tr.appendChild(td);
      }
      mouseTable.appendChild(tr);
    }
  }else{
    $("#mouseTable").hide();
    $("#mouseChartContainer").show();
    var labels = currentCategory.data.map(obj => {return obj.label});
    var colors = currentCategory.data.map(obj => {return obj.color});
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
    if(!currentCategory.pie){
      $("#groupTable" + groupIdx).show();
      $("#groupChartContainer" + groupIdx).hide();
      var groupTable = document.getElementById("groupTable" + groupIdx);
      while (groupTable.rows[0]) {
        groupTable.deleteRow(0);
      }
      for(i=0; i<currentCategory.data.length; i++){
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.id = "groupCol_name" + i + "_" + groupIdx;
        if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum"){ //currentCategory.data[i]が空でない場合
          th.innerText = currentCategory.data[i].label || "";
          if(currentCategory.data[i].desc !== undefined){ //ツールチップを付加
            var div1 = document.createElement("div");
            div1.className = "tooltip";
            var icon = document.createElement("i");
            icon.className = "fas fa-question-circle";
            icon.style = "color:#0f5f91;";
            div1.appendChild(icon);
            var div2 = document.createElement("div");
            div2.className = "description";
            div2.innerText = currentCategory.data[i].desc;
            div1.appendChild(div2);
            th.appendChild(div1);
          }
        }else{
          th.style = "display:none";
        }
        tr.appendChild(th);
        var td = document.createElement("td");
        td.id = "groupCol_data" + i + "_" + groupIdx;
        if(Object.keys(currentCategory.data[i]).length && currentCategory.data[i].func !== "nonsum"){ //currentCategory.data[i]が空でない場合
          td.innerText = "";
        }else{
          td.style = "display:none";
        }
        tr.appendChild(td);
        groupTable.appendChild(tr);
      }


    }else{
      $("#groupTable" + groupIdx).hide();
      $("#groupChartContainer" + groupIdx).show();

      var labels = currentCategory.data.map(obj => {return obj.label});
      var colors = currentCategory.data.map(obj => {return obj.color});
      chart[groupIdx].data.labels = labels;
      chart[groupIdx].data.datasets = [{
        backgroundColor: colors
      }];
      chart[groupIdx].update();
    }
    var columnSelector = document.getElementById("columnName" + groupIdx);
    while (columnSelector.firstChild) {
      columnSelector.removeChild(columnSelector.firstChild);
    }
    currentCategory.data.forEach(e => {
      var option = document.createElement("option");
      if(Object.keys(e).length){
        option.value = e.name;
        option.innerText = e.label;
        columnSelector.appendChild(option);
      }else{
        //iOSではoptionに対してdisplay:noneが効かないので、spanで囲む
        option.style = "display:none";
        $(columnSelector).append($("<span>", {style: "display: none;"}).append(option));
      }
    });
    currentColumn = currentCategory.data[0];
    rewriteSumTable(groupIdx);


  });

}

//データセット変更
function datasetChange(e){
  //「選択地物を保持してデータセット変更」
  let save = async()=>{
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    //selectedFeaturesをコピー
    var formerFeatures = [];
    selectedFeatures.forEach((group, groupIdx)=>{
      group.forEach((feature)=>{
        formerFeatures.push({code: feature.CODE5, group: groupIdx});
      });
      group.length = 0;
    });

    document.querySelector(".loader").style.display = "inline";
    document.querySelector(".loaderBG").style.display = "inline";
    document.querySelector(".loaderCover").style.display = "inline";

    polygonLayer.remove();
    lineLayer.remove();
    if(!window[currentDataset.polygonObj]){ //ポリゴンデータの取得が済んでいない場合
      window[currentDataset.polygonObj] = await getResources(currentDataset.polygonFile);
    }
    polygonRedraw(window[currentDataset.polygonObj]);
    if(!window[currentDataset.lineObj]){ //ラインデータの取得が済んでいない場合
      window[currentDataset.lineObj] = await getResources(currentDataset.lineFile, currentDataset.date);
    }
    lineRedraw(window[currentDataset.lineObj]);

    //フィールド一覧を取得
    polygonFields = Object.keys(window[currentDataset.polygonObj].features[0].properties);


    formerFeatures.forEach((e)=>{
      let match = window[currentDataset.polygonObj].features.find((f)=>{
        return(f.properties.CODE5 === e.code);
      });
      if(match){
        selectedFeatures[e.group].push(match.properties);
        polygonLayer.setFeatureStyle(match.properties.uid, {fill: true, fillColor:(groupColors[e.group]) ,fillOpacity:0.4, opacity:0});
      }
    });

    currentCategory = currentDataset.category[0];
    currentColumn = currentCategory[0];

    //カテゴリ選択部の更新
    var categorySelector = document.getElementById("category");
    while (categorySelector.firstChild) {
      categorySelector.removeChild(categorySelector.firstChild);
    }
    currentDataset.category.forEach(f => {
      if(f.name !== "csv"){ //csv用のカテゴリセットは除く
        var option = document.createElement("option");
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
      $("<a>", {href: attr.link, text: attr.label}).appendTo("#attribution");
      if(currentDataset.attr[i+1]){$("#attribution").append("、");}
    });

    //グループの再描画
    var event = new Event("change");
    categorySelector.dispatchEvent(event);
    rewriteCursorTable();


    document.querySelector(".loader").style.display = "none";
    document.querySelector(".loaderBG").style.display = "none";
    document.querySelector(".loaderCover").style.display = "none";
  }
  //「選択地物を破棄してデータセット変更」
  let discard = async()=>{
    currentDataset = Dataset.find(f => {return f.name === e.target.value});
    //地図上の色をリセット
    selectedFeatures.flat().forEach(function(f){
      polygonLayer.setFeatureStyle(f.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0});
    });
    for(var i=1; i < selectedFeatures.length; i++){
      document.getElementById("group" + i).remove();
    }
    colorPicker.splice(1);
    chart.splice(1);
    selectedFeatures.splice(1);
    selectedFeatures[0] = [];
    document.getElementById("groupName0").textContent = "グループ1";
    //group0を再選択
    document.getElementById("group0").style.border = "4px solid #a00";
    currentGroup = 0;
    //値リセット
    newGroupNo = 2;
    groupNames = ["グループ1"];
    groupColors = ["#cc0000"];
    colorPicker[0].updateColor(112);
    currentCategory = currentDataset.category[0];
    currentColumn = currentCategory.data[0];


    //カテゴリ選択部の更新
    var categorySelector = document.getElementById("category");
    while (categorySelector.firstChild) {
      categorySelector.removeChild(categorySelector.firstChild);
    }
    currentDataset.category.forEach(f => {
      if(f.name !== "csv"){ //csv用のカテゴリセットは除く
        var option = document.createElement("option");
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
      $("<a>", {href: attr.link, text: attr.label}).appendTo("#attribution");
      if(currentDataset.attr[i+1]){$("#attribution").append("、");}
    });


    //グループの再描画
    var event = new Event("change");
    categorySelector.dispatchEvent(event);
    rewriteCursorTable();


    document.querySelector(".loader").style.display = "inline";
    document.querySelector(".loaderBG").style.display = "inline";
    document.querySelector(".loaderCover").style.display = "inline";

    polygonLayer.remove();
    lineLayer.remove();
    if(!window[currentDataset.polygonObj]){ //ポリゴンデータの取得が済んでいない場合
      window[currentDataset.polygonObj] = await getResources(currentDataset.polygonFile);
    }
    polygonRedraw(window[currentDataset.polygonObj]);
    if(!window[currentDataset.lineObj]){ //ラインデータの取得が済んでいない場合
      window[currentDataset.lineObj] = await getResources(currentDataset.lineFile, currentDataset.date);
    }
    lineRedraw(window[currentDataset.lineObj]);

    //フィールド一覧を取得
    polygonFields = Object.keys(window[currentDataset.polygonObj].features[0].properties);

    document.querySelector(".loader").style.display = "none";
    document.querySelector(".loaderBG").style.display = "none";
    document.querySelector(".loaderCover").style.display = "none";

  }

  dialog_changeDataset.msg = "データセットを「" + $("#dataset option:selected").text() +  "」に変更しますか？";
  dialog_changeDataset.cancel = ()=>{document.getElementById("dataset").value = currentDataset.name;};
  dialog_changeDataset.buttons = [{id: "save", text: "選択地物を保持して変更", onclick: save}, {id: "discard", text: "選択地物をリセットして変更", onclick: discard}, {id: "cancel", text: "キャンセル", onclick: "cancel"}];
  dialog_changeDataset.show();
}

//csv生成用テーブルを開く
function openTable(){
  var tableType = $('input[name="tableType"]:checked').val();
  var csvCate = currentDataset.category.slice(-1)[0].data; //categoryの最後の要素
  $("#csvTableHeader").text("データ: " + currentDataset.label);
  //表一行目
  var tr1 = $("<tr>");
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
        var tr2 = $("<tr>");
        $("#csvTable").append(tr2);
        $("<td>", {text: fts.CODE5}).appendTo(tr2);
        $("<td>", {text: (fts.NAME || "-")}).appendTo(tr2);
        $("<td>", {text: "G" + groupNames[i].substr(4)}).appendTo(tr2);
        csvCate.forEach(cate => {
          if(cate.func){
            var tableData = calc(fts, cate.func, cate.prec, cate.args);
            var textAlign = function(){switch(cate.func){case "nonsum": return "left"; default: return "right"}};
            $("<td>", {text: tableData, css:{"textAlign": textAlign}}).appendTo(tr2);
          }
        });
      });
    }

    //グループ合計値
    var tr3 = $("<tr>");
    $(tr3).css("background-color", "#ddf");
    $("#csvTable").append(tr3);
    $("<td>", {text: "G" + groupNames[i].substr(4)}).appendTo(tr3);
    $("<td>", {text: groupNames[i]}).appendTo(tr3);
    if(tableType === "all"){$("<td>").appendTo(tr3);}else{$("<td>", {text: selectedFeatures[i].length}).appendTo(tr3);}
    csvCate.forEach(cate => {
      if(cate.func){
        var tableData = calc(selectedFeatures[i], cate.func, cate.prec, cate.args);
        $("<td>", {text: tableData, css:{textAlign: "right"}}).appendTo(tr3);
      }
    });
  }

  //全グループ合計
  var tr4 = $("<tr>");
  $(tr4).css("background-color", "#fdd");
  $("#csvTable").append(tr4);
  $("<td>", {text: "Gtotal"}).appendTo(tr4);
  $("<td>", {text: "全グループ"}).appendTo(tr4);
  if(tableType === "all"){$("<td>").appendTo(tr4);}else{$("<td>", {text: selectedFeatures.flat().length}).appendTo(tr4);}
  csvCate.forEach(cate => {
    if(cate.func){
      var tableData = calc(selectedFeatures.flat(), cate.func, cate.prec, cate.args);
      $("<td>", {text: tableData, css:{textAlign: "right"}}).appendTo(tr4);
    }
  });


}

function closeTable(){
  $("#csvTable").empty();
}

function downloadCsv(){
  //テーブルからcsv用文字列を作成
  var csvData = "データ: " + currentDataset.label + "\n";
  var table = $("#csvTable")[0];
  for(i = 0;  i < table.rows.length; i++){
    for(j = 0; j < table.rows[i].cells.length; j++){
      csvData += table.rows[i].cells[j].innerText;
      if(j == table.rows[i].cells.length-1) {csvData += "\n";}
      else {csvData += ",";}
    }
  }

  //csvダウンロード
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  var blob = new Blob([bom, csvData], { type: 'text/csv' });
  var url = (window.URL || window.webkitURL).createObjectURL(blob);
  var download = document.createElement("a");
  download.href = url;
  download.download = "populationCalculator.csv";
  download.click();
  (window.URL || window.webkitURL).revokeObjectURL(url);
  csvData = "";
}

function copyTable(){
  var clipBoardData = "";
  var table = $("#csvTable")[0];
  for(i = 0;  i < table.rows.length; i++){
    for(j = 0; j < table.rows[i].cells.length; j++){
      clipBoardData += table.rows[i].cells[j].innerText;
      if(j == table.rows[i].cells.length-1) {clipBoardData += "\n";}
      else {clipBoardData += "\t";}
    }
  }

  var promise = new Promise((resolve, reject) => {
    navigator.clipboard.writeText(clipBoardData);
    resolve();
  });
  promise.then(() => {toastr["success"]("表をクリップボードにコピーしました。");});

}
