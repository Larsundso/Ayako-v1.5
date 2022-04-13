module.exports = {
  name: 'unban',
  perm: 4n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) return msg.client.emit('modBanRemove', msg.author, user, reason, msg);
        msg.delete().catch(() => {});
      } else return msg.client.emit('modBanRemove', msg.author, user, reason, msg);
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    const { lan } = msg;
    if (!user) return msg.client.ch.error(msg, msg.language.error.userNotFound);
    const reason = `${msg.author.tag} | ${
      msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason
    }`;
    return proceed(null, this);
  },
};
