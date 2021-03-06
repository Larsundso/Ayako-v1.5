const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const confusables = require('confusables');

module.exports = {
  execute: async (data, guild, r) => {
    const language = await guild.client.ch.languageSelector(guild.id);
    const con = guild.client.constants.antiraidMessage;
    const { client } = guild;

    if (data.joins) {
      checkAll(guild, language, con, client, r);
    }
  },
};

const checkAll = async (guild, language, con, client, r, { time }) => {
  const memberIDs = await getMemberIDs(guild, time, r);

  const buffers = await Promise.all(
    memberIDs.map(async (id) =>
      client.ch.convertImageURLtoBuffer([
        client.users.cache.get(id).displayAvatarURL({ size: 4096 }),
      ]),
    ),
  );

  const newIDs = memberIDs
    .map((id, index) => {
      const isSamePFP = checkPFP(memberIDs, buffers, index);
      const isSameNick = checkNick(client, id, memberIDs);
      const isSimilarID = checkID(id, memberIDs);

      if (isSamePFP || isSameNick || isSimilarID) {
        return id;
      }
      return null;
    })
    .filter((u) => !!u);

  const similarUsers = getSimilarUsers(newIDs, guild);

  run(guild, language, con, client, r, [...new Set([...newIDs, ...similarUsers])]);
};

const run = (guild, language, con, client, r, members) => {
  const lan = language.commands.antiraidHandler;

  if (r.posttof) sendMessage(client, lan, con, r, members);
  if (r.punishmenttof) {
    if (r.punishment) ban(client, guild, language, members);
    if (!r.punishment) kick(client, guild, language, members);
  }
};

const kick = (client, guild, language, members) => {
  client.emit('antiraidKickAdd', client.user, members, language.autotypes.antiraid, guild);
};

const ban = (client, guild, language, members) => {
  client.emit('antiraidBanAdd', client.user, members, language.autotypes.antiraid, guild);
};

const sendMessage = (client, lan, con, r, members) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.debugMessage.author,
      iconURL: con.author.image,
      url: con.author.link,
    })
    .setColor(con.color);
  embed.setDescription(`${lan.debugMessage.description}\n${lan.debugMessage.file}`);

  const channel = client.channels.cache.get(r.postchannel);
  if (channel) {
    const pingRoles = r.pingroles?.map((role) => `<@&${role}>`);
    const pingUsers = r.pingusers?.map((user) => `<@${user}>`);

    const payload = { embeds: [embed], content: `${pingRoles || ''}\n${pingUsers || ''}` };
    payload.files = [
      client.ch.txtFileWriter(
        members.map((u) => `${u}`),
        'antiraid',
      ),
    ];

    const printIds = new Builders.UnsafeButtonBuilder()
      .setLabel(lan.debugMessage.printIDs)
      .setCustomId('antiraid_print_ids')
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(true);

    if (payload.files?.length) {
      printIds.setDisabled(false);
    }

    const massban = new Builders.UnsafeButtonBuilder()
      .setLabel(lan.debugMessage.massban)
      .setCustomId('antiraid_massban')
      .setStyle(Discord.ButtonStyle.Danger);

    payload.components = client.ch.buttonRower([[printIds, massban]]);

    client.ch.send(channel, payload);
  }
};

const checkNick = (client, id, ids) => {
  const returns = ids
    .map((checkedWithID) => {
      const checkedWithUser = client.users.cache.get(checkedWithID);
      const user = client.users.cache.get(id);

      if (confusables.remove(checkedWithUser.username) === confusables.remove(user.username)) {
        return true;
      }
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const checkID = (id, ids) => {
  const returns = ids
    .map((checkedWithID) => {
      if (checkedWithID.slice(0, 2) === id.slice(0, 2)) {
        return true;
      }
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const checkPFP = (ids, buffers, currentIndex) => {
  const returns = ids
    .map((_, i) => {
      const thisIDbuffer = buffers[currentIndex][0].attachment;
      const checkedIDbuffer = buffers[i][0].attachment;

      if (thisIDbuffer.equals(checkedIDbuffer)) {
        return true;
      }
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const getSimilarUsers = (ids, guild) => {
  let otherUsers = [];

  ids.forEach((id) => {
    const { user } = guild.members.cache.get(id);
    const otherUsersFilter = guild.members.cache.filter((m) => m.user.username === user.username);

    otherUsers = [...otherUsers, ...otherUsersFilter];
  });

  return otherUsers;
};

const getMemberIDs = async (guild, timestamp, { time }) => {
  const memberIDs = guild.members.cache
    .map((member) => {
      if (member.joinedTimestamp > timestamp - time) {
        return member.user.id;
      }
      return null;
    })
    .filter((m) => !!m);

  return memberIDs;
};
