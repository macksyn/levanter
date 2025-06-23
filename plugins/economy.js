// 📁 plugins/economy.js (MongoDB Version) import { Econ } from '../lib/db.js';

const shopItems = { potion: { price: 200, desc: '💖 Health Potion' }, sword: { price: 1000, desc: '⚔️ Sword' }, shield: { price: 1500, desc: '🛡️ Shield' }, pepperspray: { price: 800, desc: '🧴 Pepper Spray (Blocks robbery)' } };

async function getUser(id) { let user = await Econ.findOne({ id }); if (!user) { user = new Econ({ id, balance: 0, bank: 0, lastWork: 0, lastDaily: 0, items: {}, lastRob: 0 }); await user.save(); } return user; }

export default async function handler(msg, sock) { const text = (msg.body || msg.message?.conversation || '').trim(); if (!text.startsWith('!')) return;

const parts = text.split(' '); const command = parts[0].toLowerCase(); const id = msg.sender; const mention = msg.mentionedJid ? msg.mentionedJid[0] : null;

const user = await getUser(id);

switch (command) { case '!balance': { await sock.sendMessage(msg.chat, { text: 💼 @${id.split('@')[0]} Wallet: ₦${user.balance} Bank: ₦${user.bank}, mentions: [id] }); break; }

case '!work': {
  const cooldown = 60 * 60 * 1000;
  const now = Date.now();
  if (now - user.lastWork < cooldown) {
    const left = Math.ceil((cooldown - (now - user.lastWork)) / 60000);
    return sock.sendMessage(msg.chat, { text: `⏳ Try again in ${left} minutes.` });
  }
  const earn = Math.floor(Math.random() * 500) + 100;
  user.balance += earn;
  user.lastWork = now;
  await user.save();
  await sock.sendMessage(msg.chat, { text: `🛠 You worked hard and got ₦${earn}!` });
  break;
}

case '!daily': {
  const cooldown = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (now - user.lastDaily < cooldown) {
    const left = Math.ceil((cooldown - (now - user.lastDaily)) / 3600000);
    return sock.sendMessage(msg.chat, { text: `📅 Come back in ${left} hours.` });
  }
  const reward = 1000;
  user.balance += reward;
  user.lastDaily = now;
  await user.save();
  await sock.sendMessage(msg.chat, { text: `🎁 You received your daily ₦${reward}!` });
  break;
}

case '!transfer': {
  if (!mention || !parts[2] || isNaN(parts[2])) {
    return sock.sendMessage(msg.chat, { text: `Usage: !transfer @user <amount>` });
  }
  const receiver = await getUser(mention);
  const amount = parseInt(parts[2]);
  if (amount < 1 || user.balance < amount) {
    return sock.sendMessage(msg.chat, { text: `❌ You don't have enough money.` });
  }
  user.balance -= amount;
  receiver.balance += amount;
  await user.save();
  await receiver.save();
  await sock.sendMessage(msg.chat, {
    text: `✅ Transferred ₦${amount} to @${mention.split('@')[0]}.`,
    mentions: [mention]
  });
  break;
}

case '!rob': {
  if (!mention) {
    return sock.sendMessage(msg.chat, { text: `Usage: !rob @user` });
  }
  const now = Date.now();
  const robCooldown = 3 * 60 * 60 * 1000; // 3 hours
  if (now - user.lastRob < robCooldown) {
    const left = Math.ceil((robCooldown - (now - user.lastRob)) / 60000);
    return sock.sendMessage(msg.chat, { text: `🚓 You must wait ${left} minutes before robbing again.` });
  }

  const target = await getUser(mention);
  if (target.items?.pepperspray > 0) {
    target.items.pepperspray -= 1;
    await target.save();
    return sock.sendMessage(msg.chat, {
      text: `😤 Robbery failed! @${mention.split('@')[0]} used pepper spray on you!` ,
      mentions: [mention]
    });
  }

  if (target.balance < 200) {
    return sock.sendMessage(msg.chat, { text: `@${mention.split('@')[0]} is too poor to rob!`, mentions: [mention] });
  }

  const success = Math.random() < 0.5;
  const amount = Math.floor(Math.random() * (target.balance * 0.3)) + 1;
  if (success) {
    target.balance -= amount;
    user.balance += amount;
    user.lastRob = now;
    await target.save();
    await user.save();
    await sock.sendMessage(msg.chat, {
      text: `💰 You successfully robbed @${mention.split('@')[0]} of ₦${amount}!`,
      mentions: [mention]
    });
  } else {
    const fine = Math.floor(Math.random() * (user.balance * 0.1)) + 1;
    user.balance = Math.max(user.balance - fine, 0);
    user.lastRob = now;
    await user.save();
    await sock.sendMessage(msg.chat, { text: `🚓 Rob failed! You were fined ₦${fine}.` });
  }
  break;
}

case '!bank': {
  if (parts[1] !== 'deposit' || isNaN(parts[2])) {
    return sock.sendMessage(msg.chat, { text: `Usage: !bank deposit <amount>` });
  }
  const amount = parseInt(parts[2]);
  if (user.balance < amount) {
    return sock.sendMessage(msg.chat, { text: `❌ You don’t have that much.` });
  }
  user.balance -= amount;
  user.bank += amount;
  await user.save();
  await sock.sendMessage(msg.chat, { text: `🏦 Deposited ₦${amount} to your bank.` });
  break;
}

case '!shop': {
  let textOut = '🛒 *Shop Items:*\n';
  for (const [key, val] of Object.entries(shopItems)) {
    textOut += `• ${key} – ₦${val.price} ${val.desc}\n`;
  }
  await sock.sendMessage(msg.chat, { text: textOut });
  break;
}

case '!buy': {
  const item = parts[1];
  if (!item || !shopItems[item]) {
    return sock.sendMessage(msg.chat, { text: 'Usage: !buy <item> (check !shop)' });
  }
  const cost = shopItems[item].price;
  if (user.balance < cost) {
    return sock.sendMessage(msg.chat, { text: `❌ Not enough money to buy ${item}.` });
  }
  user.balance -= cost;
  user.items[item] = (user.items[item] || 0) + 1;
  await user.save();
  await sock.sendMessage(msg.chat, { text: `✅ You bought 1 ${item}.` });
  break;
}

case '!sell': {
  const item = parts[1];
  if (!item || !user.items[item] || user.items[item] < 1) {
    return sock.sendMessage(msg.chat, { text: `❌ You don’t have that item.` });
  }
  const resaleValue = Math.floor(shopItems[item].price * 0.5);
  user.balance += resaleValue;
  user.items[item] -= 1;
  await user.save();
  await sock.sendMessage(msg.chat, { text: `✅ You sold 1 ${item} for ₦${resaleValue}.` });
  break;
}

case '!leaderboard': {
  const topUsers = await Econ.find().sort({ balance: -1 }).limit(10);
  let lb = '🏆 *Leaderboard*\n';
  topUsers.forEach((u, i) => {
    lb += `${i + 1}. @${u.id.split('@')[0]} — ₦${u.balance + u.bank}\n`;
  });
  const mentions = topUsers.map(u => u.id);
  await sock.sendMessage(msg.chat, { text: lb, mentions });
  break;
}

} }

  
