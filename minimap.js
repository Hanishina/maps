class Minimap{
    constructor(element, option={}){
        /*
        option:{backgroundColor}
        */
        this.app = new PIXI.Application({
            width: $(element)[0].clientWidth || 500,
            height: $(element)[0].clientHeight || 500,
            backgroundColor: option.backgroundColor || "#ddffff",
            antialias: true
        });
        $(element).append(this.app.view);
        this.layers = {};
    }

    addLayer(layerName){
        this.layers[layerName] = new PIXI.Container();
        this.app.stage.addChild(this.layers[layerName]);
    }

    deleteLayer(layerName){
        this.app.stage.removeChild(this.layers[layerName]);
        delete this.layers[layerName];
    }

    clearLayer(layerName){
        this.layers[layerName].removeChildren();
    }

    setScale(geojson, offset=10){
        this.boundbox = Minimap.getBounds(geojson.features);
        let scaleWE = (this.app.screen.width-20) / (this.boundbox[2] - this.boundbox[0]);
        let scaleNS = (this.app.screen.height-20) / (this.boundbox[3] - this.boundbox[1]);
        this.scale = Math.min(scaleWE, scaleNS);
        //beforeOffset = [-boundbox[0], -boundbox[3]];
        //afterOffset = [(app.screen.width-20 - scale*(boundbox[2] - boundbox[0]))/2 + 10, (app.screen.height-20 - scale*(boundbox[3] - boundbox[1]))/2 + 10]
        this.offset = [-this.scale*(this.boundbox[0] + (this.boundbox[2]-this.boundbox[0])/2) + this.app.screen.width/2, -this.scale*(-this.boundbox[1] - (this.boundbox[3]-this.boundbox[1])/2) + this.app.screen.height/2]
    }

    addData(geojson, style, layerName=null){
        geojson.features.forEach((feature)=>{
            let shape = new PIXI.Graphics();
            shape.beginFill(style.fill || "#ffcccc");
            shape.lineStyle(style.line);
            feature.geometry.coordinates.forEach((singlePolygon)=>{
                singlePolygon.forEach((ring, ringId)=>{
                    ring.forEach((point, i)=>{
                        if(i==0){
                            if(ringId == 0){
                                //shape.moveTo((point[0]+beforeOffset[0])*scale+afterOffset[0], (point[1]+beforeOffset[1])*-scale+afterOffset[1]);
                                shape.endHole();
                                shape.moveTo(point[0]*this.scale+this.offset[0], point[1]*-this.scale+this.offset[1]);
                            }else{
                                //穴
                                shape.beginHole();
                                shape.moveTo(point[0]*this.scale+this.offset[0], point[1]*-this.scale+this.offset[1]);
                            }
                        }else{
                            //shape.lineTo((point[0]+beforeOffset[0])*scale+afterOffset[0], (point[1]+beforeOffset[1])*-scale+afterOffset[1]);
                            shape.lineTo(point[0]*this.scale+this.offset[0], point[1]*-this.scale+this.offset[1])
                        }
                    });
                });
            });
            //shape.x = afterOffset[0];
            //shape.y = afterOffset[1];
            shape.closePath();
            if(layerName){
                this.layers[layerName].addChild(shape);
            }else{
                this.app.stage.addChild(shape);
            }
        });
    }

    static toMercator(geojson){
        geojson.features.forEach((f, i, a)=>{
            a[i].geometry.coordinates = f.geometry.coordinates.map((polygon)=>{
                return polygon.map((ring)=>{
                    return ring.map((point)=>{
                        return proj4("EPSG:4326", "EPSG:3857", point);
                    });
                });
            });
        });
        return geojson;
    }

    static getBounds(features){
        let xMax = -Infinity;
        let xMin = Infinity;
        let yMax = -Infinity;
        let yMin = Infinity;
        features.forEach((f)=>{
            let xs = f.geometry.coordinates.flat(Infinity).filter((v,i)=>{return i%2==0});
            let ys = f.geometry.coordinates.flat(Infinity).filter((v,i)=>{return i%2==1});
            xMax = Math.max(xMax, ...xs);
            xMin = Math.min(xMin, ...xs);
            yMax = Math.max(yMax, ...ys);
            yMin = Math.min(yMin, ...ys);
        });
        return [xMin, yMin, xMax, yMax];
    }
}