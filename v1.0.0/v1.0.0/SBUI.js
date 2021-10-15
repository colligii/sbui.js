const SBUI = (() => {

    let useMemoVar;

    class UseEffect{
        constructor(func, array) {
            if(typeof array === "undefined") {
                setInterval(func, 0);
            } else if(array instanceof Array) {
                if(array.length === 0) {
                    func();
                } else {
                    array.forEach(item => {
                        if(isHooks(item)) {
                            if(item instanceof UseState || item instanceof UseRef) {
                                item.whenChange.push(func);
                                func()
                            }
                        }
                    })
                }
            } else throw new Error("Array don't have a valid type of array")
            
        }
    }

    class UseRef{
        constructor() {
            this.elem = null;
            this.whenChange = [];
            this.setElem = (newElem) => {
                this.elem = newElem;
                this.whenChange.forEach(item => item(this.elem));
            }
        }
    }

    class UseState{
        constructor(value) {
            this.value = value;
            this.whenChange = [];
            this.setState = (newValue) => {
                this.value = newValue;
                this.whenChange.forEach(item => item(this.value));
            }
        }
    }

    function isHooks(testingValue) {
        if(testingValue instanceof UseState ||testingValue instanceof UseRef || testingValue instanceof UseEffect) return true
        return false;
    }

    function setProps(props, elem) {
        try{
            Object.keys(props).forEach(item => {
                if(item === "style") {
                    function setStyle(styleJson) {
                        try {
                            Object.keys(styleJson).forEach(styleItem => {
                                elem.style[styleItem] = isHooks(styleJson[styleItem]) ? (() => {
                                    styleJson[styleItem].whenChange.push((value) => {
                                        elem.style[styleItem] = value;
                                    });
                                    return styleJson[styleItem].value;
                                })() : styleJson[styleItem]; 
                            })
                        } catch(e) {
                            console.log('style have to be a json valid format');
                        }
                    }
                    let styleHookValue = props[item];
                    if(isHooks(props[item])) {
                       styleHookValue = props[item].value
                       props[item].whenChange.push(setStyle);
                    }
                    setStyle(styleHookValue);

                } else if(item === "ref" && props[item] instanceof UseRef){
                    props[item].setElem(elem);
                } else if(item === "childs"){
                    function setChilds(startRender){
                        elem.innerHTML = "";
                        startRender.forEach(elementCustom => elem.appendChild(elementCustom.elem));
                    }
                    if(isHooks(props[item])) {
                        if(props[item] instanceof UseState) {
                            setChilds(props[item].value);
                            props[item].whenChange.push(() => setChilds(props[item].value));
                        } else throw new Error("you just can use UseState hooks")
                    } else setChilds(props[item])


                } else if(item === "attrs"){
                    function setAttrs(attrs){
                        
                        Object.keys(attrs).forEach(attrsItem => {if(attrs[attrsItem] !== null) elem.setAttribute(attrsItem, attrs[attrsItem]); else elem.removeAttribute(attrsItem)});
                    }
                    if(isHooks(props[item])) {
                        if(props[item] instanceof UseState) {
                            setAttrs(props[item].value);
                            props[item].whenChange.push(() => setAttrs(props[item].value));
                        } else throw new Error("you just can use UseState hooks")
                    } else setAttrs(props[item])


                } else if(isHooks(props[item])) {
                    function setPropsHook() {
                        elem[item] = props[item].value;
                    }

                    props[item].whenChange.push(setPropsHook);
                    setPropsHook();
                } else {
                    elem[item] = props[item];
                }
            });
        } catch(e) {
            console.log('props have to be a json valid format');
        }
    }

    class SBuiElement{
        constructor(elem, props, attrs) {
            this.elem = isHooks(elem) ? new Error("Elem can't be a hook") : elem instanceof Element ? elem : document.createElement(elem);
            if(props !== null && props !== undefined) {
                if(isHooks(props)) {
                    if(props instanceof UseState) {
                        setProps(props.value, this.elem);
                        props.whenChange.push(() => {
                            setProps(props.value, this.elem);
                        })
                    } else throw new Error("just useState hooks can be used at props");

                }
                else setProps(props, this.elem);
            }
            if(attrs !== undefined && attrs !== props) {
                if(isHooks(attrs)) {
                    if(attrs instanceof UseState) {
                    
                    }
                }
            }
        }
    }

    return {
        Element: function(elem, props) {
            return new SBuiElement(elem, props);
        },
        render: function(selector, element) {
            if(typeof selector !== "string" || !(element instanceof SBuiElement)) throw new Error('You pass some params wrong at render func.')
            document.querySelector(selector).innerHTML = "";
            document.querySelector(selector).appendChild(element.elem);
        },
        addToElement: function(selector, element) {
            if(typeof selector !== "string" || !(element instanceof SBuiElement)) throw new Error('You pass some params wrong at render func.')
            document.querySelector(selector).appendChild(element.elem);
        },
        useState: (value) => new UseState(value),
        useRef: () =>  new UseRef(),
        useEffect: (func, array) => new UseEffect(func, array),
        useMemo: () => [ useMemoVar, (memovalue) => useMemoVar = memovalue ],  
        alreadyInPage: (() => {
            const elems = {};
            
            Array.from(document.querySelectorAll('[sbuielement]')).forEach(item => {
                if(!(item.getAttribute('sbuielement') in elems)) elems[item.getAttribute('sbuielement')] = item;
                item.removeAttribute('sbuielement');
            })
            

            return elems
        })()
    }

})()