const jobs = require('node-schedule');

module.exports = {
  async execute(msg) {
    if (!msg.channel || msg.channel.type === 1 || !msg.author || !msg.guild) return;
    const { member } = msg;
    if (msg.guild.id === '366219406776336385' && msg.channel.id !== '801804774759727134') {
      if (msg.content.toLocaleLowerCase().includes('discord.gg/')) {
        if (msg.author.id !== '267835618032222209' && msg.author.id !== '400086473337995265') {
          if (member && !member.permissions.has('manageGuild')) {
            msg.delete().catch(() => {});
            msg.client.ch
              .send(msg.channel, `${msg.author} **Do not send Discord Links in this Channel**`)
              .then((m) => {
                jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                  m.delete().catch(() => {});
                });
              });
          } else if (!member.permissions.has('MANAGE_GUILD')) msg.delete().catch(() => {});
        }
      }
      if (
        msg.content.toLowerCase().startsWith('https://') ||
        msg.content.toLowerCase().startsWith('http://')
      ) {
        if (member) {
          if (
            member.roles.cache.has('369619820867747844') ||
            member.roles.cache.has('367781331683508224') ||
            member.roles.cache.has('585576789376630827') ||
            msg.channel.id === '367403201646952450' ||
            msg.channel.id === '777660259200270376' ||
            msg.channel.id === '851779578846117888'
          ) {
            return;
          }
          msg.delete().catch(() => {});
          msg.client.ch
            .send(
              msg.channel,
              `${msg.author} You are not allowed to post links yet. \`Needed role: Level 30 | VIP | Nobles\``,
            )
            .then((send) => {
              jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                send.delete().catch(() => {});
              });
            })
            .catch(() => {});
        } else msg.delete().catch(() => {});
      }
    }
    if (msg.guild.id === '366219406776336385') {
      if (
        msg.content.toLocaleLowerCase().includes('http://') ||
        msg.content.toLocaleLowerCase().includes('https://')
      ) {
        if (
          msg.channel.id === '298954459172700181' ||
          msg.channel.id === '644353691096186893' ||
          msg.channel.id === '705095466358145035'
        ) {
          if (member.roles.cache.has('331556297344548874')) return;
          if (member.roles.cache.has('358778201868075008')) return;
          if (member.roles.cache.has('606164114691194900')) return;
          msg.delete().catch(() => {});
          msg.client.ch
            .send(
              msg.channel,
              `${msg.author} You are not allowed to post links yet. \`Needed level: Donut [40]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`,
            )
            .then((send) => {
              jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                send.delete().catch(() => {});
              });
            })
            .catch();
        }
        if (msg.channel.id === '825690575147368479') {
          if (member.roles.cache.has('331556297344548874')) return;
          if (member.roles.cache.has('358778201868075008')) return;
          if (member.roles.cache.has('606164114691194900')) return;
          msg.delete().catch(() => {});
          msg.client.ch
            .send(
              msg.channel,
              `${msg.author} You are not allowed to post links yet. \`Needed level: Cookie [40]\``,
            )
            .then((send) => {
              jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                send.delete().catch(() => {});
              });
            })
            .catch();
        }
      }
      if (
        msg.content.includes(' is now level ') &&
        msg.author.id === '159985870458322944' &&
        msg.guild.id === '298954459172700181' &&
        msg.content.split(/ +/)[4].replace(/!/g, '') < 40
      ) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.delete().catch(() => {});
        });
      }
      if (
        msg.content.includes(' leveled up!') &&
        (msg.author.id === '172002275412279296' || msg.author.id === '453643070181867561')
      ) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.delete().catch(() => {});
        });
      }
    }
    if (
      (msg.channel.id === '554487212276842534' || msg.channel.id === '791390835916537906') &&
      msg.attachments.size < 1 &&
      !member.roles.cache.has('366238244775657472') &&
      !member.roles.cache.has('776248679363248168') &&
      msg.author.id !== msg.client.user.id
    ) {
      msg.delete().catch(() => {});
    }
    if (msg.guild.id === '298954459172700181') {
      if (
        msg.content.toLocaleLowerCase().includes('http://') ||
        msg.content.toLocaleLowerCase().includes('https://')
      ) {
        if (msg.channel.id === '298954459172700181') {
          if (member) {
            if (member.roles.cache.has('334832484581769217')) return;
            if (member.roles.cache.has('606164114691194900')) return;
            msg.client.ch
              .send(
                msg.channel,
                `${msg.author} You are not allowed to post links yet. \`Needed level: Cookie [20]\`\n Please use <#298954962699026432> and <#348601610244587531> instead.`,
              )
              .then((send) => {
                jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                  send.delete().catch(() => {});
                });
              })
              .catch(() => {});
          }
          msg.delete().catch(() => {});
        }
      }
      if (
        msg.content.includes(' is now level ') &&
        msg.author.id === '159985870458322944' &&
        msg.guild.id === '298954459172700181' &&
        msg.content.split(/ +/)[4].replace(/!/g, '') < 40
      ) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.delete().catch(() => {});
        });
      }
      if (msg.content.includes(' leveled up!')) {
        if (msg.author.id === '172002275412279296' || msg.author.id === '453643070181867561') {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.delete().catch(() => {});
          });
        }
      }
      if (msg.author.id === '172002275412279296') {
        if (
          msg.channel.id !== '298955020232032258' &&
          msg.channel.id !== '756502435572219915' &&
          msg.channel.id !== '315517616447946763'
        ) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.delete().catch(() => {});
          });
        }
      }
    }
  },
};
