
//$(function() { 

// SPlitter classes:
// 'splitter-horizontal' : 'splitter-vertical');




//-----------------------------------------------------------------------------------------       Main 
function addNestedSplit(component){
    // Очищаем родительский div
    component.innerHTML = '';

    const contextMenu = new ContextMenuSplit();
    contextMenu.addTo(component);
    contextMenu.splitHorizontal.addEventListener('click', () => {           // Legacy     document.getElementById('splitHorizontal').addEventListener('click', () => {
        const targetDiv = contextMenu.menu.targetDiv;
        if (targetDiv) splitDiv(targetDiv, 'horizontal');
        contextMenu.hideContextMenu();
    });
    
    contextMenu.splitVertical.addEventListener('click', () => {           // Legacy     document.getElementById('splitHorizontal').addEventListener('click', () => {
        const targetDiv = contextMenu.menu.targetDiv;
        if (targetDiv) splitDiv(targetDiv, 'vertical');
        contextMenu.hideContextMenu();
    });
    
    contextMenu.deleteArea.addEventListener('click', () => {       //document.getElementById('splitVertical').addEventListener('click', () => {
        const targetDiv = contextMenu.menu.targetDiv;
        if (targetDiv) console.log('delete current area ' + targetDiv.id);
        contextMenu.hideContextMenu();
    });


    divResizeHV(component);



     //---------------------------------------------------------------------------------dividing
    const splitterSize = 20;    //10 pixels width or height of splitters
    let counter = 0;

    splitDiv(component, 'horizontal');

    function splitDiv(parent, direction) {          //   'horizontal' or any other - 'vertical'
        


        const splitters = [];  // to  strore splitters during creation and assign listener afterwards

        
        // Создаем рабочие области и сплиттеры
        const splitCoefficient = parseInt(contextMenu.spinner.value);
        for (let i = 0; i < splitCoefficient; i++) {
            parent.style.display = 'flex';
            const area = document.createElement('div');

            area.classList.add('area');
            counter ++;
            area.id = counter + '_' + parent.id + '_area';
            area.style.backgroundColor = 'rgba(' + (255 * Math.random()) + ',' +  (255 * Math.random()) + ',' +  (255 * Math.random()) + ', 0.5)'; 
            // area.style.alignItems = 'stretch'; // it is bydefault
            area.style.display = 'flex';
            area.style.flex = `1 1 auto`;
            console.log(`Created: ${area.id}`);
            parent.appendChild(area);

            if (direction === 'horizontal') {
                parent.style.flexDirection = 'row'
            } else {
                parent.style.flexDirection = 'column'
            }

            contextMenu.addTo(area);

            // Добавляем сплиттеры между рабочими областями 1 less of Areas
            if (i < splitCoefficient - 1) {
                const splitter = document.createElement('div');
                counter ++;
                // area.style.position = 'absolute';
                splitter.classList.add('splitter');
                splitter.classList.add(direction === 'horizontal' ? 'splitter-horizontal' : 'splitter-vertical');
                splitter.id = counter + '_' + parent.id + '_splitter-' + direction + '';
                splitter.style.backgroundColor = 'rgba(' + (255 * Math.random()) + ',' +  (255 * Math.random()) + ',' +  (255 * Math.random()) + ', 0.5)'; 
                // splitter.style.alignItems = 'stretch';

                console.log(`Created: ${splitter.id}`);
                splitter.style.flex = `0 0 ${splitterSize}px`;
                splitters.push(splitter);
                parent.appendChild(splitter);
            }
        }
        splitters.forEach(element => {
            makeResizableDiv(element);
        });
        
    }
     //-----------------------------------------------------------------------------------------resizing

    function makeResizableDiv(splitter) {
        const parent  = splitter.parentElement;
        const areaPrev = splitter.previousElementSibling; //document.querySelector(div);
        const areaNext = splitter.nextElementSibling;;



        const minimum_size = 5;                    //Minimal size % of parent to stop resize
        // let original_width = 0;
        // let original_height = 0;
        // let original_x = 0;
        // let original_y = 0;
        // let original_width2 = 0;
        // let original_height2 = 0;
        // let original_x2 = 0;
        // let original_y2 = 0;
        // let original_widthS = 0;
        // let original_heightS = 0;
        // let original_xS = 0;
        // let original_yS = 0;


        let mouse_x_start = 0;
        let mouse_y_start = 0;

        let parentRect = null;
        let splitterRect = null;
        let rectPrev = null;
        let rectNex = null;

        let availableWidth = 0;
        let availableHeight = 0; 


        splitter.addEventListener('mousedown', function(e) {
            e.preventDefault()
            // original_width = parseFloat(getComputedStyle(areaPrev, null).getPropertyValue('width').replace('px', ''));
            // original_height = parseFloat(getComputedStyle(areaPrev, null).getPropertyValue('height').replace('px', ''));
            // original_x = areaPrev.getBoundingClientRect().left;
            // original_y = areaPrev.getBoundingClientRect().top;
            // original_width2 = parseFloat(getComputedStyle(areaNext, null).getPropertyValue('width').replace('px', ''));
            // original_height2 = parseFloat(getComputedStyle(areaNext, null).getPropertyValue('height').replace('px', ''));
            // original_x2 = areaNext.getBoundingClientRect().left;
            // original_y2 = areaNext.getBoundingClientRect().top;

            // original_widthS = parseFloat(getComputedStyle(splitter, null).getPropertyValue('width').replace('px', ''));
            // original_heightS = parseFloat(getComputedStyle(splitter, null).getPropertyValue('height').replace('px', ''));
            // original_xS = splitter.getBoundingClientRect().left;
            // original_yS = splitter.getBoundingClientRect().top;


            mouse_x_start = e.pageX;
            mouse_y_start = e.pageY;

            
            //Freeze all element and parent during splitter move:
            Array.from(parent.children).forEach(child => {
                if(child.classList.contains('area')){
                    const rect = child.getBoundingClientRect();
                    if(parent.style.flexDirection === 'row'){
                        child.style.flex = `0 0 ${rect.width}px`;
                        console.log(`fixed: ${child.id}  fles: ${child.style.flex}  w: ${rect.width} h: ${rect.height}`);
                    }else if(parent.style.flexDirection === 'column'){
                        child.style.flex = `0 0 ${rect.height}px`;
                        console.log(`fixed: ${child.id}  fles: ${child.style.flex} w: ${rect.width} h: ${rect.height}`);
                    }
                }
            });

            // define ranges
             parentRect = splitter.parentNode.getBoundingClientRect();
             splitterRect = splitter.getBoundingClientRect();
             rectPrev = areaPrev.getBoundingClientRect();
             rectNex = areaNext.getBoundingClientRect();
            
            // Space for distribution
            availableWidth = rectPrev.width + rectNex.width;      // - splitter.width;
            availableHeight = rectPrev.height + rectNex.height;     // - splitter.width;

            window.addEventListener('mousemove', resize)
            window.addEventListener('mouseup', stopResize)
        });
        

        //'splitter-horizontal' : 'splitter-vertical');
        function resize(e) {

            if (parent.style.flexDirection === 'row') {   
                mouse_x = e.pageX;

                const  deltaX = mouse_x_start - mouse_x;
                const prevNewWidth = rectPrev.width - deltaX;

                if(prevNewWidth > minimum_size && prevNewWidth < availableWidth - minimum_size){
                    areaPrev.style.flex = `0 0 ${prevNewWidth}px`;
                    areaNext.style.flex = `1 1 auto`;
                }        
            }
            else if (parent.style.flexDirection === 'column') {
                mouse_y = e.pageY;

                const  deltaY = mouse_y_start - mouse_y;
                const prevNewHeight = rectPrev.height - deltaY;

                if(prevNewHeight > minimum_size && prevNewHeight < availableHeight - minimum_size){
                    areaPrev.style.flex = `0 0 ${prevNewHeight}px`;
                    areaNext.style.flex = `1 1 auto`;
                }        
        
            }
        
        


        }
        function stopResize() {

            // //Setup actual size and return settings: no grow and 

            // if (splitter.classList.contains('splitter-horizontal')) {
            //     // Получаем текущую ширину элемента
            //     const currentWidth = areaNext.getBoundingClientRect().width;

            //     // Устанавливаем её в flex-basis
            //     areaNext.style.flexBasis = `${currentWidth}px`;

            //     // Отключаем flex-grow
            //     areaNext.style.flexGrow = '0';
            // }
            // else if (splitter.classList.contains('splitter-vertical')) {
            //     // Получаем текущую ширину элемента
            //     const currentHeight = areaNext.getBoundingClientRect().height;

            //     // Устанавливаем её в flex-basis
            //     areaNext.style.flexBasis = `${currentHeight}px`;

            //     // Отключаем flex-grow
            //     areaNext.style.flexGrow = '0';
            // }

            // //Unfreeze elements where size was not changed and parent during splitter move:
            // Array.from(parent.children).forEach(child => {
            //     if(child.classList.contains('area') && child !== areaPrev && child !== areaNext  ){  //&& child !== areaNext
            //         child.style.flexGrow = 1;
            //         child.style.flexShrink = 1;
            //         // console.log(`un- fixed: ${child.id}  fles: ${child.style.flex} w: ${rect.width} h: ${rect.height}`);
                    
            //     }
            // });

            

            window.removeEventListener('mousemove', resize)
            window.removeEventListener('mouseup', stopResize)
        }

    }

}








    //-------------------------------------------------------------------Context Menu





    class ContextMenuSplit{


        createContextMenu(){
            let spinnerContainer = document.createElement('div');
            let spinnerLabel = document.createElement('label');
            spinnerLabel.textContent = 'Spinner: ';
            this.spinner = document.createElement('input');
            this.spinner.id = 'spinner';
            this.spinner.type = 'number';
            this.spinner.min = '2';
            this.spinner.max = '10';
            this.spinner.value = '2';
            spinnerContainer.appendChild(spinnerLabel);
            spinnerContainer.appendChild(this.spinner);
        
            let contextMenu = document.createElement('ul');
            contextMenu.id = 'contextMenu';
            contextMenu.classList.add('context-menu');
            
            this.splitHorizontal = document.createElement('li');                    // Entry point to assign listener
            //splitHorizontal.id = 'splitHorizontal';
            this.splitHorizontal.textContent = " |  Разделить горизонтально";
            
            this.splitVertical = document.createElement('li');                       // Entry point to assign listener
            //splitVertical.id = 'splitVertical';
            this.splitVertical.textContent = ' ⎯  Разделить вертикально';
        
            let separator = document.createElement('hr');
            contextMenu.appendChild(separator); // Вставить разделитель
        
        
            this.deleteArea = document.createElement('li');
            //deleteArea.id = 'deleteArea';
            this.deleteArea.textContent = 'Delete area';
        
            contextMenu.append(spinnerContainer, this.splitHorizontal, this.splitVertical, separator, this.deleteArea);
        
            let propertiesMenu = [
                { id: 'leftPlus',    text: 'Left +10', prop: 'left', delta: 10 },
                { id: 'leftMinus',   text: 'Left -10', prop: 'left', delta: -10 },
                { id: 'topPlus' ,    text: 'Top +10', prop: 'top', delta: 10 },
                { id: 'topMinus',    text: 'Top -10', prop: 'top', delta: -10 },
                { id: 'widthPlus' ,  text: 'Width +10', prop: 'width', delta: 10 },
                { id: 'widthMinus',  text: 'Width -10', prop: 'width', delta: -10 },
                { id: 'heightPlus' , text: 'Height +10', prop: 'height', delta: 10 },
                { id: 'heightMinus', text: 'Height -10', prop: 'height', delta: -10 },
                { id: 'xPlus',       text: 'Z + 1', prop: 'z-index', delta: 1 },
                { id: 'xMinus',      text: 'Z - 1', prop: 'z-index', delta: -1 },
            ];
            
            propertiesMenu.forEach(item => {
                let btn = document.createElement('li');
                btn.id = item.id;
                btn.textContent = item.text;
                btn.addEventListener('click', () => {
                    let targetDiv = contextMenu.targetDiv;
                    let currentVal;
            
                    if (item.prop === 'z-index') {
                        // Если z-index не задан, установим значение по умолчанию 0
                        currentVal = parseInt(window.getComputedStyle(targetDiv).getPropertyValue(item.prop)) || 0;
                    } else {
                        currentVal = parseInt(window.getComputedStyle(targetDiv).getPropertyValue(item.prop).replace('px', '')) || 0;
                    }
            
                    targetDiv.style[item.prop] = item.prop === 'z-index' 
                        ? `${currentVal + item.delta}`  // z-index не нуждается в "px"
                        : `${currentVal + item.delta}px`;  // Для других свойств добавляем "px"
        
                    console.log(currentVal + ' - ' + item.prop + ' - ' + (currentVal + item.delta));
                });
                contextMenu.appendChild(btn);
            });
            document.body.appendChild(contextMenu);
            return contextMenu;
        }
    
        addListenres(){
 


            document.addEventListener('click', () => {
                // Проверяем, если клик был вне contextMenu
                if (!this.menu.contains(event.target)) {
                    this.hideContextMenu();
                }
            });
    
            
            // document.getElementById('deleteArea').addEventListener('click', () => {
            //     // const targetDiv = contextMenu.targetDiv;
                
            //     // if (targetDiv.id === 'workArea') {
            //     //     alert("You can't delete the main work area!");
            //     //     return;
            //     // }
            
            //     // const previousSplitter = targetDiv.previousElementSibling;
            //     // const nextSplitter = targetDiv.nextElementSibling;
            //     // const parent = targetDiv.parentElement;
            
            //     // // Если есть сплиттеры с обеих сторон
            //     // if (previousSplitter && previousSplitter.classList.contains('splitter') && nextSplitter && nextSplitter.classList.contains('splitter')) {
            //     //     parent.removeChild(previousSplitter); // Удаляем первый сплиттер
            //     //     parent.removeChild(targetDiv); // Удаляем сам div
            //     //     nextSplitter.previousElementSibling.style.width = '50%'; // Равномерное распределение
            //     //     nextSplitter.nextElementSibling.style.width = '50%';
            //     // } else if (previousSplitter && previousSplitter.classList.contains('splitter')) {
            //     //     parent.removeChild(previousSplitter); // Удаляем сплиттер
            //     //     parent.removeChild(targetDiv); // Удаляем div
            //     //     nextSplitter.style.width = '100%'; // Растягиваем оставшийся div на всё пространство
            //     // } else if (nextSplitter && nextSplitter.classList.contains('splitter')) {
            //     //     parent.removeChild(nextSplitter);
            //     //     parent.removeChild(targetDiv);
            //     //     previousSplitter.style.width = '100%';
            //     // }
                
            //     this.hideContextMenu();
            // });
        }
        
        addTo(component){
            component.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e);
            });
    
        }
        // отображение контекстного меню
        showContextMenu(e) {
            this.menu.style.left = `${e.pageX}px`;
            this.menu.style.top = `${e.pageY}px`;
            this.menu.style.display = 'block';
            this.menu.targetDiv = e.target; // Запоминаем div, на котором вызвано меню It is new inseted field
        }
    
        // Скрытие контекстного меню
            hideContextMenu() {
            this.menu.style.display = 'none';
        }
        constructor(){
            this.menu = this.createContextMenu();
            
            this.addListenres();
        }
    }
    
    
    

  

   


