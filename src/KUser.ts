import { KEntryManager } from "./KEntryManager";
import { KEntry } from "./KEntry";
import { Message, MessageEmbed } from "discord.js";
import { defaultValue, KConf } from "./KConfig";

function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;

    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }

    return out;
}

export class KUser {
    id: string;
    username: string;

    enabled_permissions: string[];
    disabled_permissions: string[];

    entries: KEntryManager;
    message_count: number;
    blacklist_message_count: number;
    operator: boolean;
    // banned: boolean;

    // lastly_banned: string;
    last_message: string;
    joined_server: string;

    public constructor(id: string, name: string) {
        this.id = id;
        this.username = name;

        this.entries = new KEntryManager();
        this.message_count = 0;
        this.blacklist_message_count = 0;

        this.enabled_permissions = [];
        this.disabled_permissions = [];

        this.operator = false;
        // this.banned = false;
        // this.lastly_banned = "never";
        this.last_message = "never";
        this.joined_server = "never";
    }

    public getCanPermissions(): string[] {
        let ret: string[] = [];

        for (let i in this.enabled_permissions) {
            if (!this.isPermissionDisabled(this.enabled_permissions[i])) {
                ret.push(this.enabled_permissions[i]);
            }
        }

        return ret;
    }

    public getEnabledPermissions(): string[] {
        return this.enabled_permissions;
    }

    public getDisabledPermissions(): string[] {
        return this.disabled_permissions;
    }

    public getBlacklistCount(): number {
        return this.blacklist_message_count;
    }
    public incBlacklistCount() {
        this.blacklist_message_count++;
    }
    public setBlacklistCount(count: number) {
        this.blacklist_message_count = count;
    }

    public getMessageCount(): number {
        return this.message_count;
    }

    public incMessageCount() {
        this.message_count++;
    }

    public setMessageCount(count: number) {
        this.message_count = count;
    }

    public getID() {
        return this.id;
    }

    public getDisplayName() {
        return this.username;
    }

    public async updateDisplayName(username: string) {
        if (this.username.trim() != username.trim()) {
            this.username = username;
        }
    }

    private cmp_permissions(perm1: string, perm2: string): boolean {
        perm1 = perm1.trim();
        perm2 = perm2.trim();

        if (perm1 == perm2) {
            return true;
        } else if (perm1.endsWith("*")) {
            // console.log("DEBUG PERMISSIONS: "+perm2+" (1) starts with "+perm1.substr(0, perm1.length-1), perm1.startsWith(perm2.substr(0, perm2.length-1)));
            return perm2.startsWith(perm1.substr(0, perm1.length-1));
        } else if (perm2.endsWith("*")) {
            // console.log("DEBUG PERMISSIONS: "+perm1+" (2) starts with "+perm2.substr(0, perm2.length-1), perm1.startsWith(perm2.substr(0, perm2.length-1)));
            return perm1.startsWith(perm2.substr(0, perm2.length-1));
        }

        return false;
    }

    public isPermissionEnabled(permission: string): boolean {
        for (let i in this.enabled_permissions) {
            if (this.cmp_permissions(this.enabled_permissions[i],
                permission)) {

                return true;
            }
        }

        return false;
    }

    public isPermissionDisabled(permission: string): boolean {
        for (let i in this.disabled_permissions) {
            if (this.cmp_permissions(this.disabled_permissions[i],
                permission)) {

                return true;
            }
        }

        return false;
    }

    public canPermission(perm: string): boolean {
        if (this.operator) {
            return true;
        }

        return this.isPermissionEnabled(perm) &&
            !this.isPermissionDisabled(perm);
    }

    public canPermissions(perms: string[]): boolean {
        if (this.operator) {
            return true;
        }

        for (let i in perms) {
            if (!this.canPermission(perms[i])) {
                return false;
            }
        }

        return perms.length == 0;
    }

    public canPermissionsOR(perms: string[]): boolean {                                             // check if user has permission in OR-way ...
        for (let i in perms) {                                                                      // ... (check if he has one out of an array)
            if (this.canPermission(perms[i])) {
                return true;
            }
        }

        if (this.operator) {                                                                        // if user is operator, he can do anything
            return true;
        }

        return perms.length == 0;
    }

