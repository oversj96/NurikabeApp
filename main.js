const electron = require('electron');
const path = require('path');
const url = require('url');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;

// init win
let win;
let patternCounter;
// When ready, create the window
app.on('ready', createWindow);

// Quite when windows are closed

function createWindow() {
    // Create browser window
    win = new BrowserWindow({
        width: 800,
        height: 600
    });

    // Load index file
    win.loadURL(url.format({
        webPreferences: {
            nodeIntegration: true
        },
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
    // Quit app when closed
    win.on('closed', function () {
        app.quit();
    });

    // Load dev tools.
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
}

// Menu Template
const mainMenuTemplate = [{
    label: 'File',
    submenu: [{
            label: 'Add Item',
            click() {
                createPatternCounter();
            }
        },
        {
            label: 'Clear Items'
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }
    ]
}];

function createPatternCounter() {
    // Create browser window
    patternCounter = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 200,
        height: 300,
        title: "Add New Pattern Counter"
    });

    // Load index file
    patternCounter.loadURL(url.format({
        pathname: path.join(__dirname, 'patternCounter.html'),
        protocol: 'file',
        slashes: true
    }));

    // Garbage Collection Handle
    patternCounter.on('close', function () {
        patternCounter = null;
    });
}

// If we are on a mac, we need an empty object in the menu to get File
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Catch dimensionsItem
ipcMain.on('dimensionItems', function(e, item){
    console.log(item);
    win.webContents.send('dimensionItems', item);
    patternCounter.close();
});

// Add DevTools if we are not in production package
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}