//---------------------------------------------------------------------Resizer for whole Container
// Adds resize control to bootom right
// function divResizeHV(component){

//     const style = document.createElement('style');
//     style.textContent = `
//         /* Resize button */
//         .corner-for-resize {
//             width: 10px;
//             height: 10px;
//             background-color: black;
//             border-style: solid ;
//             position: absolute;


//             right: 0;
//             bottom: -10px; /* Сдвигаем на 10px вниз за пределы workArea */
//             /* right: -10px; */
//             cursor: se-resize;
//             z-index: 10;
//         }
//     `;
//     document.head.appendChild(style);
//     // add resize control at bottom right
//     const bottomRight = document.createElement('div');
//     bottomRight.classList.add('corner-for-resize');
//     component.appendChild(bottomRight);
   
//     bottomRight.addEventListener('mousedown', startResizing);
   
//     function startResizing(e) {
//         const component = e.target.parentElement;
//         let startWidth = component.offsetWidth;
//         let startHeight = component.offsetHeight;
//         let startX = e.clientX;
//         let startY = e.clientY;
   
   
//         function onMouseMove(event) {
   
   
//             let newWidth =  startWidth + event.clientX - startX ;  //startWidth/2 + (event.clientX - startX); // ( startWidth + event.clientX - startX );  //startWidth/2 + (event.clientX - startX);  // Here / 2 due to auto center positioning
//             let newHeight = startHeight + (event.clientY - startY);
   
