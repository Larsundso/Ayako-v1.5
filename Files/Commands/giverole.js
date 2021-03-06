const stringSimilarity = require('string-similarity');

module.exports = {
  name: 'giverole',
  perm: 268435456n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'roles',
  execute: async (msg) => {
    const role =
      msg.guild.roles.cache.get(msg.args.slice(1).join(' ').replace(/\D+/g, '')) ||
      msg.guild.roles.cache.find(
        (r) => r.name.toLowerCase() === msg.args.slice(1).join(' ').toLowerCase(),
      ) ||
      msg.guild.roles.cache.find(
        (r) =>
          r.name.toLowerCase() ===
          stringSimilarity.findBestMatch(
            msg.args.slice(1).join(' ').toLowerCase(),
            msg.guild.roles.cache.map((roles) => roles.name.toLowerCase()),
          ).bestMatch.target,
      );

    if (!role) return msg.client.ch.error(msg, msg.language.errors.roleNotFound);

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

    return msg.client.emit(
      `modBaseEvent`,
      {
        target: user,
        executor: msg.author,
        msg,
        role,
        guild: msg.guild,
      },
      'roleAdd',
    );
  },
};