    public async removePermission(permission: string) {
        for (let i = 0; i < this.enabled_permissions.length; i++) {
            if (this.cmp_permissions(this.enabled_permissions[i], permission)) {
                this.enabled_permissions.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.disabled_permissions.length; i++) {
            if (this.cmp_permissions(this.disabled_permissions[i], permission)) {
                this.disabled_permissions.splice(i, 1);
                i--;
            }
        }
    }

    public disablePermission(permission: string) {
        if (!this.isPermissionDisabled(permission)) {
            this.disabled_permissions.push(permission);
        }
    }

    public enablePermission(permission: string) {
        if (!this.isPermissionEnabled(permission)) {
            this.enabled_permissions.push(permission);
        }
    }

    public setEnabledPermissions(perms: string[]) {
        this.enabled_permissions = perms;
    }

    public setDisabledPermissions(perms: string[]) {
        this.disabled_permissions = perms;
    }

    public getEntries(): KEntryManager {
        return this.entries;
    }

    public setEntries(entries: KEntryManager) {
        this.entries = entries;
    }

    public addEntry(entry: string, msg: Message, conf: KConf, dont_log: boolean = false) {
        let e: KEntry = new KEntry();

        e.setContent(entry);
        e.setDate(new Date());

        e.setID(KEntryManager.generateID(this.id,
            entry,
            (new Date()).toUTCString()));

        e.setAuthorID(msg.author.id);
        e.setMsgURL(msg.url);

        this.entries.addEntry(e);

        if (dont_log) return;
        (async (entry, msg, conf, entry_id) => {
            let author = msg.author;
            let owner = msg.guild.members.cache.get(this.id);

            conf.logMessageToServer(conf.client,
                msg.guild.id,
                (new MessageEmbed())
                    .setColor("#fcc66f")
                    .setTitle(conf.getTranslationForServer(
                        msg.guild.id,
                        "log.user_entry_added.title")
                            .replace("{1}", (new Date().toLocaleString())))

                    .setDescription(conf.getTranslationForServer(
                        msg.guild.id,
                        "log.user_entry_added.body")
                            .replace("{1}", author.username+"#"+author.discriminator)
                            .replace("{2}", owner.user.username+"#"+owner.user.discriminator)
                            .replace("{3}", conf.getConfig().command_prefix)
                            .replace("{4}", owner.id)
                            .replace("{5}", entry_id))

                    .setFooter(this.username, owner.user.avatarURL()))
        })(entry, msg, conf, e.id);
    }

    public setLastMessageDate(date: string) {
        this.last_message = date;
    }

    public getLastMessageDate() {
        return this.last_message;
    }

    public setJoinDate(joined: string) {
        this.joined_server = joined;
    }

    public getJoinDate() {
        return this.joined_server;
    }

    /*
    public setBanState(state: boolean) {
        this.banned = state;
    }

    public ban(reason: string, msg: Message, conf: KConf) {
        this.addEntry(reason, msg, conf);
    }

    public kick(reason: string, msg: Message, conf: KConf) {
        this.addEntry(reason, msg, conf);
        this.banned = true;
        this.lastly_banned = (new Date()).toUTCString();
    }

    public unban(reason: string, msg: Message, conf: KConf) {
        this.addEntry(reason, msg, conf);
        this.banned = false;
    }
    */

    public toJSONObject(): object {
        return {
            id: this.id,
            username: this.username,

            enabled_permissions: uniq_fast(this.enabled_permissions),
            disabled_permissions: uniq_fast(this.disabled_permissions),

            entries: this.entries.toJSONObject(),
            message_count: this.message_count,
            blacklist_message_count: this.blacklist_message_count,
            operator: this.operator,
            // banned: this.banned,

            // lastly_banned: this.lastly_banned,
            last_message: this.last_message,
            joined_server: this.joined_server
        }
    }

    public static fromJSONObject(obj: any): KUser {
        let user: KUser = new KUser(obj.id, obj.username);

        user.setMessageCount(defaultValue(obj.message_count, 0));
        user.setEntries(KEntryManager.fromJSONObject(obj.entries));
        user.setDisabledPermissions(defaultValue(obj.disabled_permissions, []));
        user.setEnabledPermissions(defaultValue(obj.enabled_permissions, []));
        user.setBlacklistCount(defaultValue(obj.blacklist_message_count, 0));
        // user.setBanState(obj.banned)
        user.setLastMessageDate(defaultValue(obj.last_message, "never"));
        user.setJoinDate(defaultValue(obj.joined_server, "never"));
        // user.lastly_banned = obj.lastly_banned;
        user.operator = defaultValue(obj.operator, false);

        return user;
    }
}