const segment = document.querySelector('.segment');
const inputValue = document.getElementById('block-size');
const saveButton = document.getElementById('add-block');

let blocks = [];
let currentPosition = 0;
let ID = 0;

document.getElementById('add-block').addEventListener('click', () => {
    const blockSize = parseInt(document.getElementById('block-size').value);
    if (!isNaN(blockSize) && blockSize > 0) {
        addBlock(blockSize);
    }
});

document.getElementById('order-blocks').addEventListener('click', () => {
    orderBlocks();
});

inputValue.addEventListener('input', updateSum);

inputValue.addEventListener('input', validateInput);

function validateInput() {
    const value = Number(inputValue.value);

    if (value <= 0) {
        inputValue.value = '';
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createEmptyBlock(size, deletedIndex, targetElementId){
    const targetElement = document.getElementById(`blockId${targetElementId}`);
    const newBlock = document.createElement('div');
    newBlock.classList.add('block');
    newBlock.classList.add('deleted');
    newBlock.setAttribute('id', `blockId${ID}`);
    newBlock.style.width = `${size}px`;

    blocks[deletedIndex + 1] = {
        block: newBlock,
        size: size,
        isDeleted: true,
        id: ID++,
    };

    targetElement.insertAdjacentElement('afterend', newBlock);
}

function sumOfSizesGreater() {
    let sum = 0;

    for (const block of blocks) {
        if (typeof block.size === 'number' && !block.isDeleted) {
            sum += block.size;
        }
    }
    return sum
}

function updateSum() {
    const value = Number(inputValue.value);

    const sum = sumOfSizesGreater() + value;

    saveButton.disabled = sum > 600;
}

function orderBlocks() {
    blocks = blocks.filter(block => !block.isDeleted);
    const activeBlocks = blocks.filter(block => !block.isDeleted);
    const segment = document.querySelector('.segment');
    segment.innerHTML = '';

    let leftPosition = 0;

    activeBlocks.forEach(blockObject => {
        const block = blockObject.block;
        if (!block.classList.contains('deleted')) {
            const space = block.offsetWidth;
            block.style.left = `${leftPosition}px`;
            leftPosition += space + 2;
            segment.appendChild(block);
        }
    });

    currentPosition = leftPosition;
}

function mergeEmptyBlocks(){
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].isDeleted) {
            let mergedSize = blocks[i].size;
            let startIndex = i + 1;

            while (startIndex < blocks.length && blocks[startIndex].isDeleted) {
                mergedSize += blocks[startIndex].size;
                startIndex++;
            }

            if (startIndex - i > 1) {
                const targetElement = document.getElementById(`blockId${blocks[startIndex].id}`);
                const deletedBlocks = blocks.splice(i, startIndex - i);
                deletedBlocks.forEach(deletedBlock => deletedBlock.block.remove());

                const mergedBlock = document.createElement('div');
                mergedBlock.classList.add('block');
                mergedBlock.classList.add('deleted');
                mergedBlock.setAttribute('id', `blockId${ID}`);
                mergedBlock.style.width = `${mergedSize}px`;

                segment.insertBefore(mergedBlock, targetElement);
                blocks.splice(i, 0, { block: mergedBlock, size: mergedSize, isDeleted: true, id: ID });
            }
        }
    }
}

function createNew(blockObject, newBlock){
    blocks.push(blockObject);
    document.querySelector('.segment').appendChild(newBlock);
}

function sameSize(deletedIndex, blockObject, newBlock){

    const objectId = blocks[deletedIndex].id;
    const deletedBlock = blocks[deletedIndex].block;
    const targetElement = segment.children[deletedIndex];

    blocks[deletedIndex] = blockObject;

    segment.insertBefore(newBlock, targetElement);

    segment.replaceChild(newBlock,deletedBlock);

    const elementToRemove = document.getElementById(`blockId${objectId}`);
    elementToRemove.remove();
}

function smallSize(deletedIndex, size, blockObject, newBlock){

    const objectId = blocks[deletedIndex].id;
    const newSize =  blocks[deletedIndex].size - size;
    const targetElement = segment.children[deletedIndex];
    const elementToRemove = document.getElementById(`blockId${objectId}`);

    blocks.splice(deletedIndex,0, blockObject)

    segment.insertBefore(newBlock, targetElement);

    createEmptyBlock(newSize, deletedIndex, objectId);

    elementToRemove.remove();
}

