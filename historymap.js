let maps = [];
let date = [];
let lineLayers = [];
let polygonLayers = [];
let labelLayers = [];
let labelLayerGroups = [];
let baseLayerNames = [];
let typeColoredLayers = [];
let typeColoredLayerGroups = [];
let gunColoredLayers = [];
let gunColoredLayerGroups = [];
let railLayers = [];
let stationLayers = [];
let railLayerGroups = [];
let didLayers = [];
let didLayerGroups = [];
let dateSelectors = [];

let polygonJson;
let lineJson;
let nameJson;
let nameCsv;
let railJson;
let stationJson;
let didJson;

let mediaQ = matchMedia("screen and (orientation: portrait)");
let orient;
let dualChkbx;
let containerA;
let containerB;

let layerControl = [];

let clickedObj;
let clickedOnFeature = false;

let cookies;
let urlParams;

async function getResources(name){
  let path = "./json/" + name;
  return $.getJSON(path, function(json){
    let features = json.features;
    //並べ替え処理(暫定的)
    if (json.name === "line"){
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

    if (json.name === "polygon"){
      //湖ポリゴンを削除
      features = features.filter(function(f){return f.properties.TYPE !== "湖"});
      //unique index追加
      features.forEach(function(f, i){
        f.properties.uid = i;
      });
    }

    json.features = features;
    return json;
  });
}

async function getCsv(name){
  let path = "./csv/" + name;
  csvText = await $.get(path);
  let tempArr = csvText.split(/\r\n|\r|\n/g);
  let csvArr = [];
  let columnNames;
  tempArr.forEach((item, i)=>{
    if(i == 0){
      columnNames = item.split(",");
    }else if(item){
      let obj = {};
      item.split(",").forEach((val, j)=>{
        obj[columnNames[j]] = val;
      });
      csvArr.push(obj);
    }
  });
  return csvArr;
}

async function init(){
  polygonJson = await getResources("polygon.geojson");
  lineJson = await getResources("line.geojson");
  nameJson = await getResources("name.geojson");
  nameCsv = await getCsv("shichosonname.csv");

  cookies = getCookieArray();
  urlParams = new URL(window.location.href).searchParams;
  //Params Example→?x=139.5&y=35.7&z=10&date0=2000/01/01&date1=2020/01/01&base0=paleMap&base1=paleMap&label0=true&label1=true&dual=true

  maps[0] = L.map('mapA');
  maps[1] = L.map('mapB');

  //日付セレクトボックス初期設定
  let formElemA = $("#dateSelectorA");
  let commitBtnA = $("#dateSelectorA").find(".commit");
  dateSelectors[0] = new DateSelector({formElem: formElemA, commitElem: commitBtnA, minYear: 1947});
  $(commitBtnA).on("click", {n: 0} ,buttonClick);

  let formElemB = $("#dateSelectorB");
  let commitBtnB = $("#dateSelectorB").find(".commit");
  dateSelectors[1] = new DateSelector({formElem: formElemB, commitElem: commitBtnB, minYear: 1947});
  $(commitBtnB).on("click", {n: 1} , buttonClick);

  //URLパラメータ・cookie・デフォルト値の優先順位で日付を取得
  date[0] = new Date(urlParams.get("date0") ?? cookies.date0 ?? "");
  if(date[0].toString() === "Invalid Date"){
    date[0] = new Date(2000, 0 ,1);
  }

  date[1] = new Date(urlParams.get("date1") ?? cookies.date1 ?? "")
  if(date[1].toString() === "Invalid Date"){
    date[1] = new Date(2020, 0 ,1);
  }

  //formに日付セット
  $(formElemA).find(".year").val(date[0].getFullYear());
  $(formElemA).find(".month").val(date[0].getMonth() + 1);
  $(formElemA).find(".date").val(date[0].getDate());
  dateSelectors[0].sync();

  $(formElemB).find(".year").val(date[1].getFullYear());
  $(formElemB).find(".month").val(date[1].getMonth() + 1);
  $(formElemB).find(".date").val(date[1].getDate());
  dateSelectors[1].sync();

  maps.forEach(async function(map, n){
    map.setView([(urlParams.get("y") ?? cookies.y ?? 35.7), (urlParams.get("x") ?? cookies.x ?? 139.5)], (urlParams.get("z") ?? cookies.z ?? 10));
    map.setMinZoom(5);
    map.setMaxBounds([[10, 100], [60, 180]]);
    map.createPane("base").style.zIndex = 100;
    map.createPane("polygon").style.zIndex = 250;
    map.createPane("colored").style.zIndex = 230;
    map.createPane("did").style.zIndex = 240;
    map.createPane("rail").style.zIndex = 380;
    map.createPane("line").style.zIndex = 400;

    labelLayerGroups[n] = new L.LayerGroup();
    labelLayers[n] = new L.LayerGroup();
    typeColoredLayerGroups[n] = new L.LayerGroup();
    gunColoredLayerGroups[n] = new L.LayerGroup();
    railLayerGroups[n] = new L.LayerGroup(null, {attribution: "<a href='https://nlftp.mlit.go.jp/ksj/' target='_blank'>国土数値情報</a>(一部改変)"});
    railLayers[n] = new L.LayerGroup();
    stationLayers[n] = new L.LayerGroup();
    didLayerGroups[n] = new L.LayerGroup(null, {attribution: "<a href='https://nlftp.mlit.go.jp/ksj/' target='_blank'>国土数値情報</a>(一部改変)"});
    didLayers[n] = new L.LayerGroup();


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
        opacity: 0.3
    });
    let altitudeMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
        pane: "base",
        opacity: 0.3
    });
    let shadeAltitudeMap = new L.LayerGroup([shadeMap, altitudeMap]);
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
      "色別標高図+陰影起伏図": shadeAltitudeMap,
      "航空写真": photo,
      "OpenStreetMap": osm,
      "GoogleMap": googleRoads,
      "背景非表示":blank
    };
    let overlayMaps = {
      "市区町村名ラベルを表示": labelLayerGroups[n],
      "色分け(市・町・村)": typeColoredLayerGroups[n],
      "色分け(郡)": gunColoredLayerGroups[n],
      "鉄道路線(1950年～)[年単位]": railLayerGroups[n],
      "人口集中地区(1960年～)[5年単位]": didLayerGroups[n]
    };

    layerControl[n] = L.control.layers(baseMaps, overlayMaps).addTo(map);

    //背景地図一覧(文字列)
    let baseMapNames = {
      "淡色地図(地理院地図)": "paleMap",
      "標準地図(地理院地図)": "standardMap",
      "色別標高図+陰影起伏図": "shadeAltitudeMap",
      "航空写真": "photo",
      "OpenStreetMap": "osm",
      "GoogleMap": "googleRoads",
      "背景非表示": "blank"
    }

    //URLパラメータ・cookie・デフォルトの優先順位で背景レイヤを取得
    let layerParams = {base: urlParams.get("base" + n) ?? cookies["base" + n] ?? "paleMap", label: urlParams.get("label" + n) ?? cookies["label" + n] ?? "false", color: urlParams.get("color" + n) ?? cookies["color" + n] ?? 0, rail: urlParams.get("rail" + n) ?? cookies["rail" + n] ?? "false", did: urlParams.get("did" + n) ?? cookies["did" + n] ?? "false"};

    if(Object.values(baseMapNames).includes(layerParams.base)){
      map.addLayer(eval(layerParams.base));
      baseLayerNames[n] = layerParams.base;
    }else{
      map.addLayer(paleMap);
      baseLayerNames[n] = "paleMap";
    }

    if(layerParams.label === "true"){
      map.addLayer(labelLayerGroups[n]);
    }

    if(layerParams.color == 1){
      map.addLayer(typeColoredLayerGroups[n]);
    }else if(layerParams.color == 2){
      map.addLayer(gunColoredLayerGroups[n]);
    }

    if(layerParams.rail === "true"){
      map.addLayer(railLayerGroups[n]);
    }

    if(layerParams.did === "true"){
      map.addLayer(didLayerGroups[n]);
    }

    L.control.scale({imperial: false, maxWidth: 300}).addTo(map);

    //マップ(地物が存在しない部分)クリック時にハイライト消去
    map.on("click", function(e){
      if(!clickedOnFeature && clickedObj){
        polygonLayers[clickedObj.substr(0, 1)].resetFeatureStyle(clickedObj);
      }
      clickedOnFeature = false;
    });

    map.on("baselayerchange", function(e){
      baseLayerNames[n] = baseMapNames[e.name];
      setUrlParam();
    });


    map.on("overlayadd", async(e)=>{
      //レイヤー削除時に遅延処理が必要(leafletのバグ？)
      if(e.name === "色分け(市・町・村)" && map.hasLayer(gunColoredLayerGroups[n])){
        setTimeout(()=>{
          map.removeLayer(gunColoredLayerGroups[n]);
        }, 10);
      }
      if(e.name === "色分け(郡)" && map.hasLayer(typeColoredLayerGroups[n])){
        setTimeout(()=>{
          map.removeLayer(typeColoredLayerGroups[n]);
        }, 10);
      }

      if(e.name === "鉄道路線(1950年～)[年単位]"){
        //データ読み込み処理
        if(!railJson){
          if(n === 0){
            $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "inline");
          }else{
            $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "inline");
          }

          railJson = await getResources("KSJrailroad_line.geojson");
          stationJson = await getResources("KSJrailroad_point.geojson");
          
          
          if(n === 0){
            $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
          }else{
            $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
          }
        }
        if(!railLayerGroups[n].hasLayer(railLayers[n])){
          railRedraw(n);
          stationRedraw(n);
        }
      }

      if(e.name === "人口集中地区(1960年～)[5年単位]"){
        //データ読み込み処理
        if(!didJson){
          if(n === 0){
            $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "inline");
          }else{
            $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "inline");
          }

          didJson = await getResources("DIDall.geojson");
        
          if(n === 0){
            $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
          }else{
            $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
          }
        }
        if(!didLayerGroups[n].hasLayer(didLayers[n])){
          didRedraw(n);
        }
      }

      setUrlParam();
    });

    map.on("overlayremove", (e)=>{
      setUrlParam();
    });


    typeColoredRedraw(n);
    gunColoredRedraw(n);
    polygonRedraw(n);
    lineRedraw(n);
    labelRedraw(n);

    if(map.hasLayer(railLayerGroups[n])){
      //データ読み込み処理
      if(!railJson){
        railJson = await getResources("KSJrailroad_line.geojson");
        stationJson = await getResources("KSJrailroad_point.geojson");
        railRedraw(n);
        stationRedraw(n);
      }
    }
    if(map.hasLayer(didLayerGroups[n])){
      //データ読み込み処理
      if(!didJson){
        didJson = await getResources("DIDall.geojson");
        didRedraw(n);
      }
    }


    if(!("GUNCOLOR" in polygonJson.features[0].properties)){
      console.log("WARNING! : ポリゴンファイルにフィールド「GUNCOLOR」が存在しません。");
    }

    if(n === 0){
      $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
    }else{
      $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
    }
  });

  maps[0].sync(maps[1], {syncCursor: true});
  maps[1].sync(maps[0], {syncCursor: true});

  dualChkbx = document.getElementById("dual");
  containerA = document.getElementById("containerA");
  containerB = document.getElementById("containerB");
  dualChkbx.addEventListener("change", changeDisplay);
  if(urlParams.get("dual") === "true"){
    dualChkbx.checked = true;
  }else if(urlParams.get("dual") === null & cookies.dual === "true"){
    dualChkbx.checked = true;
  }else{
    dualChkbx.checked = false;
  }

  maps[0].on("moveend", function(){
    labelRedraw(0);
    labelRedraw(1);
    if(stationJson){
      stationRedraw(0);
      stationRedraw(1);
    }

    setUrlParam();
  });

  checkOrientation(mediaQ);
  mediaQ.addListener(checkOrientation);

}

