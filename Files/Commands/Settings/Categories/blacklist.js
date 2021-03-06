const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 8192n,
  type: 1,
  finished: true,
  category: ['auto-moderation'],
  helpCategory: 'mod',
  displayEmbed(msg, r) {
    let wordText = '';
    const wordArr = [];
    if (r.words && r.words.length) {
      for (let i = 0; i < r.words.length; i += 1) {
        wordArr[i] = `${r.words[i]}⠀`;
        wordText += wordArr[i] + new Array(Math.abs(22 - wordArr[i].length)).join(' ');
      }
    } else wordText = msg.language.none;
    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(
        `**${msg.lan.words}**\n${
          r.words && r.words.length ? msg.client.ch.makeCodeBlock(wordText) : msg.language.none
        }`,
      )
      .addFields(
        {
          name: msg.lanSettings.active,
          value: `${
            r.active
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
          }`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.bpchannelid,
          value: `${
            r.bpchannelid && r.bpchannelid.length
              ? r.bpchannelid.map((id) => ` <#${id}>`)
              : msg.language.none
          }`,
          inline: false,
        },
        {
          name: msg.lan.bpuserid,
          value: `${
            r.bpuserid && r.bpuserid.length
              ? r.bpuserid.map((id) => ` <@${id}>`)
              : msg.language.none
          }`,
          inline: false,
        },
        {
          name: msg.lan.bproleid,
          value: `${
            r.bproleid && r.bproleid.length
              ? r.bproleid.map((id) => ` <@&${id}>`)
              : msg.language.none
          }`,
          inline: false,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.language.punishments,
          value: '\u200b',
          inline: false,
        },
        {
          name: msg.lan.warntof,
          value: `${
            r.warntof
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
          }\n`,
          inline: true,
        },
        {
          name: msg.lan.mutetof,
          value: `${
            r.mutetof
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
          }`,
          inline: true,
        },
        {
          name: msg.lan.kicktof,
          value: `${
            r.kicktof
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
          }`,
          inline: true,
        },
        {
          name: msg.lan.bantof,
          value: `${
            r.bantof
              ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
              : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
          }`,
          inline: true,
        },
        {
          name: '\u200b',
          value:
            `${msg.client.ch.stp(msg.lan.warnafter, {
              amount: r.warnafter ? r.warnafter : '--',
            })}\n` +
            `${msg.client.ch.stp(msg.lan.muteafter, {
              amount: r.muteafter ? r.muteafter : '--',
            })}\n` +
            `${msg.client.ch.stp(msg.lan.kickafter, {
              amount: r.kickafter ? r.kickafter : '--',
            })}\n` +
            `${msg.client.ch.stp(msg.lan.banafter, { amount: r.banafter ? r.banafter : '--' })}`,
          inline: false,
        },
      );
    return embed;
  },
  buttons(msg, r) {
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const wm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.warntof.name)
      .setLabel(msg.lan.warntof)
      .setStyle(r.warntof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.mutetof.name)
      .setLabel(msg.lan.mutetof)
      .setStyle(r.mutetof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const km = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kicktof.name)
      .setLabel(msg.lan.kicktof)
      .setStyle(r.kicktof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const bm = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bantof.name)
      .setLabel(msg.lan.bantof)
      .setStyle(r.bantof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channel = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bpchannelid.name)
      .setLabel(msg.lan.bpchannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const role = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const maw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.muteafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.muteafter.replace(/\*/g, ''), {
          amount: r.muteafter ? r.muteafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const kaw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kickafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.kickafter.replace(/\*/g, ''), {
          amount: r.kickafter ? r.kickafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const baw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.banafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.banafter.replace(/\*/g, ''), {
          amount: r.banafter ? r.banafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const words = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.words.name)
      .setLabel(msg.lan.words.replace(/\*/g, ''))
      .setStyle(Discord.ButtonStyle.Primary);
    const waw = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.warnafter.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.warnafter.replace(/\*/g, ''), {
          amount: r.warnafter ? r.warnafter : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);

    return [
      [active, words],
      [channel, user, role],
      [wm, mm, km, bm],
      [waw, maw, kaw, baw],
    ];
  },
};
