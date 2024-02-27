let maps = [];
let geojsonBank = {};
let currentDate = [];
let dateSelectors = [];
let layerControl = [];
let filteredNames = [];

let mapState = {
    x: 139.5,
    y: 35.7,
    z: 8,
    date0: "2000-01-01",
    date1: "2020-01-01",
    base0: "paleMap",
    base1: "paleMap",
    label0: false,
    label1: false,
    color0: false,
    color1: false,
    did0: false,
    did1: false,
    rail0: false,
    rail1: false,
    dual: false
};

let syncCursorGeojson = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [135, 35]
    }
}

let emptyGeojson = {
    type: "Feature",
    geometry: {
        type: "MultiPolygon",
        coordinates: [[[0,0]]]
    }
}

let mediaQ = matchMedia("screen and (orientation: portrait)");
let orient;

let clickedFeature = [];
let featureCopyMode = false;
let urlParams;
let setStateWaiting = false;

let googleSessionToken = "";

async function init(){
    await $.getJSON("./json/polygon.geojson").done((j)=>{geojsonBank.polygon = j});
    await $.getJSON("./json/line.geojson").done((j)=>{geojsonBank.line = j});
    await $.getJSON("./json/name.geojson").done((j)=>{geojsonBank.name = j});

    let featuresCopy = geojsonBank.line.features;
    geojsonBank.line.features = [];
    for(let type of ["村", "区", "郡", "特別区", "支庁", "県", "湖", "海"]){
        geojsonBank.line.features.push(...featuresCopy.filter(f=>{return f.properties.TYPE === type}));
    }

    urlParams = new URL(window.location.href).searchParams;
    //Params Example→?x=139.5&y=35.7&z=10&date0=2000/01/01&date1=2020/01/01&base0=paleMap&base1=paleMap&label0=true&label1=true&dual=true
    let lsMapState = JSON.parse(localStorage.getItem("hist_mapState")) ?? {};

    let pmProtocol = new pmtiles.Protocol();
    //maplibregl.addProtocol("pmtiles", pmProtocol.tile);
    maplibregl.addProtocol('pmtiles', (request) => {
        return new Promise((resolve, reject) => {
            const callback = (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({data});
                }
            };
            pmProtocol.tile(request, callback);
        });
    });

    maps[0] = new maplibregl.Map({container: "mapA"});
    maps[1] = new maplibregl.Map({container: "mapB"});

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
    currentDate[0] = new Date(urlParams.get("date0") ?? lsMapState.date0 ?? "");
    if(currentDate[0].toString() === "Invalid Date"){
        currentDate[0] = new Date(mapState.date0);
    }

    currentDate[1] = new Date(urlParams.get("date1") ?? lsMapState.date1 ?? "");
    if(currentDate[1].toString() === "Invalid Date"){
        currentDate[1] = new Date(mapState.date1);
    }

    //formに日付セット
    $(formElemA).find(".year").val(currentDate[0].getFullYear());
    $(formElemA).find(".month").val(currentDate[0].getMonth() + 1);
    $(formElemA).find(".date").val(currentDate[0].getDate());
    dateSelectors[0].sync();

    $(formElemB).find(".year").val(currentDate[1].getFullYear());
    $(formElemB).find(".month").val(currentDate[1].getMonth() + 1);
    $(formElemB).find(".date").val(currentDate[1].getDate());
    dateSelectors[1].sync();

    //googlemap用
    try{
        await $.ajax({
            "type": "post",
            "url": "https://tile.googleapis.com/v1/createSession?key=AIzaSyA05mQQCiqSlagtiU7Z0NoeX3n1snBdg44", 
            "data": JSON.stringify({"mapType": "roadmap", "language": "ja", "region": "JP"}), 
            "contentType": "application/json",
            "dataType": "json"
        }).done((data)=>{
            googleSessionToken = data.session;
        });
    }catch(err){
        console.log(err);
    }


    maps.forEach(async function(map, n){
        let layers = [{
            layerId: "paleMap",
            group: "ベースマップ",
            groupType: "radio",
            name: "淡色地図(地理院地図)",
            id: "paleMap"
        },{
            layerId: "standardMap",
            group: "ベースマップ",
            name: "標準地図(地理院地図)",
            id: "standardMap"
        },{
            layerId: "photo",
            group: "ベースマップ",
            name: "航空写真",
            id: "photo"
        },{
            layerId: ["shadeMap", "altitudeMap"],
            group: "ベースマップ",
            name: "色別標高図+陰影起伏図",
            id: "shadeAlittudeMap"
        },{
            layerId: "osm",
            group: "ベースマップ",
            name: "OpenStreetMap",
            id: "osm"
        },{
            layerId: "google",
            group: "ベースマップ",
            name: "Googleマップ",
            id: "google"
        },{
            layerId: null,
            group: "ベースマップ",
            name: "背景非表示",
            id: "blank"
        },{
            layerId: "label",
            group: "文字ラベル",
            groupType: "checkbox",
            name: "市区町村名ラベルを表示"
        },{
            layerId: "type_color",
            group: "色分け",
            groupType: "checkbox_excl",
            name: "色分け(市・町・村)"
        },{
            layerId: "gun_color",
            group: "色分け",
            name: "色分け(郡)"
        },{
            layerId: "did",
            group: "追加データ(国土数値情報)",
            name: "DID(1960年～)[5年単位]",
            id: "did"
        },{
            layerId: ["railroad_line", "railroad_point", "railroad_label"],
            group: "追加データ(国土数値情報)",
            name: "鉄道路線(1950年～)[年単位]",
            id: "rail"
        }]

        let baseMapNames = layers.filter(l=>{return l.group === "ベースマップ"}).map(l=>{return l.id});
        if(baseMapNames.includes(urlParams.get("base" + n))){
            mapState["base" + n] = urlParams.get("base" + n);
        }else if(baseMapNames.includes(lsMapState["base" + n])){
            mapState["base" + n] = lsMapState["base" + n];
        }else{
            mapState["base" + n] = "paleMap";
        }

        if(urlParams.get("label" + n) === "true" ?? lsMapState["label" + n] === "true"){
            mapState["label" + n] = true;
        }

        if(urlParams.get("color" + n) === "1" ?? lsMapState["color" + n] === "1"){
            mapState["color" + n] = 1;
        }else if(urlParams.get("color" + n) === "2" ?? lsMapState["color" + n] === "2"){
            mapState["color" + n] = 2;
        }

        if(urlParams.get("rail" + n) === "true" ?? lsMapState["rail" + n] === "true"){
            mapState["rail" + n] = true;
        }

        if(urlParams.get("did" + n) === "true" ?? lsMapState["did" + n] === "true"){
            mapState["did" + n] = true;
        }

        let fillOpacity;
        if(currentDate[n] < new Date(1947, 4, 3)){
            fillOpacity = 0.3
        }else if(currentDate[n] < new Date(1970, 3, 1)){
            fillOpacity = [
                "case",
                ["boolean", ["feature-state", "clicked"], false],
                0.3,
                ["in", ["get", "KEN"], ["literal", ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "新潟県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]]],
                0.3,
                0
            ];
        }else{
            fillOpacity = [
                "case",
                ["boolean", ["feature-state", "clicked"], false],
                0.3,
                0
            ];
        }

        map.setMaxBounds([[100, 10], [180, 60]]);
        map.setMaxZoom(18);

        await map.setStyle({
            version: 8,
            glyphs: "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
            center: [(parseFloat(urlParams.get("x")) || parseFloat(lsMapState.x) || mapState.x), (parseFloat(urlParams.get("y")) || parseFloat(lsMapState.y) || mapState.y)],
            zoom: (parseFloat(urlParams.get("z")) || parseFloat(lsMapState.z) || mapState.z),
            sources: {
                "paleMap": {
                    type: "raster",
                    tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                }, "standardMap": {
                    type: "raster",
                    tiles: ["https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                }, "shadeMap": {
                    type: "raster",
                    tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                }, "altitudeMap": {
                    type: "raster",
                    tiles: ["https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                }, "photo": {
                    type: "raster",
                    tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"],
                    tileSize: 256,
                    attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                }, "osm": {
                    type: "raster",
                    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                    tileSize: 256,
                    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors",
                }, "google": {
                    type: "raster",
                    tiles: ["https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=" + googleSessionToken + "&key=AIzaSyA05mQQCiqSlagtiU7Z0NoeX3n1snBdg44"],
                    tileSize: 256,
                    attribution: "<a href='https://cloud.google.com/maps-platform/terms' target='_blank'>Google</a>",
                }, "polygon": {
                    type: "geojson",
                    data: geojsonBank.polygon,
                    generateId: true,
                    attribution: "<a href='https://hanishina.github.io/maps/' target='_blank'>地図地理Sandbox</a>"
                }, "line": {
                    type: "geojson",
                    data: geojsonBank.line
                }, "name": {
                    type: "geojson",
                    data: geojsonBank.name
                }, "did": {
                    type: "vector",
                    url: "pmtiles://https://hanishina.net/maps/tiles/DIDall.pmtiles",
                    attribution: "<a href='https://nlftp.mlit.go.jp/ksj/' target='_blank'>国土数値情報</a>(一部改変)"
                }, "railroad": {
                    type: "vector",
                    url: "pmtiles://https://hanishina.net/maps/tiles/KSJrailroad.pmtiles",
                    attribution: "<a href='https://nlftp.mlit.go.jp/ksj/' target='_blank'>国土数値情報</a>(一部改変)"
                }, "syncCursor": {
                    type: "geojson",
                    data: syncCursorGeojson
                }, "copiedFeature": {
                    type: "geojson",
                    data: emptyGeojson
                }
            }, layers: [
                {
                    id: "background",
                    type: "background",
                    paint: {
                        "background-color": "#ffffff"
                    }
                }, {
                    id: "paleMap",
                    source: "paleMap",
                    type: "raster",
                    layout: {
                        "visibility": mapState["base" + n] === "paleMap" ? "visible" : "none"
                    }
                }, {
                    id: "standardMap",
                    source: "standardMap",
                    type: "raster",
                    layout: {
                        "visibility": mapState["base" + n] === "standardMap" ? "visible" : "none"
                    }
                }, {
                    id: "shadeMap",
                    source: "shadeMap",
                    type: "raster",
                    paint: {
                        "raster-opacity": 0.3
                    },
                    layout: {
                        "visibility": mapState["base" + n] === "shadeAltitudeMap" ? "visible" : "none"
                    }
                }, {
                    id: "altitudeMap",
                    source: "altitudeMap",
                    type: "raster",
                    paint: {
                        "raster-opacity": 0.3
                    },
                    layout: {
                        "visibility": mapState["base" + n] === "shadeAltitudeMap" ? "visible" : "none"
                    }
                }, {
                    id: "photo",
                    source: "photo",
                    type: "raster",
                    paint: {
                        "raster-opacity": 0.7
                    },
                    layout: {
                        "visibility": mapState["base" + n] === "photo" ? "visible" : "none"
                    }
                }, {
                    id: "osm",
                    source: "osm",
                    type: "raster",
                    layout: {
                        "visibility": mapState["base" + n] === "osm" ? "visible" : "none"
                    }
                }, {
                    id: "google",
                    source: "google",
                    type: "raster",
                    layout: {
                        "visibility": mapState["base" + n] === "google" ? "visible" : "none"
                    }
                }, {
                    id: "did",
                    source: "did",
                    "source-layer": "DIDall",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])]
                    ],
                    type: "fill",
                    paint: {
                        "fill-color": "#ff6aba",
                        "fill-opacity": 0.4
                    },
                    layout: {
                        visibility: mapState["did" + n] ? "visible" : "none"
                    }
                }, {
                    id: "type_color",
                    source: "polygon",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])],
                        ["!=", "TYPE", "湖"]
                    ],
                    type: "fill",
                    paint: {
                        "fill-color": [
                            "match",
                            ["get", "TYPE"],
                            "特別区",
                            "#ffc3da",
                            "政令区",
                            "#ffc3da",
                            "市",
                            "#ffdda1",
                            "町",
                            "#aaeaad",
                            "村",
                            "#e6d5ff",
                            "#ffffff"
                        ],
                        "fill-opacity": 0.5
                    },
                    layout: {
                        "visibility": mapState["color" + n] === 1 ? "visible" : "none"
                    }
                },{
                    id: "gun_color",
                    source: "polygon",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])],
                        ["!=", "TYPE", "湖"]
                    ],
                    type: "fill",
                    paint: {
                        "fill-color": [
                            "match",
                            ["get", "GUNCOLOR"],
                            1,
                            "#ffb0b0",
                            2,
                            "#e3b77b",
                            3,
                            "#e6e491",
                            4,
                            "#beff8f",
                            5,
                            "#79ab85",
                            6,
                            "#bafff6",
                            7,
                            "#9e9eff",
                            8,
                            "#e2a9f5",
                            "rgba(255,255,255,0)"
                        ],
                        "fill-opacity": [
                            "match",
                            ["get", "TYPE"],
                            "町",
                            0.5,
                            0.25
                        ]
                    },
                    layout: {
                        visibility: mapState["color" + n] === 2 ? "visible" : "none"
                    }
                },{
                    id: "polygon",
                    source: "polygon",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])],
                        ["!=", "TYPE", "湖"]
                    ],
                    type: "fill",
                    paint: {
                        "fill-color": [
                            "case",
                            ["boolean", ["feature-state", "clicked"], false],
                            "#ff0000",
                            "#000000"
                        ],
                        "fill-opacity": fillOpacity
                    }
                },{
                    id: "copiedFeature",
                    type: "fill",
                    source: "copiedFeature",
                    layout: {
                        visibility: "none"
                    },
                    paint: {
                        "fill-color": "#3366ff",
                        "fill-opacity": 0.3
                    }
                },{
                    id: "railroad_line",
                    source: "railroad",
                    "source-layer": "line",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])]
                    ],
                    type: "line",
                    paint: {
                        "line-color": [
                            "match",
                            ["get", "jigyoshaType"],
                            "1",
                            "#114211",
                            "2",
                            "#333958",
                            "3",
                            "#687943",
                            "4",
                            "#80663a",
                            "5",
                            "#6a1a47",
                            "#114211"
                        ],
                        "line-width": [
                            "match",
                            ["get", "jigyoshaType"],
                            "1",
                            2,
                            1.5
                        ],
                        "line-dasharray": [3,2]
                    },
                    layout: {
                        visibility: mapState["rail" + n] ? "visible" : "none"
                    },
                }, {
                    id: "railroad_point",
                    source: "railroad",
                    "source-layer": "point",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])]
                    ],
                    minzoom: 10,
                    type: "circle",
                    paint: {
                        "circle-color": "#5d5d5d",
                        "circle-radius": 3,
                    },
                    layout: {
                        visibility: mapState["rail" + n] ? "visible" : "none"
                    }
                }, {
                    id: "line",
                    source: "line",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])]
                    ],
                    type: "line",
                    paint: {
                        "line-color": [
                            "match",
                            ["get", "TYPE"],
                            "海",
                            "#223c8a",
                            "湖",
                            "#5363b5",
                            "県",
                            "#8a2725",
                            "支庁",
                            "#995514",
                            ["else", "郡", "特別区"],
                            "#326333",
                            "区",
                            "#857944",
                            "村",
                            "#639394",
                            "#00ff00"
                        ],
                        "line-width": [
                            "match",
                            ["get", "TYPE"],
                            ["else", "村", "区"],
                            2,
                            2.5
                        ]
                    }
                }, {
                    id: "railroad_label",
                    source: "railroad",
                    "source-layer": "point",
                    filter: [
                        "all",
                        ["<=", "START", dateToStr(currentDate[n])],
                        [">", "END", dateToStr(currentDate[n])]
                    ],
                    minzoom: 10,
                    type: "symbol",
                    layout: {
                        "text-field": ["get", "name"],
                        "text-font": ["Noto Sans CJK JP Regular"],
                        "text-size": 12,
                        "text-allow-overlap": true,
                        "text-anchor": "left",
                        "text-offset": [0.7,0],
                        visibility: mapState["rail" + n] ? "visible" : "none"
                    },
                    paint: {
                        "text-color": "#414eb5",
                        "text-halo-color": "#ffffff",
                        "text-halo-width": 2
                    }
                }, {
                    id: "label",
                    type: "symbol",
                    source: "name",
                    minzoom: 8,
                    filter: [
                        "all",
                        ["<=", "start", dateToStr(currentDate[n])],
                        ["any", [">", "end", dateToStr(currentDate[n])], ["==", "end", ""]]
                    ],
                    layout: {
                        "text-field": ["get", "name"],
                        "text-font": ["Noto Sans CJK JP Regular"],
                        "text-size": [
                            "match",
                            ["get", "type"],
                            "市",
                            18,
                            "特別区",
                            18,
                            "政令区",
                            16,
                            "町",
                            16,
                            "村",
                            12,
                            12
                        ],
                        "text-allow-overlap": true,
                        "visibility": mapState["label" + n] ? "visible" : "none"
                    },
                    paint: {
                        "text-color": [
                            "match",
                            ["get", "type"],
                            "市",
                            "#724e00",
                            "特別区",
                            "#640026",
                            "政令区",
                            "#640026",
                            "町",
                            "#004b0a",
                            "村",
                            "#3d1f6d",
                            "#3d1f6d"
                        ],
                        "text-halo-color": "#ffffff",
                        "text-halo-width": 2
                    }
                },{
                    id: "syncCursor",
                    type: "circle",
                    source: "syncCursor",
                    layout: {
                        visibility: "none"
                    },
                    paint: {
                        "circle-color": "#ff0000",
                        "circle-radius": 5
                    }
                }
            ]
        });
        
        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.addControl(new maplibregl.ScaleControl({maxWidth: 150}));
        layerControl[n] = new MaplibreLayerControl(layers).addTo(map);

        map.on("styledata", (e)=>{
            setMapState();
        });

        map.on("moveend", (e)=>{
            //呼び出し回数を減らすため遅延
            setTimeout(setMapState, 1000);
        });
        map.on("zoomend", (e)=>{
            //呼び出し回数を減らすため遅延
            setTimeout(setMapState, 1000);
        });

        map.on("click", "polygon", (e)=>{
            //console.log(e.features[0]);
            other = Number(!n);
            if(clickedFeature[n] != null){
                map.setFeatureState({
                    source: "polygon",
                    id: clickedFeature[n]
                },{
                    clicked: false
                });
                clickedFeature[n] = null;

                maps[other].getSource("copiedFeature").setData(emptyGeojson);
            }
            if(!e.features[0].state.clicked){
                let start = e.features[0].properties.START;
                if(start == "1889-04-01"){start = "-";}
                let end = e.features[0].properties.END;
                if(end == "2999-12-31"){end = "-";}
                let name = (e.features[0].properties.NAME ?? e.features[0].properties.TYPE);
                if(e.features[0].properties.CODE5 === "01223X"){name = name + "(歯舞群島)";}
                let yomi = "";
                if(e.features[0].properties.CODE6){
                    yomi = filteredNames[n].find(f=>{return f.code6 == [e.features[0].properties.CODE6]});
                    if(yomi){
                        yomi = yomi.yomi;
                    }else{
                        yomi = "???";
                    }
                }
                let table = '<div class="tableTitle">' + name + '</div>' + '<table><tr><th>都道府県</th><td>' + (e.features[0].properties.KEN ?? '') + '</td></tr><tr><th>支庁</th><td>' + (e.features[0].properties.SHICHO ?? '') + '</td></tr><tr><th>郡</th><td>' + (e.features[0].properties.GUN ?? '') + '</td></tr><tr><th>読み</th><td>' + yomi + '</td></tr><tr><th>開始</th><td>' + start + '</td></tr><tr><th>終了</th><td>' + end + '</td></tr></table>';
                //let table = '<div class="tableTitle">' + name + '</div>' + '<table><tr><th>都道府県</th><td>' + (e.features[0].properties.KEN ?? '') + '</td></tr><tr><th>支庁</th><td>' + (e.features[0].properties.SHICHO ?? '') + '</td></tr><tr><th>郡</th><td>' + (e.features[0].properties.GUN ?? '') + '</td></tr><tr><th>開始</th><td>' + start + '</td></tr><tr><th>終了</th><td>' + end + '</td></tr></table>';
                new maplibregl.Popup().setLngLat(e.lngLat).setHTML(table).addTo(map);
                map.setFeatureState({
                    source: "polygon",
                    id: e.features[0].id
                },{
                    clicked: true
                });
                clickedFeature[n] = e.features[0].id;

                let gj = map.querySourceFeatures("polygon", {filter: ["==", ["id"], e.features[0].id]}).reduce((acc, cur)=>{return turf.union(acc, cur)}, turf.polygon([], {}));
                maps[other].getSource("copiedFeature").setData(gj);
            }
        });

        map.on("move", function(e){
            if(!e.sync){
                sync(n);
            }
        });
    
        map.on("mousemove", function(e){
            syncCursor(n, e.lngLat);
        });
        map.on("touchmove", function(e){
            syncCursor(n, e.lngLat);
        });


        map.on("mouseout", syncCursorOff);
        map.on("touchend", syncCursorOff);

        if(!("GUNCOLOR" in geojsonBank.polygon.features[0].properties)){
            console.log("WARNING! : ポリゴンファイルにフィールド「GUNCOLOR」が存在しません。");
        }

        nameFilter(n);

        if(n === 0){
            $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
        }else{
            $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
        }


    });

    let dual = $("#dual");
    dual.on("change", changeDisplay);
    if(urlParams.get("dual") === "true" ?? lsMapState.dual === "true"){
        dual[0].checked = true;
    }else{
        dual[0].checked = false;
    }
    
    let copy = $("#copy");
    copy[0].checked = false;
    copy.on("change", (e)=>{
        if(e.target.checked){
            maps[0].setLayoutProperty("copiedFeature", "visibility", "visible");
            maps[1].setLayoutProperty("copiedFeature", "visibility", "visible");
        }else{
            maps[0].setLayoutProperty("copiedFeature", "visibility", "none");
            maps[1].setLayoutProperty("copiedFeature", "visibility", "none");
        }
    });

    checkOrientation(mediaQ);
    mediaQ.addListener(checkOrientation);

}

