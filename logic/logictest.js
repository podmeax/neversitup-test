function validate(pin) {
    let result = true
    let duplicate = 0
    let ordering = 0
    let duplicateSet = 0
    let pinArray = (pin + "").split("")
    if(pinArray.length<6){
        result = false
    }else{
        let lastNumber = pinArray[0]
        for(let i=1; i<pinArray.length; i++){
            if(pinArray[i]==lastNumber){
                duplicate++
                //
                if(duplicate==3){
                    result = false
                    break
                }
                
                if(duplicate==1){
                    duplicateSet++
                    if(duplicateSet==3){
                        result = false
                        break
                    }
                }
            }else{
                duplicate = 0
            }

            if(pinArray[i]==((lastNumber- -0) + 1)){
                ordering++
                if(ordering==3){
                    result = false
                    break
                }
            }else{
                ordering = 0
            }
            lastNumber = pinArray[i]
        }
    }
    console.log(result) 
}

validate(11224685785)