function lineRedraw(n){
  lineLayers[n] = L.vectorGrid.slicer(itemFilter(lineJson, n), {
    vectorTileLayerStyles: {
      sliced: function(properties){
          switch(properties.TYPE){
            case '村': return{color:"#639394", weight:2}
            case '区': return{color:"#857944", weight:2}
            case '特別区': return{color:"#326333", weight:2.5}
            case '郡': return{color:"#326333", weight:2.5}
            case '支庁': return{color:"#995514", weight:2.5}
            case '県': return{color:"#8a2725", weight:2.5}
            case '湖': return{color:"#5363b5", weight:2.5}
            case '海': return{color:"#223c8a", weight:2.5}
         }
      }
    },
    maxZoom: 18,
    pane: "line"
  });
  lineLayers[n].addTo(maps[n]);
}

function railRedraw(n){
  if(date[n].getFullYear() >= 1950){
    railLayers[n] = L.vectorGrid.slicer(itemFilter(railJson, n), {
      vectorTileLayerStyles: {
        sliced: function(properties){
          switch(properties.JigyoshaType){
            case "1": return{color:"#114211", weight:2, dashArray: "8 8"}
            case "2": return{color:"#333958", weight:1.5, dashArray: "5 5"}
            case "3": return{color:"#687943", weight:1.5, dashArray: "5 5"}
            case "4": return{color:"#80663a", weight:1.5, dashArray: "5 5"}
            case "5": return{color:"#6a1a47", weight:1.5, dashArray: "5 5"}
         }
        }
      },
      maxZoom: 18,
      pane: "rail"
    });
    railLayers[n].addTo(railLayerGroups[n]);
  }
}

