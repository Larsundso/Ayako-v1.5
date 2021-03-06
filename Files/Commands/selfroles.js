const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'selfroles',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['im', 'iam', 'iamn', 'iamnot', 'lsar', 'imn', 'lsr'],
  type: 'roles',
  async execute(msg, answer) {
    const res = await msg.client.ch.query(
      'SELECT * FROM selfroles WHERE guildid = $1 AND active = true ORDER BY uniquetimestamp ASC;',
      [msg.guild.id],
    );

    const Data = {
      currentRow: null,
      cOptions: [],
      rOptions: [],
      cTake: [],
      rTake: [],
      cPage: 1,
      rPage: 1,
    };

    const getCategoryFields = (embed) => {
      Data.cTake.forEach((took) => {
        const row = res.rows.find((r) => r.uniquetimestamp === took.data.value);
        const roles = row?.roles
          .map((role) => (msg.guild.roles.cache.get(role) ? msg.guild.roles.cache.get(role) : null))
          .filter((role) => !!role);
        if (roles?.length) {
          embed.addFields({
            name: `${row.name}`,
            value: `${roles.length} ${msg.language.roles}`,
            inline: true,
          });
        }
      });
    };

    const getComponents = () => {
      const buttons = [];

      const categoryMenu = new Builders.UnsafeSelectMenuBuilder()
        .setCustomId('categoryMenu')
        .addOptions(...(Data.cTake ? Data.cTake : [{ label: '0', value: '0' }]))
        .setDisabled(!Data.cTake?.length)
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder(msg.language.select.selfroles.select);

      const prevCategory = new Builders.UnsafeButtonBuilder()
        .setCustomId('prevCategory')
        .setLabel(msg.lan.prevCategory)
        .setDisabled(Data.cPage === 1)
        .setStyle(Discord.ButtonStyle.Danger);

      const nextCategory = new Builders.UnsafeButtonBuilder()
        .setCustomId('nextCategory')
        .setLabel(msg.lan.nextCategory)
        .setDisabled(Data.cPage === Math.ceil(res.rowCount / 25))
        .setStyle(Discord.ButtonStyle.Primary);

      buttons.push([categoryMenu], [prevCategory, nextCategory]);

      if (Data.currentRow) {
        const roleMenu = new Builders.UnsafeSelectMenuBuilder()
          .setCustomId('roleMenu')
          .addOptions(...(Data.rTake ? Data.rTake : [{ label: '0', value: '0' }]))
          .setDisabled(!Data.rTake?.length)
          .setMinValues(1)
          .setMaxValues(Data.currentRow.onlyone ? 1 : Data.rTake.length)
          .setPlaceholder(
            Data.currentRow.onlyone
              ? msg.language.select.role.select
              : msg.language.select.roles.select,
          )
          .setDisabled(Data.currentRow.isBlacklisted);

        const prevRoles = new Builders.UnsafeButtonBuilder()
          .setCustomId('prevRoles')
          .setLabel(msg.lan.prevRoles)
          .setDisabled(Data.rPage === 1)
          .setStyle(Discord.ButtonStyle.Danger);

        const nextRoles = new Builders.UnsafeButtonBuilder()
          .setCustomId('nextRoles')
          .setLabel(msg.lan.nextRoles)
          .setDisabled(Data.rPage === Math.ceil(Data.rOptions.length / 25))
          .setStyle(Discord.ButtonStyle.Primary);

        const back = new Builders.UnsafeButtonBuilder()
          .setCustomId('back')
          .setLabel(msg.language.back)
          .setEmoji(msg.client.objectEmotes.back)
          .setStyle(Discord.ButtonStyle.Danger);

        buttons.push([roleMenu], [prevRoles, nextRoles], [back]);
      }

      return msg.client.ch.buttonRower(buttons);
    };

    const roleGetter = (clickButton, doesntNeedNewRow) => {
      if (!doesntNeedNewRow) {
        Data.currentRow = res.rows.find((r) => r.uniquetimestamp === clickButton.values[0]);
        if (!Data.currentRow) {
          Data.currentRow = res.rows.find((r) => r.roles.includes(clickButton.values[0]));
        }
      }

      Data.rOptions = [];
      for (let i = 0; i < Data.currentRow.roles.length; i += 1) {
        const r = msg.guild.roles.cache.get(Data.currentRow.roles[i]);
        if (r) {
          let disabled;
          if (msg.member.roles.cache.has(r.id)) disabled = msg.client.objectEmotes.minusBG;
          else disabled = msg.client.objectEmotes.plusBG;
          Data.rOptions.push(
            new Builders.UnsafeSelectMenuOptionBuilder()
              .setLabel(`${r.name}`)
              .setValue(r.id)
              .setEmoji(disabled),
          );
        }
      }

      Data.rTake = [];
      const neededIndex = Data.rPage * 25 - 25;
      for (let j = neededIndex; j < neededIndex + 25 && j < Data.rOptions.length; j += 1) {
        if (msg.member.roles.cache.has(Data.rOptions[j].data.value) && Data.currentRow.onlyone) {
          Data.rTake.push(Data.rOptions[j]);
        } else if (
          !msg.member.roles.cache.some((r) => Data.currentRow.roles.includes(r.id)) ||
          !Data.currentRow.onlyone
        ) {
          Data.rTake.push(Data.rOptions[j]);
        }
      }
    };

    const getRoleUpdateReplyEmbed = async (add, remove) => {
      const embed = new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: msg.lan.rolesUpdated,
          url: msg.client.constants.standard.invite,
        })
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me));

      if (add.length) {
        embed.addFields({
          name: msg.lan.addedRoles,
          value: add.map((r) => `<@&${r}>`).join(', '),
          inline: false,
        });
      }
      if (remove.length) {
        embed.addFields({
          name: msg.lan.removedRoles,
          value: remove.map((r) => `<@&${r}>`).join(', '),
          inline: false,
        });
      }

      if (add.length) {
        await msg.member.roles.add(add, msg.language.autotypes.selfroles).catch(() => {});
      }
      if (remove.length) {
        await msg.member.roles.remove(remove, msg.language.autotypes.selfroles).catch(() => {});
      }

      return embed;
    };

    const getRoleUpdateEmbed = () =>
      new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
        .setAuthor({
          name: Data.currentRow.name,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.data.value}>`).join(', ')}\n\n${
            msg.lan.categoryPage
          }: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
            Data.rPage
          }/${Math.ceil(Data.rOptions.length / 25)}\``,
        );

    const getCategoryUpdateEmbed = () =>
      new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
        .setAuthor({
          name: Data.currentRow.name,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.data.value}>`).join(', ')}\n\n${
            msg.lan.categoryPage
          }: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\`\n${
            msg.lan.rolePage
          }: \`1/${Math.ceil((Data.rOptions.length + 1) / 25)}\``,
        );

    const categoryMenuHandler = (clickButton) => {
      roleGetter(clickButton);
      Data.cTake.forEach((c, i) => {
        if (c.value === clickButton.values[0]) {
          Data.cTake[i].setDefault(true);
        } else {
          Data.cTake[i].setDefault(false);
        }
      });
      const embed = getCategoryUpdateEmbed();
      const currentRows = getComponents();
      return { embeds: [embed], components: currentRows };
    };

    const roleMenuHandler = async (clickButton) => {
      const add = [];
      const remove = [];
      clickButton.values.forEach((id) => {
        if (msg.member.roles.cache.has(id)) remove.push(id);
        else add.push(id);
      });

      const replyEmbed = await getRoleUpdateReplyEmbed(add, remove);
      roleGetter(clickButton);
      const embed = getRoleUpdateEmbed();
      const currentRows = getComponents();

      msg.client.ch.reply(clickButton, { embeds: [replyEmbed], ephemeral: true });
      msg.client.ch.edit(msg.m, { embeds: [embed], components: currentRows });

      return null;
    };

    const getCategoryButtonEmbed = () => {
      if (Data.currentRow) {
        return new Builders.UnsafeEmbedBuilder()
          .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
          .setAuthor({
            name: Data.currentRow.name,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            `${Data.rOptions.map((r) => `<@&${r.data.value}>`).join(', ')}\n\n${
              msg.lan.categoryPage
            }: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
              Data.rPage
            }/${Math.ceil((Data.rOptions.length + 1) / 25)}\``,
          );
      }
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
        .setAuthor({
          name: Data.currentRow.name,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          `${msg.language.page}: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\``,
        );
      getCategoryFields(embed);
      return embed;
    };

    const getRoleButtonEmbed = () =>
      new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
        .setAuthor({
          name: Data.currentRow.name,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          `${Data.rOptions.map((r) => `<@&${r.data.value}>`).join(', ')}\n\n${
            msg.lan.categoryPage
          }: \`${Data.cPage}/${Math.ceil(Data.cOptions.length / 25)}\`\n${msg.lan.rolePage}: \`${
            Data.rPage
          }/${Math.ceil((Data.rOptions.length + 1) / 25)}\``,
        );

    const categoryButtonHandler = (clickButton, increasePage) => {
      if (increasePage) Data.cPage += 1;
      else Data.cPage -= 1;

      Data.cTake = [];
      if (increasePage) {
        const indexLast = Data.cOptions.findIndex(
          (r) =>
            r.data.value ===
            clickButton.message.components[0].components[0].options[
              clickButton.message.components[0].components[0].options.length - 1
            ].value,
        );
        for (let j = indexLast + 1; j < indexLast + 26 && j < Data.cOptions.length; j += 1) {
          Data.cTake.push(Data.cOptions[j]);
        }
      } else {
        const indexFirst = Data.cOptions.findIndex(
          (r) => r.data.value === clickButton.message.components[0].components[0].options[0].value,
        );
        for (let j = indexFirst - 25; j < indexFirst && j < Data.cOptions.length; j += 1) {
          Data.cTake.push(Data.cOptions[j]);
        }
      }

      const currentRows = getComponents();
      const embed = getCategoryButtonEmbed();

      return { embeds: [embed], components: currentRows };
    };

    const roleButtonHandler = (clickButton, increasePage) => {
      if (increasePage) Data.rPage += 1;
      else Data.rPage -= 1;

      roleGetter(clickButton, true);

      const currentRows = getComponents();
      const embed = getRoleButtonEmbed();

      return { embeds: [embed], components: currentRows };
    };

    const embed = new Builders.UnsafeEmbedBuilder();
    embed.setColor(msg.client.ch.colorSelector(msg.guild.members.me)).setAuthor({
      name: msg.lan.author,
      url: msg.client.constants.standard.invite,
    });

    if (res && res.rowCount > 0) {
      let disabled = false;
      let isBlacklisted = false;

      res.rows.forEach((thisrow, i) => {
        res.rows[i].id = i;

        if (!disabled || !isBlacklisted) {
          thisrow.blacklistedroles?.forEach((id) => {
            if (msg.member.roles.cache.get(id)) {
              disabled = true;
              isBlacklisted = true;
            }
          });
        }

        if (!disabled || !isBlacklisted) {
          thisrow.disabled?.forEach((id) => {
            if (msg.member.roles.cache.get(id)) {
              disabled = true;
              isBlacklisted = true;
            }
          });
        }

        if (!disabled) {
          thisrow.roles?.forEach((id) => {
            if (thisrow.onlyone && msg.member.roles.cache.find((r) => r.id === id)) {
              disabled = true;
            }
          });
        }

        if (disabled || isBlacklisted) {
          thisrow.whitelistedroles?.forEach((id) => {
            if (msg.member.roles.cache.find((r) => r.id === id)) {
              disabled = false;
              isBlacklisted = false;
            }
          });
        }

        if (disabled || isBlacklisted) {
          thisrow.whitelistedusers?.forEach((id) => {
            if (msg.author.id === id) {
              disabled = false;
              isBlacklisted = false;
            }
          });
        }

        res.rows[i].isBlacklisted = isBlacklisted;
        res.rows[i].disabled = disabled;
      });

      Data.cOptions = res.rows.map((r) =>
        new Builders.UnsafeSelectMenuOptionBuilder()
          .setLabel(r.name)
          .setValue(r.uniquetimestamp)
          .setDescription(r.disabled ? msg.lan.disabled : null)
          .setEmoji(r.disabled ? msg.client.objectEmotes.lock : msg.client.objectEmotes.unlock),
      );

      for (let i = 0; i < Data.cOptions.length && i < 25; i += 1) {
        Data.cTake.push(Data.cOptions[i]);
      }

      getCategoryFields(embed);
    }

    const rows = getComponents();
    embed.setDescription(`${msg.language.page}: \`1/${Math.ceil(Data.cOptions.length / 25)}\``);

    if (answer) {
      await answer.client.ch.edit(answer, { embeds: [embed], components: rows });
      msg.m = answer.message;
    } else if (msg.m) {
      msg.m = await msg.client.ch.edit(msg.m, { embeds: [embed], components: rows });
    } else msg.m = await msg.client.ch.reply(msg, { embeds: [embed], components: rows });

    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    buttonsCollector.on('collect', async (clickButton) => {
      if (clickButton.user.id === msg.author.id) {
        let responseBody;
        switch (clickButton.customId) {
          case 'roleMenu': {
            responseBody = await roleMenuHandler(clickButton);
            break;
          }
          case 'categoryMenu': {
            responseBody = categoryMenuHandler(clickButton);
            break;
          }
          case 'prevCategory': {
            responseBody = categoryButtonHandler(clickButton, false);
            break;
          }
          case 'nextCategory': {
            responseBody = categoryButtonHandler(clickButton, true);
            break;
          }
          case 'prevRoles': {
            responseBody = roleButtonHandler(clickButton, false);
            break;
          }
          case 'nextRoles': {
            responseBody = roleButtonHandler(clickButton, true);
            break;
          }
          default: {
            buttonsCollector.stop();
            this.execute(msg, clickButton);
          }
        }
        if (responseBody) clickButton.client.ch.edit(clickButton, responseBody);
        buttonsCollector.resetTimer();
      } else msg.client.ch.notYours(clickButton);
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.disableComponents(msg.m, [embed]);
      }
    });
  },
};
