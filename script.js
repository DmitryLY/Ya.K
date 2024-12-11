window.addEventListener('load', initRollingString);

function initRollingString(){

    var intervalTime = 10;

    var containers = document.querySelectorAll('.rolling_string');
    
    for( let container of containers ){
        rollingString(container);
    }

    function rollingString(container){

        var string = document.createElement('div');
        string.innerHTML = container.innerHTML;
        container.innerHTML = '';
        container.appendChild( string );
        
        container.addEventListener('selectstart', (e)=>e.preventDefault())

        function extendString(x){

            function setOriginal( element, original ){
                Object.defineProperty( element, 'original', {value: original, writable: false, configurable: false });
            }

            function setOriginals(){
                for( let child of string.children ){
                    if( !child.original )
                        setOriginal(child,child);
                }
            }

            function getfirstOriginal(){
                for( let child of string.children ){
                    if( child.original === child ){
                        return child;
                    }
                }
            }

            while( (last = string.children[ string.children.length - 1 ]) && ( last.offsetLeft + last.offsetWidth <= -x + container.offsetWidth ) ){

                setOriginals();

                let element = last?.original.nextElementSibling?.original || getfirstOriginal();

                if( element.offsetLeft + element.offsetWidth > -x ){
                    let clone = element.cloneNode( true );
                    setOriginal( clone, element.original );
                    string.appendChild(clone);
                }else{

                    for( let child of string.children ){
                        
                        if( child === element || child.original === child )
                            break;
                        
                        child.parentNode.removeChild( child );
                        x += child.offsetWidth;

                    }

                    string.appendChild(element);
                    x += element.offsetWidth;
                }

            }

            return x;

        }

        function letRolling(){

            var computedTransform = new DOMMatrixReadOnly( window.getComputedStyle( string ).transform );
            var x = computedTransform.m41;

            x = extendString(--x);

            string.style.transform = 'translateX('+ x +'px)';
        }

        var interval = setInterval(
            letRolling, intervalTime
        );

    }

}




document.addEventListener('DOMContentLoaded', transformStep);

function transformStep(){
    var steps = document.querySelector('.steps');
    var steps_items = [].slice.call( steps.querySelectorAll('.step') );
    var slider, steps_nav_slider;

    window.addEventListener('resize', transform);
    transform();

    function transform(){
        var steps_content;
    
        if( document.body.offsetWidth < 700 ){

            steps_content = steps.querySelector('.content ');

            if( !steps_content )
                return;

            var box_step = document.createElement('div');
            box_step.className = 'box_step';

            steps_content.insertBefore(box_step, steps_items[2]);

            box_step.appendChild( steps_items[0] );
            box_step.appendChild( steps_items[1] );

            var box_step = document.createElement('div');
            box_step.className = 'box_step';

            steps_content.insertBefore(box_step, steps_items[5] );

            box_step.appendChild( steps_items[3] );
            box_step.appendChild( steps_items[4] );

            steps_nav_slider = document.createElement('div');
            steps_nav_slider.className = 'nav_slider';
            steps_nav_slider.innerHTML = document.querySelector('.members .nav_slider').innerHTML;

            steps.appendChild( steps_nav_slider );

            slider = new sliderInit( steps_content, steps_nav_slider, { mobile: true } );

        }else{

            if( slider )
                slider.destroy();

            if( steps_nav_slider ){
                steps_nav_slider.parentNode.removeChild( steps_nav_slider );
                steps_nav_slider = undefined;
            }

            steps_content = steps.querySelector('.content');

            if( !steps_content )
                return;

            for( let child of steps_items ){
                steps_content.appendChild( child );
            }

        }

    }

}


document.addEventListener('DOMContentLoaded', buttons_anchor);

function buttons_anchor(){

    var buttons = document.querySelectorAll('a[href^="#"]');

    for( let button of buttons ){
        let toElemSelector = button.getAttribute('href');
        let toElem = document.querySelector(toElemSelector);console.log( toElemSelector, toElem );
        if( !toElem )
            continue;

        button.addEventListener('click', scrollTo.bind( button, document.body, toElem, 300, 30 ));
    }

    function scrollTo( wp, to, time, offset, event ){

        event.preventDefault();

        var bcr = to.getBoundingClientRect();
        var to = bcr.top + wp.scrollTop - offset;
        var steps = to / (time/1000); 
        intervalStep = time / steps;
        intervalStep = intervalStep < 4 ? (( step = step * (4 / intervalStep) ), 4) : intervalStep;
        var step = to / ( time / intervalStep );
    
        function stepTo(){
            if( wp.scrollTop >= to ){
                wp.scrollTop = to;
                clearInterval( interval_id );
                return;
            }
            wp.scrollTop += step; 
        }
    
        var interval_id = setInterval( stepTo, intervalStep);
        
    }

}