//             if(newWidth >  160) component.style.width =  `${newWidth}px` ;    //`${newWidth * 2 }px`; //`${newWidth }px`;    //`${newWidth * 2 }px`;           // Here * 2 due to auto center positioning 
//             if(newHeight > 100) component.style.height = `${newHeight}px`;
   
            
//         }
   
//         document.addEventListener('mousemove', onMouseMove);
   
//         document.addEventListener('mouseup', function mouseUpHandler() {
//             document.removeEventListener('mousemove', onMouseMove);
//             document.removeEventListener('mouseup', mouseUpHandler);
//         });
//     }
   
//    }
   
// function makeResizableParentDiv(parentDiv, areaMinimumSize) {
function divResizeHV(parentDiv, areaMinimumSize = 10){    
    const splitterClass = 'splitter';
    const areaClass = 'area';
    const dragHandleSize = 10; // Размер поля для drag внизу справа

    // Создаем drag-элемент в нижней правой части parentDiv
    const dragHandle = document.createElement('div');
    dragHandle.style.position = 'absolute';
    dragHandle.style.right = '0';
    dragHandle.style.bottom = '0';
    dragHandle.style.width = `${dragHandleSize}px`;
    dragHandle.style.height = `${dragHandleSize}px`;
    dragHandle.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dragHandle.style.cursor = 'se-resize'; // Указатель для drag
    parentDiv.appendChild(dragHandle);

    let originalWidth, originalHeight, originalMouseX, originalMouseY;
    let areas = Array.from(parentDiv.getElementsByClassName(areaClass));
    let originalAreaSizes = [];
    let resizing = false;

    // Функция для начала перетаскивания
    dragHandle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        resizing = true;

        originalWidth = parentDiv.getBoundingClientRect().width;
        originalHeight = parentDiv.getBoundingClientRect().height;
        originalMouseX = e.pageX;
        originalMouseY = e.pageY;

        // Сохраняем оригинальные размеры всех areas
        areas.forEach(area => {
            const rect = area.getBoundingClientRect();
            originalAreaSizes.push({ width: rect.width, height: rect.height });
        });

        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
        if (!resizing) return;

        const deltaX = e.pageX - originalMouseX;
        const deltaY = e.pageY - originalMouseY;

        let newWidth = originalWidth + deltaX;
        let newHeight = originalHeight + deltaY;

        // Ограничиваем размеры parentDiv по минимальным и максимальным значениям
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (newWidth > windowWidth) newWidth = windowWidth;
        if (newHeight > windowHeight) newHeight = windowHeight;

        // Изменяем размер parentDiv
        parentDiv.style.width = `${newWidth}px`;
        parentDiv.style.height = `${newHeight}px`;

        // Пропорционально изменяем размеры всех area элементов
        const widthRatio = newWidth / originalWidth;
        const heightRatio = newHeight / originalHeight;

        areas.forEach((area, index) => {
            const originalSize = originalAreaSizes[index];
            let newAreaWidth = originalSize.width * widthRatio;
            let newAreaHeight = originalSize.height * heightRatio;

            // Проверка минимальных размеров
            if (newAreaWidth < areaMinimumSize) newAreaWidth = areaMinimumSize;
            if (newAreaHeight < areaMinimumSize) newAreaHeight = areaMinimumSize;

            // Устанавливаем новые размеры для каждой области
            area.style.width = `${newAreaWidth}px`;
            area.style.height = `${newAreaHeight}px`;
        });

        // Проверка на минимальные размеры
        if (newWidth <= areaMinimumSize || newHeight <= areaMinimumSize) {
            stopResize();
        }
    }

    function stopResize() {
        resizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }
}

// // Пример использования:
// const parentDiv = document.getElementById('parentDiv');
// const areaMinimumSize = 50; // Минимальный размер для вложенных элементов
// makeResizableParentDiv(parentDiv, areaMinimumSize);



//});