function stationRedraw(n){
  stationLayers[n].clearLayers();
  if(date[n].getFullYear() >= 1950){
    if(maps[n].getZoom() >= 10){
      itemFilter(stationJson, n, true).features.forEach(function(f){
        let marker = L.circleMarker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {
          radius: 3,
          fillColor: "#5d5d5d",
          weight: 0,
          fillOpacity: 0.8,
          interactive: false
        });
        stationLayers[n].addLayer(marker);
        if(maps[n].getZoom() >= 12){
          let divIcon = new L.DivIcon({
            className: 'labelClassStation',
            html: '<div>' + (f.properties.Name) + '</div>',
            iconSize: [(f.properties.Name).length*12, 20],
            iconAnchor: [-5, 8]
          });
          let label = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {
            icon: divIcon,
            interactive: false
          });
          stationLayers[n].addLayer(label);
        }
      });
      stationLayers[n].addTo(railLayerGroups[n]);
    }
  }
}

function polygonRedraw(n){
  polygonLayers[n] = L.vectorGrid.slicer(itemFilter(polygonJson, n), {
    vectorTileLayerStyles: {
      sliced:function(properties){
        //1970年より前の日付を選んだ場合、データ未作成の県の色を灰色に
        if(date[n] < new Date("1947/05/03")){
          return {fill: true, fillColor:"#000000" ,fillOpacity:0.2, opacity:0}
        }else if(date[n] < new Date("1970/04/01")){
          if(["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "岡山県"].some(e => e === properties.KEN)){
            return {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0}
          }else{
            return {fill: true, fillColor:"#000000" ,fillOpacity:0.2, opacity:0}
          }
        }else{
          return {fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0}
        }
      }
    },
    maxZoom: 18,
    interactive: true,
    getFeatureId: function(f){
      return n + "_" + f.properties.uid;
    },
    pane: "polygon"
  }).on("click", function(e){
    let prop = e.sourceTarget.properties;
    L.popup(e.latlng, {content: ()=>{
      let start = prop.START;
      if(start == "1889-04-01"){start = "-";}
      let end = prop.END;
      if(end == "2999-12-31"){end = "-";}
      let name = (prop.NAME ?? prop.TYPE);
      if(prop.CODE5 === "01223X"){name = name + "(歯舞群島)";}
      return '<div class="tableTitle">' + name + '</div>' + '<table><tr><th>都道府県</th><td>' + (prop.KEN ?? '') + '</td></tr><tr><th>支庁</th><td>' + (prop.SHICHO ?? '') + '</td></tr><tr><th>郡</th><td>' + (prop.GUN ?? '') + '</td></tr><tr><th>開始</th><td>' + start + '</td></tr><tr><th>終了</th><td>' + end + '</td></tr></table>';
    }}).openOn(maps[n]);
    clickEvent(e, n);
  });
  polygonLayers[n].addTo(maps[n]);
}

function typeColoredRedraw(n){
  typeColoredLayers[n] = L.vectorGrid.slicer(itemFilter(polygonJson, n), {
    vectorTileLayerStyles: {
      sliced:function(properties){
        switch(properties.TYPE){
          case '村': return{fill: true, fillColor:"#e6d5ff" ,fillOpacity:0.4, opacity:0}
          case '町': return{fill: true, fillColor:"#aaeaad" ,fillOpacity:0.4, opacity:0}
          case '市': return{fill: true, fillColor:"#ffdda1" ,fillOpacity:0.4, opacity:0}
          case '政令区': return{fill: true, fillColor:"#ffc3da" ,fillOpacity:0.4, opacity:0}
          case '特別区': return{fill: true, fillColor:"#ffc3da" ,fillOpacity:0.4, opacity:0}
          default : return{fill: true, fillColor:"#ffffff" ,fillOpacity:0.4, opacity:0}
       }
      }
    },
    maxZoom: 18,
    pane: "colored"
  });
  typeColoredLayers[n].addTo(typeColoredLayerGroups[n]);
}

function gunColoredRedraw(n){
  gunColoredLayers[n] = L.vectorGrid.slicer(itemFilter(polygonJson, n), {
    vectorTileLayerStyles: {
      sliced:function(properties){
         let op = 0.25;
         if(properties.TYPE === "町"){op = 0.5}
         switch(properties.GUNCOLOR){
           case 1: return{fill: true, fillColor:"#ffb0b0" ,fillOpacity:op, opacity:0}
           case 2: return{fill: true, fillColor:"#e3b77b" ,fillOpacity:op, opacity:0}
           case 3: return{fill: true, fillColor:"#e6e491" ,fillOpacity:op, opacity:0}
           case 4: return{fill: true, fillColor:"#beff8f" ,fillOpacity:op, opacity:0}
           case 5: return{fill: true, fillColor:"#79ab85" ,fillOpacity:op, opacity:0}
           case 6: return{fill: true, fillColor:"#bafff6" ,fillOpacity:op, opacity:0}
           case 7: return{fill: true, fillColor:"#9e9eff" ,fillOpacity:op, opacity:0}
           case 8: return{fill: true, fillColor:"#e2a9f5" ,fillOpacity:op, opacity:0}
           default : return{fill: true, fillColor:"#ffffff" ,fillOpacity:0.0, opacity:0}
        }
      }
    },
    maxZoom: 18,
    pane: "colored"
  });
  gunColoredLayers[n].addTo(gunColoredLayerGroups[n]);
}

function didRedraw(n){
  didLayers[n] = L.vectorGrid.slicer(itemFilter(didJson, n), {
    vectorTileLayerStyles: {
      sliced: {fill: true, fillColor:"#ff6aba" ,fillOpacity:0.4, opacity:0}
    },
    maxZoom: 18,
    pane: "did"
  });
  didLayers[n].addTo(didLayerGroups[n]);
}

function labelRedraw(n){
  //マーカーを全消去
  labelLayers[n].clearLayers();
  //レイヤ再描画はz>=10の時のみ
  if(maps[n].getZoom() >= 10){
    itemFilter(nameCsv, n, true).forEach(function(f){
      let nameLength = (f.name ?? f.type).length;
      let className;
      switch(f.type){
        case '村': className = 'labelClassMura'; break;
        case '町': className = 'labelClassMachi'; break;
        case '市': className = 'labelClassShi'; break;
        case '政令区': className = 'labelClassKu'; break;
        case '特別区': className = 'labelClassTokubetsuku'; break;
        default: className = 'labelClass';
      }
      let icon = new L.DivIcon({
        className: className,
        html: '<div>' + (f.name ?? f.type) + '</div>',
        iconSize: [nameLength*30, 30]
      });
      let marker = L.marker([f.y, f.x], {
        icon: icon,
        interactive: false
      });
      labelLayers[n].addLayer(marker);
    });
    labelLayers[n].addTo(labelLayerGroups[n]);
  }
}

//JSONの日付フィルター
function itemFilter(item, n, point = false){
  //JSON or CSV
  let itemType;
  let features;
  if(Array.isArray(item)){
    itemType = "csv";
    features = item;
  }else{
    itemType = "json";
    features = item.features;
  }

  let newFeatures;
  if(itemType === "json"){
    newFeatures = features.filter(function(f){
      return new Date(f.properties.START.replaceAll("-", "/")) <= (date[n]) && new Date(f.properties.END.replaceAll("-", "/")) > (date[n])
    });

    //画面内にあるものを取得
    if(point){
      let view = maps[n].getBounds();
      newFeatures = newFeatures.filter(function(f){
        return f.geometry.coordinates[0] >= view.getWest() && f.geometry.coordinates[0] <= view.getEast() && f.geometry.coordinates[1] >= view.getSouth() && f.geometry.coordinates[1] <= view.getNorth()
      });
    }

    let newJson = Object.assign({}, item);
    newJson.features = newFeatures;
    return newJson;

  }else{
    newFeatures = features.filter(function(f){
      return new Date(f.start.replaceAll("-", "/")) <= (date[n]) && ( new Date(f.end.replaceAll("-", "/")) > (date[n]) || f.end === "0000-00-00")
    });

    //画面内にあるものを取得
    let view = maps[n].getBounds();
    newFeatures = newFeatures.filter(function(f){
      return f.x >= view.getWest() & f.x <= view.getEast() && f.y >= view.getSouth() && f.y <= view.getNorth()
    });

    return newFeatures;
  }
}


function buttonClick(e){
  let n = e.data.n;
  if(n === 0){
    $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "inline");
  }else{
    $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "inline");
  }

  date[n] = dateSelectors[n].commit();
  typeColoredLayerGroups[n].removeLayer(typeColoredLayers[n]);
  gunColoredLayerGroups[n].removeLayer(gunColoredLayers[n]);
  maps[n].removeLayer(lineLayers[n]);
  maps[n].removeLayer(polygonLayers[n]);
  labelLayerGroups[n].removeLayer(labelLayers[n]);
  

  typeColoredRedraw(n);
  gunColoredRedraw(n);
  polygonRedraw(n);
  lineRedraw(n);
  labelRedraw(n);

  //鉄道データが読み込み済みの場合、鉄道レイヤのデータ更新
  if(railJson){
    if(railLayerGroups[n].hasLayer(railLayers[n])){
      railLayerGroups[n].removeLayer(railLayers[n]);
    }
    railRedraw(n);
    stationRedraw(n);
  }
  if(didJson){
    if(didLayerGroups[n].hasLayer(didLayers[n])){
      didLayerGroups[n].removeLayer(didLayers[n]);
    }
    didRedraw(n);
  }

  setUrlParam();

  if(n === 0){
    $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
  }else{
    $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
  }
}



