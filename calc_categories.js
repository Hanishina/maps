//カテゴリー一覧:最後のデータはcsvテーブル用(選択不可)
var Categories_kokusei_2020 = [{name: "population", label: "人口・人口増減・面積", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {}
]}, {name: "house", label: "世帯数", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"], noprop:true, desc:"前回調査(5年前)からの世帯増加数。"},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1, desc:"世帯増加数を前回調査時世帯数で割ったもの。"},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1, desc:"人口を世帯数で割ったもの。"},
  {}
]}, {name: "did", label: "人口集中地区(DID)", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"], desc:"人口集中地区(DID)内に居住している人の数。"},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1, desc:"DID人口を総人口で割ったもの。"}
]}, {name: "age", label: "年齢別人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1, desc:"15歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1, desc:"15歳以上65歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1, desc:"65歳以上の人口を総人口で割ったもの。総人口には年齢不詳を含む。"}
]}, {name: "age_pie", label: "年齢別人口【円グラフ表示】", pie: true, data:[
  {name: "POP_U15", label:"15歳未満人口(人)", color:"#80acff", func:"sum", args:["POP_U15"]},
  {name: "POP_O15", label:"15歳～64歳人口(人)", color:"#e6de73", func:"sum", args:["POP_O15"]},
  {name: "POP_O65", label:"65歳以上人口(人)", color:"#de7571", func:"sum", args:["POP_O65"]},
  {name: "other", label:"年齢不詳(人)", color:"#b8b8b8", func:"pie_other", args:["POPULATION", "POP_U15", "POP_O15", "POP_O65"]}
]}, {name: "foreigner", label: "外国人人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口割合(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2, desc:"総人口に占める外国人人口の割合。総人口には国籍不詳を含む。"},
  {}
]}, {name: "csv", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"]},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"]},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"]},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口比率(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2}
]}];

var Categories_kokusei_old = [{name: "population", label: "人口・人口増減・面積", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {}
]}, {name: "house", label: "世帯数", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"], noprop:true, desc:"前回調査(5年前)からの世帯増加数。"},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1, desc:"世帯増加数を前回調査時世帯数で割ったもの。"},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1, desc:"人口を世帯数で割ったもの。"},
  {}
]}, {name: "age", label: "年齢別人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1, desc:"15歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1, desc:"15歳以上65歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1, desc:"65歳以上の人口を総人口で割ったもの。総人口には年齢不詳を含む。"}
]}, {name: "age_pie", label: "年齢別人口【円グラフ表示】", pie: true, data:[
  {name: "POP_U15", label:"15歳未満人口(人)", color:"#80acff", func:"sum", args:["POP_U15"]},
  {name: "POP_O15", label:"15歳～64歳人口(人)", color:"#e6de73", func:"sum", args:["POP_O15"]},
  {name: "POP_O65", label:"65歳以上人口(人)", color:"#de7571", func:"sum", args:["POP_O65"]},
  {name: "other", label:"年齢不詳(人)", color:"#b8b8b8", func:"pie_other", args:["POPULATION", "POP_U15", "POP_O15", "POP_O65"]}
]}, {name: "csv", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"]},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"]},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1},
]}];

