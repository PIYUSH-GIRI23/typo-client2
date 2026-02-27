const getPrefix = (type,length,difficulty) => {
    if(type=="quote"){
        return "qo";
    }

    if(length=="long" && difficulty=="easy") return "wel";
    if(length=="short" && difficulty=="easy") return "wes";
    if(length=="short" && difficulty=="hard") return "whs";
    if(length=="long" && difficulty=="hard") return "whl";
}

const generateKey = (type,length,difficulty) => {
    const maxPara = process.env.NEXT_PUBLIC_MAX_PARA || 10;
    const prefix = getPrefix(type,length,difficulty);
    const randNum = Math.floor(Math.random() * maxPara) + 1;
    return `${prefix}${randNum}`;
}

export default generateKey