
//$(function() { 

// SPlitter classes:
// 'horizontal-splitter' : 'vertical-splitter');
   
    
document.addEventListener('DOMContentLoaded', () => {
    const workArea = document.getElementById('workArea');
    

    //-------------------------------------------------------------------Context Menu
    let spinnerContainer = document.createElement('div');
    let spinnerLabel = document.createElement('label');
    spinnerLabel.textContent = 'Spinner: ';
    let spinner = document.createElement('input');
    spinner.id = 'spinner';
    spinner.type = 'number';
    spinner.min = '2';
    spinner.max = '10';
    spinner.value = '2';
    spinnerContainer.appendChild(spinnerLabel);
    spinnerContainer.appendChild(spinner);

   
    let contextMenu = document.createElement('ul');
    contextMenu.id = 'contextMenu';
    contextMenu.classList.add('context-menu');
    
    let splitHorizontal = document.createElement('li');
    splitHorizontal.id = 'splitHorizontal';
    splitHorizontal.textContent = " |  Разделить горизонтально";
    
    let splitVertical = document.createElement('li');
    splitVertical.id = 'splitVertical';
    splitVertical.textContent = ' ⎯  Разделить вертикально';

    let separator = document.createElement('hr');
    contextMenu.appendChild(separator); // Вставить разделитель


    let deleteArea = document.createElement('li');
    deleteArea.id = 'deleteArea';
    deleteArea.textContent = 'Delete area';

    contextMenu.append(spinnerContainer, splitHorizontal, splitVertical, separator, deleteArea);

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
            let targetDiv = contextMenu.relatedDiv;
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




    
    document.getElementById('splitHorizontal').addEventListener('click', () => {
        const targetDiv = contextMenu.relatedDiv;
        if (targetDiv) splitDiv(targetDiv, 'horizontal');
        hideContextMenu();
    });
    
    document.getElementById('splitVertical').addEventListener('click', () => {
        const targetDiv = contextMenu.relatedDiv;
        if (targetDiv) splitDiv(targetDiv, 'vertical');
        hideContextMenu();
    });

    // Показ контекстного меню
    function showContextMenu(e) {
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.display = 'block';
        contextMenu.relatedDiv = e.target; // Запоминаем div, на котором вызвано меню
    }

    // Скрытие контекстного меню
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    document.addEventListener('click', () => {
        // Проверяем, если клик был вне contextMenu
        if (!contextMenu.contains(event.target)) {
            hideContextMenu();
        }
    });

    deleteArea.addEventListener('click', () => {
        const targetDiv = contextMenu.relatedDiv;
        
        if (targetDiv.id === 'workArea') {
            alert("You can't delete the main work area!");
            return;
        }
    
        const previousSplitter = targetDiv.previousElementSibling;
        const nextSplitter = targetDiv.nextElementSibling;
        const parent = targetDiv.parentElement;
    
        // Если есть сплиттеры с обеих сторон
        if (previousSplitter && previousSplitter.classList.contains('splitter') && nextSplitter && nextSplitter.classList.contains('splitter')) {
            parent.removeChild(previousSplitter); // Удаляем первый сплиттер
            parent.removeChild(targetDiv); // Удаляем сам div
            nextSplitter.previousElementSibling.style.width = '50%'; // Равномерное распределение
            nextSplitter.nextElementSibling.style.width = '50%';
        } else if (previousSplitter && previousSplitter.classList.contains('splitter')) {
            parent.removeChild(previousSplitter); // Удаляем сплиттер
            parent.removeChild(targetDiv); // Удаляем div
            nextSplitter.style.width = '100%'; // Растягиваем оставшийся div на всё пространство
        } else if (nextSplitter && nextSplitter.classList.contains('splitter')) {
            parent.removeChild(nextSplitter);
            parent.removeChild(targetDiv);
            previousSplitter.style.width = '100%';
        }
        
        hideContextMenu();
    });
    





    

    const splitCoefficientInput = document.getElementById('spinner');
    let splitCoefficient = parseInt(splitCoefficientInput.value);

    let draggedSplitter = null;
    let startX = 0, startY = 0, startWidth = 0, startHeight = 0;

    splitCoefficientInput.addEventListener('input', () => {
        splitCoefficient = parseInt(splitCoefficientInput.value);
    });

    // Показ контекстного меню
    workArea.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e);
    });



    //---------------------------------------------------------------------------------dividing
    const splitterSize = 20;    //10 pixels width or height of splitters
    // Функция разделения div
    function splitDiv(targetDiv, direction) {
        

        const rect = targetDiv.getBoundingClientRect();
        const totalSize = direction === 'horizontal' ? rect.width : rect.height;
        const availableSize = totalSize - (splitCoefficient - 1) * 5; // Учитываем размеры splitters
        const areaSize = availableSize / splitCoefficient;

        // Очищаем родительский div
        targetDiv.innerHTML = '';
        const splitters = [];  // to  strore splitters during creation and assign listener afterwards
        // Создаем рабочие области и сплиттеры
        for (let i = 0; i < splitCoefficient; i++) {
            const area = document.createElement('div');
            // area.style.position = 'absolute';
            area.classList.add('area');
            area.id = targetDiv.id + '_area';
            area.style.backgroundColor = 'rgba(' + (255 * Math.random()) + ',' +  (255 * Math.random()) + ',' +  (255 * Math.random()) + ', 0.5)'; 
            // area.style.alignItems = 'stretch';
            area.style.flexGrow = 0;
            console.log(`Created: ${area.id}`);
            targetDiv.appendChild(area);

            // display: flex;
            // flex-direction: row;

            if (direction === 'horizontal') {
                targetDiv.style.display = 'flex';
                targetDiv.style.flexDirection = 'row'
                
                // area.style.flexGrow = 1;


            } else {
                targetDiv.style.display = 'flex';
                targetDiv.style.flexDirection = 'column'
                
                

            }

            area.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e);
            });

            // Добавляем сплиттеры между рабочими областями 1 less of Areas
            if (i < splitCoefficient - 1) {
                const splitter = document.createElement('div');
                // area.style.position = 'absolute';
                splitter.classList.add('splitter');
                splitter.classList.add(direction === 'horizontal' ? 'horizontal-splitter' : 'vertical-splitter');
                splitter.id = targetDiv.id + '_splitter-' + direction + '';
                splitter.style.backgroundColor = 'rgba(' + (255 * Math.random()) + ',' +  (255 * Math.random()) + ',' +  (255 * Math.random()) + ', 0.5)'; 
                // splitter.style.alignItems = 'stretch';

                console.log(`Created: ${splitter.id}`);
                splitter.style.flex = `0 0 ${splitterSize}px`;
                // if (direction === 'horizontal') {
                //     splitter.style.flexBasis = splitterSize + 'px';
                //     // splitter.style.width = splitterSize + 'px';
    


                // } else {
                //     splitter.style.flexBasis = splitterSize + 'px';
                //     // splitter.style.height = splitterSize + 'px';

                // }

                splitters.push(splitter);
                targetDiv.appendChild(splitter);
            }
        }
        splitters.forEach(element => {
            makeResizableDiv(element);
        });
        
    }

    //-----------------------------------------------------------------------------------------resizing

    function makeResizableDiv(splitter) {
        const areaPrev = splitter.previousElementSibling; //document.querySelector(div);
        const areaNext = splitter.nextElementSibling;;


    
        const minimum_size = 5;                    //Minimal size % of parent to stop resize
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_width2 = 0;
        let original_height2 = 0;
        let original_x2 = 0;
        let original_y2 = 0;
        let original_widthS = 0;
        let original_heightS = 0;
        let original_xS = 0;
        let original_yS = 0;


        let original_mouse_x = 0;
        let original_mouse_y = 0;
    
    
        splitter.addEventListener('mousedown', function(e) {
        e.preventDefault()
        original_width = parseFloat(getComputedStyle(areaPrev, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(areaPrev, null).getPropertyValue('height').replace('px', ''));
        original_x = areaPrev.getBoundingClientRect().left;
        original_y = areaPrev.getBoundingClientRect().top;
        original_width2 = parseFloat(getComputedStyle(areaNext, null).getPropertyValue('width').replace('px', ''));
        original_height2 = parseFloat(getComputedStyle(areaNext, null).getPropertyValue('height').replace('px', ''));
        original_x2 = areaNext.getBoundingClientRect().left;
        original_y2 = areaNext.getBoundingClientRect().top;

        original_widthS = parseFloat(getComputedStyle(splitter, null).getPropertyValue('width').replace('px', ''));
        original_heightS = parseFloat(getComputedStyle(splitter, null).getPropertyValue('height').replace('px', ''));
        original_xS = splitter.getBoundingClientRect().left;
        original_yS = splitter.getBoundingClientRect().top;
    
    
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
        })
        
    
        //'horizontal-splitter' : 'vertical-splitter');
        function resize(e) {
            // if (!isDragging) return;
            const parentRect = splitter.parentNode.getBoundingClientRect();
            const splitterRect = splitter.getBoundingClientRect();
            if (splitter.classList.contains('horizontal-splitter')) {   

                // Получаем текущие координаты мыши и ширину родителя
                const newLeft = e.clientX - parentRect.left;
                const parentWidth = parentRect.width;

                //Calculate local coordonates mouse on splitter:
                const splitterMouseLeft = e.clientX - splitterRect.left;
                // console.log('mouse local x : ' + splitterMouseLeft);

                // Устанавливаем ширину первого блока с учетом ширины splitter
                // const leftFlex = ((newLeft - splitterMouseLeft) / parentWidth) * 100;
                const leftFlex = ((newLeft - splitterSize / 2) / parentWidth) * 100;

                if(leftFlex > minimum_size && leftFlex <100 - minimum_size){
                    areaPrev.style.flex = `0 0 ${leftFlex}%`;
                    areaNext.style.flexGrow = 1;
                }


        
            }
            else if (splitter.classList.contains('vertical-splitter')) {

    
                // Получаем текущие координаты мыши и ширину родителя
                const newTop = e.clientY - parentRect.top;
                const parentHeight = parentRect.height;
    
                //Calculate local coordonates mouse on splitter:
                // const splitterMouseTop = e.clientY - splitterRect.top;
                // console.log('mouse local y : ' + splitterMouseTop);
    
                // Устанавливаем ширину первого блока с учетом ширины splitter
                const topFlex = ((newTop - splitterSize / 2) / parentHeight) * 100;
                if(topFlex > minimum_size && topFlex <100 - minimum_size){
                    areaPrev.style.flex = `0 0 ${topFlex}%`;
                    areaNext.style.flexGrow = 1;
                }
        
            }
        
        

    
        }
        function stopResize() {

            //Setup actual size and return settings: no grow and 

            if (splitter.classList.contains('horizontal-splitter')) {
                // Получаем текущую ширину элемента
                const currentWidth = areaNext.getBoundingClientRect().width;

                // Устанавливаем её в flex-basis
                areaNext.style.flexBasis = `${currentWidth}px`;

                // Отключаем flex-grow
                areaNext.style.flexGrow = '0';
            }
            else if (splitter.classList.contains('vertical-splitter')) {
                // Получаем текущую ширину элемента
                const currentHeight = areaNext.getBoundingClientRect().height;

                // Устанавливаем её в flex-basis
                areaNext.style.flexBasis = `${currentHeight}px`;

                // Отключаем flex-grow
                areaNext.style.flexGrow = '0';
            }


            window.removeEventListener('mousemove', resize)
        }
    
    }


})



//});

