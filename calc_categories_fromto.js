let Categories_kokusei2020move = [{name: "move", label: "移動人口", data:[
  {name: "POPULATION", label: "2020年総人口", func: "sum", args:["POPULATION"]},
  {name: "NOMOVE", label: "移動なし", func: "sum", args:["NOMOVE"]},
  {name: "DOMESTIC", label: "市区町村内移動", singleOnly: true,  func: "custom", args:"\domestic"},
  {name: "DOMESTIC", label: "グループ内移動", groupOnly: true,  func: "custom", args:"\domestic"},
  {name: "MOVEIN_JP", label: "転入(国内)", func: "custom", args:"MOVEIN_JP,-,\domestic"},
  {name: "MOVEIN_ABR", label: "転入(海外・移動元不詳)", func: "custom", args:"MOVEIN_ABR,+,MOVEIN_UNK"},
  {name: "UNKNOWN", label: "移動状況不詳", func: "sum", args:["UNKNOWN"]},
  {name: "MOVEOUT", label: "転出", func: "custom", args:"MOVEOUT_JP,-,\domestic", desc: "海外を含まない"},
  {name: "move_dist", label: "転入超過数(国内)", func: "custom", args:"MOVEIN_JP,-,MOVEOUT_JP", desc: "海外を含まない"}
]},{name: "fromto", data:[
  {name: "move", label: "A→B移動人口", func: "custom", args:"\move"},
  {name: "move_dist", label: "A→B転入超過数", func: "custom", args:"\move,-,\revMove"},
  {name: "move_spRA", label: "A転出者に占めるBへの移動者割合", func: "custom", prec: 2, args:"\move,/,MOVEOUT_JP,*,100", ab: "A"},
  {name: "move_spRB", label: "B転入者に占めるAからの移動者割合", func: "custom", prec: 2, args:"\move,/,MOVEIN_JP,*,100", ab: "B"}
]},{name: "csv", data:[
  {name: "POPULATION", label: "2020年総人口", func: "sum", args:["POPULATION"]},
  {name: "NOMOVE", label: "移動なし", func: "sum", args:["NOMOVE"]},
  {name: "DOMESTIC", label: "市区町村内移動", singleOnly: true,  func: "custom", args:"\domestic"},
  {name: "DOMESTIC", label: "グループ内移動", groupOnly: true,  func: "custom", args:"\domestic"},
  {name: "MOVEIN_JP", label: "転入(国内)", func: "custom", args:"MOVEIN_JP,-,\domestic"},
  {name: "MOVEIN_ABR", label: "転入(海外・移動元不詳)", func: "custom", args:"MOVEIN_ABR,+,MOVEIN_UNK"},
  {name: "UNKNOWN", label: "移動状況不詳", func: "sum", args:["UNKNOWN"]},
  {name: "MOVEOUT", label: "転出", func: "custom", args:"MOVEOUT_JP,-,\domestic", desc: "海外を含まない"},
  {name: "move_dist", label: "転入超過数(国内)", func: "custom", args:"MOVEIN_JP,-,MOVEOUT_JP", desc: "海外を含まない"}
]}];

let Categories_kokusei2020work = [{name: "work", label: "通勤・通学者人口", data:[
  {name: "POPULATION", label: "夜間人口", func: "sum", args:["POPULATION"]},
  {name: "POP_DAY", label: "昼間人口", func: "sum", args:["POP_DAY"]},
  {name: "NOCOMMUTE", label: "通勤なし", func: "sum", args:["NOCOMMUTE"]},
  {name: "DOMESTIC", label: "市区町村内で従業", singleOnly: true, func: "custom", args:"\domestic"},
  {name: "DOMESTIC", label: "グループ内で従業", groupOnly: true, func: "custom", args:"\domestic"},
  {name: "WORKOUT", label: "市区町村外への通勤者数", singleOnly: true, func: "custom", args:"COMMUTE_JP,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKOUT", label: "グループ外への通勤者数", groupOnly: true, func: "custom", args:"COMMUTE_JP,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKIN", label: "市区町村外からの通勤者数", singleOnly: true, func: "custom", args:"WORKER,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKIN", label: "グループ外からの通勤者数", groupOnly: true, func: "custom", args:"WORKER,-,\domestic", desc: "海外および不詳を除く"}
]},{name: "fromto", data:[
  {name: "move", label: "A→B通勤人口", func: "custom", args:"\move"},
  {name: "move_dist", label: "A→B通勤超過数", func: "custom", args:"\move,-,\revMove"},
  {name: "move_spRA", label: "A常住労働者に占めるBへの通勤者割合", func: "custom", prec: 2, args:"\move,/,COMMUTE_JP,*,100", ab: "A"},
  {name: "move_spRB", label: "B従業労働者に占めるAからの通勤者割合", func: "custom", prec: 2, args:"\move,/,WORKER,*,100", ab: "B"}
]},{name: "csv", data:[
  {name: "POPULATION", label: "夜間人口", func: "sum", args:["POPULATION"]},
  {name: "POP_DAY", label: "昼間人口", func: "sum", args:["POP_DAY"]},
  {name: "NOCOMMUTE", label: "通勤なし", func: "sum", args:["NOCOMMUTE"]},
  {name: "DOMESTIC", label: "市区町村内で従業", singleOnly: true, func: "custom", args:"\domestic"},
  {name: "DOMESTIC", label: "グループ内で従業", groupOnly: true, func: "custom", args:"\domestic"},
  {name: "WORKOUT", label: "市区町村外への通勤者数", singleOnly: true, func: "custom", args:"COMMUTE_JP,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKOUT", label: "グループ外への通勤者数", groupOnly: true, func: "custom", args:"COMMUTE_JP,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKIN", label: "市区町村外からの通勤者数", singleOnly: true, func: "custom", args:"WORKER,-,\domestic", desc: "海外および不詳を除く"},
  {name: "WORKIN", label: "グループ外からの通勤者数", groupOnly: true, func: "custom", args:"WORKER,-,\domestic", desc: "海外および不詳を除く"}
]}];

var Dataset = [
  {name: "kokusei2020move", label: "2020年国勢調査：人口移動", date: "2020-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2020", lineFile: "line.geojson", lineObj: "line2020", csvFile: "2020kokusei_move.csv", csvObj: "kokusei2020move", fromtoFile: "2020kokusei_move_fromto.csv", fromtoObj: "kokusei2020move_fromto", category: Categories_kokusei2020move, fromto: true, attr: [{label: "令和2年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2020/index.html"}]},
  {name: "kokusei2020work", label: "2020年国勢調査：通勤", date: "2020-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2020", lineFile: "line.geojson", lineObj: "line2020", csvFile: "2020kokusei_work.csv", csvObj: "kokusei2020work", fromtoFile: "2020kokusei_work_fromto.csv", fromtoObj: "kokusei2020work_fromto", category: Categories_kokusei2020work, fromto: true, attr: [{label: "令和2年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2020/index.html"}]}
]
