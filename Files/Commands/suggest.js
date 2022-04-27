const Builders = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
  name: 'suggest',
  perm: null,
  dm: false,
  takesFirstArg: true,
  aliases: [],
  type: 'utility',
  execute: async (msg) => {
    const isEnabled = await getSettings(msg);
    if (!isEnabled) {
      msg.client.ch.error(msg, msg.lan.notEnabled);
      return;
    }

    const settings = isEnabled;

    const isAllowed = getAllowed(settings, msg);
    if (!isAllowed) return;

    const channel = msg.client.channels.cache.get(settings.channelid);
    if (!channel) {
      msg.client.ch.error(msg, msg.lan.misconfigured);
      return;
    }

    const loadingEmbed = await msg.client.ch.loadingEmbed({ author: msg.lan.author }, msg.guild);
    const m = await msg.client.ch.reply(msg, { embeds: [loadingEmbed] });
    if (!m) return;

    const text = msg.content.split(/ /).slice(1).join(' ');
    const attachmentUrls = await getAttachments(msg);

    msg.delete().catch(() => {});

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: `${msg.lan.author} | ${msg.author.tag}`,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(text)
      .setColor(msg.client.constants.standard.ephemeralColor);

    if (attachmentUrls.length) {
      embed.addFields({
        name: msg.lan.attachedFiles,
        value: attachmentUrls.join('\n'),
        inline: false,
      });
    }

    embed.addFields({
      name: msg.lan.votes,
      value: `${msg.client.textEmotes.tickBG}: 0\n${msg.client.textEmotes.crossBG}: 0`,
      inline: false,
    });

    const buttons = getButtons(msg, settings);

    const reply = await msg.client.ch.send(channel, { embeds: [embed], components: buttons });
    if (!reply) return;

    msg.client.ch.query(
      `INSERT INTO suggestionvotes (guildid, msgid, authorid, ended, upvoted, downvoted) VALUES ($1, $2, $3, false, $4, $4);`,
      [msg.guild.id, reply.id, msg.author.id, []],
    );

    m.edit({
      embeds: [
        new Builders.UnsafeEmbedBuilder()
          .setDescription(msg.lan.sentSuccess)
          .setColor(await msg.client.ch.colorSelector(msg.guild.me)),
      ],
    });
  },
};

const getSettings = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM suggestionsettings WHERE guildid = $1 AND active = true;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getAllowed = (settings, msg) => {
  if (
    settings.nosendroles &&
    settings.nosendroles.length &&
    settings.noserndroles.some((r) => msg.member.roles.cache.has(r.id))
  ) {
    msg.client.ch.error(msg, msg.lan.roleSendBlacklisted);
    return false;
  }

  if (
    settings.nosendusers &&
    settings.nosendusers.length &&
    settings.nosendusers.includes(msg.author.id)
  ) {
    msg.client.ch.error(msg, msg.lan.userSendBlacklisted);
    return false;
  }

  return true;
};

const getAttachments = async (msg) => {
  if (!msg.attachments?.size) return [];

  const buffers = await msg.client.ch.convertImageURLtoBuffer(msg.attachments.map((a) => a.url));
  const channel = msg.client.channels.cache.get(
    msg.client.constants.standard.suggestionsDataChannel,
  );

  const m = await msg.client.ch.send(channel, { files: buffers });

  return m.attachments.map((a) => a.url);
};

const getButtons = (msg, settings) =>
  msg.client.ch.buttonRower([
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_upvote')
        .setLabel('\u200b')
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji(msg.client.objectEmotes.tickWithBackground),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_downvote')
        .setStyle(Discord.ButtonStyle.Danger)
        .setLabel('\u200b')
        .setEmoji(msg.client.objectEmotes.crossWithBackground),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_viewVotes')
        .setLabel(msg.lan.viewVotes)
        .setStyle(Discord.ButtonStyle.Secondary)
        .setDisabled(settings.anon),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_approve')
        .setLabel(msg.lan.approve)
        .setStyle(Discord.ButtonStyle.Success),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_deny')
        .setLabel(msg.lan.deny)
        .setStyle(Discord.ButtonStyle.Danger),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_edit')
        .setStyle(Discord.ButtonStyle.Danger)
        .setLabel('\u200b')
        .setEmoji(msg.client.objectEmotes.trash),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('suggestion_delete')
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel('\u200b')
        .setEmoji(msg.client.objectEmotes.edit),
    ],
  ]);