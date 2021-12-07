
let kenArr = [{code: "01", name: "北海道"}, {code: "02", name: "青森県"}, {code: "03", name: "岩手県"}, {code: "04", name: "宮城県"}, {code: "05", name: "秋田県"}, {code: "06", name: "山形県"}, {code: "07", name: "福島県"}, {code: "08", name: "茨城県"}, {code: "09", name: "栃木県"}, {code: "10", name: "群馬県"}
, {code: "11", name: "埼玉県"}, {code: "12", name: "千葉県"}, {code: "13", name: "東京都"}, {code: "14", name: "神奈川県"}, {code: "15", name: "新潟県"}, {code: "16", name: "富山県"}, {code: "17", name: "石川県"}, {code: "18", name: "福井県"}, {code: "19", name: "山梨県"}, {code: "20", name: "長野県"}
, {code: "21", name: "岐阜県"}, {code: "22", name: "静岡県"}, {code: "23", name: "愛知県"}, {code: "24", name: "三重県"}, {code: "25", name: "滋賀県"}, {code: "26", name: "京都府"}, {code: "27", name: "大阪府"}, {code: "28", name: "兵庫県"}, {code: "29", name: "奈良県"}, {code: "30", name: "和歌山県"}
, {code: "31", name: "鳥取県"}, {code: "32", name: "島根県"}, {code: "33", name: "岡山県"}, {code: "34", name: "広島県"}, {code: "35", name: "山口県"}, {code: "36", name: "徳島県"}, {code: "37", name: "香川県"}, {code: "38", name: "愛媛県"}, {code: "39", name: "高知県"}, {code: "40", name: "福岡県"}
, {code: "41", name: "佐賀県"}, {code: "42", name: "長崎県"}, {code: "43", name: "熊本県"}, {code: "44", name: "大分県"}, {code: "45", name: "宮崎県"}, {code: "46", name: "鹿児島県"}, {code: "47", name: "沖縄県"}
, {code: "50", name: "全国", cond:"(50万以上)"}, {code: "52", name: "東北地方", cond:"(10万以上)"}, {code: "53", name: "関東地方", cond:"(30万以上)"}, {code: "54", name: "北陸甲信越地方", cond:"(10万以上)"}, {code: "55", name: "東海地方", cond:"(15万以上)"}, {code: "56", name: "近畿地方", cond:"(20万以上)"}, {code: "57", name: "中国地方", cond:"(10万以上)"}, {code: "58", name: "四国地方", cond:"(10万以上)"}, {code: "59", name: "九州地方", cond:"(15万以上)"}];

