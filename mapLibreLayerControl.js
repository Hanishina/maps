class MaplibreLayerControl{
    //layers
    //[{
    //  layerId: null || style.layer.id || その配列
    //  group: グループの名称
    //  groupType: "checkbox"(default) || "radio" || "checkbox_excl" ※グループの最初のレイヤのみ指定可
    //  name: 表示用レイヤ名称
    //  onChange: onChangeメソッド
    //}]
    //postLoad{
    //  sources: 
    //  layers: {
    //      before: レイヤ順序指定
    //  }
    //}
    static sourceBank = {};

    constructor(layers = [], postLoad = null){
        this.button = $("<button>").html("<i class='fa-solid fa-layer-group'></i>").attr({class: "maplibregl-ctrl maplibreLayerControl_button"});
        this.window = $("<div>").attr({class: "maplibregl-ctrl maplibreLayerControl_window"});
        $("<button>").text("×").attr({class: "maplibreLayerControl_closeBtn"}).css({position: "absolute", top: "0", right: "0"}).on("click", (e)=>{this.close();}).appendTo(this.window);
        $(this.button).on("click", (e)=>{
            this.open();
        });
        this.layers = [];
        this.groups = [];
        this.groupTypes = [];
        this.postLoad = postLoad;
        layers.forEach((l)=>{
            this.addLayer(l);
        });
    }

    addTo(map){
        this.mapDiv = map.getContainer();
        $(this.button).appendTo($(this.mapDiv).find(".maplibregl-ctrl-top-left"));
        this.map = map;
        return this;
    }

    open(){
        this.button.detach();
        this.window.find(".maplibreLayerControl_layer").each((i,l)=>{
            let checkbox = $(l).children("input");
            if($(checkbox).val()){
                this.layers[$(checkbox).val()].layerId.forEach((layerId)=>{
                    if(layerId != null && this.map.getLayer(layerId) && this.map.getLayoutProperty(layerId, "visibility") != "none"){
                        $(checkbox).prop("checked", "checked");
                    }
                });
            }
        });
        this.window.find(".maplibreLayerControl_group").each((i,g)=>{
            if($(g).attr("type") == "radio" && !$(g).find(":checked").length){
                $(g).find("input").filter((i,input)=>{return this.layers[$(input).val()].layerId[0] == null}).each((i,input)=>{
                    $(input).prop("checked", "checked");
                });
            }
        });
        $(this.window).appendTo($(this.mapDiv).find(".maplibregl-ctrl-top-left"));
    }

    close(){
        this.window.detach();
        $(this.button).appendTo($(this.mapDiv).find(".maplibregl-ctrl-top-left"));
    }

    addLayer(l){
        let layerIdx = this.layers.length
        if(!Array.isArray(l.layerId)){
            l.layerId = [l.layerId];
        }
        this.layers.push(l)
        let groupDiv;
        let groupType;
        if(!this.groups.includes(l.group)){
            this.groups.push(l.group);
            this.groupTypes.push(l.groupType || "checkbox");
            groupType = l.groupType || "checkbox";
            groupDiv = $("<div>").attr({class: "maplibreLayerControl_group", type: groupType, name: l.group});
            $("<div>").text(l.group).appendTo(groupDiv);
            groupDiv.appendTo(this.window);
        }else{
            let index = this.groups.findIndex((g)=>{return g == l.group});
            groupDiv = this.window.find(".maplibreLayerControl_group")[index];
            groupType = this.groupTypes[index];
        }
        let layerLabel = $("<label>").attr({class: "maplibreLayerControl_layer"}).text(l.name);
        if(groupType == "checkbox" || groupType == "checkbox_excl"){
            $("<input>").attr({type: "checkbox", value: layerIdx, name: l.group}).prependTo(layerLabel);
        }else if(groupType == "radio"){
            $("<input>").attr({type: "radio", value: layerIdx, name: l.group}).prependTo(layerLabel);
        }
        $("<div>").append(layerLabel).appendTo(groupDiv);
        layerLabel.on("change", (e)=>{
            if($(e.target).parents(".maplibreLayerControl_group").attr("type") == "checkbox"){
                if($(e.target).prop("checked")){
                    this.layers[e.target.value].layerId.forEach((layerId)=>{
                        this.setLayoutProperty(layerId, true);
                    });
                }else{
                    this.layers[e.target.value].layerId.forEach((layerId)=>{
                        this.setLayoutProperty(layerId, false);
                    });
                }
            }else if($(e.target).parents(".maplibreLayerControl_group").attr("type") == "radio" || $(e.target).parents(".maplibreLayerControl_group").attr("type") == "checkbox_excl"){
                let inputs = this.window.find("input[name = '" + e.target.name + "']").filter((i, e2)=>{return e2 != e.target});
                inputs.each((i,input)=>{
                    this.layers[input.value].layerId.forEach((layerId)=>{
                        if(layerId){
                            this.setLayoutProperty(layerId, false);
                        }
                    });
                    $(input).prop("checked", false);
                });
                if(e.target.checked){
                    this.layers[e.target.value].layerId.forEach((layerId)=>{
                        if(layerId){
                            this.setLayoutProperty(layerId, true);
                        }
                    });
                }else{
                    this.layers[e.target.value].layerId.forEach((layerId)=>{
                        if(layerId){
                            this.setLayoutProperty(layerId, false);
                        }
                    });
                }
            }
            if(l.onchange){
                l.onchange(e);
            }
        });
    }

    async setLayoutProperty(layerId, vis = true){
        if(!this.map.getLayer(layerId)){
            let layer = this.postLoad.layers.filter((e)=>{return e.id == layerId})[0];
            let source = this.postLoad.sources[layer.source];
            if(!MaplibreLayerControl.sourceBank[layer.source]){
                await $.getJSON(source.data).done((data)=>{
                    MaplibreLayerControl.sourceBank[layer.source] = data;
                });
            }
            if(!this.map.getSource(layer.source)){
                source.data = MaplibreLayerControl.sourceBank[layer.source];
                this.map.addSource(layer.source, source);
            }
            if(layer.before){
                this.map.addLayer(layer, layer.before);
            }else{
                this.map.addLayer(layer);
            }
        }
        if(vis){
            this.map.setLayoutProperty(layerId, "visibility", "visible");
        }else{
            this.map.setLayoutProperty(layerId, "visibility", "none");
        }
    }
}