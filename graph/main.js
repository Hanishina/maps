let exportData = [];
let ken = "沖縄県"; //←ここと

window.onload = function(){
  const dataArr = [];
  const req = new XMLHttpRequest();
  req.open("get", "./data/47.csv"); //←ここを変更
  req.send(null);

  req.onload = function(){
    const tmp = req.responseText.split("\n");
    for(let i=0; i<tmp.length; i++){
      dataArr[i] = tmp[i].split(",");
    }
    console.log(dataArr);

    for(let count = 0; count <=3; count++){
      let svg;
      let zoomRate;
      if(count == 0){
        svg = document.getElementById("graphA");
        zoomRate = -160;
      }else if(count == 1){
        svg = document.getElementById("graphB");
        zoomRate = -400;
      }else if(count == 2){
        svg = document.getElementById("graphC");
        zoomRate = -1000;
      }else{
        svg = document.getElementById("graphD");
        zoomRate = -1600;
      }
      const svgDoc = svg.contentDocument
      const lineArea = svgDoc.getElementById("lineArea");
      const dotArea = svgDoc.getElementById("dotArea");
      const labelArea = svgDoc.getElementById("labelArea");

      dataArr.forEach(function(law){
        let popArr = [law[3], law[4], law[5], law[6], law[7], law[8], law[9], law[10], law[11], law[12], law[13], law[14]];
        let mergeArr = [law[15], law[16], law[17], law[18], law[19], law[20], law[21], law[22], law[23], law[24], law[25], law[26]];

        popArr.forEach(function(elem, i){
          if (elem){
            const dot = svgDoc.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("id", law[0] + i);
            dot.setAttribute("cx", 100 * i);
            dot.setAttribute('cy', elem / zoomRate);
            dot.setAttribute("r","5");
            dot.setAttribute("fill",law[2]);
            if(mergeArr[i] == 2){
              dot.setAttribute("display", "none");
            }
            dotArea.appendChild(dot);
          }
        });

        const dotsA = [svgDoc.getElementById(law[0] + "0"), svgDoc.getElementById(law[0] + "1"), svgDoc.getElementById(law[0] + "2"), svgDoc.getElementById(law[0] + "3"), svgDoc.getElementById(law[0] + "4"), svgDoc.getElementById(law[0] + "5"), svgDoc.getElementById(law[0] + "6"), svgDoc.getElementById(law[0] + "7"), svgDoc.getElementById(law[0] + "8"), svgDoc.getElementById(law[0] + "9"), svgDoc.getElementById(law[0] + "10"), svgDoc.getElementById(law[0] + "11")]
        const ysA = [];
        dotsA.forEach(function(elem){
          if(elem == null){
            ysA.push(null);
          }else{
            ysA.push(elem.getAttribute("cy"));
          }
        });

        const label = svgDoc.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", 1100 + 5);
        if (typeof (popArr[popArr.length - 1]) == "undefined"){
          label.setAttribute("y", 0 / zoomRate + 6);
        }else{
          label.setAttribute("y", popArr[popArr.length - 1] / zoomRate + 6);
        }
        label.setAttribute("fill", law[2]);
        label.textContent = law[0];
        labelArea.appendChild(label);

        for(let i = 0; i <= 10; i++){
          const line = svgDoc.createElementNS("http://www.w3.org/2000/svg", "path");
          line.setAttribute("d", "M " + 100*i + " " + ysA[i] +  "L " + 100*(i+1) + " " + ysA[i+1]);
          line.setAttribute("stroke",law[2]);
          line.setAttribute("stroke-width", "2px");
          if(mergeArr[i+1] > 0){
            line.setAttribute("stroke-dasharray", "5,5");
          }
          lineArea.appendChild(line);
        };
      });

      const graphTitle = svgDoc.getElementById("graphTitle");
      if(count == 0){
        graphTitle.textContent = ken + "の市の人口推移(A)";
      }else if(count == 1){
        graphTitle.textContent = ken + "の市の人口推移(B)";
      }else if(count == 2){
        graphTitle.textContent = ken + "の市の人口推移(C)";
      }else{
        graphTitle.textContent = ken + "の市の人口推移(D)";
      }

      const serializer = new XMLSerializer();
      exportData.push(serializer.serializeToString(svgDoc));

    }

  }

};

var btnA = document.getElementById("btnA");
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
}, false);
