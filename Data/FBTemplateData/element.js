class Element {
    constructor(title=null, subtitle=null, image_url= null,buttons=null) {
        // always initialize all instance properties
        this.title = title;
        this.subtitle = subtitle;
        this.image_url = image_url;
        this.buttons = buttons;
    }

}

module.exports = Element;
