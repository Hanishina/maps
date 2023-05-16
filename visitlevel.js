let map;
let polygonLayer;
let clickLayer;
let clickLayerType = "black";
let labelLayerGroup;
let labelLayer;
let geojsonFiles = {};
let csv;
let pointjson;
let codecompcsv;
let kokusei2020;
let selectedFeatures = [];
let currentSave;
let saveDataArr = [];

let pattern;
const Color = ["", "#a24cc2", "#7575f0", "#3e9cfe", "#18d7cb", "#48f882", "#a4fc3c", "#e2dc38", "#fea331", "#ef5911", "#c22403"];

const Pref = [{"ken" : "北海道", "code" : 01}, {"ken" : "青森県", "code" : 02}, {"ken" : "岩手県", "code" : 03}, {"ken" : "宮城県", "code" : 04}, {"ken" : "秋田県", "code" : 05}, {"ken" : "山形県", "code" : 06}, {"ken" : "福島県", "code" : 07}, {"ken" : "茨城県", "code" : 08}, {"ken" : "栃木県", "code" : 09}, {"ken" : "群馬県", "code" : 10}, {"ken" : "埼玉県", "code" : 11}, {"ken" : "千葉県", "code" : 12}, {"ken" : "東京都", "code" : 13}, {"ken" : "神奈川県", "code" : 14}, {"ken" : "新潟県", "code" : 15}, {"ken" : "富山県", "code" : 16}, {"ken" : "石川県", "code" : 17}, {"ken" : "福井県", "code" : 18}, {"ken" : "山梨県", "code" : 19}, {"ken" : "長野県", "code" : 20}, {"ken" : "岐阜県", "code" : 21}, {"ken" : "静岡県", "code" : 22}, {"ken" : "愛知県", "code" : 23}, {"ken" : "三重県", "code" : 24}, {"ken" : "滋賀県", "code" : 25}, {"ken" : "京都府", "code" : 26}, {"ken" : "大阪府", "code" : 27}, {"ken" : "兵庫県", "code" : 28}, {"ken" : "奈良県", "code" : 29}, {"ken" : "和歌山県", "code" : 30}, {"ken" : "鳥取県", "code" : 31}, {"ken" : "島根県", "code" : 32}, {"ken" : "岡山県", "code" : 33}, {"ken" : "広島県", "code" : 34}, {"ken" : "山口県", "code" : 35}, {"ken" : "徳島県", "code" : 36}, {"ken" : "香川県", "code" : 37}, {"ken" : "愛媛県", "code" : 38}, {"ken" : "高知県", "code" : 39}, {"ken" : "福岡県", "code" : 40}, {"ken" : "佐賀県", "code" : 41}, {"ken" : "長崎県", "code" : 42}, {"ken" : "熊本県", "code" : 43}, {"ken" : "大分県", "code" : 44}, {"ken" : "宮崎県", "code" : 45}, {"ken" : "鹿児島県", "code" : 46}, {"ken" : "沖縄県", "code" : 47}];

