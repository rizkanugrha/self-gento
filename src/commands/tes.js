import axios from "axios";
import config from "../utils/config.js";
import { runtime } from "../lib/function.js";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import os from 'os'

export default {
    name: 'tes',
    aliases: ['tes', 'bot'],
    category: 'General',
    pconly: false,
    group: false,
    admin: false,
    botAdmin: false,
    owner: false,
    execute: async (m, client, { body, prefix, args, arg, cmd, url, flags }) => {
        m.reply('uhuyy')
    }
}
