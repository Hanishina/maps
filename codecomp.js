const Table2 = {"01": "A", "02": "B", "03": "C", "04": "D", "05": "E", "06": "F", "07": "G", "08": "H", "09": "I", "12": "J", "13": "K", "14": "L", "15": "M", "16": "N", "17": "O", "18": "P", "19": "Q", "23": "R", "24": "S", "25": "T", "26": "U", "27": "V", "28": "W", "29": "X", "34": "Y", "35": "Z", "36": "a", "37": "b", "38": "c", "39": "d", "45": "e", "46": "f", "47": "g", "48": "h", "49": "i", "56": "j", "57": "k", "58": "l", "59": "m", "67": "n", "68": "o", "69": "p", "78": "q", "79": "r", "89": "s"};
const Table2r = Object.fromEntries(Object.entries(Table2).map(e=>{return [e[1], e[0]]}));

function codecomp_encode(input){
    ///inputの重複排除と並べ替え
    input = new Set(input);
    input = [...input].sort();

    let output = "";
    let mode = "";
    let ken = "";
    let middle = "";
    let end = "";
    try{
        input.forEach(code=>{
            if(code.slice(0,2) != ken){
                ///新しい県
                ken = code.slice(0,2);
                middle = "";
                if(code[2] == "0"){
                    throw new Error("invalid code: " + code);
                }else if(code[2] == "1"){
                    ///区
                    output += "-";
                    mode = "区";
                }else{
                    ///市・町村
                    output += "_";
                    mode = "市";
                }
                if(parseInt(code.slice(0,2)) < 10){
                    output += code[1];
                }else if(parseInt(code.slice(0,2)) < 36){
                    output += String.fromCodePoint(0x41 + parseInt(code.slice(0,2)) - 10);
                }else if(parseInt(code.slice(0,2)) < 62){
                    output += String.fromCodePoint(0x61 + parseInt(code.slice(0,2)) - 36);
                }else{
                    throw new Error("invalid code: " + code);
                }
            }
            if(code[2] == "0"){
                throw new Error("invalid code: " + code);
            }else if(code[2] == "1"){
                ///区の場合
                if(code.slice(2,4) != middle){
                    ///中3桁が前のものと異なる
                    middle = code.slice(2,4);
                    end = code[4];
                    output += String.fromCodePoint(0x41 + parseInt(code.slice(2,4)) - 10);
                    output += code[4]; ///一旦5桁目を入力
                }else{
                    ///中3桁が前のものと同じ
                    if(end){
                        ///偶数個目
                        output = output.slice(0, -1) + Table2[end + code[4]];
                        end = "";
                    }else{
                        ///奇数個目
                        output += code[4]; ///一旦5桁目を入力
                        end = code[4];
                    }
                }
            }else if(code[2] == "2"){
                ///市の場合
                if(mode == "区"){
                    mode = "市";
                    output += "y" ///市の開始フラグ
                }
                if(code.slice(2,4) != middle){
                    ///中3桁が前のものと異なる
                    middle = code.slice(2,4);
                    end = code[4];
                    output += String.fromCodePoint(0x41 + parseInt(code.slice(2,4)) - 20);
                    output += code[4]; ///一旦5桁目を入力
                }else{
                    ///中3桁が前のものと同じ
                    if(end){
                        ///偶数個目
                        output = output.slice(0, -1) + Table2[end + code[4]];
                        end = "";
                    }else{
                        ///奇数個目
                        output += code[4]; ///一旦5桁目を入力
                        end = code[4];
                    }
                }
            }else{
                ///町村の場合
                if(["区", "市"].includes(mode)){
                    mode = "町村";
                    output += "z"; ///町村の開始フラグ
                }
                if(code.slice(2,4) != middle){
                    ///中3桁が前のものと異なる
                    middle = code.slice(2,4);
                    end = code[4];
                    if(parseInt(code.slice(2,4)) < 56){
                        output += String.fromCodePoint(0x41 + parseInt(code.slice(2,4)) - 30);
                    }else if(parseInt(code.slice(2,4)) < 82){
                        output += String.fromCodePoint(0x41 + parseInt(code.slice(2,4)) - 56);
                    }else{
                        throw new Error("invalid code: " + code);
                    }
                    output += code[4]; ///一旦5桁目を入力
                }else{
                    ///中3桁が前のものと同じ
                    if(end){
                        ///偶数個目
                        output = output.slice(0, -1) + Table2[end + code[4]];
                        end = "";
                    }else{
                        ///奇数個目
                        if(parseInt(code.slice(2,4)) < 56){
                            output += String.fromCodePoint(0x41 + parseInt(code.slice(2,4)) - 30);
                        }else if(parseInt(code.slice(2,4)) < 82){
                            output += String.fromCodePoint(0x61 + parseInt(code.slice(2,4)) - 56);
                        }else{
                            throw new Error("invalid code: " + code);
                        }
                        output += code[4]; ///一旦5桁目を入力
                        end = code[4];
                    }
                }
            }
        });
    }catch(e){
        console.error(e.name, e.message);
        return undefined;
    }
    return output;
}

