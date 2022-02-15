const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  childOf: 'nitro',
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.logchannels,
        value: `${
          r.logchannels && r.logchannels.length
            ? r.logchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');
    const logchannels = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.logchannels.name)
      .setLabel(msg.lan.logchannels)
      .setStyle('PRIMARY');

    return [[active], [logchannels]];
  },
};
