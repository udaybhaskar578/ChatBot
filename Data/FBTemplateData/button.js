class Button{
    constructor(type=null,title=null,payload=null,url=null){
        this.type = type;
        this.url = url;
        this.payload = payload;
        this.title = title;
    }
}
module.exports = Button;