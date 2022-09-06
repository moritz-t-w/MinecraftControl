/**
 * Entry point
 * @authors Moritz Tim W.
 * @version 0.1.0
 */

import robot from 'robotjs';
import os from 'os';
import path from 'path';

const defaultPrefix = '/';
const optionsFilePath = path.sep + 'options.txt';

/** Represents an instance of Minecraft */
class Minecraft {

    /**
     * Create a new Minecraft instance
     * @param {string} [root] `.minecraft` dir location
     * @param {string} [version] version name
     * @param {Chat} [chat] Instance of Chat
     * @param {Command[]} [commands] available commands
     */
    constructor(root, version, chat, commands) {
        if (root === undefined) {
            this.root = root;
        } else {
            /** root path as array of dirs without the string 'minecraft' */
            let preRoot;
            switch (os.platform) {
                case 'win32': // Windows
                    preRoot = ['%AppData%', 'Roaming', '.'];
                    break;
                case 'darwin': // MacOS
                    preRoot = ['~', 'Library', 'Application Support'];
                    break;
                case 'linux':
                    preRoot = ['~', '.'];
                    break;
                default:
                    throw new Error('Unsupported OS');
            }
            this.root = preRoot.join(path.sep) + 'minecraft';
        }
        this.options = Minecraft.getOptions(root + optionsFilePath);
        if (version != undefined) this.version = version;
        this.chat = chat ?? new Chat(this.options['key_key.chat'], this.options['key_key.command'], defaultPrefix);
        if (commands != undefined) this.commands = commands;
    }

    /**
     * Get options from options.txt
     * @param {string} optionsFilePath path to options.txt
     * @returns options object
     */
    static getOptions(optionsFilePath) {
        options = {};
        let optionsFile = fs.readFileSync(optionsFilePath, 'utf8'); // key:value\nkey:value\n...
        let pairs = optionsFile.split('\n'); // key:value
        pairs.forEach(pair => {
            let pair = pair.split(':');
            options[pair[0]] = pair[1];
        });
        return options;
    }
}

/** Represents the chat within an instance of Minecraft */
class Chat {
    /**
     * Create a new Chat instance
     * @param {string} [key] the key to open the chat
     * @param {string} [commandKey] the key to open the chat with the command prefix already typed
     * @param {string} [commandPrefix] the command prefix
     * @param {Command[]} [commands] available commands
     */
    constructor(key, commandKey, commandPrefix = '/', commands = []) {
        let defaultOptions = Minecraft.getOptions('default.options.txt');
        this.key = key ?? defaultOptions['key_key.chat'];
        this.commandKey = commandKey ?? defaultOptions['key_key.command'];
        this.commandPrefix = commandPrefix;
        this.commands = commands;
    }

    /**
     * Open the chat input field
     * CAUTION: only works if the chat is not already open
     */
    async open() {
        return new Promise((resolve, reject) => {
            robot.keyTap(this.key);
            setTimeout(() => { resolve(); }, 100); // wait for the chat to open
        });
    }

    /** Add a message to the chat input field
     * CAUTION: only works if the chat is already open
     * @param {string} message the string to add
     */
    add(message) {
        robot.typeString(message);
    }

    /**
     * Open the chat and type the given message
     * CAUTION: only works if the chat is not already open
     * @param {string} message the string to type
     */
    send(message) {
        await this.open();
        this.add(message);
    }

    /** Open the chat input field with the command prefix */
    async openCommand() {
        return new Promise((resolve, reject) => {
            robot.keyTap(this.commandKey);
            setTimeout(() => { resolve(); }, 100); // wait for the command to open
        });
    }

    /** Close the chat input field
     * CAUTION: only works if the chat is open
     */
    close() {
        robot.keyTap("escape")
    }
}

/** Represents a command within an instance of Minecraft */
class Command {
    /**
     * Create a new Command instance
     * @param {string|string[]} names name and aliases
     * @param {Parameter|Parameter[]} [params] parameters
     */
    constructor(names, ...params) {
        this.names = names;
        this.params = params;
    }
}

/** Represents a parameter for a command within an instance of Minecraft */
class Parameter {
    /**
     * Create a new Parameter instance
     * @param {string} name name
     * @param {string} [type] value type
     * @param {boolean} [required] required
     */
    constructor(name, type, required = false) {
        this.name = name;
        this.type = type;
        this.required = required;
    }
}