var Categories_kokusei_2015 = [{name: "population", label: "人口・人口増減・面積", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {}
]}, {name: "house", label: "世帯数", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"], noprop:true, desc:"前回調査(5年前)からの世帯増加数。"},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1, desc:"世帯増加数を前回調査時世帯数で割ったもの。"},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1, desc:"人口を世帯数で割ったもの。"},
  {}
]}, {name: "did", label: "人口集中地区(DID)", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"], desc:"人口集中地区(DID)内に居住している人の数。"},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1, desc:"DID人口を総人口で割ったもの。"}
]}, {name: "age", label: "年齢別人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1, desc:"15歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1, desc:"15歳以上65歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1, desc:"65歳以上の人口を総人口で割ったもの。総人口には年齢不詳を含む。"}
]}, {name: "age_pie", label: "年齢別人口【円グラフ表示】", pie: true, data:[
  {name: "POP_U15", label:"15歳未満人口(人)", color:"#80acff", func:"sum", args:["POP_U15"]},
  {name: "POP_O15", label:"15歳～64歳人口(人)", color:"#e6de73", func:"sum", args:["POP_O15"]},
  {name: "POP_O65", label:"65歳以上人口(人)", color:"#de7571", func:"sum", args:["POP_O65"]},
  {name: "other", label:"年齢不詳(人)", color:"#b8b8b8", func:"pie_other", args:["POPULATION", "POP_U15", "POP_O15", "POP_O65"]}
]}, {name: "foreigner", label: "外国人人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口割合(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2, desc:"総人口に占める外国人人口の割合。総人口には国籍不詳を含む。"},
  {}
]}, {name: "daytime", label: "昼夜間人口", data:[
  {name: "POPULATION", label:"夜間人口(人)", func:"sum", args:["POPULATION"], desc:"当該市区町村に居住している人の数。すなわち人口と同値。"},
  {name: "DAYTIME", label:"昼間人口(人)", func:"sum", args:["DAYTIME"], desc:"当該市区町村に通勤・通学しているものと当該市区町村に居住し通勤も通学もしていないものの合計。"},
  {name: "daytimeR", label:"昼夜間人口比率(%)", func:"rate", args:["DAYTIME", "POPULATION"], prec:1, desc:"昼間人口を夜間人口で割ったもの。"},
  {}
]}, {name: "industry", label:"産業別従業者数(三分類)", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "WORKER", label:"15歳以上の従業者数(人)", func:"sum", args:["WORKER"], desc:"当該市区町村で従業している、15歳以上の従業者の数。"},
  {name: "1ST_IND", label:"第一次産業従業者数(人)", func:"sum", args:["1ST_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第一次産業(産業大分類のうちA, B)に分類される産業の従業者数。"},
  {name: "1st_indR", label:"第一次産業従業者割合(%)", func:"rate", args:["1ST_IND", "WORKER"], prec:1, desc:"第一次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", func:"sum", args:["2ND_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第二次産業(産業大分類のうちC～E)に分類される産業の従業者数。"},
  {name: "2nd_indR", label:"第二次産業従業者割合(%)", func:"rate", args:["2ND_IND", "WORKER"], prec:1, desc:"第二次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", func:"sum", args:["3RD_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第三次産業(産業大分類のうちF～S)に分類される産業の従業者数。"},
  {name: "3rd_indR", label:"第三次産業従業者割合(%)", func:"rate", args:["3RD_IND", "WORKER"], prec:1, desc:"第三次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"}
]}, {name: "industry_pie", label:"産業別従業者数(三分類)【円グラフ表示】", pie: true, data:[
  {name: "1ST_IND", label:"第一次産業従業者数(人)", color:"#72b578", func:"sum", args:["1ST_IND"]},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", color:"#e88f89", func:"sum", args:["2ND_IND"]},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", color:"#6c9bd9", func:"sum", args:["3RD_IND"]},
  {name: "other", label:"分類不能の産業(人)", color:"#b8b8b8", func:"pie_other", args:["WORKER", "1ST_IND", "2ND_IND", "3RD_IND"]}
]}, {name: "industry2", label:"産業別従業者数(大分類抜粋)", data:[
  {name: "IND_AGRI", label:"農林業(人)", func:"sum", args:["IND_AGRI"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「A:農業・林業」に分類される産業の従業者数。"},
  {name: "ind_agriR", label:"農林業割合(%)", func:"rate", args:["IND_AGRI", "WORKER"], prec:1, desc:"農林業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_MANU", label:"製造業(人)", func:"sum", args:["IND_MANU"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「E:製造業」に分類される産業の従業者数。"},
  {name: "ind_manuR", label:"製造業割合(%)", func:"rate", args:["IND_MANU", "WORKER"], prec:1, desc:"製造業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_SALE", label:"卸・小売業(人)", func:"sum", args:["IND_SALE"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「I:卸売業・小売業」に分類される産業の従業者数。"},
  {name: "ind_saleR", label:"卸・小売業割合(%)", func:"rate", args:["IND_SALE", "WORKER"], prec:1, desc:"卸・小売業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_ACCO", label:"宿泊・飲食業(人)", func:"sum", args:["IND_ACCO"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「M:宿泊業・飲食サービス業」に分類される産業の従業者数。"},
  {name: "ind_accoR", label:"宿泊・飲食業割合(%)", func:"rate", args:["IND_ACCO", "WORKER"], prec:1, desc:"宿泊・飲食業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_MEDI", label:"医療・福祉(人)", func:"sum", args:["IND_MEDI"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「P:医療・福祉」に分類される産業の従業者数。"},
  {name: "ind_mediR", label:"医療・福祉割合(%)", func:"rate", args:["IND_MEDI", "WORKER"], prec:1, desc:"医療・福祉従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"}
]}, {name: "csv", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"]},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"]},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"]},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口比率(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2},
  {name: "DAYTIME", label:"昼間人口(人)", func:"sum", args:["DAYTIME"]},
  {name: "daytimeR", label:"昼夜間人口比率(%)", func:"rate", args:["DAYTIME", "POPULATION"], prec:1},
  {name: "WORKER", label:"15歳以上の従業者数(人)", func:"sum", args:["WORKER"]},
  {name: "1ST_IND", label:"第一次産業従業者数(人)", func:"sum", args:["1ST_IND"]},
  {name: "1st_indR", label:"第一次産業従業者割合(%)", func:"rate", args:["1ST_IND", "WORKER"], prec:1},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", func:"sum", args:["2ND_IND"]},
  {name: "2nd_indR", label:"第二次産業従業者割合(%)", func:"rate", args:["2ND_IND", "WORKER"], prec:1},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", func:"sum", args:["3RD_IND"]},
  {name: "3rd_indR", label:"第三次産業従業者割合(%)", func:"rate", args:["3RD_IND", "WORKER"], prec:1},
  {name: "IND_AGRI", label:"農林業(人)", func:"sum", args:["IND_AGRI"]},
  {name: "ind_agriR", label:"農林業割合(%)", func:"rate", args:["IND_AGRI", "WORKER"], prec:1},
  {name: "IND_MANU", label:"製造業(人)", func:"sum", args:["IND_MANU"]},
  {name: "ind_manuR", label:"製造業割合(%)", func:"rate", args:["IND_MANU", "WORKER"], prec:1},
  {name: "IND_SALE", label:"卸・小売業(人)", func:"sum", args:["IND_SALE"]},
  {name: "ind_saleR", label:"卸・小売業割合(%)", func:"rate", args:["IND_SALE", "WORKER"], prec:1},
  {name: "IND_ACCO", label:"宿泊・飲食業(人)", func:"sum", args:["IND_ACCO"]},
  {name: "ind_accoR", label:"宿泊・飲食業割合(%)", func:"rate", args:["IND_ACCO", "WORKER"], prec:1},
  {name: "IND_MEDI", label:"医療・福祉(人)", func:"sum", args:["IND_MEDI"]},
  {name: "ind_mediR", label:"医療・福祉割合(%)", func:"rate", args:["IND_MEDI", "WORKER"], prec:1}
]}];

var Categories_kokusei_2000 = [{name: "population", label: "人口・人口増減・面積", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"], noprop:true, desc:"前回調査(5年前)からの人口増加数。"},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1, desc:"人口増加数を前回調査時人口で割ったもの。"},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {}
]}, {name: "house", label: "世帯数", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1, desc:"人口を世帯数で割ったもの。"},
  {}
]}, {name: "did", label: "人口集中地区(DID)", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"], desc:"人口集中地区(DID)内に居住している人の数。"},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1, desc:"DID人口を総人口で割ったもの。"}
]}, {name: "age", label: "年齢別人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1, desc:"15歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1, desc:"15歳以上65歳未満の人口を総人口で割ったもの。総人口には年齢不詳を含む。"},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1, desc:"65歳以上の人口を総人口で割ったもの。総人口には年齢不詳を含む。"}
]}, {name: "age_pie", label: "年齢別人口【円グラフ表示】", pie: true, data:[
  {name: "POP_U15", label:"15歳未満人口(人)", color:"#80acff", func:"sum", args:["POP_U15"]},
  {name: "POP_O15", label:"15歳～64歳人口(人)", color:"#e6de73", func:"sum", args:["POP_O15"]},
  {name: "POP_O65", label:"65歳以上人口(人)", color:"#de7571", func:"sum", args:["POP_O65"]},
  {name: "other", label:"年齢不詳(人)", color:"#b8b8b8", func:"pie_other", args:["POPULATION", "POP_U15", "POP_O15", "POP_O65"]}
]}, {name: "foreigner", label: "外国人人口", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口比率(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2, desc:"総人口に占める外国人人口の割合。総人口には国籍不詳を含む。"},
  {}
]}, {name: "daytime", label: "昼夜間人口", data:[
  {name: "POPULATION", label:"夜間人口(人)", func:"sum", args:["POPULATION"], desc:"当該市区町村に居住している人の数。すなわち人口と同値。"},
  {name: "DAYTIME", label:"昼間人口(人)", func:"sum", args:["DAYTIME"], desc:"当該市区町村に通勤・通学しているものと当該市区町村に居住し通勤も通学もしていないものの合計。"},
  {name: "daytimeR", label:"昼夜間人口比率(%)", func:"rate", args:["DAYTIME", "POPULATION"], prec:1, desc:"昼間人口を夜間人口で割ったもの。"},
  {}
]}, {name: "industry", label:"産業別従業者数(三分類)", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "WORKER", label:"15歳以上の従業者数(人)", func:"sum", args:["WORKER"], desc:"当該市区町村で従業している、15歳以上の従業者の数。"},
  {name: "1ST_IND", label:"第一次産業従業者数(人)", func:"sum", args:["1ST_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第一次産業(産業大分類のうちA, B)に分類される産業の従業者数。"},
  {name: "1st_indR", label:"第一次産業従業者割合(%)", func:"rate", args:["1ST_IND", "WORKER"], prec:1, desc:"第一次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", func:"sum", args:["2ND_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第二次産業(産業大分類のうちC～E)に分類される産業の従業者数。"},
  {name: "2nd_indR", label:"第二次産業従業者割合(%)", func:"rate", args:["2ND_IND", "WORKER"], prec:1, desc:"第二次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", func:"sum", args:["3RD_IND"], desc:"当該市区町村で従業している15歳以上の従業者のうち、第三次産業(産業大分類のうちF～S)に分類される産業の従業者数。"},
  {name: "3rd_indR", label:"第三次産業従業者割合(%)", func:"rate", args:["3RD_IND", "WORKER"], prec:1, desc:"第三次産業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"}
]}, {name: "industry_pie", label:"産業別従業者数(三分類)【円グラフ表示】", pie: true, data:[
  {name: "1ST_IND", label:"第一次産業従業者数(人)", color:"#72b578", func:"sum", args:["1ST_IND"]},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", color:"#e88f89", func:"sum", args:["2ND_IND"]},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", color:"#6c9bd9", func:"sum", args:["3RD_IND"]},
  {name: "other", label:"分類不能の産業(人)", color:"#b8b8b8", func:"pie_other", args:["WORKER", "1ST_IND", "2ND_IND", "3RD_IND"]}
]}, {name: "industry2", label:"産業別従業者数(大分類抜粋)", data:[
  {name: "IND_AGRI", label:"農林業(人)", func:"sum", args:["IND_AGRI"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「A:農業・B:林業」に分類される産業の従業者数。"},
  {name: "ind_agriR", label:"農林業割合(%)", func:"rate", args:["IND_AGRI", "WORKER"], prec:1, desc:"農林業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_MANU", label:"製造業(人)", func:"sum", args:["IND_MANU"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「F:製造業」に分類される産業の従業者数。"},
  {name: "ind_manuR", label:"製造業割合(%)", func:"rate", args:["IND_MANU", "WORKER"], prec:1, desc:"製造業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_SALE", label:"卸・小売・飲食業(人)", func:"sum", args:["IND_SALE"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「I:卸売・小売業、飲食店」に分類される産業の従業者数。"},
  {name: "ind_saleR", label:"卸・小売・飲食業割合(%)", func:"rate", args:["IND_SALE", "WORKER"], prec:1, desc:"卸・小売・飲食業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"},
  {name: "IND_SERV", label:"サービス業(人)", func:"sum", args:["IND_SERV"], desc:"当該市区町村で従業している15歳以上の従業者のうち、産業大分類の「L:サービス業」に分類される産業の従業者数。"},
  {name: "ind_servR", label:"サービス業割合(%)", func:"rate", args:["IND_SERV", "WORKER"], prec:1, desc:"サービス業従業者数を15歳以上の総従業者数で割ったもの。総従業者数には「分類不能の産業」を含む。"}
]}, {name: "csv", data:[
  {name: "POPULATION", label:"人口(人)", func:"sum", args:["POPULATION"]},
  {name: "AREA", label:"面積(㎢)", func:"sum", args:["AREA"], prec:2},
  {name: "POP_INCREASE", label:"人口増加数(人)", func:"sum", args:["POP_INCREASE"]},
  {name: "pop_increaseR", label:"人口増加率(%)", func:"incr_rate", args:["POP_INCREASE", "POPULATION"], prec:1},
  {name: "density" , label:"人口密度(人/㎢)", func:"div", args:["POPULATION", "AREA"], prec:1},
  {name: "HOUSE", label:"世帯数(世帯)", func:"sum", args:["HOUSE"]},
  {name: "HOU_INCREASE", label:"世帯増加数(世帯)", func:"sum", args:["HOU_INCREASE"]},
  {name: "hou_increaseR", label:"世帯増加率(%)", func:"incr_rate", args:["HOU_INCREASE", "HOUSE"], prec:1},
  {name: "pop/house", label:"一世帯当たりの人員数(人)", func:"div", args:["POPULATION", "HOUSE"], prec:1},
  {name: "DID_POPULATION", label:"DID人口(人)", func:"sum", args:["DID_POPULATION"]},
  {name: "did_popR", label: "DID人口割合(%)", func:"rate", args:["DID_POPULATION", "POPULATION"], prec:1},
  {name: "POP_U15", label:"15歳未満人口(人)", func:"sum", args:["POP_U15"]},
  {name: "pop_u15R", label:"15歳未満人口割合(%)", func:"rate", args:["POP_U15", "POPULATION"], prec:1},
  {name: "POP_O15", label:"15歳～64歳人口(人)", func:"sum", args:["POP_O15"]},
  {name: "pop_o15R", label:"15歳～64歳人口割合(%)", func:"rate", args:["POP_O15", "POPULATION"], prec:1},
  {name: "POP_O65", label:"65歳以上人口(人)", func:"sum", args:["POP_O65"]},
  {name: "pop_o65R", label:"65歳以上人口割合(%)", func:"rate", args:["POP_O65", "POPULATION"], prec:1},
  {name: "FOREIGNER", label:"外国人人口(人)", func:"sum", args:["FOREIGNER"]},
  {name: "foreignerR", label:"外国人人口比率(%)", func:"rate", args:["FOREIGNER", "POPULATION"], prec:2},
  {name: "DAYTIME", label:"昼間人口(人)", func:"sum", args:["DAYTIME"]},
  {name: "daytimeR", label:"昼夜間人口比率(%)", func:"rate", args:["DAYTIME", "POPULATION"], prec:1},
  {name: "WORKER", label:"15歳以上の従業者数(人)", func:"sum", args:["WORKER"]},
  {name: "1ST_IND", label:"第一次産業従業者数(人)", func:"sum", args:["1ST_IND"]},
  {name: "1st_indR", label:"第一次産業従業者割合(%)", func:"rate", args:["1ST_IND", "WORKER"], prec:1},
  {name: "2ND_IND", label:"第二次産業従業者数(人)", func:"sum", args:["2ND_IND"]},
  {name: "2nd_indR", label:"第二次産業従業者割合(%)", func:"rate", args:["2ND_IND", "WORKER"], prec:1},
  {name: "3RD_IND", label:"第三次産業従業者数(人)", func:"sum", args:["3RD_IND"]},
  {name: "3rd_indR", label:"第三次産業従業者割合(%)", func:"rate", args:["3RD_IND", "WORKER"], prec:1},
  {name: "IND_AGRI", label:"農林業(人)", func:"sum", args:["IND_AGRI"]},
  {name: "ind_agriR", label:"農林業割合(%)", func:"rate", args:["IND_AGRI", "WORKER"], prec:1},
  {name: "IND_MANU", label:"製造業(人)", func:"sum", args:["IND_MANU"]},
  {name: "ind_manuR", label:"製造業割合(%)", func:"rate", args:["IND_MANU", "WORKER"], prec:1},
  {name: "IND_SALE", label:"卸・小売・飲食業(人)", func:"sum", args:["IND_SALE"]},
  {name: "ind_saleR", label:"卸・小売・飲食業割合(%)", func:"rate", args:["IND_SALE", "WORKER"], prec:1},
  {name: "IND_SERV", label:"サービス業(人)", func:"sum", args:["IND_SERV"]},
  {name: "ind_servR", label:"サービス業割合(%)", func:"rate", args:["IND_SERV", "WORKER"], prec:1}
]}];

var Categories_keizai = [{name: "office", label: "事業所・従業者数", data:[
  {name: "POPULATION", label: "人口(国調2015)(人)", func: "sum", args: ["POPULATION"], desc:"平成27年国勢調査による人口。"},
  {name: "AREA", label: "面積(国調2015)(㎢)", func: "sum", args: ["AREA"], prec: 2, desc:"平成27年国勢調査による面積。"},
  {name: "OFFICE", label: "民営事業所数(所)", func: "sum", args: ["OFFICE"], desc:"事業所の数(公務を除く)。"},
  {name: "WORKER", label: "従業者数(人)", func: "sum", args: ["WORKER"]}
]}, {name: "ind_office", label: "産業別事業所数", data:[
  {name: "OFFICE", label: "民営事業所数(所)", func: "sum", args: ["OFFICE"], desc:"事業所の数(公務を除く・事業内容不詳を含む)。"},
  {},
  {name: "O_1ST", label: "第一次産業(所)", func: "sum", args: ["O_1ST"], desc:"事業所のうち、農林業・漁業に分類されるものの数。"},
  {name: "o_1stR", label: "第一次産業割合(%)", func: "rate", args: ["O_1ST", "OFFICE"], prec: 1, desc:"第一次産業事業所数を民営事業所数で割ったもの。"},
  {name: "O_2ND", label: "第二次産業(所)", func: "sum", args: ["O_2ND"], desc:"事業所のうち、鉱業・建設業・製造業等に分類されるものの数。"},
  {name: "o_2ndR", label: "第二次産業割合(%)", func: "rate", args: ["O_2ND", "OFFICE"], prec: 1, desc:"第二次産業事業所数を民営事業所数で割ったもの。"},
  {name: "O_3RD", label: "第三次産業(所)", func: "sum", args: ["O_3RD"], desc:"事業所のうち、第三次産業(産業大分類のうちF～R)に分類されるものの数。"},
  {name: "o_3rdR", label: "第三次産業割合(%)", func: "rate", args: ["O_3RD", "OFFICE"], prec: 1, desc:"第三次産業事業所数を民営事業所数で割ったもの。"}
]}, {name: "ind_worker", label: "産業別従業者数", data:[
  {name: "WORKER", label: "従業者数(人)", func: "sum", args: ["WORKER"], desc:"民営事業所(事業内容不詳を含む)の従業者の数。"},
  {},
  {name: "W_1ST", label: "第一次産業(人)", func: "sum", args: ["W_1ST"], desc:"事業所のうち、農林業・漁業に分類されるものに従事している従業者の数。"},
  {name: "w_1stR", label: "第一次産業割合(%)", func: "rate", args: ["W_1ST", "WORKER"], prec: 1, desc:"第一次産業従業者数を民営事業所従業者数で割ったもの。"},
  {name: "W_2ND", label: "第二次産業(人)", func: "sum", args: ["W_2ND"], desc:"事業所のうち、鉱業・建設業・製造業等に分類されるものに従事している従業者の数。"},
  {name: "w_2ndR", label: "第二次産業割合(%)", func: "rate", args: ["W_2ND", "WORKER"], prec: 1, desc:"第二次産業従業者数を民営事業所従業者数で割ったもの。"},
  {name: "W_3RD", label: "第三次産業(人)", func: "sum", args: ["W_3RD"], desc:"事業所のうち、第三次産業(産業大分類のうちF～R)に分類されるものに従事している従業者の数。"},
  {name: "w_3rdR", label: "第三次産業割合(%)", func: "rate", args: ["W_3RD", "WORKER"], prec: 1, desc:"第三次産業従業者数を民営事業所従業者数で割ったもの。"}
]}, {name: "sales_all", label: "売上・付加価値額(全産業)", data:[
  {name: "SALES_EST", label: "売上金額試算値(百万円)", func: "sum", args: ["SALES_EST"], desc: "1年間(調査年前年)の売上利益。一部の産業は事業所別の売上高を算出することが困難であるため、推計値を用いる。"},
  {name: "ADD_VALUE", label: "付加価値額(百万円)", func: "sum", args: ["ADD_VALUE"], desc: "生産活動によって新たに生み出された価値。売上高から費用等を引いたもの。"},
  {name: "productivity", label: "労働生産性(百万円/人)", func: "div", args: ["ADD_VALUE", "WORKER"], prec: 2, desc: "付加価値額を民営事業所従業者数で割ったもの。"},
  {}
]}, {name: "sales_ind", label: "主要産業売上高", data:[
  {name: "SALES_AGRI", label: "農林漁業(百万円)", func: "sum", args: ["SALES_AGRI"]},
  {name: "SALES_MANU", label: "製造業(百万円)", func: "sum", args: ["SALES_MANU"]},
  {name: "SALES_SALE", label: "卸・小売業(百万円)", func: "sum", args: ["SALES_SALE"]},
  {name: "SALES_ACCO", label: "宿泊・飲食サービス業(百万円)", func: "sum", args: ["SALES_ACCO"]},
  {name: "SALES_MEDI", label: "医療・福祉(百万円)", func: "sum", args: ["SALES_MEDI"]},
  {}
]}, {name: "manufacture", label: "製造業に関する指標", data:[
  {name: "MANU_OFFICE", label: "事業所数(所)", func: "sum", args: ["MANU_OFFICE"], desc:"従業員数4人以上の製造業事業所の数。"},
  {name: "MANU_WORKER", label: "従業者数(人)", func: "sum", args: ["MANU_WORKER"]},
  {name: "MANU_SHIP", label: "製造品出荷額等(万円)", func: "sum", args: ["MANU_SHIP"], desc:"1年間(調査年前年)に製造された製品の出荷額。"},
  {name: "MANU_ADD", label: "粗付加価値額(万円)", func: "sum", args: ["MANU_ADD"], desc:"製造品出荷額等から原材料費・燃料費・諸税等を差し引いたもの。"},
  {name: "manu_shipPW", label: "従業員あたり出荷額(万円/人)", func: "div", args: ["MANU_SHIP", "MANU_WORKER"], prec: 1},
  {name: "manu_shipPO", label: "事業所あたり出荷額(万円/所)", func: "div", args: ["MANU_SHIP", "MANU_OFFICE"], prec: 1},
  {name: "manu_shipPC", label: "人口あたり出荷額(万円/人)", func: "div", args: ["MANU_SHIP", "POPULATION"], prec: 1},
  {}
]}, {name: "sales", label: "卸・小売業に関する指標", data:[
  {name: "SL_OFFICE", label: "事業所数(所)", func: "sum", args: ["SL_OFFICE"], desc:"卸売業・小売業に分類される事業所の数(販売額等の数値が得られたもののみ)。"},
  {name: "SL_WORKER", label: "従業者数(人)", func: "sum", args: ["SL_WORKER"]},
  {name: "SL_SALES", label: "年間商品販売額(百万円)", func: "sum", args: ["SL_SALES"], desc:"1年間(調査年前年)に販売された有体商品の売上高。"},
  {name: "sl_salesPO", label: "事業所あたり商品販売額(百万円/所)", func: "div", args: ["SL_SALES", "SL_OFFICE"], prec: 1},
  {name: "sl_salesPW", label: "従業員あたり商品販売額(百万円/人)", func: "div", args: ["SL_SALES", "SL_WORKER"], prec: 1},
  {name: "sl_salesPC", label: "人口あたり商品販売額(百万円/人)", func: "div", args: ["SL_SALES", "POPULATION"], prec: 2}
]}, {name: "wholesale", label: "卸売業に関する指標", data:[
  {name: "WH_OFFICE", label: "事業所数(所)", func: "sum", args: ["WH_OFFICE"], desc:"卸売業に分類される事業所の数(販売額等の数値が得られたもののみ)。"},
  {name: "WH_WORKER", label: "従業者数(人)", func: "sum", args: ["WH_WORKER"]},
  {name: "WH_SALES", label: "年間商品販売額(百万円)", func: "sum", args: ["WH_SALES"], desc:"1年間(調査年前年)に販売された有体商品の売上高。"},
  {name: "wh_salesPO", label: "事業所あたり商品販売額(百万円/所)", func: "div", args: ["WH_SALES", "WH_OFFICE"], prec: 1},
  {name: "wh_salesPW", label: "従業員あたり商品販売額(百万円/人)", func: "div", args: ["WH_SALES", "WH_WORKER"], prec: 1},
  {name: "wh_salesPC", label: "人口あたり商品販売額(百万円/人)", func: "div", args: ["WH_SALES", "POPULATION"], prec: 2}
]}, {name: "retail", label: "小売業に関する指標", data:[
  {name: "RE_OFFICE", label: "事業所数(所)", func: "sum", args: ["RE_OFFICE"], desc:"小売業に分類される事業所の数(販売額等の数値が得られたもののみ)。"},
  {name: "RE_WORKER", label: "従業者数(人)", func: "sum", args: ["RE_WORKER"]},
  {name: "RE_SALES", label: "年間商品販売額(百万円)", func: "sum", args: ["RE_SALES"], desc:"1年間(調査年前年)に販売された有体商品の売上高。"},
  {name: "re_salesPO", label: "事業所あたり商品販売額(百万円/所)", func: "div", args: ["RE_SALES", "RE_OFFICE"], prec: 1},
  {name: "re_salesPW", label: "従業員あたり商品販売額(百万円/人)", func: "div", args: ["RE_SALES", "RE_WORKER"], prec: 1},
  {name: "re_salesPC", label: "人口あたり商品販売額(百万円/人)", func: "div", args: ["RE_SALES", "POPULATION"], prec: 2},
  {name: "RE_AREA", label: "売場面積(㎡)", func: "sum", args: ["RE_AREA"]},
  {}
]}, {name: "csv", data: [
  {name: "POPULATION", label: "人口(国調2015)(人)", func: "sum", args: ["POPULATION"]},
  {name: "AREA", label: "面積(国調2015)(㎢)", func: "sum", args: ["AREA"], prec: 2},
  {name: "OFFICE", label: "事業所数(所)", func: "sum", args: ["OFFICE"]},
  {name: "WORKER", label: "従業者数(人)", func: "sum", args: ["WORKER"]},
  {name: "O_1ST", label: "【事】第一次産業(所)", func: "sum", args: ["O_1ST"]},
  {name: "o_1stR", label: "【事】第一次産業割合(%)", func: "rate", args: ["O_1ST", "OFFICE"], prec: 1},
  {name: "O_2ND", label: "【事】第二次産業(所)", func: "sum", args: ["O_2ND"]},
  {name: "o_2ndR", label: "【事】第二次産業割合(%)", func: "rate", args: ["O_2ND", "OFFICE"], prec: 1},
  {name: "O_3RD", label: "【事】第三次産業(所)", func: "sum", args: ["O_3RD"]},
  {name: "o_3rdR", label: "【事】第三次産業割合(%)", func: "rate", args: ["O_3RD", "OFFICE"], prec: 1},
  {name: "W_1ST", label: "【従】第一次産業(人)", func: "sum", args: ["W_1ST"]},
  {name: "w_1stR", label: "【従】第一次産業割合(%)", func: "rate", args: ["W_1ST", "WORKER"], prec: 1},
  {name: "W_2ND", label: "【従】第二次産業(人)", func: "sum", args: ["W_2ND"]},
  {name: "w_2ndR", label: "【従】第二次産業割合(%)", func: "rate", args: ["W_2ND", "WORKER"], prec: 1},
  {name: "W_3RD", label: "【従】第三次産業(人)", func: "sum", args: ["W_3RD"]},
  {name: "w_3rdR", label: "【従】第三次産業割合(%)", func: "rate", args: ["W_3RD", "WORKER"], prec: 1},
  {name: "SALES_EST", label: "売上金額試算値(百万円)", func: "sum", args: ["SALES_EST"]},
  {name: "ADD_VALUE", label: "付加価値額(百万円)", func: "sum", args: ["ADD_VALUE"]},
  {name: "productivity", label: "労働生産性(百万円/人)", func: "div", args: ["ADD_VALUE", "W_PRIVATE"], prec: 2},
  {name: "SALES_AGRI", label: "農林漁業売上高(百万円)", func: "sum", args: ["SALES_AGRI"]},
  {name: "SALES_MANU", label: "製造業売上高(百万円)", func: "sum", args: ["SALES_MANU"]},
  {name: "SALES_SALE", label: "卸・小売業売上高(百万円)", func: "sum", args: ["SALES_SALE"]},
  {name: "SALES_ACCO", label: "宿泊・飲食サービス業売上高(百万円)", func: "sum", args: ["SALES_ACCO"]},
  {name: "SALES_MEDI", label: "医療・福祉売上高(百万円)", func: "sum", args: ["SALES_MEDI"]},
  {name: "MANU_OFFICE", label: "【製】事業所数(所)", func: "sum", args: ["MANU_OFFICE"]},
  {name: "MANU_WORKER", label: "【製】従業者数(人)", func: "sum", args: ["MANU_WORKER"]},
  {name: "MANU_SHIP", label: "【製】製造品出荷額等(万円)", func: "sum", args: ["MANU_SHIP"]},
  {name: "MANU_ADD", label: "【製】粗付加価値額(万円)", func: "sum", args: ["MANU_ADD"]},
  {name: "manu_shipPW", label: "【製】従業員あたり出荷額(万円/人)", func: "div", args: ["MANU_SHIP", "MANU_WORKER"], prec: 1},
  {name: "manu_shipPO", label: "【製】事業所あたり出荷額(万円/所)", func: "div", args: ["MANU_SHIP", "MANU_OFFICE"], prec: 1},
  {name: "manu_shipPC", label: "【製】人口あたり出荷額(万円/人)", func: "div", args: ["MANU_SHIP", "POPULATION"], prec: 1},
  {name: "SL_OFFICE", label: "【卸・小】事業所数(所)", func: "sum", args: ["SL_OFFICE"]},
  {name: "SL_WORKER", label: "【卸・小】従業者数(人)", func: "sum", args: ["SL_WORKER"]},
  {name: "SL_SALES", label: "【卸・小】年間商品販売額(百万円)", func: "sum", args: ["SL_SALES"]},
  {name: "sl_salesPO", label: "【卸・小】事業所あたり商品販売額(百万円/所)", func: "div", args: ["SL_SALES", "SL_OFFICE"], prec: 1},
  {name: "sl_salesPW", label: "【卸・小】従業員あたり商品販売額(百万円/人)", func: "div", args: ["SL_SALES", "SL_WORKER"], prec: 1},
  {name: "sl_salesPC", label: "【卸・小】人口あたり商品販売額(百万円/人)", func: "div", args: ["SL_SALES", "POPULATION"], prec: 2},
  {name: "WH_OFFICE", label: "【卸】事業所数(所)", func: "sum", args: ["WH_OFFICE"]},
  {name: "WH_WORKER", label: "【卸】従業者数(人)", func: "sum", args: ["WH_WORKER"]},
  {name: "WH_SALES", label: "【卸】年間商品販売額(百万円)", func: "sum", args: ["WH_SALES"]},
  {name: "wh_salesPO", label: "【卸】事業所あたり商品販売額(百万円/所)", func: "div", args: ["WH_SALES", "WH_OFFICE"], prec: 1},
  {name: "wh_salesPW", label: "【卸】従業員あたり商品販売額(百万円/人)", func: "div", args: ["WH_SALES", "WH_WORKER"], prec: 1},
  {name: "wh_salesPC", label: "【卸】人口あたり商品販売額(百万円/人)", func: "div", args: ["WH_SALES", "POPULATION"], prec: 2},
  {name: "RE_OFFICE", label: "【小】事業所数(所)", func: "sum", args: ["RE_OFFICE"]},
  {name: "RE_WORKER", label: "【小】従業者数(人)", func: "sum", args: ["RE_WORKER"]},
  {name: "RE_SALES", label: "【小】年間商品販売額(百万円)", func: "sum", args: ["RE_SALES"]},
  {name: "re_salesPO", label: "【小】事業所あたり商品販売額(百万円/所)", func: "div", args: ["RE_SALES", "RE_OFFICE"], prec: 1},
  {name: "re_salesPW", label: "【小】従業員あたり商品販売額(百万円/人)", func: "div", args: ["RE_SALES", "RE_WORKER"], prec: 1},
  {name: "re_salesPC", label: "【小】人口あたり商品販売額(百万円/人)", func: "div", args: ["RE_SALES", "POPULATION"], prec: 2},
  {name: "RE_AREA", label: "【小】売場面積(㎡)", func: "sum", args: ["RE_AREA"]}
]}];

var Categories_senkyo = [{name: "shosenkyo", label: "小選挙区制", data:[
  {name: "S_DIST", label: "小選挙区", func: "nonsum", args:["S_DIST"]},
  {name: "ELECTOR", label: "選挙当日有権者数", func: "sum", args:["ELECTOR"], desc: "選挙当日の有権者の数(在外を含む)。"},
  {name: "S_VOTE", label: "投票者数", func: "sum", args:["S_VOTE"]},
  {name: "s_voteR", label: "投票率(%)", func: "rate", args:["S_VOTE", "ELECTOR"], prec: 1, desc: "投票者数を有権者数で割ったもの。"},
  {name: "S_VALID_VOTE", label: "有効投票数", func: "sum", args:["S_VALID_VOTE"]},
  {name: "s_valid_voteR", label: "有効投票率(%)", func: "rate", args:["S_VALID_VOTE", "S_VOTE"], prec: 1, desc: "有効投票数を投票者数で割ったもの。"}
]}, {name: "hirei", label: "比例代表制", data:[
  {name: "H_DIST", label: "比例ブロック", func: "nonsum", args:["H_DIST"]},
  {name: "ELECTOR", label: "選挙当日有権者数", func: "sum", args:["ELECTOR"], desc: "選挙当日の有権者の数(在外を含む)。"},
  {name: "H_VOTE", label: "投票者数", func: "sum", args:["H_VOTE"]},
  {name: "h_voteR", label: "投票率(%)", func: "rate", args:["H_VOTE", "ELECTOR"], prec: 1, desc: "投票者数を有権者数で割ったもの。"},
  {name: "H_VALID_VOTE", label: "有効投票数", func: "sum", args:["H_VALID_VOTE"]},
  {name: "h_valid_voteR", label: "有効投票率(%)", func: "rate", args:["H_VALID_VOTE", "H_VOTE"], prec: 1, desc: "有効投票数を投票者数で割ったもの。"}
]}, {name: "party", label: "比例：政党別得票数", data:[
  {name: "H_VALID_VOTE", label: "有効投票数", func: "sum", args:["H_VALID_VOTE"]},
  {name: "ruling", label: "与党", func: "custom", args:["(", "H_JIMIN", "+", "H_KOMEI", ")"], desc: "自由民主党および公明党の得票数。"},
  {name: "H_JIMIN", label: "自民党", func: "sum", args:["H_JIMIN"], desc: "自由民主党の得票数。"},
  {name: "H_KOMEI", label: "公明党", func: "sum", args:["H_KOMEI"], desc: "公明党の得票数。"},
  {name: "H_RIKKEN", label: "立憲民主党", func: "sum", args:["H_RIKKEN"], prec: "floor", desc: "立憲民主党の得票数。按分により生じる端数は切り捨て。"},
  {name: "H_ISHIN", label: "日本維新の会", func: "sum", args:["H_ISHIN"], desc: "日本維新の会の得票数。"},
  {name: "H_KYOSAN", label: "共産党", func: "sum", args:["H_KYOSAN"], desc: "日本共産党の得票数。"},
  {name: "H_KOKUMIN", label: "国民民主党", func: "sum", args:["H_KOKUMIN"], prec: "floor", desc: "国民民主党の得票数。按分により生じる端数は切り捨て。"},
  {name: "H_REIWA", label: "れいわ新選組", func: "sum", args:["H_REIWA"], desc: "れいわ新選組の得票数。"},
  {name: "H_SHAMIN", label: "社民党", func: "sum", args:["H_SHAMIN"], desc: "社会民主党の得票数。"},
  {name: "H_NHK", label: "NHK党", func: "sum", args:["H_NHK"], desc: "ＮＨＫと裁判してる党弁護士法７２条違反での得票数。"},
  {name: "H_OTHER", label: "その他", func: "sum", args:["H_OTHER"], desc: "上記以外の党の得票数の合計。"}
]}, {name: "party_rate", label: "比例：政党別得票率", data:[
  {name: "H_VALID_VOTE", label: "有効投票数", func: "sum", args:["H_VALID_VOTE"]},
  {name: "rulingR", label: "与党(%)", func: "custom", args:["(", "H_JIMIN", "+", "H_KOMEI", ")", "/", "H_VALID_VOTE", "*", "100"], prec: 1, noprop:true, desc: "自由民主党および公明党の得票数。"},
  {name: "h_jiminR", label: "自民党(%)", func: "rate", args:["H_JIMIN", "H_VALID_VOTE"], prec: 1, desc: "自由民主党の得票率。"},
  {name: "h_komeiR", label: "公明党(%)", func: "rate", args:["H_KOMEI", "H_VALID_VOTE"], prec: 1, desc: "公明党の得票率。"},
  {name: "h_rikkenR", label: "立憲民主党(%)", func: "rate", args:["H_RIKKEN", "H_VALID_VOTE"], prec: 1, desc: "立憲民主党の得票率。"},
  {name: "h_ishinR", label: "日本維新の会(%)", func: "rate", args:["H_ISHIN", "H_VALID_VOTE"], prec: 1, desc: "日本維新の会の得票率。"},
  {name: "h_kyosanR", label: "共産党(%)", func: "rate", args:["H_KYOSAN", "H_VALID_VOTE"], prec: 1, desc: "日本共産党の得票率。"},
  {name: "h_kokuminR", label: "国民民主党(%)", func: "rate", args:["H_KOKUMIN", "H_VALID_VOTE"], prec: 1, desc: "国民民主党の得票率。"},
  {name: "h_reiwaR", label: "れいわ新選組(%)", func: "rate", args:["H_REIWA", "H_VALID_VOTE"], prec: 1, desc: "れいわ新選組の得票率。"},
  {name: "h_shaminR", label: "社民党(%)", func: "rate", args:["H_SHAMIN", "H_VALID_VOTE"], prec: 1, desc: "社会民主党の得票率。"},
  {name: "h_nhkR", label: "NHK党(%)", func: "rate", args:["H_NHK", "H_VALID_VOTE"], prec: 1, desc: "ＮＨＫと裁判してる党弁護士法７２条違反での得票率。"},
  {name: "h_otherR", label: "その他(%)", func: "rate", args:["H_OTHER", "H_VALID_VOTE"], prec: 1, desc: "上記以外の党の合計得票率。"}
]}, {name: "csv", data:[
  {name: "H_DIST", label: "比例ブロック", func: "nonsum", args:["H_DIST"]},
  {name: "S_DIST", label: "小選挙区", func: "nonsum", args:["S_DIST"]},
  {name: "ELECTOR", label: "選挙当日有権者数", func: "sum", args:["ELECTOR"]},
  {name: "S_VOTE", label: "【小】投票者数", func: "sum", args:["S_VOTE"]},
  {name: "s_voteR", label: "【小】投票率(%)", func: "rate", args:["S_VOTE", "ELECTOR"], prec: 1},
  {name: "S_VALID_VOTE", label: "【小】有効投票数", func: "sum", args:["S_VALID_VOTE"]},
  {name: "s_valid_voteR", label: "【小】有効投票率(%)", func: "rate", args:["S_VALID_VOTE", "S_VOTE"], prec: 1},
  {name: "H_VOTE", label: "【比】投票者数", func: "sum", args:["H_VOTE"]},
  {name: "h_voteR", label: "【比】投票率(%)", func: "rate", args:["H_VOTE", "ELECTOR"], prec: 1},
  {name: "H_VALID_VOTE", label: "【比】有効投票数", func: "sum", args:["H_VALID_VOTE"]},
  {name: "h_valid_voteR", label: "【比】有効投票率(%)", func: "rate", args:["H_VALID_VOTE", "H_VOTE"], prec: 1},
  {name: "ruling", label: "与党得票数", func: "custom", args:["(", "H_JIMIN", "+", "H_KOMEI", ")"]},
  {name: "H_JIMIN", label: "自民党得票数", func: "sum", args:["H_JIMIN"]},
  {name: "H_KOMEI", label: "公明党得票数", func: "sum", args:["H_KOMEI"]},
  {name: "H_RIKKEN", label: "立憲民主党得票数", func: "sum", args:["H_RIKKEN"], prec: "floor"},
  {name: "H_ISHIN", label: "日本維新の会得票数", func: "sum", args:["H_ISHIN"]},
  {name: "H_KYOSAN", label: "共産党得票数", func: "sum", args:["H_KYOSAN"]},
  {name: "H_KOKUMIN", label: "国民民主党得票数", func: "sum", args:["H_KOKUMIN"], prec: "floor"},
  {name: "H_REIWA", label: "れいわ新選組得票数", func: "sum", args:["H_REIWA"]},
  {name: "H_SHAMIN", label: "社民党得票数", func: "sum", args:["H_SHAMIN"]},
  {name: "H_NHK", label: "NHK党得票数", func: "sum", args:["H_NHK"]},
  {name: "H_OTHER", label: "その他得票数", func: "sum", args:["H_OTHER"]},
  {name: "rulingR", label: "与党得票率(%)", func: "custom", args:["(", "H_JIMIN", "+", "H_KOMEI", ")", "/", "H_VALID_VOTE", "*", "100"], prec: 1, noprop:true},
  {name: "h_jiminR", label: "自民党得票率(%)", func: "rate", args:["H_JIMIN", "H_VALID_VOTE"], prec: 1},
  {name: "h_komeiR", label: "公明党得票率(%)", func: "rate", args:["H_KOMEI", "H_VALID_VOTE"], prec: 1},
  {name: "h_rikkenR", label: "立憲民主党得票率(%)", func: "rate", args:["H_RIKKEN", "H_VALID_VOTE"], prec: 1},
  {name: "h_ishinR", label: "日本維新の会得票率(%)", func: "rate", args:["H_ISHIN", "H_VALID_VOTE"], prec: 1},
  {name: "h_kyosanR", label: "共産党得票率(%)", func: "rate", args:["H_KYOSAN", "H_VALID_VOTE"], prec: 1},
  {name: "h_kokuminR", label: "国民民主党得票率(%)", func: "rate", args:["H_KOKUMIN", "H_VALID_VOTE"], prec: 1},
  {name: "h_reiwaR", label: "れいわ新選組得票率(%)", func: "rate", args:["H_REIWA", "H_VALID_VOTE"], prec: 1},
  {name: "h_shaminR", label: "社民党得票率(%)", func: "rate", args:["H_SHAMIN", "H_VALID_VOTE"], prec: 1},
  {name: "h_nhkR", label: "NHK党得票率(%)", func: "rate", args:["H_NHK", "H_VALID_VOTE"], prec: 1},
  {name: "h_otherR", label: "その他得票率(%)", func: "rate", args:["H_OTHER", "H_VALID_VOTE"], prec: 1}
]}];

var Senkyo_estimate = ["H_VOTE", "H_VALID_VOTE", "H_JIMIN", "H_KOMEI", "H_RIKKEN", "H_ISHIN", "H_KYOSAN", "H_KOKUMIN", "H_REIWA", "H_SHAMIN", "H_NHK", "H_OTHER"];

var Dataset = [
  {name: "kokusei2020", label: "2020年国勢調査", date: "2020-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2020", lineFile: "line_calc.geojson", lineObj: "line2020", csvFile: "2020kokusei.csv", csvObj: "kokusei2020", category: Categories_kokusei_2020, attr: [{label: "令和2年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2020/index.html"}]},
  {name: "kokusei2020old", label: "2020年国勢調査[旧市町村単位]", polygonFile: "2020kokusei_old.geojson", polygonObj: "polygon2020Old", lineFile: "2020kokusei_old_l.geojson", lineObj: "line2020Old", csvFile: "2020kokusei_old.csv", csvObj: "kokusei2020Old", category: Categories_kokusei_old, attr: [{label: "令和2年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2020/index.html"}]},
  {name: "kokusei2015", label: "2015年国勢調査", date: "2015-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2015", lineFile: "line_calc.geojson", lineObj: "line2015", csvFile: "2015kokusei.csv", csvObj: "kokusei2015", category: Categories_kokusei_2015, attr: [{label: "平成27年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2015/index.html"}]},
  {name: "kokusei2010", label: "2010年国勢調査", date: "2010-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2010", lineFile: "line_calc.geojson", lineObj: "line2010", csvFile: "2010kokusei.csv", csvObj: "kokusei2010", category: Categories_kokusei_2015, attr: [{label: "平成22年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2010/index.html"}]},
  {name: "kokusei2005", label: "2005年国勢調査", date: "2005-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2005", lineFile: "line_calc.geojson", lineObj: "line2005", csvFile: "2005kokusei.csv", csvObj: "kokusei2005", category: Categories_kokusei_2015, attr: [{label: "平成17年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2005/index.html"}]},
  {name: "kokusei2000", label: "2000年国勢調査", date: "2000-10-01", polygonFile: "polygon.geojson", polygonObj: "polygon2000", lineFile: "line_calc.geojson", lineObj: "line2000", csvFile: "2000kokusei.csv", csvObj: "kokusei2000", category: Categories_kokusei_2000, attr: [{label: "平成12年国勢調査", link: "https://www.stat.go.jp/data/kokusei/2000/index.html"}]},
  {name: "keizaicensus2016", label: "2016年経済センサス", date: "2016-06-01", polygonFile: "polygon.geojson", polygonObj: "polygon2016", lineFile: "line_calc.geojson", lineObj: "line2016", csvFile: "2016keizai.csv", csvObj: "keizai2016", category: Categories_keizai, attr: [{label: "平成28年経済センサス-活動調査", link: "https://www.stat.go.jp/data/e-census/2016/index.html"}]},
  {name: "senkyo2021", label: "2021年衆院選", polygonFile: "2021shosenkyoku.geojson", polygonObj: "senkyo2021", lineFile: "2021shosenkyoku_l.geojson", lineObj: "senkyoLine2021", csvFile: "2021election.csv", csvObj: "election2021", category: Categories_senkyo, estimate: Senkyo_estimate, attr: [{label: "総務省：選挙関連資料", link: "https://www.soumu.go.jp/senkyo/senkyo_s/data/shugiin49/index.html"}, {label: "各都道府県選管資料"}]}
];
