function again() {
    console.log("Again button pressed");
}

function hard() {
    console.log("Hard button pressed");
}

function good() {
    console.log("Good button pressed");
}

function easy() {
    console.log("Easy button pressed");
}

document.addEventListener('keydown', (event) => {
    if (!ankiMode || !mode.startsWith('study')) return;

    switch (event.key) {
        case '1':
            again();
            break;
        case '2':
            hard();
            break;
        case '3':
            good();
            break;
        case '4':
            easy();
            break;
    }
});
