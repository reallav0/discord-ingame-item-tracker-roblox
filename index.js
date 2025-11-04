const { Client, GatewayIntentBits, discordSort, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Embed, Collector, Component } = require('discord.js');

require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json());
const port = 3000

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
	],
});
const fs = require('fs');

const path = 'subscriber.json';

function readData() {
  const file = fs.readFileSync(path, 'utf8');
  return JSON.parse(file);
}

function writeData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
}

function createUser(user) {
  const data = readData();
  const exists = data.some(u => u.id === user.id);

  if (!exists) {
    data.push(user);
    writeData(data);
    console.log(`User ${user.id} created.`);
  } else {
    console.log(`User ${user.id} already exists.`);
  }
}

function addItemToUser(userId, itemName, dm_noti) {
  const data = readData();
  const user = data.find(u => u.id === userId);

  if (!user) {
    console.log(`User ${userId} not found.`);
    return;
  }

  const exists = user.items.some(item => item.item_name === itemName);
  if (!exists) {
    user.items.push({ item_name: itemName, dm_noti });
    writeData(data);
    console.log(`Item "${itemName}" added to user ${userId}.`);
  } else {
    console.log(`Item "${itemName}" already exists for user ${userId}.`);
  }
}

function removeItemFromUser(userId, itemName) {
  const data = readData();
  const user = data.find(u => u.id === userId);

  if (!user) {
    console.log(`User ${userId} not found.`);
    return;
  }

  const initialLength = user.items.length;
  user.items = user.items.filter(item => item.item_name !== itemName);

  if (user.items.length < initialLength) {
    writeData(data);
    console.log(`Item "${itemName}" removed from user ${userId}.`);
  } else {
    console.log(`Item "${itemName}" not found for user ${userId}.`);
  }
}


client.once('ready', async() => {
 console.log('Bot is on')
    

const guildID = '1341921128788004934' //Change to your preference server


 const guild = client.guilds.cache.get(guildID)
 let commands 
    if (guild) {
        commands = guild.commands

    } else {
        commands = client.application?.commands

    }

    
    commands?.create({
      name: 'track',
      description: 'Track an item',
      options: [
        {
          name: 'type',
          description: 'The type of item to track',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'channel', value: 'nor' },
            { name: 'directMessage', value: 'dm' },
          ],
        },
        {
          name: 'item_name',
          description: 'The name of the item you want to track',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
    commands?.create({
      name: 'untrack',
      description: 'Stop tracking an item',
      options: [
        {
          name: 'item_name',
          description: 'The name of the item you want to stop tracking',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
    
    
})

const channelID = '1364512263146438687' 




app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

 //---------------------------------------------------------------// //---------------------------------------------------------------//

 client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const userID = interaction.user.id;

  if (interaction.commandName === 'track') {
    const type = interaction.options.getString('type');
    const itemName = interaction.options.getString('item_name').trim();
    const dm_noti = type === 'dm';
  
    await createUser({ id: userID, items: [] });
  
    const data = readData();
    const user = data.find(u => u.id === userID);
  
    if (user.items.length > 0) {
      const existingItem = user.items[0].item_name;
  
      const embed = new EmbedBuilder()
        .setTitle('⚠️ Already Tracking')
        .setDescription(`You're already tracking **${existingItem}**.\nPlease use \`/untrack\` to remove it before tracking a new item.`)
        .setColor('Orange')
        .setTimestamp();
  
      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  
    addItemToUser(userID, itemName, dm_noti);
  
    const embed = new EmbedBuilder()
      .setTitle('✅ Tracking Started')
      .setDescription(`Now tracking **${itemName}** via ${dm_noti ? 'DM' : 'Channel'}`)
      .setColor('Green')
      .setTimestamp();
  
    if (dm_noti) {
      await interaction.user.send({ embeds: [embed] });
    } else {
      const channel = client.channels.cache.get(channelID);
      if (channel) await channel.send(`<@${userID}> is now tracking **${itemName}**`);
    }
  
    await interaction.reply({
      content: `📍 Tracking set for **${itemName}**.`,
      ephemeral: true,
    });
  }
  if (interaction.commandName === 'untrack') {
    const itemName = interaction.options.getString('item_name').trim();

    removeItemFromUser(userID, itemName);

    const embed = new EmbedBuilder()
      .setTitle('Tracking Removed')
      .setDescription(`You have stopped tracking **${itemName}**.`)
      .setColor('Red')
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
});

    
 
app.post('/game/noti', async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid data format. Expected an array of items.' });
  }

  const data = readData();
  const channel = client.channels.cache.get(channelID);

  for (const item of items) {
    const { item_name, price, description, image_id } = item;

    for (const user of data) {
      const matchedItem = user.items.find(i => i.item_name === item_name);
      if (!matchedItem) continue;

      const embed = new EmbedBuilder()
        .setTitle(`📦 ${item_name}`)
        .setDescription(description)
        .addFields(
          { name: '💰 Price', value: `${price}`, inline: true },
        )
        .setColor('Blue')
        .setTimestamp();

      try {
        if (matchedItem.dm_noti) {
          const userObj = await client.users.fetch(user.id);
          await userObj.send({ embeds: [embed] });
          console.log(`📨 DM sent to ${user.id} for item ${item_name}`);
        } else if (channel) {
          await channel.send({ content: `<@${user.id}>`, embeds: [embed] });
          console.log(`🔔 Pinged ${user.id} in channel for item ${item_name}`);
        }
      } catch (err) {
        console.error(`❌ Failed to DM ${user.id} for ${item_name}:`, err.message);

        if (channel) {
          const fallbackEmbed = new EmbedBuilder(embed.data)
            .setFooter({ text: '⚠️ Failed to send DM. Pinged here instead.' });

          await channel.send({ content: `<@${user.id}>`, embeds: [fallbackEmbed] });
          console.log(`🔁 Fallback pinged ${user.id} in channel for ${item_name}`);
        }
      }
    }
  }

  res.json({ message: 'Notifications processed.' });
});
            

 

  
                                


client.login(process.env.TOKEN)



