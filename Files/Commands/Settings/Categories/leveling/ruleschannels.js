const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const ChannelRules = require('../../../../BaseClient/Other Client Files/Classes/ChannelRules');

module.exports = {
  perm: 32n,
  type: 4,
  finished: true,
  setupRequired: false,
  rules: ChannelRules,
  childOf: 'leveling',
  category: ['automation'],
  helpCategory: 'leveling',
  mmrEmbed(msg, res) {
    const embed = new Builders.UnsafeEmbedBuilder();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.rules ? msg.client.ch.channelRuleCalc(r.rules, msg.language).length : '--'
        } ${msg.language.ChannelRules}`,
        value: `${msg.language.affected}: ${
          r.channels && r.channels.length
            ? `${r.channels.length} ${msg.language.channelTypes}`
            : msg.language.none
        }`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(
        `**${msg.lan.rules}**:\n${
          r.rules
            ? `\`${msg.client.ch.channelRuleCalc(r.rules, msg.language).join('`\n `')}\``
            : msg.language.none
        }`,
      )
      .addFields({
        name: msg.language.channelTypes,
        value: `${r.channels?.length ? r.channels.map((id) => ` <#${id}>`) : msg.language.none}`,
        inline: false,
      });

    if (r.rules) {
      embed.addFields({
        name: '\u200b',
        value: '\u200b',
        inline: false,
      });

      msg.client.ch.channelRuleCalc(r.rules, msg.language).forEach((rule, i) => {
        const [key] = Object.entries(msg.language.channelRules).find(([, v]) => v === rule);
        const emote = msg.client.textEmotes.numbers[(i % 5) + 1];

        embed.addFields({
          name: `${emote} ${rule}`,
          value: `${msg.language.amountDefinition}: ${
            typeof r[key] === 'string' ? r[key] : msg.language.none
          }`,
          inline: true,
        });
      });
    }

    return embed;
  },
  buttons(msg, r) {
    const lan = msg.language.commands.settings[msg.file.name];

    const channels = new Builders.UnsafeButtonBuilder()
      .setCustomId(lan.edit.channels.name)
      .setLabel(lan.channels)
      .setStyle(Discord.ButtonStyle.Primary);

    const rules = new Builders.UnsafeButtonBuilder()
      .setCustomId(lan.edit.rules.name)
      .setLabel(lan.rules)
      .setStyle(Discord.ButtonStyle.Secondary);

    const ruleButtons = [[]];
    let i = 0;

    const channelRules = msg.client.ch.channelRuleCalc(r.rules, msg.language);
    if (channelRules && channelRules.length) {
      channelRules.forEach((rule, j) => {
        const [key] = Object.entries(msg.language.channelRules).find(([, v]) => v === rule);
        const emote = msg.client.objectEmotes.numbers[(j % 5) + 1];

        const button = new Builders.UnsafeButtonBuilder()
          .setCustomId(lan.edit[key].name)
          .setLabel(msg.language.channelRules[`${key}Short`])
          .setEmoji(emote)
          .setStyle(Discord.ButtonStyle.Secondary);

        if (ruleButtons[i].length <= 4) {
          ruleButtons[i].push(button);
        } else {
          ruleButtons.push([button]);
          i += 1;
        }
      });
    }

    if (ruleButtons[0].length) return [[channels, rules], ...ruleButtons];
    return [[channels, rules]];
  },
};