window.addEventListener('load', function(){

    let members_slider = document.querySelector('.members .slider');
    let members_nav_slider = document.querySelector('.members .nav_slider');
    new sliderInit( members_slider, members_nav_slider, {cycle: true, autoslide: 2000} );

});


    function sliderInit ( slider, nav, options ){

        if( !slider.children.length )
            return;
        
        var self = this;

        Object.defineProperty( this, 'curElement', {
            get(){
                return curElement;
            },
            set( element ){
                if( ! [].slice.call(slider_wp.children).includes( element ) )
                    return false;

                curElement = element;
                setWPX();
                showNavigation();
                return true;
            }
        });

        Object.defineProperty( this, 'getSliderWP', {
            get(){

                var width = 0;

                for( let slide of slider_wp.children ){
                    let gcs = window.getComputedStyle( slide );
                    width += slide.offsetWidth + parseInt(gcs.marginLeft) + parseInt(gcs.marginRight);
                }

                return width;
            },
            set(){

            }
        });

        this.destroy = function(){
            slider_wp.parentNode?.removeChild( slider_wp );
        }

        var curElement;
        
        var slider_wp = document.createElement('div');
        slider_wp.className = 'slider_wp';

        for( let i = 0; slider.children.length; i++ ){
            let child = slider.children[0];
            slider_wp.appendChild( child );
        }

        slider.appendChild( slider_wp );

        function setCurElement( direction ){

            if( direction !== 'prev' && direction !== 'next' )
                return

            var wpx = -getWPX(true) + ( direction !== 'prev' && slider.offsetWidth );
            !curElement && ( curElement = slider_wp.children[0] );
            var curElement_ =  curElement;
    
            do{

                let pre_cur_element = curElement_[ direction === 'prev' ? 'previousSibling' : 'nextSibling' ];
                
                if( !pre_cur_element ){

                    if( options?.cycle )
                        curElement_ = direction === 'prev' ? slider_wp.children[ slider_wp.children.length-1 ] : slider_wp.children[0] ;

                        break;
                }


                if( direction === 'next' ){
                    curElement_ = pre_cur_element;

                    if( pre_cur_element.offsetLeft + pre_cur_element.offsetWidth > wpx )
                        break
                }else if( direction === 'prev' ){
                    curElement_ = pre_cur_element;

                    if( pre_cur_element.offsetLeft < wpx )
                        break;
                }

            }while( curElement_ !== curElement );

            self.curElement = curElement_;

        }

        function getWPX(style){

            if( style )
                return slider_wp.style.transform.match(/translateX\((-?\d+)px\)/)?.[1] || 0;
            
            var computedTransform = new DOMMatrixReadOnly( window.getComputedStyle( slider_wp ).transform );
            return computedTransform.m41;

        }

        function setWPX(){

            var wpx = getWPX(), x;

            if( -wpx <= curElement.offsetLeft )
                x = wpx - ( ( curElement.offsetLeft + curElement.offsetWidth ) - ( - wpx + slider.offsetWidth ) );
            else
                x = wpx - ( curElement.offsetLeft + wpx );   

            if( x > 0 )
                x = 0;
            
            slider_wp.style.transform = 'translateX('+ x +'px)';

        }

        function showNavigation(){

            if( !navigation )  
                return;


            if( options?.mobile ){

                navigation.innerHTML = '';

                if( navigation.children.length !== slider_wp.children.length )
                    for( let child of slider_wp.children ){
                        let item = document.createElement('div');
                        item.classList = 'item';
                        Object.defineProperty( item, 'parent', { value: child, writable: false, configurable: false } );
                        navigation.appendChild(item);
                    }


                for( let item of navigation.children ){
                    item.classList.remove('active');
                    if( item.parent === curElement )
                        item.classList.add('active');
                }

            } else {
            
                let wpx = -getWPX(true) + slider.offsetWidth, num = 0;

                for( let child of slider_wp.children  ){
                    if( child.offsetLeft + child.offsetWidth > wpx )
                        break;
                    num++;
                }

                let cur = navigation.querySelector('.cur');
                let length = navigation.querySelector('.length');
                cur.innerText = (num || 1);
                length.innerText = slider_wp.children.length;
            }

            if( !options?.cycle ){

                let wpx = -getWPX(true), num = 0;
                
                prev_access = wpx - slider.offsetWidth >= 0;
                next_access = self.getSliderWP - ( wpx + slider.offsetWidth ) > 0;

                ( prev_access && !prev.classList.remove('disabled') ) || prev.classList.add('disabled');
                ( next_access && !next.classList.remove('disabled') ) || next.classList.add('disabled');
            }

        }

        var prev_access = options?.cycle, next_access = options?.cycle;

        if( nav instanceof HTMLElement ){

            var prev = nav.querySelector('.prev');
            var next = nav.querySelector('.next');
            var navigation = nav.querySelector('.navigation');

            nav.addEventListener('selectstart', (e)=>e.preventDefault())

            prev.addEventListener('click', function(){
                if( !prev_access )
                    return;

                setCurElement( 'prev' );
            });

            next.addEventListener('click', function(){
                if( !next_access )
                    return;

                setCurElement( 'next' );
            });


        }

        var autoslide_interval
        function autoslide(set){
            if( set )
                autoslide_interval = setInterval( setCurElement.bind( null, 'next' ), options.autoslide );
            else
            slider.addEventListener('mouseout', autoslide.bind(null, true), {once: true} ),
            clearInterval( autoslide_interval ), ( autoslide_interval = undefined );
        }

        if( options?.autoslide ){
            autoslide(true);
            slider.addEventListener('mouseover', autoslide.bind(null, false) )
        }

        self.curElement = slider_wp.children[0];

        window.addEventListener('resize', ()=>(self.curElement = curElement));

    }

