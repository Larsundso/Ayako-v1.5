/* eslint-disable no-underscore-dangle */
const { Worker } = require('worker_threads');
const jobs = require('node-schedule');
const ch = require('../../../BaseClient/ClientHelper');

const UpdateWorker = new Worker('./Files/Events/guildEvents/guildMemberUpdate/separatorUpdater.js');

UpdateWorker.on('message', ({ text, data }) => {
  if (text === 'NO_SEP') {
    ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [data.sep]);
  }
});
UpdateWorker.on('error', (error) => {
  throw error;
});

const isWaiting = new Set();

module.exports = {
  execute(oldMember, newMember) {
    if (oldMember._roles.sort().join(',') === newMember._roles.sort().join(',')) return;

    if (isWaiting.has(`${newMember.user.id}-${newMember.guild.id}`)) return;
    isWaiting.add(`${newMember.user.id}-${newMember.guild.id}`);
    jobs.scheduleJob(new Date(Date.now() + 2000), async () => {
      isWaiting.delete(`${newMember.user.id}-${newMember.guild.id}`);
      const member = await newMember.fetch().catch(() => {});
      if (!member) return;

      const ress = await newMember.client.ch.query(
        'SELECT stillrunning FROM roleseparatorsettings WHERE guildid = $1;',
        [newMember.guild.id],
      );
      if (ress && ress.rowCount > 0 && ress.rows[0].stillrunning) return;
      const res = await newMember.client.ch.query(
        'SELECT * FROM roleseparator WHERE active = true AND guildid = $1;',
        [newMember.guild.id],
      );
      const language = await newMember.client.ch.languageSelector(newMember.guild);
      UpdateWorker.postMessage({
        roles: member._roles,
        guildid: member.guild.id,
        userid: member.user.id,
        guildroles: new Map(member.guild.roles.cache),
        highest: member.guild.roles.highest,
        res: res?.rows,
        language,
      });
    });
  },
  async oneTimeRunner(msg, embed, clickButton) {
    const { client } = msg;
    const res = await ch.query(
      'SELECT * FROM roleseparator WHERE active = true AND guildid = $1;',
      [msg.guild.id],
    );
    let membersWithRoles;
    if (
      (
        await msg.client.ch.query(
          'SELECT stillrunning FROM roleseparatorsettings WHERE guildid = $1;',
          [msg.guild.id],
        )
      )?.rows[0]?.stillrunning &&
      msg.author.id !== client.user.id
    ) {
      membersWithRoles = true;
    } else {
      msg.client.ch.query(
        'UPDATE roleseparatorsettings SET stillrunning = $2 WHERE guildid = $1;',
        [msg.guild.id, true],
      );
      membersWithRoles = await this.getNewMembers(msg.guild, res);
    }
    if (clickButton) await clickButton.deleteReply().catch(() => {});
    if (membersWithRoles === 'timeout') {
      embed
        .setAuthor({
          name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
          iconURL: msg.client.objectEmotes.settings.link,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.lan.edit.oneTimeRunner.timeout);
      msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
      msg.client.ch.query(
        'UPDATE roleseparatorsettings SET stillrunning = $2, duration = $3, startat = $4 WHERE guildid = $1;',
        [msg.guild.id, false, null, null],
      );
      return;
    }
    if (!Array.isArray(membersWithRoles)) {
      if (!membersWithRoles) {
        embed
          .setAuthor({
            name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
            iconURL: msg.client.objectEmotes.settings.link,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(msg.lan.edit.oneTimeRunner.time);
        msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
      } else {
        embed
          .setAuthor({
            name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
            iconURL: msg.client.objectEmotes.settings.link,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(msg.lan.edit.oneTimeRunner.stillrunning);
        msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
      }
    } else {
      membersWithRoles.forEach((m, index) => {
        const fakeMember = m;
        const realMember = msg.guild.members.cache.get(m.id);
        if (realMember) {
          if (fakeMember.giveTheseRoles) {
            fakeMember.giveTheseRoles.forEach((roleID, rindex) => {
              if (realMember.roles.cache.has(roleID)) {
                membersWithRoles[index].giveTheseRoles.splice(rindex, 1);
              }
            });
          }
          if (fakeMember.takeTheseRoles) {
            fakeMember.takeTheseRoles.forEach((roleID, rindex) => {
              if (!realMember.roles.cache.has(roleID)) {
                membersWithRoles[index].takeTheseRoles.splice(rindex, 1);
              }
            });
          }
        }
      });
      const finishTime = Math.floor(
        Date.now() / 1000 +
          (membersWithRoles ? membersWithRoles.length * 4 : 0) +
          ((membersWithRoles ? membersWithRoles.length : 0) / 3600) * 400,
      );

      embed
        .setAuthor({
          name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
          iconURL: msg.client.objectEmotes.settings.link,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          msg.client.ch.stp(msg.lan.edit.oneTimeRunner.stats, {
            members: membersWithRoles && membersWithRoles.length ? membersWithRoles.length : '0',
            roles: membersWithRoles && membersWithRoles.length ? membersWithRoles.length * 4 : '0',
            finishTime: `<t:${finishTime}:F> (<t:${finishTime}:R>)`,
          }),
        );
      msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
    }
    msg.client.ch.query(
      'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4, channelid = $5, messageid = $6 WHERE guildid = $2;',
      [
        true,
        msg.guild.id,
        Math.floor(Date.now() / 1000) + (membersWithRoles ? membersWithRoles.length * 4 : 0),
        Date.now(),
        msg.channel.id,
        msg.m.id,
      ],
    );
    this.assinger(msg, membersWithRoles, embed);
  },
  async getNewMembers(guild, res) {
    await guild.members.fetch().catch(() => {});
    const obj = {
      members: [],
      separators: [],
      rowroles: [],
      roles: [],
      highestRole: {
        id: guild.roles.highest.id,
        position: guild.roles.highest.position,
      },
      clientHighestRole: {
        id: guild.members.cache.get(guild.client.user.id).roles.highest.id,
        position: guild.members.cache.get(guild.client.user.id).roles.highest.position,
      },
    };

    guild.members.cache.forEach((member) => {
      const roles = [];
      member.roles.cache.forEach((role) => {
        roles.push({ id: role.id, position: role.position });
      });
      obj.members.push({ id: member.user.id, roles });
    });

    guild.roles.cache.forEach((role) => {
      obj.roles.push({ id: role.id, position: role.position });
    });

    res.rows.forEach((r) => {
      if (r.stoprole) {
        obj.separators.push({
          separator: {
            id: r.separator,
            position: guild.roles.cache.get(r.separator)?.position,
          },
          stoprole: { id: r.stoprole, position: guild.roles.cache.get(r.stoprole)?.position },
        });
      } else {
        obj.separators.push({
          separator: {
            id: r.separator,
            position: guild.roles.cache.get(r.separator)?.position,
          },
        });
      }
      if (r.roles && r.roles.length) {
        obj.roles.forEach((roleid) => {
          const role = guild.roles.cache.get(roleid);
          obj.rowroles.push({ id: role.id, position: role.position });
        });
      }
    });
    const worker = new Worker('./Files/Events/guildEvents/guildMemberUpdate/separatorWorker.js', {
      workerData: { res: res.rows, obj },
    });
    let output;
    await new Promise((resolve, reject) => {
      worker.once('message', (result) => {
        output = result;
        resolve();
        worker.terminate();
      });
      worker.once('error', (error) => {
        reject();
        throw error;
      });
    });
    return output;
  },
  async assinger(msg, membersWithRoles, embed) {
    if (membersWithRoles.length) {
      if (!msg.client.separatorAssigner) msg.client.separatorAssigner = {};
      membersWithRoles.forEach((raw, index) => {
        if (!msg.client.separatorAssigner[msg.guild.id]) {
          msg.client.separatorAssigner[msg.guild.id] = {};
        }

        msg.client.separatorAssigner[msg.guild.id][index] = jobs.scheduleJob(
          new Date(Date.now() + index * 3000),
          async () => {
            const giveRoles = raw.giveTheseRoles;
            const takeRoles = raw.takeTheseRoles;
            const member = msg.guild.members.cache.get(raw.id);
            if (member) {
              const roles = giveRoles ? [...member._roles, ...giveRoles] : member._roles;
              if (takeRoles) takeRoles.forEach((r) => roles.splice(roles.indexOf(r), 1));
              if ((giveRoles && giveRoles.length) || (takeRoles && takeRoles.length)) {
                await msg.client.eris
                  .editGuildMember(
                    msg.guild.id,
                    member.user.id,
                    { roles },
                    msg.language.autotypes.separators,
                  )
                  .catch(() => {});
              }
            }
            if (index === membersWithRoles.length - 1 && msg.lastTime) {
              embed
                .setAuthor({
                  name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
                  iconURL: msg.client.objectEmotes.settings.link,
                  url: msg.client.constants.standard.invite,
                })
                .setDescription(msg.lan.edit.oneTimeRunner.finished);
              msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
              msg.client.ch.query(
                'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4 WHERE guildid = $2;',
                [false, msg.guild.id, null, null],
              );
            } else if (index === membersWithRoles.length - 1) {
              msg.lastTime = true;
              this.oneTimeRunner(msg, embed);
            } else {
              msg.client.ch.query(
                'UPDATE roleseparatorsettings SET index = $1, length = $3 WHERE guildid = $2;',
                [index, msg.guild.id, membersWithRoles.length - 1],
              );
            }
          },
        );
      });
    } else {
      embed
        .setAuthor({
          name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
          iconURL: msg.client.objectEmotes.settings.link,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.lan.edit.oneTimeRunner.finished);
      msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
      msg.client.ch.query(
        'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4 WHERE guildid = $2;',
        [false, msg.guild.id, null, null],
      );
    }
  },
};