function bigSize(deletedIndex, size){
    const objectId = blocks[deletedIndex].id;
    const firstBlockID =  ID++;
    const secondBlockID =  ID++;

    const firstBlockSize =  blocks[deletedIndex].size;
    const secondBlockSize =  size - blocks[deletedIndex].size ;

    const elementToRemove = document.getElementById(`blockId${objectId}`);
    const targetElement = document.getElementById(`blockId${objectId}`);

    const firstDiv = document.createElement('div');
    const secondDiv = document.createElement('div');

    const backgroundColorValue = getRandomColor();

    firstDiv.setAttribute('id', `blockId${firstBlockID}`);
    firstDiv.classList.add('block');
    firstDiv.style.width = `${firstBlockSize}px`;
    firstDiv.style.backgroundColor = backgroundColorValue;

    secondDiv.setAttribute('id', `blockId${secondBlockID}`);
    secondDiv.classList.add('block');
    secondDiv.style.width = `${secondBlockSize}px`;
    secondDiv.style.backgroundColor = backgroundColorValue;

    const firstBlockObject = {
        block: firstDiv,
        size: firstBlockSize,
        isDeleted: false,
        id: firstBlockID,
    };

    const secondBlockObject = {
        block: secondDiv,
        size: secondBlockSize,
        isDeleted: false,
        id: secondBlockID,
    };

    targetElement.insertAdjacentElement('afterend', firstDiv);
    segment.appendChild(secondDiv);

    function onClickHandler() {
        firstDiv.classList.toggle('selected');
        secondDiv.classList.toggle('selected');
    }

    function onDblClickHandler() {
        firstDiv.classList.add('deleted');
        firstBlockObject.isDeleted = true;
        secondDiv.classList.add('deleted');
        secondBlockObject.isDeleted = true;
    }

    firstDiv.addEventListener('click', onClickHandler);
    secondDiv.addEventListener('click', onClickHandler);

    firstDiv.addEventListener('dblclick', onDblClickHandler);
    secondDiv.addEventListener('dblclick', onDblClickHandler);

    blocks[deletedIndex] = firstBlockObject;
    blocks.push(secondBlockObject);

    elementToRemove.remove();

}

function addBlock(size) {
    const newBlock = document.createElement('div');
    newBlock.classList.add('block');
    newBlock.setAttribute('id', `blockId${ID}`);
    newBlock.style.width = `${size}px`;
    newBlock.style.backgroundColor = getRandomColor();

    const deletedIndex = blocks.findIndex(block => block.isDeleted);

    const blockObject = {
        block: newBlock,
        size: size,
        isDeleted: false,
        id: ID++,
    };

    newBlock.addEventListener('click', () => {
        newBlock.classList.toggle('selected');
    });

    newBlock.addEventListener('dblclick', () => {
        blockObject.isDeleted = true;
        newBlock.classList.add('deleted');
    });


    if(blocks.length && blocks[blocks.length - 1].isDeleted === true){
        const elementToRemove = document.getElementById(`blockId${blocks[blocks.length - 1].id}`);
        elementToRemove.remove();
        blocks.pop();
    }

    if(deletedIndex === -1){
        orderBlocks();
    }

    if(sumOfSizesGreater() >= 600){
        return
    }

    mergeEmptyBlocks();

    if (deletedIndex !== -1 && blocks[deletedIndex].block.parentNode === segment && blocks[deletedIndex].size === size) {
        sameSize(deletedIndex, blockObject, newBlock)
    } else
        if (deletedIndex !== -1 && blocks[deletedIndex].block.parentNode === segment && blocks[deletedIndex].size > size) {
            smallSize(deletedIndex, size, blockObject, newBlock);
    } else
        if (deletedIndex !== -1 && blocks[deletedIndex].block.parentNode === segment && blocks[deletedIndex].size < size) {
            bigSize(deletedIndex, size)
    } else {
            createNew(blockObject, newBlock);
    }
}



