const Builders = require('@discordjs/builders');

module.exports = {
  async execute(oldUser, newUser) {
    const client = oldUser ? oldUser.client : newUser.client;
    const { ch } = client;
    const Constants = client.constants;
    client.guilds.cache.forEach(async (guild) => {
      const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
      if (res && res.rowCount > 0) {
        const channels = res.rows[0].userevents
          ?.map((id) =>
            typeof client.channels.cache.get(id)?.send === 'function'
              ? client.channels.cache.get(id)
              : null,
          )
          .filter((c) => c !== null);
        if (channels && channels.length) {
          const member = guild.members.cache.get(newUser.id);
          if (member) {
            const language = await ch.languageSelector(guild);
            const lan = language.userUpdate;
            const con = Constants.userUpdate;
            const changedKey = [];
            const embed = new Builders.UnsafeEmbedBuilder()
              .setTimestamp()
              .setAuthor({
                name: lan.author.name,
                iconURL: con.author.image,
                url: ch.stp(con.author.link, { user: newUser.id }),
              })
              .setColor(con.color);

            let files = [];
            if (oldUser.avatar !== newUser.avatar) {
              changedKey.push(language.avatar);

              const buffers = await ch.convertImageURLtoBuffer([
                newUser.displayAvatarURL({ size: 4096 }),
              ]);
              if (buffers.length) {
                files = buffers;
                embed.addFields({ name: language.avatar, value: lan.avatar });
                embed.setThumbnail(`attachment://${buffers[0].name}`);
              }
            }
            if (oldUser.username !== newUser.username) {
              changedKey.push(language.username);
              embed.addFields({
                name: language.username,
                value: `${language.before}: \`${oldUser.username}\`\n${language.after}: \`${newUser.username}\``,
              });
            }
            if (oldUser.discriminator !== newUser.discriminator) {
              changedKey.push(language.discriminator);
              embed.addFields({
                name: language.discriminator,
                value: `${language.before}: \`${oldUser.discriminator}\`\n${language.after}: \`${newUser.discriminator}\``,
              });
            }
            embed.setDescription(
              ch.stp(lan.description, { user: newUser }) + changedKey.map((o) => ` \`${o}\``),
            );

            if (embed.data.fields?.length || (embed.data.thumbnail && embed.data.thumbnail.url)) {
              ch.send(channels, { embeds: [embed], files }, 5000);
            }
          }
        }
      }
    });
  },
};
