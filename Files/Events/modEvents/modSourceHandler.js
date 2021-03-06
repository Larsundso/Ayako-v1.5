const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = async (msg, embed) => {
  let minimizeTimeout = 0;
  let deleteTimeout = 0;

  switch (msg.source) {
    case 'antivirus': {
      minimizeTimeout = Number(msg.r.minimize);
      deleteTimeout = Number(msg.r.delete);

      if (deleteTimeout <= minimizeTimeout) {
        jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
          msg.m?.delete().catch(() => {});
        });
      } else {
        if (embed) {
          embed = new Builders.UnsafeEmbedBuilder(embed.data).setDescription(
            embed.data.fields[0].value,
          );
          embed.data.fields = [];

          jobs.scheduleJob(new Date(Date.now() + minimizeTimeout), () => {
            msg.client.ch.edit(msg.m, { embeds: [embed] });
          });
        }

        jobs.scheduleJob(new Date(Date.now() + deleteTimeout), () => {
          msg.m?.delete().catch(() => {});
        });
      }

      break;
    }
    default: {
      break;
    }
  }
};
