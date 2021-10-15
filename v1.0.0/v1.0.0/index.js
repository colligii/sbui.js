(() => {

    const imgClassState = SBUI.useState('');

    const counter = SBUI.useState(0);

    SBUI.Element(SBUI.alreadyInPage["1"], {
        className: imgClassState,
        onmouseover:() => {
            imgClassState.setState('animation');

            setTimeout(() => {
                imgClassState.setState('');
            }, 1000)
        }
    })

    SBUI.Element(SBUI.alreadyInPage.counter, {
        innerText: counter
    })

    SBUI.Element(SBUI.alreadyInPage.add, {
        onclick: () => {
            counter.setState(counter.value+1);
        }
    })

    SBUI.Element(SBUI.alreadyInPage.remove, {
        onclick: () => {
            if(counter.value > 0) counter.setState(counter.value-1);
        }
    })
    

})()