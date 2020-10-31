## Explanation for Syntax of Commands

```
!command_name <@user> [number]
```

Everything in `<...>` is necessary. Everything in `[...]` is optional. `|` means
"or". So if you write `<@user|userID>` the command needs at this position a tagged
user, or their ID. So the example command "!command_name" needs a user-ID and if
you want to, you can give the command a number. So both these commands would be
valid: `!command_name @Test#0001` and `!command_name @Test#0001 10` .

# Commands

## Admin Commands

| Name | Syntax | Explanation | Needed Permission |
| ---- | ------ | ----------- | ----------------- |
| `ban` | `!ban <@user|userID> <days> <why...>` | | `admin.ban` |
| `kick` | `!kick <@user|userID> <why...>` - kick user | | `admin.kick` |
| `disable jokes` | `!dj` - disable jokes on server // MAYBE IRRELEVANT, BECAUSE OF !DEACTIVATE // | | `admin.disable_jokes` |
| `remind` | `!remind <date> [@user|userID] <what...>` | | `admin.remind` |
| `delete` | `!delete <num> [@user|userID]` | Deletes `<num>` messages(, by @user) | `admin.delete` |
| `raid-end` | `!raid-end` | Ends the raid mode. | `admin.raid_end` |
| `user` | `!user <@user|userID> [show <entryID>]` | Show username, ID, join date, avatar, last post date, first post date, posts count and reports. | See user command. |
| `unreport` | `!unreport <user> [reportID]` | Delete all reports of user. If `reportID` is given, only delete the report with this ID. | `admin.report` |
| `say` | `!say <channelID> <what>` | Write a message as KIRA into the channel with `<channelID>`. Cross-Server-Messages (sending a message from a server's channel to another server's channel) aren't allowed. | `admin.say` |
| `perm` | See perm command. | See perm command. | See perm command. |
| `stat` | See stat command. | See stat command. | `admin.stat` |
| `config` | See config command. | See config command. | See config command. |
| `list-all` | `!lsa` | See all commands (because `help` doesn't list deactivated commands). |
| `deactivate` | `!deactivate <command>` | Deactivate a command for a server. For example: `!deactivate thanks` makes the `!thanks` command unusable. | `admin.deactivate` |
| `activate` | `!activate <command>` | Deactivate a command for a server. For example: `!activate thanks` makes the `!thanks` command usable. | `admin.activate` |

### Permission Command

The permission command manages the permissions of the KIRA bot for a user. If a
user does not have the permission for a command, they won't be able to execute
it. If one of the user's role has the permission, every user with the same roll
will be able to execute that command.

Some rules:
1. users' disabled permissions overwrite enabled permissions
    * (if a user's role has the `admin.ban` permission, but someone deactivated
      `admin.ban` for that user, he won't be able to use the ban command)

2. roles' disabled permissions do **not** overwrite enabled permissions
    * (if a user's role has the `admin.ban` permission disabled, but someone
      activated `admin.ban` for that user or for another role the user has,
      he will be able to use the ban command)

3. KIRA operators (defined in `config.json`) have all permissions, it is
   impossible do disable their permissions

4. permissions ending with `*` include every permission that starts with the
   same string
    * (if you have the permission `admin.*`, you can use every admin command;
      if you have the permission `*`, you can use every command, without
      exceptions, but it is possible to disable commands; if `admin.*` is
      disabled, while `*` is enabled, you can use every command but admin
      commands.)

| Syntax | Explanation | Needed Permission |
| ------ | ----------- | ----------------- |
| `!perm role <roleID> enable <permission>` | Enables a permission for the role. | `admin.perm.role.enable` |
| `!perm role <roleID> disable <permission>` | Disables a permission for the role. | `admin.perm.role.disable` |
| `!perm role <roleID> show` | Show's every permission the role has. | `admin.perm.role.show` |
| `!perm role <userID> remove <permission>` | Removes a permission from the enabled- and disabled-permissions lists. | `admin.perm.role.remove` |
| `!perm user <userID> enable <permission>` | Enables a permission for the user. | `admin.perm.user.enable` |
| `!perm user <userID> disable <permission>` | Disables a permission for the user. | `admin.perm.user.disable` |
| `!perm user <userID> show` | Show's every permission the user has. | `admin.perm.user.show` |
| `!perm user <userID> remove <permission>` | Removes a permission from the enabled- and disabled-permissions lists. | `admin.perm.user.remove` |

### Stat Command
--------------------------------------------------------------------------------

| Syntax | Explanation | Needed Permission |
| ------ | ----------- | ----------------- |
| `!stat <search queries> ...` | Search for given queries in user activities. | `admin.stat` |

The queries can be connected by `or` or `and`. You can add brackets to change
the order of the evaluation. Add a `!` before the query to negate it.

Possible Queries:

| Query | Syntax | Explanation |
| ----- | ------ | ----------- |
| `inactive` | `inactive:<time>` | User didn't write a message since `<time>`. |
| `active` | `active:<time>` | User did write a message in the last `<time>` days/weeks/... |
| `messages_less` | `messages_less:<number>[:<time>]` | User did write less than `<number>` messages [in time `<time>`]. |
| `messages_more` | `messages_more:<number>[:<time>]` | User did write more than `<number>` messages [in time `<time>`]. Note that you can't check for more than 100 messages (due to API limitations). |
| `permission` | `permission:<permission>` | User has permission `<permission>`. |
| `role` | `role:<name|roleID>` | User has role `<name|roleID>`. |

The argument `<time>` is a number with a suffix, where the suffixes have to be one
of the following:

| Suffix | Explanation |
| ------ | ----------- |
| `d`    | Days        |
| `w`    | Weeks       |
| `m`    | Months      |
| `y`    | Years       |

So `1y` means 1 year. Combinations like 2m1d (2 months and 1 day) are not
possible.

### Stat Command Examples

List every user that wrote a message in the last week (`active:1w`) and that
wrote more than 10 messages (`message_more:10`).
```bash
!stat active:1w and message_more:10
```

--------------------------------------------------------------------------------

List every user that wasn't active in the last week. 1'st way:
```bash
!stat !active:1w
```
2'nd way:
```bash
!stat inactive:1w
```

Both ways check, if the user didn't write a message for 1 week.

--------------------------------------------------------------------------------

List every user that was active for the last 6 months and doesn't have the
`command.joke` permission (and whose roles doesn't have the `command.joke`
permission).
```bash
!stat active:6m and !permission:command.joke
```
--------------------------------------------------------------------------------

List every user that was active for 6 months and from that get every user, who
either don't has the `command.joke` permission or has written less than 10
messages.
```bash
!stat active:6m and (!permission:command.joke or message_less:10)
```

### Config Command
--------------------------------------------------------------------------------

| Name | Syntax | Explanation | Needed Permission |
| ---- | ------ | ----------- | ----------------- |
| `load` | `!config load` | Reloads the server config. (All unsaved changes will be lost!) | `admin.config.load` |
| `save` | `!config save` | Save all changes to server config. | `admin.config.save` |
| `language` | `!config language [short]` | Set the language of the server to `[short]`. See the list of supported languages, standard is `en` for "English". If `[short]` is not given, it will list all supported languages. | `admin.config.language` |
| `delete user` | `!config delu <@user|userID>` | Delete all saved stats about a user. (Message count, last written message, permissions). | `admin.config.delete_user` |
| `role` | `!config role <type> <roleID>` | Set's KIRA's role config. See user type list for further explanation. | `admin.config.role` |
| `channel` | `!config channel <type> <channelID>` | Set's KIRAs channel config. See channel type list for further explanation. | `admin.config.channel` |
| `message` | `!config message <type> <content>` | Change the standard value of standard messages. For further explanation see the message type list. | |

Supported languages:

| Language    | Short |
| ----------- | ----- |
| English     | en    |
| German      | de    |

User type list:

| Type | Explanation |
| ---- | ----------- |
| `muted` | This role is not able to write messages. |

Channel type list (text channels):

| Type | Explanation |
| ---- | ----------- |

Default message types (text channels):

| Type | Explanation | Default value |
| ---- | ----------- | ------------- |
| `welcome` | Message send into the `welcome`-type channel. | Welcome `<user>`! Have fun! |
| `kick` | Message send ito the user, when he was kicked from the server. | You were kicked from `<server>`: `<reason>` |
| `ban` | Message send ito the user, when he was banned from the server. | You were banned from `<server>`: `<reason>` |

Placeholders for default messages:

| Placeholder | Will be replaced by... | Possible in types |
| ----------- | ---------------------- | ----------------- |
| `<user>`    | ... the user's name.   | `welcome`, `kick`, `ban` |
| `<server>`  | ... the server's name. | `welcome`, `kick`, `ban` |
| `<reason>`  | ... the reason for kick/ban.   | `kick`, `ban` |
| `<date>`  | ... the current date in format `YYYY-MM-DD`.   | `welcome`, `kick`, `ban` |
| `<time>`  | ... the current time in format `HH:MM:SS`.   | `welcome`, `kick`, `ban` |

### User Command
--------------------------------------------------------------------------------

The `!user` command provides administrators to show trivial things like the
user's ID and their name, but also advanced things like if the user is banned
and why the user was banned.

Syntax:

| Syntax | Explanation |
| ------ | ----------- |
| `!user <userID|@user>` | Show everything, but reports. |
| `!user <userID|@user> show [reportID]` | Show all reports shortened (id+reason), if `reportID` is given, show report, author, reason, creation date and link to message. |

## Normal Commands
--------------------------------------------------------------------------------

| Name | Syntax | Explanation | Needed Permission |
| ---- | ------ | ----------- | ----------------- |
| `info` | `!info` | Shows information about KIRA. | `commands.info` |
| `search` | `!search [branch] <query>` | Search for `<query>`. Standard branch is EN, but it can be changed with the `!config` command. | `commands.search` |
| `search-author` | `!search [branch] <query>` | Search for `<query>` on the authors list page. The standard branch is EN, bit it can be changed with the `!config` command. | `commands.search_author` |
| `joke` | `!joke` | Writes a random joke. Is possible every 5 minutes and can only be used in the bot-channel (which can be set using the `!config` command). | `commands.joke` |
| `report` | `!report <@user|userID> <why>` | Report a player. | `commands.info` |
| `raid` | `!raid` | Enable raid-mode. New joined users and users with more than 20 messages per minute will be muted. | `commands.info` |
| `search-tags` | `!search-tags <tag>` | Searchs for articles with tag `<tag>`. |