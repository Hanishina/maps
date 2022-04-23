let gotData = {}

let year;
let color;

let sliderTrans = 1000;

let curData;
let svg;
let chartArea;
let labelArea;

window.onload = async function(){
  svg = $("#graph")[0].contentDocument;
  chartArea = $(svg).find("#chartArea");
  labelArea = $(svg).find("#labelArea");

  slider = $("#slider")[0].contentDocument;

  $(slider).find("text").each((i, elem)=>{
    $(elem).css({"user-select": "none", "pointer-events": "none"});
  });

  $(slider).find("#slideKnob").attr("transform", "translate(1000, 0)");

  $(slider).find("#slideKnob").on("mousedown touchstart", (e)=>{
    e.preventDefault();
    $(slider).on("mousemove touchmove", async (e)=>{
      let XOnDoc = e.clientX || e.touches[0].clientX;
      if((XOnDoc - 100) >= 0 && (XOnDoc - 100) <= 1000){
        let newSliderTrans = ((XOnDoc - 100)/100).toFixed() * 100;
        if(sliderTrans !== newSliderTrans){
          chartClear();
          sliderTrans = newSliderTrans;
          $(slider).find("#slideKnob").attr("transform", "translate(" + sliderTrans + ", 0)");

          year = 1970 + (sliderTrans/20);

          if(!gotData[year]){
            await $.getJSON("./proportions/data/" + year + ".json", (json)=>{
              gotData[year] = json;
            });
          }
          curData = gotData[year];
          chartWrite();
        }
      }
    });
  });

  $(slider).on("mouseup touchend", (e)=>{
    $(slider).off("mousemove touchmove");
  });

  $(slider).find(".clickArea").on("mouseup touchend", async (e)=>{
    chartClear();
    year = $(e.target).attr("year");
    sliderTrans = (year - 1970) * 20;
    $(slider).find("#slideKnob").attr("transform", "translate(" + sliderTrans + ", 0)");

    if(!gotData[year]){
      await $.getJSON("./proportions/data/" + year + ".json", (json)=>{
        gotData[year] = json;
      });
    }
    curData = gotData[year];
    chartWrite();
  });

  await $.getJSON("./proportions/data/2020.json", (json)=>{
    gotData[2020] = json;
  });
  curData = gotData[2020];
  chartClear();
  chartWrite();


}

function chartClear(){
  $(chartArea).empty();
  $(labelArea).empty();
}

