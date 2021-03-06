const Builders = require('@discordjs/builders');

module.exports = {
  async execute(guild) {
    const { client } = guild;
    const { ch } = client;
    const Constants = client.constants;
    const con = Constants.guildCreate;
    const logEmbed = new Builders.UnsafeEmbedBuilder()
      .setDescription(con.logEmbed.joinedAGuild)
      .addFields({ name: con.logEmbed.guildName, value: `\u200b${guild.name}`, inline: true })
      .addFields({ name: con.logEmbed.guildId, value: `\u200b${guild.id}`, inline: true })
      .addFields({
        name: con.logEmbed.memberCount,
        value: `\u200b${guild.memberCount}`,
        inline: true,
      })
      .addFields({ name: con.logEmbed.guildOwner, value: `\u200b${guild.ownerId}`, inline: true })
      .setFooter({ text: ch.stp(con.logEmbed.currentGuildCount, { client }) })
      .setColor(guild.client.constants.colors.success);
    ch.send(
      client.channels.cache.get(Constants.standard.guildLogChannel),
      { embeds: [logEmbed] },
      5000,
    );
  },
};