async function init(){
    map = L.map("map", {zoomControl: false, doubleClickZoom: false});
    map.setView([35, 137], 8);
    map.setMinZoom(5);
    map.setMaxBounds([[10, 100], [60, 180]]);
    L.control.zoom({position: "topright"}).addTo(map);
    map.createPane("base").style.zIndex = 100;
    map.createPane("color").style.zindex = 150;
    map.createPane("click").style.zindex = 200;
    map.createPane("line").style.zindex = 400;

    pattern = new L.StripePattern({weight: 2, spaceWeight: 4, color: "#555555", angle: 45});
    pattern.addTo(map);

    geojsonFiles.polygon2020 = await getJson("polygon.geojson", "2020-10-01");
    geojsonFiles.line2020 = await getJson("line.geojson", "2020-10-01");
    csv = await getCsv("jinryu.csv");
    pointjson = await getJson("point.geojson");
    codecompcsv = await getCsv("自治体コード圧縮形.csv");
    kokusei2020 = await getCsv("2020kokusei.csv");
    pointjson.features.forEach(row=>{
        let match = csv.find(f=>{return f.citycode === row.properties.CODE5});
        if(match){
            row.properties.visit_diff = match.visit_diff;
        }else{
            row.properties.visit_diff = null;
        }
    });

    let lineLayer = L.vectorGrid.slicer(geojsonFiles.line2020, {
        vectorTileLayerStyles: {
            sliced: function(properties){
                switch(properties.TYPE){
                    case '村': return{color:"#186316", weight:2}
                    case '区': return{color:"#186316", weight:2}
                    case '特別区': return{color:"#186316", weight:2}
                    case '郡': return{color:"#186316", weight:2}
                    case '支庁': return{color:"#063d04", weight:3}
                    case '県': return{color:"#063d04", weight:3}
                    case '湖': return{color:"#063d04", weight:2}
                    case '海': return{color:"#063d04", weight:2}
                }
            }
        },
        maxZoom: 18,
        minZoom: 8,
        pane: "line"
    });
    lineLayer.addTo(map);

    geojsonFiles.polygon2020.features.forEach(f=>{
        let match = csv.find(f2=>{return f2.citycode === f.properties.CODE5});
        if(match){
            f.properties.visit_diff = match.visit_diff;
            f.properties.visitor = match.sum_outcity;
        }else{
            f.properties.visit_diff = null;
        }
        match = kokusei2020.find(f2=>{return f2.CODE === f.properties.CODE5});
        if(match){
            f.properties.population = match.POPULATION;
            f.properties.area = match.AREA;
        }
        match = codecompcsv.find(f2=>{return f2["5keta"] === f.properties.CODE5});
        if(match){
            f.properties.CODE3 = match["3keta"];
        }
    });
    geojsonFiles.polygon2020.features = geojsonFiles.polygon2020.features.filter(f=>{return f.properties.visit_diff});

    polygonLayer = L.vectorGrid.slicer(geojsonFiles.polygon2020, {
        vectorTileLayerStyles: {
            sliced:function(properties){
                return {fill: true, fillColor:Color[properties.visit_diff] ,fillOpacity:0.5, opacity:0};
            }
        },
        maxZoom: 18,
        interactive: false,
        getFeatureId: function(f){
            return f.properties.CODE5;
        },
        pane: "color"
    });
    polygonLayer.addTo(map);

    clickLayer = L.vectorGrid.slicer(geojsonFiles.polygon2020, {
        vectorTileLayerStyles: {
            sliced:function(properties){
                return{fill: true, fillColor:"#ff0000" ,fillOpacity:0, opacity:0};
            }
        },
        maxZoom: 18,
        interactive: true,
        getFeatureId: function(f){
            return f.properties.CODE5;
        },
        pane: "click"
    }).on("click", (e)=>{
        featureClick(e);
    }).on("mouseover mousedown", (e)=>{
        let text;
        if(e.layer.properties.TYPE === "政令区"){
            text = e.layer.properties.KEN + e.layer.properties.GUN + e.layer.properties.NAME;
        }else{
            text = e.layer.properties.KEN + e.layer.properties.NAME;
        }
        $("#smallWindow").find(".cityname").text(text);
        $("#smallWindow").find(".visit_diff").text("訪問難易度：　" + e.layer.properties.visit_diff);
        $("#smallWindow").find(".visitor").text("滞在者数：　" + e.layer.properties.visitor);
    }).on("mouseout", (e)=>{
        $("#smallWindow").find(".cityname").text("-");
        $("#smallWindow").find(".visit_diff").text("訪問難易度：　");
        $("#smallWindow").find(".visitor").text("滞在者数：　");
    });
    clickLayer.addTo(map);


    let paleMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
        pane: "base"
    });
    let standardMap = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
        pane: "base"
    });
    let hakuchizu = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png', {
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
        "白地図(地理院地図)": hakuchizu,
        "陰影起伏図": shadeMap,
        "航空写真": photo,
        "OpenStreetMap": osm,
        "GoogleMap": googleRoads,
        "背景非表示":blank
    };

    labelLayerGroup = new L.LayerGroup();
    labelLayer = new L.LayerGroup();
    dummyLayer = new L.LayerGroup().addTo(map);

    let overlayMaps = {
        "ラベル": labelLayerGroup,
        "訪問した市区町村": dummyLayer,
        "難易度別色分け": polygonLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);
    map.addLayer(paleMap);
    L.control.scale({imperial: false, maxWidth: 300, position: "bottomright"}).addTo(map);

    $(dummyLayer).on("add", e=>{
        if(map.hasLayer(polygonLayer)){
            clickLayerChange("black");
        }else{
            clickLayerChange("red");
        }
    });
    $(dummyLayer).on("remove", e=>{
        clickLayerChange("trans");
    });
    $(polygonLayer).on("add", e=>{
        if(map.hasLayer(dummyLayer)){
            clickLayerChange("black");
        }
    });
    $(polygonLayer).on("remove", e=>{
        if(map.hasLayer(dummyLayer)){
            clickLayerChange("red");
        }
    });

    $("#achieve_ken").append($("<tr>")
        .append($("<td>").text("全国"))
        .append($("<td>").attr({class: "count"}).text("0"))
        .append($("<td>").text("/"+csv.length))
        .append($("<td>").attr({class: "percent"}).text("(0%)"))
        .append($("<td>").attr({class: "point"}).text("0"))
        .append($("<td>").text("/"+csv.reduce((pre, cur)=>{return pre+Number(cur.visit_diff)}, 0)))
        .append($("<td>").attr({class: "percent"}).text("(0%)"))
    );
    $("#achieve_level").append($("<tr>")
        .append($("<td>").text("すべて"))
        .append($("<td>").attr({class: "count"}).text("0"))
        .append($("<td>").text("/"+csv.length))
        .append($("<td>").attr({class: "percent"}).text("(0%)"))
    );
    for(i=1; i<=47; i++){
        $("#achieve_ken").append($("<tr>")
            .append($("<td>").text(Pref[i-1].ken))
            .append($("<td>").attr({class: "count"}).text("0"))
            .append($("<td>").text("/"+csv.filter(f=>{return f.citycode.substring(0, 2) === i.toString().padStart(2, "0")}).length))
            .append($("<td>").attr({class: "percent"}).text("(0%)"))
            .append($("<td>").attr({class: "point"}).text("0"))
            .append($("<td>").text("/"+csv.filter(f=>{return f.citycode.substring(0, 2) === i.toString().padStart(2, "0")}).reduce((pre, cur)=>{return pre+Number(cur.visit_diff)}, 0)))
            .append($("<td>").attr({class: "percent"}).text("(0%)"))
        );
    }
    for(i=1; i<=10; i++){
        $("#achieve_level").append($("<tr>")
            .append($("<td>").text("訪問難易度" + i))
            .append($("<td>").attr({class: "count"}).text("0"))
            .append($("<td>").text("/"+csv.filter(f=>{return f.visit_diff === i.toString()}).length))
            .append($("<td>").attr({class: "percent"}).text("(0%)"))
        );
    }

    $("input[name='listtype']").val(["ken"]);
    $("input[name='listtype']").on("change", e=>{
        $("#list_ken").parent().toggle();
        $("#list_level").parent().toggle();
    });
    $("input[name='tabletype']").val(["ken"]);
    $("input[name='tabletype']").on("change", e=>{
        $("#achieve_ken").parent().toggle();
        $("#achieve_level").parent().toggle();
    });

    map.on("moveend", function(){
        labelRedraw();
    });

    $("#savebtn").modaal({
        content_source: "#saveModal",
        before_open: saveModal
    });

    $("#loadbtn").modaal({
        content_source: "#loadModal",
        before_open: loadModal
    });

    $("#sharebtn").modaal({
        content_source: "#shareModal",
        before_open: shareModal
    });

    $("#resetbtn").on("click", e=>{
        new Dialog({msg: "すべての選択をリセットしますか？", buttons: [{id: "determ", text: "OK", onclick: function(){reset()}}, {id: "cancel", text: "キャンセル", onclick: "cancel"}]}).show()
    });

    if(window.localStorage.getItem("visitlevel_saveData")){
        saveDataArr = JSON.parse(window.localStorage.getItem("visitlevel_saveData"));
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
            window.localStorage.setItem("visitlevel_saveData", JSON.stringify(saveDataArr));
            saveDataTableRedraw();
            if($(e.delegateTarget).attr("id") === "saveTable"){
                $("#saveTable").find("[value='" + saveDataArr.length + "']").click();
            }else if($(e.delegateTarget).attr("id") === "loadTable"){
                $("#loadTable").find("[value='0']").click();
            }
        }}, {id: "cancel", text: "キャンセル", onclick: "cancel"}]});
        dialog.show();
    });
    
    $("#saveModal").find(".cancel").on("click", ()=>{
        $("#savebtn").modaal("close");
    });
    
    $("#loadModal").find(".cancel").on("click", ()=>{
        $("#loadbtn").modaal("close");
    });
    
    $("#saveModal").find(".save").on("click", function(){
        function determ(){
            let saveDataName = $("[name='saveDataName']").val();
            let saveData = makeSaveData(saveDataName);
            console.log(saveData);
            let index = $("#saveTable").children("[selected]").attr("value");
            saveDataArr[index] = saveData;
            saveDataArr.sort((a, b)=>{return new Date(b.createTime) - new Date(a.createTime)});
            window.localStorage.setItem("visitlevel_saveData", JSON.stringify(saveDataArr));
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
    
    $("#loadModal").find(".load").on("click", function(){
        let index = $("#loadTable").children("[selected]").attr("value");
        if(!isNaN(index)){
            currentSave = saveDataArr[index];
            $("#loadbtn").modaal("close");
            loadData(currentSave);
        }
    });

    $("#shareModal").find(".btn_twitter").on("click", function(){
        let path = "https://twitter.com/intent/tweet?text=" + encodeURIComponent($("#shareContent").html())
        window.open(path, "_blank");
    });
}

function featureClick(e){
    if(!map.hasLayer(dummyLayer)){
        map.addLayer(dummyLayer);
        if(map.hasLayer(polygonLayer)){
            clickLayerChange("black");
        }else{
            clickLayerChange("red");
        }
    }
    if(!selectedFeatures.some(f=>{return f.CODE5 === e.layer.properties.CODE5})){
        let newStyle;
        if(clickLayerType === "black"){
            newStyle = {fill: true, fillPattern: pattern ,fillOpacity:1, opacity:0};
        }else if(clickLayerType === "red"){
            newStyle = {fill: true, fillColor: "#ff0000" ,fillOpacity:0.3, opacity:0};
        }
        clickLayer.setFeatureStyle(e.layer.properties.CODE5, newStyle);
        selectedFeatures.push(e.layer.properties);
        selectedFeatures.sort((a,b)=>{if(a.CODE5>b.CODE5){return 1}else if(a.CODE5<b.CODE5){return -1}else{return 0}});
    }else{
        clickLayer.resetFeatureStyle(e.layer.properties.CODE5);
        selectedFeatures = selectedFeatures.filter(f=>{return f.CODE5 !== e.layer.properties.CODE5});
    }

    tableRedraw();
}

function tableRedraw(){
    $("#point").text(selectedFeatures.reduce((sum, f)=>{return sum+Number(f.visit_diff)}, 0));
    $("#pop").text(selectedFeatures.reduce((sum, f)=>{return sum+Number(f.population)}, 0));
    $("#area").text(selectedFeatures.reduce((sum, f)=>{return sum+Number(f.area)}, 0).toFixed(2));
    $("#list_ken").empty();
    $("#list_level").empty();
    selectedFeatures.forEach(f=>{
        let text;
        if(f.TYPE === "政令区"){
            text = f.KEN + f.GUN + f.NAME;
        }else{
            text = f.KEN + f.NAME;
        }
        let tr = $("<tr>").css({"background-color": whiter(Color[f.visit_diff])});
        tr.append([$("<td>").text(text), $("<td>").text(f.visit_diff + " pt")]);
        tr.appendTo($("#list_ken"));
    });
    [...selectedFeatures].sort((a,b)=>{return b.visitor - a.visitor}).forEach(f=>{
        let text;
        if(f.TYPE === "政令区"){
            text = f.KEN + f.GUN + f.NAME;
        }else{
            text = f.KEN + f.NAME;
        }
        let tr = $("<tr>").css({"background-color": whiter(Color[f.visit_diff])});
        tr.append([$("<td>").text(text), $("<td>").text(f.visit_diff + " pt")]);
        tr.appendTo($("#list_level"));
    });
    $("#achieve_ken tr .count").first().text(selectedFeatures.length);
    $("#achieve_ken tr .point").first().text(selectedFeatures.reduce((pre, cur)=>{return pre+Number(cur.visit_diff)}, 0));
    $("#achieve_level tr .count").first().text(selectedFeatures.length);
    for(i=1; i<=47; i++){
        $($("#achieve_ken tr .count")[i]).text(selectedFeatures.filter(f=>{return f.CODE5.substring(0, 2) === i.toString().padStart(2, "0")}).length);
        $($("#achieve_ken tr .point")[i]).text(selectedFeatures.filter(f=>{return f.CODE5.substring(0, 2) === i.toString().padStart(2, "0")}).reduce((pre, cur)=>{return pre+Number(cur.visit_diff)}, 0));
    }
    for(i=1; i<=10; i++){
        $($("#achieve_level tr .count")[i]).text(selectedFeatures.filter(f=>{return f.visit_diff === i.toString()}).length);
    }
    $(".percent").each(function(i){
        $(this).text("(" + (Number($(this).prev().prev().text().replace(/[^0-9]/g, "")) / Number($(this).prev().text().replace(/[^0-9]/g, "")) * 100).toFixed() + "%)");
    });
    
}

function clickLayerChange(type){
    //type = black | red | trans
    clickLayerType = type;
    let newStyle;
    if(type === "black"){
        newStyle = {fill: true, fillPattern: pattern ,fillOpacity:1, opacity:0};
    }else if(type === "red"){
        newStyle = {fill: true, fillColor: "#ff0000" ,fillOpacity:0.3, opacity:0};
    }else if(type === "trans"){
        newStyle = {fill: true, fillColor: "#ff0000" ,fillOpacity:0, opacity:0};
    }
    selectedFeatures.forEach(f=>{
        clickLayer.setFeatureStyle(f.CODE5, newStyle);
    });
}

function labelRedraw(){
    //マーカーを全消去
    labelLayer.clearLayers();
    //レイヤ再描画はz>=10の時のみ
    if(map.getZoom() >= 8){
        itemFilter(pointjson.features).forEach(function(f){
            let nameLength = (f.properties.NAME ?? f.properties.TYPE).length;
            let html = "<div>" + f.properties.visit_diff + "</div>";
            if(map.getZoom() >= 10){
                html = "<div>" + (f.properties.NAME ?? f.properties.TYPE) + "</div>" + "<div>" + f.properties.visit_diff + "</div>";
            }
            let icon = new L.DivIcon({
                className: "labelClass",
                html: html,
                iconSize: [nameLength*30, 30]
            });
            let marker = L.marker([f.geometry.coordinates[1], f.geometry.coordinates[0]], {
                icon: icon,
                interactive: false
            });
            labelLayer.addLayer(marker);
        });
        labelLayer.addTo(labelLayerGroup);
    }
}

function reset(){
    selectedFeatures.forEach(f=>{
        clickLayer.resetFeatureStyle(f.CODE5);
    });
    selectedFeatures = [];
    tableRedraw();
}

function saveModal(){
    $("#saveDataPoint").text(selectedFeatures.reduce((sum, f)=>{return sum+Number(f.visit_diff)}, 0) + " pt");
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
}

function loadModal(){
    if(currentSave){
        let value = saveDataArr.findIndex(f=>{
            return f === currentSave;
        });
        $("#loadTable").find("[value='" + value + "']").click();
    }else{
        $("#loadTable").find("[value='0']").click();
    }
}

function saveDataTableRedraw(){
    let table = $("#saveTable");
    table.empty();
  
    $("<div>").attr({class: "slot", value: saveDataArr.length}).append($("<div>").html("<i class='far fa-plus-square'></i>新規セーブデータ")).append($("<div>").css({height: "1em"})).append($("<div>").css({height: "1em"})).appendTo(table);
    saveDataArr.forEach((savedata, i)=>{
        slot = $("<div>").attr({class: "slot", value: i}).appendTo(table);
        $("<div>").text(savedata.name).appendTo(slot);
        $("<div>").text(savedata.points + " pt").appendTo(slot);
        $("<div>").text(dateFormat(new Date(savedata.createTime))).appendTo(slot);
        $("<div>").html("<i class='fa-solid fa-trash-can'></i>").attr({class: "delete"}).appendTo(slot);
    });
  
    table = $("#loadTable");
    table.empty();
    saveDataArr.forEach((savedata, i)=>{
        slot = $("<div>").attr({class: "slot", value: i}).appendTo(table);
        $("<div>").text(savedata.name).appendTo(slot);
        $("<div>").text(savedata.points + " pt").appendTo(slot);
        $("<div>").text(dateFormat(new Date(savedata.createTime))).appendTo(slot);
        $("<div>").html("<i class='fa-solid fa-trash-can'></i>").attr({class: "delete"}).appendTo(slot);
    });
}

function makeSaveData(saveDataName){
    let save = {};
    save.name = saveDataName;
    save.list = selectedFeatures.map(f=>{return f.CODE5});
    save.points = selectedFeatures.reduce((sum, f)=>{return sum+Number(f.visit_diff)}, 0);
    save.mapSettings = {
        x: Math.round(map.getCenter().lng * 10000)/10000,
        y: Math.round(map.getCenter().lat * 10000)/10000,
        z: map.getZoom(),
        baseMap: ""
    };
    save.createTime = dateFormat(new Date());
    return save;
}

function makeCodeComp(){
    let text = "";
    let current = "";
    selectedFeatures.map(f=>{return f.CODE3}).forEach(f=>{
        if(f.substring(0, 1) !== current){
            current = f.substring(0, 1);
            text += f.substring(0, 1) + "_"
        }
        text += f.substring(1, 3)
    });
    return text;
}

function comparison(){
    console.log(makeCodeComp());
    console.log(selectedFeatures.reduce((pre, cur)=>{return pre + cur.CODE3}, ""));
    console.log(selectedFeatures.reduce((pre, cur)=>{return pre + cur.CODE5}, ""));
}

function decode(code){
    let arr2 = code.match(/.{2}/g);
    let arr3 = [];
    let prefix;
    arr2.forEach(r=>{
        if(r.substring(1) === "_"){
            prefix = r.substring(0, 1);
        }else{
            arr3.push(prefix + r);
        }
    });
    return arr3.map(c3=>{return codecompcsv.find(r=>{return r["3keta"] === c3})["5keta"]});
}

function initialComp(){
    let exp = [];
    let cur;
    selectedFeatures.forEach(f=>{
        if(f.CODE5.substring(0, 2) !== cur){
            cur = f.CODE5.substring(0, 2);
            exp.push("0" + f.CODE5.substring(0, 2));
        }
        exp.push(f.CODE5.substring(2, 5));
    });
    return exp.join("");
}

function loadData(save){
    reset();
    save.list.forEach(f=>{
        let match = geojsonFiles.polygon2020.features.find(f2=>{return f2.properties.CODE5 === f});
        if(match){
            selectedFeatures.push(match.properties);
            let newStyle;
            if(clickLayerType === "black"){
                newStyle = {fill: true, fillPattern: pattern ,fillOpacity:1, opacity:0};
            }else if(clickLayerType === "red"){
                newStyle = {fill: true, fillColor: "#ff0000" ,fillOpacity:0.3, opacity:0};
            }
            clickLayer.setFeatureStyle(f, newStyle);
        }
        selectedFeatures.sort((a,b)=>{if(a.CODE5>b.CODE5){return 1}else if(a.CODE5<b.CODE5){return -1}else{return 0}});
    });
    tableRedraw();
}

function shareModal(){
    let point = selectedFeatures.reduce((sum, f)=>{return sum+Number(f.visit_diff)}, 0);
    $("#shareContent").html("私の市区町村訪問ポイントは "+point+" ptです。\n\n#市区町村訪問ポイント\nhttps://hanishina.github.io/maps/visitlevel.html")
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
  
        features.forEach(function(f, i){
            f.properties.uid = i;
        });
        json.features = features
    });
}

