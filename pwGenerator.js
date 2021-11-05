module.exports = function* passwordGenerator(option, string){

    if(option === 1){
        for(let ch of string){
            yield ch
        }   
    }
    else if(option === 2){
        for(let ch of string){
            for(let ch2 of string){
                yield ch+ch2
            }
        }
    }
    else if(option === 3){
        for(let ch of string){
            for(let ch2 of string){
                for(let ch3 of string){
                    yield ch+ch2+ch3
                }
            }
        }
    }
    else if(option === 4){
        for(let ch of string){
            for(let ch2 of string){
                for(let ch3 of string){
                    for(let ch4 of string){
                        yield ch+ch2+ch3+ch4
                    }
                }
            }
        }
    }
    
}