function codecomp_decode(input){
    let output = [];
    let mode = "";
    let middle = "";
    let ken = "";
    let cursor = 0;
    input = input.split("");
    try{
        input.forEach(c=>{
            if(c == "-"){
                ///県
                ken = "";
                mode = "区";
                cursor = 0;
            }else if(c == "_"){
                ///県
                ken = "";
                mode = "市";
                cursor = 0;
            }else if(c.match(/[0-9]/)){
                if(!ken){
                    ///県番号フラグ
                    ken = "0" + c;
                }else{
                    ///5桁目表示文字
                    output.push(ken + middle + c);
                    cursor += 1;
                }
            }else if(c.match(/[A-Z]/)){
                if(!ken){
                    ///県番号フラグ
                    ken = String(c.codePointAt() - 65 + 10);
                }else if(["区", "市"].includes(mode)){
                    if(c.match(/[ABCDEFGHI]/) && cursor != 1){
                        ///中位表示文字
                        if(mode == "区"){
                            middle = "1" + String(c.codePointAt() - 65);
                        }else if(mode == "市"){
                            middle = "2" + String(c.codePointAt() - 65);
                        }
                        cursor = 1;
                    }else{
                        ///5桁目表示文字
                        let pair = Table2r[c];
                        output.push(ken + middle + pair[0]);
                        output.push(ken + middle + pair[1]);
                        cursor += 1;
                    }
                }else if(mode == "町村"){
                    if(cursor % 2 == 0){
                        ///中位表示文字
                        middle = String(c.codePointAt() - 65 + 30);
                        cursor += 1;
                    }else{
                        ///5桁目表示文字
                        let pair = Table2r[c];
                        output.push(ken + middle + pair[0]);
                        output.push(ken + middle + pair[1]);
                        cursor += 1;
                    }
                }
            }else if(c == "y" && mode == "区"){
                ///市の開始フラグ
                mode = "市";
                middle = "";
                cursor = 0;
            }else if(c == "z" && ["区", "市"].includes(mode)){
                ///町村の開始フラグ
                mode = "町村";
                middle = "";
                cursor = 0;
            }else if(c.match(/[a-z]/)){
                if(!ken){
                    ///県番号フラグ
                    ken = String(c.codePointAt() - 97 + 36);
                }else if(["区", "市"].includes(mode)){
                    ///5桁目表示文字
                    let pair = Table2r[c];
                    output.push(ken + middle + pair[0]);
                    output.push(ken + middle + pair[1]);
                    cursor += 1;
                }else if(mode == "町村"){
                    if(cursor % 2 == 0){
                        ///中位表示文字
                        middle = String(c.codePointAt() - 97 + 56);
                        cursor += 1;
                    }else{
                        ///5桁目表示文字
                        let pair = Table2r[c];
                        output.push(ken + middle + pair[0]);
                        output.push(ken + middle + pair[1]);
                        cursor += 1;
                    }
                }
            }
        });
    }catch(e){
        console.error(e.name, e.message);
        return undefined;
    }
    return output;
}