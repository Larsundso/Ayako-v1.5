const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  childOf: 'reactionroles',
  noArrows: true,
  canBe1Row: true,
  mmrEmbed: async (msg, rows) => {
    let message;
    if (rows.length) [, , message] = await linkToIDs(msg, rows[0].messagelink);

    const embed = new Builders.UnsafeEmbedBuilder();
    if (message && message.author && message.author.id !== msg.client.user.id) {
      embed.addFields({
        name: msg.lan.cantManage,
        value: msg.lan.notMyMessage,
        inline: false,
      });
      return embed;
    }

    rows.forEach((row) => {
      const emote = msg.client.emojis.cache.get(row.emoteid);

      embed.addFields({
        name: `${emote || row.buttontext || msg.client.textEmotes.warning}`,
        value: `${msg.language.affected}: ${row.roles ? row.roles.length : '0'} ${
          msg.language.roles
        }`,
        inline: true,
      });
    });

    return embed;
  },
  displayEmbed: async (msg, r) => {
    const [, , message] = await linkToIDs(msg, r.messagelink);
    const embed = new Builders.UnsafeEmbedBuilder();
    if (!message || !message.author || message.author.id !== msg.client.user.id) {
      embed.addFields({
        name: msg.lan.cantManage,
        value: msg.lan.notMyMessage,
        inline: false,
      });
      return embed;
    }

    const emote = msg.client.emojis.cache.get(r.emoteid);

    embed.addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.emoteid,
        value: `${emote || msg.language.none}`,
        inline: true,
      },
      {
        name: msg.lan.buttontext,
        value: r.buttontext || msg.language.default,
        inline: true,
      },
      {
        name: msg.lan.roles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    );

    return embed;
  },
  buttons: async (msg, r) => {
    const [, , message] = await linkToIDs(msg, r.messagelink);
    if (!message || !message.author || message.author.id !== msg.client.user.id) return [];

    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    const emoteid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.emoteid.name)
      .setLabel(msg.lan.emoteid)
      .setStyle(Discord.ButtonStyle.Primary);

    const buttontext = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.buttontext.name)
      .setLabel(msg.lan.buttontext)
      .setStyle(Discord.ButtonStyle.Primary);

    const roles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[active], [emoteid, buttontext], [roles]];
  },
  manualResGetter: async (msg) => {
    if (!msg.args[2]) {
      const res = await msg.client.ch.query(`SELECT * FROM rrbuttons WHERE guildid = $1;`, [
        msg.guild.id,
      ]);
      if (res && res.rowCount) return res;
      return null;
    }

    const baseRes = await msg.client.ch.query(
      `SELECT * FROM rrsettings WHERE guildid = $1 AND messagelink = $2;`,
      [msg.guild.id, msg.args[2]],
    );

    if (!baseRes || !baseRes.rowCount) return null;

    const res = await msg.client.ch.query(
      `SELECT * FROM rrbuttons WHERE messagelink = $1 AND guildid = $2;`,
      [baseRes.rows[0].messagelink, msg.guild.id],
    );

    if (res && res.rowCount) return res;
    return null;
  },
  doMoreThings: async (msg, insertedValues, changedKey, newRes, oldRes) => {
    console.log(insertedValues);
    if (!newRes.rows || !oldRes.rows) return;
    const newRows = newRes.rows[0];
    const oldRows = oldRes.rows[0];

    const [, , message] = await linkToIDs(msg, newRows.messagelink);

    if (!message || !message.author || message.author.id !== msg.client.user.id) return;

    if (oldRows.active === true && newRows.active === false) {
      message.edit({ components: [] }).catch(() => {});
      return;
    }
    const buttons = newRes.rows
      .map((row) => {
        if (insertedValues.messagelink && row.messagelink !== insertedValues.messagelink) {
          return null;
        }

        const button = new Builders.UnsafeButtonBuilder().setCustomId(row.uniquetimestamp);
        if (row.buttontext) button.setLabel(row.buttontext);
        if (row.emoteid) {
          const emote = msg.client.emojis.cache.get(row.emoteid);
          if (emote) button.setEmoji(emote);
        }
        if (row.active === false) button.setDisabled(true);

        button.setStyle(Discord.ButtonStyle.Secondary);

        return button;
      })
      .filter((b) => !!b);

    const actionRows = [];
    let useIndex = 0;
    buttons.forEach((b, i) => {
      if ((5 / i) % 1 === 0) {
        actionRows.push(b);
        useIndex += 1;
      } else {
        if (!actionRows[useIndex]) actionRows[useIndex] = [];
        actionRows[useIndex].push(b);
      }
    });

    const newMsg = {
      components: msg.client.ch.buttonRower(actionRows),
      content: message.content.length ? message.content : undefined,
      embeds: message.embeds,
    };

    message.edit(newMsg).catch(() => {});
  },
};

const linkToIDs = async (msg, link) => {
  const [, , , guildid, channelid, messageid] = link.split(/\/+/);

  const guild = msg.client.guilds.cache.get(guildid);
  const channel = guild ? guild.channels.cache.get(channelid) : null;
  const message = channel ? await channel.messages.fetch(messageid).catch(() => {}) : null;

  return [guild, channel, message];
};