function chartWrite(){
  curData.forEach((pref, i)=>{
    let kenName = svg.createElementNS("http://www.w3.org/2000/svg", "text");
    $(kenName).text(pref.name);
    $(kenName).attr({x: -3, y: 60*(i+1)+20, "text-anchor": "end"});
    $(kenName).appendTo(labelArea);

    let totalPop = svg.createElementNS("http://www.w3.org/2000/svg", "text");
    $(totalPop).text(pref.all.toLocaleString() + "人");
    $(totalPop).attr({x: -3, y: 60*(i+1)+40, "text-anchor": "end", "font-size": 14});
    $(totalPop).appendTo(labelArea);

    let x = 0;
    if(pref.name === "東京都"){
      let rectWard = svg.createElementNS("http://www.w3.org/2000/svg", "rect");
      $(rectWard).attr({x: x, y: 60*(i+1), width: pref.ward / pref.all * 1000, height: 30, fill: "#ffbae2"});
      $(rectWard).appendTo(chartArea);

      let textWard = svg.createElementNS("http://www.w3.org/2000/svg", "text");
      $(textWard).text("特別区部：" + (pref.ward / pref.all * 100).toFixed(1) + "％");
      $(textWard).attr({x: x + 3, y: 60*(i+1)+45, "font-size": 14});
      $(textWard).appendTo(labelArea);

      x = pref.ward / pref.all * 1000;
    }

    let rectCity = svg.createElementNS("http://www.w3.org/2000/svg", "rect");
    $(rectCity).attr({x: x, y: 60*(i+1), width: pref.city / pref.all * 1000, height: 30, fill: "#ffca8b"});
    $(rectCity).appendTo(chartArea);

    let textCity = svg.createElementNS("http://www.w3.org/2000/svg", "text");
    $(textCity).text("市部：" + (pref.city / pref.all * 100).toFixed(1) + "％");
    $(textCity).attr({x: x + 3, y: 60*(i+1)+45, "font-size": 14});
    $(textCity).appendTo(labelArea);

    x = x + pref.city / pref.all * 1000;

    let rectDist = svg.createElementNS("http://www.w3.org/2000/svg", "rect");
    $(rectDist).attr({x: x, y: 60*(i+1), width: pref.district / pref.all * 1000, height: 30, fill: "#95c2ff"});
    $(rectDist).appendTo(chartArea);

    let textDist = svg.createElementNS("http://www.w3.org/2000/svg", "text");
    $(textDist).text("郡部：" + (pref.district / pref.all * 100).toFixed(1) + "％");
    $(textDist).attr({x: 997, y: 60*(i+1)+45, "text-anchor": "end", "font-size": 14});
    $(textDist).appendTo(labelArea);

    if(pref.name === "東京都"){
      let x = 0;
      pref.majorWards.forEach((city, j, cities)=>{
        let rect = svg.createElementNS("http://www.w3.org/2000/svg", "rect");
        $(rect).attr({x: x, y: 60*(i+1), width: city.pop / pref.all * 1000, height: 30, fill: "#ffbae2", name: city.name, pop: city.pop, prop: (city.pop / pref.all * 100).toFixed(1)});
        if(city.kencho){
          $(rect).attr("fill", "#dd9364");
        }
        $(rect).on("mouseover", popup);
        $(rect).on("mouseleave", hidePopup);
        $(rect).appendTo(chartArea);

        let cityName = svg.createElementNS("http://www.w3.org/2000/svg", "text");
        $(cityName).text(city.name);
        $(cityName).attr({x: x+3, y: 60*(i+1)+20});
        $(cityName).appendTo(labelArea);

        //文字がはみ出す場合
        if(cityName.getBBox().width + 6 > rect.getBBox().width){
          let scaleX =  rect.getBBox().width / (cityName.getBBox().width + 6);
          $(cityName).css({transform: "scale(" + scaleX + ", 1)", "transform-origin": (x+3) + "px 0px"});
        }

        x = x + (city.pop / pref.all * 1000);
      });
    }

    x = 0;
    pref.majorCities.forEach((city, j, cities)=>{
      let rect = svg.createElementNS("http://www.w3.org/2000/svg", "rect");
      $(rect).attr({x: x, y: 60*(i+1), width: city.pop / pref.all * 1000, height: 30, fill: "#ffca8b", name: city.name, pop: city.pop, prop: (city.pop / pref.all * 100).toFixed(1)});
      if(city.kencho){
        $(rect).attr("fill", "#dd9364");
      }
      $(rect).on("mouseover", popup);
      $(rect).on("mouseleave", hidePopup);
      $(rect).appendTo(chartArea);

      let cityName = svg.createElementNS("http://www.w3.org/2000/svg", "text");
      $(cityName).text(city.name);
      $(cityName).attr({x: x+3, y: 60*(i+1)+20});
      $(cityName).appendTo(labelArea);

      //文字がはみ出す場合
      if(cityName.getBBox().width + 6 > rect.getBBox().width){
        let scaleX =  rect.getBBox().width / (cityName.getBBox().width + 6);
        $(cityName).css({transform: "scale(" + scaleX + ", 1)", "transform-origin": x + "px 0px"});
      }

      x = x + (city.pop / pref.all * 1000);
    });
  });

  $(svg).find("text").each((i, elem)=>{
    $(elem).css({"user-select": "none", "pointer-events": "none"});
  });


}

function popup(e){
  color = $(e.target).attr("fill");
  $(e.target).attr("fill", "#ff4e4e");
  let centerX = Number(e.target.getAttribute("x")) + Number(e.target.getAttribute("width")) / 2;
  let centerY = Number(e.target.getAttribute("y")) + 5;
  let secondText = Number(e.target.getAttribute("pop")).toLocaleString() + "人(" + e.target.getAttribute("prop") + "％)"
  $(svg).find("#popupText1").text(e.target.getAttribute("name"));
  $(svg).find("#popupText2").text(secondText);
  $(svg).find(".popup").each((i, elem)=>{
    elem.setAttribute("display", "");
    elem.setAttribute("transform", "translate(" + centerX + ", " + centerY + ")");
  });
}

function hidePopup(e){
  $(e.target).attr("fill", color);
  $(svg).find(".popup").each((i, elem)=>{
    elem.setAttribute("display", "none");
  });
}