async function getCsv(filename){
    let path = "./csv/" + filename;
    let csvText = await $.get(path);
    let tempArr = csvText.split(/\r\n|\r|\n/g);
    let csvArr = [];
    tempArr.forEach((item, i)=>{
        csvArr[i] = item.split(",");
    });
    
    let main = [];
    csvArr.forEach((row, i)=>{
        if(i>0 && row.length === csvArr[0].length){
            let obj={};
            row.forEach((item, j)=>{
                obj[csvArr[0][j]] = item;
            });
            main.push(obj);
        }
    });
  
    return main;
}

function itemFilter(item){
    //画面内にあるものを取得
    let view = map.getBounds();
    item = item.filter(function(f){
    return f.geometry.coordinates[0] >= view.getWest() & f.geometry.coordinates[0] <= view.getEast() && f.geometry.coordinates[1] >= view.getSouth() && f.geometry.coordinates[1] <= view.getNorth()
    });

    return item;
}

function dateFormat(date){
    return date.getFullYear() + "/" + (date.getMonth() + 1).toString().padStart(2, "0") + "/" + date.getDate().toString().padStart(2, "0") + " " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
}

function whiter(color){
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    r = Math.round(r + (1-r/255)/2*255);
    g = Math.round(g + (1-g/255)/2*255);
    b = Math.round(b + (1-b/255)/2*255);
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0")
}