window.onload = function(){
  let zoomRate = -50 * 1.2 ** 5;
  let sliderTrans = 50;
  let svgDoc;
  let lineArea;
  let dotArea;
  let labelArea;
  let axisLabelArea;
  let highlightArea;
  let mouseoverArea;
  let dataArr = [];
  let req = new XMLHttpRequest();
  req.open("get", "./graph/data/01.csv");
  req.send(null);

  req.onload = init;

  let svg = document.getElementById("graphA");
  svgDoc = svg.contentDocument;
  baselineArea = svgDoc.getElementById("baselineArea");
  lineArea = svgDoc.getElementById("lineArea");
  dotArea = svgDoc.getElementById("dotArea");
  labelArea = svgDoc.getElementById("labelArea");
  axisLabelArea = svgDoc.getElementById("axisLabelArea");
  highlightArea = svgDoc.getElementById("highlightArea");
  mouseoverArea = svgDoc.getElementById("mouseoverArea");


  $(svgDoc).find(".zoomBtn").on({"mouseenter": (e)=>{
    $(e.currentTarget.children[0]).attr("fill", "#aaa");
  }, "mouseleave": (e)=>{
    $(e.currentTarget.children[0]).attr("fill", "#fff");
  }});

  $(svgDoc).find("#plus").on("click", ()=>{plus()});
  $(svgDoc).find("#minus").on("click", ()=>{minus()});

  $(svgDoc).find("#slideKnob").attr("transform", "translate(0, 50)");

  $(svgDoc).find("#slideKnob").on("mousedown touchstart", (e)=>{
    e.preventDefault();
    $(svgDoc).on("mousemove touchmove", (e)=>{
      let YOnDoc = e.clientY || e.touches[0].clientY;
      if((200 - YOnDoc) <= 0 && (200 - YOnDoc) >= -320){
        let newSliderTrans = ((200 - YOnDoc)/10).toFixed() * -10;
        if(sliderTrans !== newSliderTrans){
          sliderTrans = newSliderTrans;
          deleteGraph();
          $(svgDoc).find("#slideKnob").attr("transform", "translate(0, " + sliderTrans + ")");
          zoomRate = -50 * 1.2 ** (sliderTrans/10);
          write();
        }
      }
    });
  });

  $(svgDoc).on("mouseup touchend", (e)=>{
    $(svgDoc).off("mousemove touchmove");
  });

  svgDoc.addEventListener("wheel", (e)=>{
    e.preventDefault();
    if(e.deltaY >= 0){
      minus();
    }else{
      plus();
    }
  }, {passive: false});

  kenArr.forEach((e)=>{
    $("#select").append($("<option>").html(e.name + (e.cond || "")).val(e.code));
  });

  $("#select").on("change", selectKen);

  function init(){
    let tmp = req.responseText.replaceAll("\r", ""); //改行コードを\nに変換
    tmp = tmp.split("\n");
    for(let i=0; i<tmp.length; i++){
      dataArr[i] = tmp[i].split(",");
    }

    write();

  }

  function write(){
    let unit;
    if(zoomRate<=-10000){
      unit = 1000000;
    }else if(zoomRate<=-5000){
      unit = 500000;
    }else if(zoomRate<=-4000){
      unit = 400000;
    }else if(zoomRate<=-2000){
      unit = 200000;
    }else if(zoomRate<=-1000){
      unit = 100000;
    }else if(zoomRate<=-500){
      unit = 50000;
    }else if(zoomRate<=-400){
      unit = 40000;
    }else if(zoomRate<=-200){
      unit = 20000;
    }else{
      unit = 10000;
    }
    for(i=0; i<14; i++){
      const axis = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
      axis.setAttribute("d", "M 0 " + unit/zoomRate*i + " H 1200");
      baselineArea.appendChild(axis);

      const axisLabel = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      axisLabel.textContent = unit*i;
      axisLabel.setAttribute("x", "-5");
      axisLabel.setAttribute("y", unit/zoomRate*i);
      axisLabel.setAttribute("text-anchor", "end");
      axisLabelArea.appendChild(axisLabel);
    }

    dataArr.forEach(function(row){
      let popArr = [row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13], row[14], row[15]];
      let mergeArr = [row[16], row[17], row[18], row[19], row[20], row[21], row[22], row[23], row[24], row[25], row[26], row[27], row[28]];

      popArr.forEach(function(elem, i){
        if (elem){
          const dot = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("id", row[0] + i);
          dot.setAttribute("class", "dot");
          dot.setAttribute("name", row[0]);
          dot.setAttribute("cx", 100 * i);
          dot.setAttribute('cy', elem / zoomRate);
          dot.setAttribute("r","5");
          dot.setAttribute("fill", row[2]);
          if(mergeArr[i] == 2 || mergeArr[i] == -1){
            dot.setAttribute("display", "none");
          }
          dotArea.appendChild(dot);

          const mousecircle = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
          mousecircle.setAttribute("id", row[0] + i);
          mousecircle.setAttribute("class", "pointer");
          mousecircle.setAttribute("name", row[0]);
          mousecircle.setAttribute("year", i*5+1960);
          mousecircle.setAttribute("pop", elem);
          mousecircle.setAttribute("cx", 100 * i);
          mousecircle.setAttribute('cy', elem / zoomRate);
          mousecircle.setAttribute("r","10");
          mousecircle.setAttribute("fill-opacity", 0);
          if(mergeArr[i] == 2 || mergeArr[i] == -1){
            mousecircle.setAttribute("display", "none");
          }
          mouseoverArea.appendChild(mousecircle);
        }
      });

      const dotsA = [svgDoc.getElementById(row[0] + "0"), svgDoc.getElementById(row[0] + "1"), svgDoc.getElementById(row[0] + "2"), svgDoc.getElementById(row[0] + "3"), svgDoc.getElementById(row[0] + "4"), svgDoc.getElementById(row[0] + "5"), svgDoc.getElementById(row[0] + "6"), svgDoc.getElementById(row[0] + "7"), svgDoc.getElementById(row[0] + "8"), svgDoc.getElementById(row[0] + "9"), svgDoc.getElementById(row[0] + "10"), svgDoc.getElementById(row[0] + "11"), svgDoc.getElementById(row[0] + "12")]
      const ysA = [];
      dotsA.forEach(function(elem){
        if(elem == null){
          ysA.push(null);
        }else{
          ysA.push(elem.getAttribute("cy"));
        }
      });

      const label = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
      var lastIndex = Math.max(mergeArr.lastIndexOf("0"), mergeArr.lastIndexOf("1")); //グラフの末尾位置
      label.setAttribute("x", lastIndex * 100 + 5);
      label.setAttribute("y", popArr[lastIndex] / zoomRate + 6);
      label.setAttribute("fill", row[2]);
      label.textContent = row[0];
      labelArea.appendChild(label);

      for(let i = 0; i <= 11; i++){
        if(ysA[i] != null && ysA[i+1] != null){
          const line = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
          line.setAttribute("class", "line");
          line.setAttribute("name", row[0]);
          line.setAttribute("d", "M " + 100*i + " " + ysA[i] +  "L " + 100*(i+1) + " " + ysA[i+1]);
          line.setAttribute("stroke",row[2]);
          line.setAttribute("stroke-width", "2px");
          if(mergeArr[i+1] > 0){
            line.setAttribute("stroke-dasharray", "5,5");
          }
          lineArea.appendChild(line);
        }
      }
    });

    const graphTitle = svgDoc.getElementById("graphTitle");
    graphTitle.textContent = kenArr.find((e)=>e.code === $("select option:selected").val()).name + "の市の人口推移";

    $(svgDoc).find(".pointer").on("mouseover", (e)=>{
      //ポップアップ表示
      $(svgDoc).find("#popupText1").text(e.target.getAttribute("name"));
      $(svgDoc).find("#popupText2").text(e.target.getAttribute("year") + "年");
      $(svgDoc).find("#popupText3").text(e.target.getAttribute("pop") + "人");
      $(svgDoc).find(".popup").each((i, elem)=>{
        elem.setAttribute("display", "");
        elem.setAttribute("transform", "translate(" + e.target.getAttribute("cx") + ", " + (e.target.getAttribute("cy") - 5) + ")");
      });

      //グラフハイライト
      let hlDots = $(svgDoc).find(".dot[name=" + e.target.getAttribute("name") + "]").clone();
      hlDots.each((i, elem)=>{
        elem.removeAttribute("id");
        elem.setAttribute("class", "highlight");
        elem.setAttribute("r", "6");
        elem.setAttribute("stroke", "#333");
        elem.setAttribute("stroke-width", "3");
        highlightArea.appendChild(elem);
      });

    })

    $(svgDoc).find(".pointer").on("mouseout", (e)=>{
      $(svgDoc).find(".popup").each((i, elem)=>{
        elem.setAttribute("display", "none");
      });

      removeChildren(highlightArea);
    });

    $(svgDoc).find("text").each((i, elem)=>{
      $(elem).css("user-select", "none");
    });

    /*const serializer = new XMLSerializer();
    exportData.push(serializer.serializeToString(svgDoc));*/

  }

  function deleteGraph(){
    removeChildren(baselineArea);
    removeChildren(lineArea);
    removeChildren(dotArea);
    removeChildren(labelArea);
    removeChildren(axisLabelArea);
    removeChildren(highlightArea);
    removeChildren(mouseoverArea);
    $(svgDoc).find(".popup").each((i, elem)=>{
      elem.setAttribute("display", "none");
    });
  }

  function removeChildren(elem){
    while(elem.firstChild){
      elem.removeChild(elem.firstChild);
    }
  }

  function plus(){
    deleteGraph();
    zoomRate = zoomRate / 1.2;
    sliderTrans = sliderTrans - 10;
    if(sliderTrans < 0){
      zoomRate = -50;
      sliderTrans = 0;
    }
    write();
    $(svgDoc).find("#slideKnob").attr("transform", "translate(0, " + sliderTrans + ")");
  }

  function minus(){
    deleteGraph();
    zoomRate = zoomRate * 1.2;
    sliderTrans = sliderTrans + 10;
    if(sliderTrans > 320){
      zoomRate = -50 * 1.2 ** 32;
      sliderTrans = 320;
    }
    write();
    $(svgDoc).find("#slideKnob").attr("transform", "translate(0, " + sliderTrans + ")");
  }

  function selectKen(){
    deleteGraph();
    $(svgDoc).find("#graphTitle").text("読み込み中...");
    dataArr = [];
    if($("select option:selected").val() == 50){
      sliderTrans = 200;
      zoomRate = -50 * 1.2 ** 20;
    }else if($("select option:selected").val() > 50){
      sliderTrans = 100;
      zoomRate = -50 * 1.2 ** 10;
    }else{
      sliderTrans = 50;
      zoomRate = -50 * 1.2 ** 5;
    }
    $(svgDoc).find("#slideKnob").attr("transform", "translate(0, " + sliderTrans + ")");
    req = new XMLHttpRequest();
    req.open("get", "./graph/data/" + $("select").val() + ".csv");
    req.send(null);
    req.onload = init;
  }

}

/*var btnA = document.getElementById("btnA");
btnA.addEventListener("click", function(){
  let blob = new Blob([exportData[0]], {type:"text/xml"});
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'graph.svg';
  link.click();
}, false);

var btnB = document.getElementById("btnB");
btnB.addEventListener("click", function(){
  let blob = new Blob([exportData[1]], {type:"text/xml"});
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'graph.svg';
  link.click();
}, false);

var btnC = document.getElementById("btnC");
btnC.addEventListener("click", function(){
  let blob = new Blob([exportData[2]], {type:"text/xml"});
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'graph.svg';
  link.click();
}, false);

var btnD = document.getElementById("btnD");
btnD.addEventListener("click", function(){
  let blob = new Blob([exportData[3]], {type:"text/xml"});
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'graph.svg';
  link.click();
}, false);*/
