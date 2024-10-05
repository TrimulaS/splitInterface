
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
            let currentVal = parseInt(window.getComputedStyle(targetDiv).getPropertyValue(item.prop).replace('px', ''));
            targetDiv.style[item.prop] = `${currentVal + item.delta}px`;
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

    // Функция разделения div
    function splitDiv(targetDiv, direction) {
        const splitterSize = 10;    //10 pixels width or height of splitters

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
            console.log(`Created: ${area.id}`);
            targetDiv.appendChild(area);

            // display: flex;
            // flex-direction: row;

            if (direction === 'horizontal') {
                targetDiv.style.display = 'flex';
                targetDiv.style.flexDirection = 'row'
                
                area.style.flexGrow = 1;
                //area.style.alignItems = 'stretch';

                // area.style.width = `${areaSize}px`;
                // area.style.height = `100%`;
                // area.style.left = `${i * (areaSize + 5)}px`;
                // area.style.top = '0';

            } else {
                targetDiv.style.display = 'flex';
                targetDiv.style.flexDirection = 'column'
                
                area.style.flexGrow = 1;

                // area.style.width = `100%`;
                // area.style.height = `${areaSize}px`;
                // area.style.top = `${i * (areaSize + 5)}px`;
                area.style.left = '0';
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

                console.log(`Created: ${splitter.id}`);
                if (direction === 'horizontal') {
                    // splitter.style.left = `${(i + 1) * areaSize + i * splitter.style.width}px`;
                    // splitter.style.top = '0';
                    splitter.style.width = splitterSize + 'px';
                    // splitter.style.height = '100%';

                } else {
                    // splitter.style.top = `${(i + 1) * areaSize + i * splitter.style.height}px`;
                    // splitter.style.left = '0';
                    splitter.style.height = splitterSize + 'px';
                    // splitter.style.width = '100%';
                }

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
        const element = splitter.previousElementSibling; //document.querySelector(div);
        const element2 = splitter.nextElementSibling;;


    
        const minimum_size = 20;                    //Minimal size to stop resize
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
        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        original_x = element.getBoundingClientRect().left;
        original_y = element.getBoundingClientRect().top;
        original_width2 = parseFloat(getComputedStyle(element2, null).getPropertyValue('width').replace('px', ''));
        original_height2 = parseFloat(getComputedStyle(element2, null).getPropertyValue('height').replace('px', ''));
        original_x2 = element2.getBoundingClientRect().left;
        original_y2 = element2.getBoundingClientRect().top;

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
            const parent = splitter.parentElement;
            if (splitter.classList.contains('horizontal-splitter')) {   
                const deltaX = e.pageX - original_mouse_x;                  //bottom-right
                const width = original_width + deltaX;
                const width2 = original_width2 - deltaX;

                const rect = parent.getBoundingClientRect();
                const localX = event.clientX - rect.left; // Координаты мыши по X в пределах div
                const localY = event.clientY - rect.top;  // Координаты мыши по Y в пределах div
                console.log('Локальные координаты мыши:', localX, localY, '           Координаты div:', rect.left, rect.top);


                if (width > minimum_size && width2 > minimum_size) {
                element.style.width = width + 'px'
                element2.style.width = width2 + 'px'
                element2.style.left = original_x2 + (e.pageX - original_mouse_x) + 'px'
                splitter.style.left = original_xS + (e.pageX - original_mouse_x) + 'px'
                console.log
                }
        
            }
            else if (splitter.classList.contains('vertical-splitter')) {
                const height = original_height + (e.pageY - original_mouse_y)
                const height2 = original_height2 - (e.pageY - original_mouse_y)
        
                if (height > minimum_size && height2 > minimum_size) {
                element.style.height = height + 'px'
                element2.style.height = height2 + 'px'
                element2.style.top = original_y2 + (e.pageY - original_mouse_y) + 'px'
                splitter.style.top = original_yS + (e.pageY - original_mouse_y) + 'px'
                }
            }
        
        

    
        }
        function stopResize() {
            window.removeEventListener('mousemove', resize)
        }
    
    }


})



//});

