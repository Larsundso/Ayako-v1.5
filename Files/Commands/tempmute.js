const ms = require('ms');

module.exports = {
  name: 'tempmute',
  perm: 1099511627776n,
  dm: false,
  takesFirstArg: true,
  aliases: ['mute'],
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(
            `modBaseEvent`,
            {
              target: user,
              executor: msg.author,
              reason,
              msg,
              guild: msg.guild,
              duration,
            },
            'tempmuteAdd',
          );
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(
          `modBaseEvent`,
          {
            target: user,
            executor: msg.author,
            reason,
            msg,
            guild: msg.guild,
            duration,
          },
          'tempmuteAdd',
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

    const { lan } = msg;
    let reason = msg.args.slice(2).join(' ') ? msg.args.slice(2).join(' ') : lan.reason;
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});
    let duration = msg.args[1] ? ms(msg.args[1]) : null;

    if (msg.args[1]) msg.args[1] = msg.args[1].replace(/,/g, '.');
    if (duration === msg.args[1]) {
      duration = ms(`${msg.args[1]} ${msg.args[2]}`);
      reason = msg.args.slice(3).join(' ') ? msg.args.slice(3).join(' ') : lan.reason;
    }

    if (Number.isNaN(+duration)) {
      reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
      duration =
        Number(msg.member.modrole ? msg.member.modrole.mutedurationdefault : 60) * 60 * 1000;
    }

    if (guildmember) {
      const res = await msg.client.ch.query('SELECT * FROM modroles WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res && res.rowCount > 0) {
        const roles = [];
        res.rows.forEach((r) => roles.push(r.roleid));
        if (guildmember.roles.cache.some((r) => roles.includes(r.id))) return proceed(false);
        return proceed(null);
      }
      return proceed(null);
    }
    return proceed(null);
  },
};