function clickEvent(e, n){
  //前回クリックしたオブジェクトのハイライトを消去
  if(clickedObj){
    //clickedObjの一文字目に前回クリックした地物のマップ番号が入っている
    polygonLayers[clickedObj.substr(0, 1)].resetFeatureStyle(clickedObj);
  }

  //クリックしたオブジェクトをハイライト
  polygonLayers[n].setFeatureStyle(n + "_" + e.layer.properties.uid, {fill: true, fillColor:"#ff0000" ,fillOpacity:0.3, opacity:0});
  clickedObj = n + "_" + e.layer.properties.uid;

  //mapクリックイベントを呼び出さないようにする
  clickedOnFeature = true;
}

//画面の向きを検出
function checkOrientation(mediaQ){
  if(mediaQ.matches){
    orient = "portrait";
  }else{
    orient = "landscape";
  }
  changeDisplay();
}

function changeDisplay(){
  if(dualChkbx.checked){  //二画面表示
    switch (orient) {
      case "portrait":
        containerA.style.width = "100%";
        mapA.style.height = "41vh";
      break;
      case "landscape":
        containerA.style.width = "50%";
        mapA.style.height = "82vh";
    }
    containerB.style.display = "block";
    maps[0]._onResize();
  }else{  //一画面表示
    switch (orient) {
      case "portrait":
        containerA.style.width = "100%";
        mapA.style.height = "82vh";
      break;
      case "landscape":
        containerA.style.width = "100%";
        mapA.style.height = "82vh";
    }
    containerA.style.width = "100%";
    containerB.style.display = "none";
    maps[0]._onResize();
  }
}