function sync(n){
    other = Number(!n); //n=0ならother=1
    maps[other].jumpTo({center: maps[n].getCenter(), zoom: maps[n].getZoom(), bearing: maps[n].getBearing(), pitch: maps[n].getPitch()}, {"sync": true});
}

function syncCursor(n, lngLat){
    other = Number(!n);
    maps[n].setLayoutProperty("syncCursor", "visibility", "none");
    syncCursorGeojson.geometry.coordinates = [lngLat.lng, lngLat.lat];
    maps[other].getSource("syncCursor").setData(syncCursorGeojson);
    maps[other].setLayoutProperty("syncCursor", "visibility", "visible");
}

function syncCursorOff(){
    maps[0].setLayoutProperty("syncCursor", "visibility", "none");
    maps[1].setLayoutProperty("syncCursor", "visibility", "none");
}

function buttonClick(e){
    let n = e.data.n;
    if(n === 0){
        $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "inline");
    }else{
        $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "inline");
    }

    currentDate[n] = dateSelectors[n].commit();
    let fillOpacity;
    if(currentDate[n] < new Date(1947, 4, 3)){
        fillOpacity = 0.3
    }else if(currentDate[n] < new Date(1970, 3, 1)){
        fillOpacity = [
            "case",
            ["boolean", ["feature-state", "clicked"], false],
            0.3,
            ["in", ["get", "KEN"], ["literal", ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "新潟県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]]],
            0.3,
            0
        ];
    }else{
        fillOpacity = [
            "case",
            ["boolean", ["feature-state", "clicked"], false],
            0.3,
            0
        ];
    }
    maps[n].setFilter("polygon", [
        "all",
        ["<=", "START", dateToStr(currentDate[n])],
        [">", "END", dateToStr(currentDate[n])],
        ["!=", "TYPE", "湖"]
    ]);
    maps[n].setPaintProperty("polygon", "fill-opacity", fillOpacity);
    maps[n].setFilter("type_color", [
        "all",
        ["<=", "START", dateToStr(currentDate[n])],
        [">", "END", dateToStr(currentDate[n])],
        ["!=", "TYPE", "湖"]
    ]);
    maps[n].setFilter("gun_color", [
        "all",
        ["<=", "START", dateToStr(currentDate[n])],
        [">", "END", dateToStr(currentDate[n])],
        ["!=", "TYPE", "湖"]
    ]);
    maps[n].setFilter("line", [
        "all",
        ["<=", "START", dateToStr(currentDate[n])],
        [">", "END", dateToStr(currentDate[n])]
    ]);
    maps[n].setFilter("label", [
        "all",
        ["<=", "start", dateToStr(currentDate[n])],
        ["any", [">", "end", dateToStr(currentDate[n])], ["==", "end", ""]]
    ]);
    if(maps[n].getLayer("did")){
        maps[n].setFilter("did", [
            "all",
            ["<=", "START", dateToStr(currentDate[n])],
            [">", "END", dateToStr(currentDate[n])]
        ]);
    }
    if(maps[n].getLayer("railroad_line")){
        maps[n].setFilter("railroad_line", [
            "all",
            ["<=", "START", dateToStr(currentDate[n])],
            [">", "END", dateToStr(currentDate[n])]
        ]);
    }
    if(maps[n].getLayer("railroad_point")){
        maps[n].setFilter("railroad_point", [
            "all",
            ["<=", "START", dateToStr(currentDate[n])],
            [">", "END", dateToStr(currentDate[n])]
        ]);
    }
    if(maps[n].getLayer("railroad_label")){
        maps[n].setFilter("railroad_label", [
            "all",
            ["<=", "START", dateToStr(currentDate[n])],
            [">", "END", dateToStr(currentDate[n])]
        ]);
    }

    nameFilter(n);

    setMapState();

    if(n === 0){
        $("#loaderCoverA, #loaderBGA, #loaderA").css("display", "none");
    }else{
        $("#loaderCoverB, #loaderBGB, #loaderB").css("display", "none");
    }
}

function nameFilter(n){
    filteredNames[n] = geojsonBank.name.features.filter((f)=>{return f.properties.start <= dateToStr(currentDate[n]) && (f.properties.end > dateToStr(currentDate[n]) || f.properties.end == "")}).map(f=>{return f.properties});
}

function dateToStr(date){
    let yyyy = String(date.getFullYear()).padStart(4, "0");
    let mm = String(date.getMonth()+1).padStart(2, "0");
    let dd = String(date.getDate()).padStart(2, "0");
    return yyyy+"-"+mm+"-"+dd;
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
    if($("#dual")[0].checked){    //二画面表示
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
        maps[0].resize();
        $("#copy")[0].disabled = false;
    }else{    //一画面表示
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
        maps[0].resize();
        $("#copy")[0].disabled = true;
    }
}

function getBaseLayerName(n){
    let vis = layerControl[n].layers.filter(l=>{return l.group === "ベースマップ" && l.layerId[0] && maps[n].getLayoutProperty(l.layerId[0], "visibility") === "visible"});
    if(vis.length){
        return vis[0].id;
    }else{
        return "blank";
    }
}

function getColorLayer(n){
    if(maps[n].getLayoutProperty("type_color", "visibility") === "visible"){
        return 1;
    }else if(maps[n].getLayoutProperty("gun_color", "visibility") === "visible"){
        return 2;
    }else{
        return false;
    }
}

function setMapState(){
    if(maps[0].getStyle() && maps[1].getStyle()){
        mapState.x = maps[0].getCenter().lng.toFixed(3);
        mapState.y = maps[0].getCenter().lat.toFixed(3);
        mapState.z = maps[0].getZoom().toFixed(0);
        mapState.date0 = dateToStr(currentDate[0]);
        mapState.date1 = dateToStr(currentDate[1]);
        mapState.base0 = getBaseLayerName(0);
        mapState.base1 = getBaseLayerName(1);
        mapState.label0 = maps[0].getLayoutProperty("label", "visibility") === "visible";
        mapState.label1 = maps[1].getLayoutProperty("label", "visibility") === "visible";
        mapState.color0 = getColorLayer(0);
        mapState.color1 = getColorLayer(1);
        mapState.did0 = Boolean(maps[0].getLayer("did")) && maps[0].getLayoutProperty("did", "visibility") === "visible";
        mapState.did1 = Boolean(maps[1].getLayer("did")) && maps[1].getLayoutProperty("did", "visibility") === "visible";
        mapState.rail0 = Boolean(maps[0].getLayer("railroad_line")) && maps[0].getLayoutProperty("railroad_line", "visibility") === "visible";
        mapState.rail1 = Boolean(maps[1].getLayer("railroad_line")) && maps[1].getLayoutProperty("railroad_line", "visibility") === "visible";
        mapState.dual = $("#dual")[0].checked;
    
        if(!setStateWaiting && localStorage.getItem("hist_mapState") !== JSON.stringify(mapState)){
            localStorage.setItem("hist_mapState", JSON.stringify(mapState));
            history.replaceState("","","?y=" + mapState.y + "&x=" + mapState.x + "&z=" + mapState.z + "&date0=" + mapState.date0 + "&date1=" + mapState.date1 + "&base0=" + mapState.base0 + "&base1=" + mapState.base1 + "&label0=" + mapState.label0 + "&label1=" + mapState.label1 + "&color0=" + mapState.color0 + "&color1=" + mapState.color1 + "&rail0=" + mapState.rail0 + "&rail1=" + mapState.rail1 + "&did0=" + mapState.did0 + "&did1=" + mapState.did1 + "&dual=" + mapState.dual);
            setStateWaiting = true;
            setTimeout(function(){setStateWaiting = false}, 500);
        }
    }
}