function getCookieArray(){
  let arr = new Array();
  if(document.cookie != ''){
      let tmp = document.cookie.split('; ');
      for(let i=0;i<tmp.length;i++){
          let data = tmp[i].split('=');
          arr[data[0]] = decodeURIComponent(data[1]);
      }
  }
  return arr;
}

function setUrlParam(){
  function color(n){if(maps[n].hasLayer(typeColoredLayerGroups[n])){return 1}else if(maps[n].hasLayer(gunColoredLayerGroups[n])){return 2}else{return false}};
  let statusParams = {
    "y" : Math.round(maps[0].getCenter().lat * 10000)/10000,
    "x" : Math.round(maps[0].getCenter().lng * 10000)/10000,
    "z" : maps[0].getZoom(),
    "date0" : date[0].getFullYear() + "/" + (date[0].getMonth() + 1).toString().padStart(2, 0) + "/" + date[0].getDate().toString().padStart(2, 0),
    "date1" : date[1].getFullYear() + "/" + (date[1].getMonth() + 1).toString().padStart(2, 0) + "/" + date[1].getDate().toString().padStart(2, 0),
    "base0" : baseLayerNames[0],
    "base1" : baseLayerNames[1],
    "label0" : maps[0].hasLayer(labelLayerGroups[0]),
    "label1" : maps[1].hasLayer(labelLayerGroups[1]),
    "color0" : color(0),
    "color1" : color(1),
    "rail0" : maps[0].hasLayer(railLayerGroups[0]),
    "rail1" : maps[1].hasLayer(railLayerGroups[1]),
    "did0" : maps[0].hasLayer(didLayerGroups[0]),
    "did1" : maps[1].hasLayer(didLayerGroups[1]),
    "dual" : dualChkbx.checked
  }
  for(let key in statusParams){
    let val = statusParams[key];
    document.cookie = key + "=" + val + ";path=" + location.pathname + ";max-age=7776000;samesite=strict";
  }
  history.replaceState("","","?y=" + statusParams.y + "&x=" + statusParams.x + "&z=" + statusParams.z + "&date0=" + statusParams.date0 + "&date1=" + statusParams.date1 + "&base0=" + statusParams.base0 + "&base1=" + statusParams.base1 + "&label0=" + statusParams.label0 + "&label1=" + statusParams.label1 + "&color0=" + statusParams.color0 + "&color1=" + statusParams.color1 + "&rail0=" + statusParams.rail0 + "&rail1=" + statusParams.rail1 + "&did0=" + statusParams.did0 + "&did1=" + statusParams.did1 + "&dual=" + statusParams.dual);
}
