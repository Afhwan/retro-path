// ===== RETRO PATH - Shop System =====

const SHOP_STORAGE_KEY = 'retro_path_shop';

// Product catalog
const shopProducts = {
  currency: [
    { id: 'coin_small',  name: 'Kecil Koin',     desc: 'Dapatkan 100 koin',           icon: '🪙', price: 1000, currency: 'real',  value: 100,  type: 'coins' },
    { id: 'coin_medium', name: 'Sedang Koin',     desc: 'Dapatkan 500 koin',           icon: '🪙', price: 4000, currency: 'real',  value: 500,  type: 'coins' },
    { id: 'coin_large',  name: 'Besar Koin',      desc: 'Dapatkan 2000 koin',          icon: '🪙', price: 15000, currency: 'real', value: 2000, type: 'coins' },
    { id: 'gem_small',   name: 'Kecil Permata',   desc: 'Dapatkan 10 permata',         icon: '💎', price: 2000, currency: 'real',  value: 10,   type: 'gems' },
    { id: 'gem_medium',  name: 'Sedang Permata',  desc: 'Dapatkan 50 permata',         icon: '💎', price: 9000, currency: 'real',  value: 50,   type: 'gems' },
  ],
  packs: [
    { id: 'pack_adv',    name: 'Paket Lanjutan',  desc: 'Buka level 11-20',             icon: '📦', price: 500,  currency: 'gems',  value: 'levels_11_20' },
    { id: 'pack_expert', name: 'Paket Expert',    desc: 'Buka level 21-35',             icon: '📦', price: 1200, currency: 'gems',  value: 'levels_21_35' },
    { id: 'pack_master', name: 'Paket Master',    desc: 'Buka level 36-50',             icon: '📦', price: 2500, currency: 'gems',  value: 'levels_36_50' },
  ],
  hints: [
    { id: 'hint_1',      name: '1 Petunjuk',      desc: 'Lihat 1 langkah benar',        icon: '💡', price: 200,  currency: 'coins', value: 1 },
    { id: 'hint_5',      name: '5 Petunjuk',      desc: 'Lihat 5 langkah benar',        icon: '💡', price: 800,  currency: 'coins', value: 5 },
    { id: 'hint_15',     name: '15 Petunjuk',     desc: 'Lihat 15 langkah benar',       icon: '💡', price: 2000, currency: 'coins', value: 15 },
    { id: 'hint_unlimited', name: 'Petunjuk Unlimited', desc: 'Petunjuk tak terbatas',   icon: '✨', price: 50,   currency: 'gems',  value: -1 },
  ],
  costumes: [
    { id: 'costume_default', name: 'Pixel Petualang', desc: 'Tampilan klasik',          icon: '🧑', price: 0,    currency: 'coins', value: 'default', owned: true },
    { id: 'costume_ninja',   name: 'Pixel Ninja',     desc: 'Penuh misteri',            icon: '🥷', price: 500,  currency: 'coins', value: 'ninja' },
    { id: 'costume_robot',   name: 'Pixel Robot',     desc: 'Dari masa depan',          icon: '🤖', price: 1000, currency: 'coins', value: 'robot' },
    { id: 'costume_wizard',  name: 'Pixel Penyihir',  desc: 'Kekuatan magis',           icon: '🧙', price: 1500, currency: 'coins', value: 'wizard' },
    { id: 'costume_dragon',  name: 'Pixel Naga',      desc: 'Kekuatan naga kuno',       icon: '🐉', price: 300,  currency: 'gems',  value: 'dragon' },
    { id: 'costume_ghost',   name: 'Pixel Hantu',     desc: 'Menghilang dalam gelap',   icon: '👻', price: 400,  currency: 'gems',  value: 'ghost' },
  ]
};

// Default player data
function getDefaultData() {
  return {
    coins: 0,
    gems: 5,
    hints: 3,
    hintUnlimited: false,
    ownedCostumes: ['costume_default'],
    activeCostume: 'costume_default',
    purchasedPacks: [],
    transactions: []
  };
}

// Load shop data from Local Storage
function loadShopData() {
  try {
    const data = localStorage.getItem(SHOP_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with defaults to ensure all fields exist
      const defaults = getDefaultData();
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load shop data:', e);
  }
  return getDefaultData();
}

// Save shop data to Local Storage
function saveShopData(data) {
  try {
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save shop data:', e);
  }
}

// Add a transaction record
function addTransaction(data, item, status) {
  const transaction = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    currency: item.currency,
    status: status,
    date: new Date().toISOString()
  };
  data.transactions.unshift(transaction);
  // Keep last 50 transactions
  if (data.transactions.length > 50) {
    data.transactions = data.transactions.slice(0, 50);
  }
  saveShopData(data);
}

// Process a shop purchase (simulated real payment)
function processPayment(item) {
  // Simulate payment gateway processing
  // In a real app, this would call a payment API
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for simulation
      const success = Math.random() < 0.95;
      resolve(success);
    }, 800);
  });
}

// Buy a shop item
async function buyItem(item) {
  const data = loadShopData();
  const playerData = window.gameData || {};

  // Check if already owned
  if (item.id.startsWith('costume_') && data.ownedCostumes.includes(item.id)) {
    // Switch to this costume instead
    data.activeCostume = item.id;
    saveShopData(data);
    if (window.updatePlayerCosmetic) window.updatePlayerCosmetic(item.id);
    Sound.purchase();
    notify(`Kostum ${item.name} dipasang!`);
    renderShop();
    return;
  }

  if (item.id.startsWith('pack_') && data.purchasedPacks.includes(item.value)) {
    notify('Paket ini sudah dibeli!');
    return;
  }

  if (item.id.startsWith('hint_') && item.value === -1 && data.hintUnlimited) {
    notify('Petunjuk Unlimited sudah aktif!');
    return;
  }

  // Handle real-money purchases
  if (item.currency === 'real') {
    const confirmed = confirm(`Beli ${item.name} seharga Rp${item.price.toLocaleString()}?\n\nIni adalah simulasi pembelian.`);
    if (!confirmed) return;

    const paymentSuccess = await processPayment(item);
    if (!paymentSuccess) {
      addTransaction(data, item, 'gagal');
      Sound.error();
      notify('Pembayaran gagal! Silakan coba lagi.');
      renderShop();
      return;
    }

    // Add currency
    if (item.type === 'coins') {
      data.coins += item.value;
    } else if (item.type === 'gems') {
      data.gems += item.value;
    }

    addTransaction(data, item, 'berhasil');
    saveShopData(data);
    Sound.purchase();
    notify(`Pembelian berhasil! +${item.value} ${item.type === 'coins' ? 'koin' : 'permata'}`);
    renderShop();
    updateHUD();
    return;
  }

  // Check currency balance
  const costCurrency = item.currency === 'coins' ? data.coins : data.gems;
  if (costCurrency < item.price) {
    Sound.error();
    notify('Saldo tidak mencukupi!');
    return;
  }

  // Deduct cost
  if (item.currency === 'coins') {
    data.coins -= item.price;
  } else {
    data.gems -= item.price;
  }

  // Apply purchase
  let purchaseDesc = '';
  if (item.id.startsWith('hint_')) {
    if (item.value === -1) {
      data.hintUnlimited = true;
      purchaseDesc = 'Petunjuk Unlimited aktif!';
    } else {
      data.hints += item.value;
      purchaseDesc = `+${item.value} petunjuk`;
    }
  } else if (item.id.startsWith('costume_')) {
    data.ownedCostumes.push(item.id);
    data.activeCostume = item.id;
    if (window.updatePlayerCosmetic) window.updatePlayerCosmetic(item.id);
    purchaseDesc = `Kostum ${item.name} dibuka!`;
  } else if (item.id.startsWith('pack_')) {
    data.purchasedPacks.push(item.value);
    purchaseDesc = `${item.name} dibuka!`;
  }

  addTransaction(data, item, 'berhasil');
  saveShopData(data);
  Sound.purchase();
  notify(purchaseDesc || `Pembelian ${item.name} berhasil!`);
  renderShop();
  updateHUD();
}

// Check if an item is owned
function isItemOwned(data, item) {
  if (item.id === 'hint_unlimited') return data.hintUnlimited;
  if (item.id.startsWith('costume_')) {
    return data.ownedCostumes.includes(item.id);
  }
  if (item.id.startsWith('pack_')) {
    return data.purchasedPacks.includes(item.value);
  }
  return false;
}

// Get price display text
function getPriceText(item) {
  if (item.currency === 'real') {
    return `Rp${item.price.toLocaleString()}`;
  }
  const icon = item.currency === 'coins' ? '🪙' : '💎';
  return `${item.price} ${icon}`;
}

// Render shop items for current tab
function renderShop() {
  const data = loadShopData();
  const container = document.getElementById('shop-items');
  const activeTab = document.querySelector('.shop-tab.active');
  if (!activeTab || !container) return;

  const category = activeTab.dataset.category;
  const items = shopProducts[category] || [];

  container.innerHTML = items.map(item => {
    const owned = isItemOwned(data, item);
    const isCostume = item.id.startsWith('costume_');
    const isActive = isCostume && data.activeCostume === item.id;

    let btnText = 'BELI';
    let btnClass = 'shop-buy-btn';

    if (item.price === 0 && isCostume) {
      btnText = 'GRATIS';
    } else if (owned && isCostume) {
      btnText = isActive ? 'DIPAKAI' : 'PAKAI';
      btnClass = owned && isActive ? 'shop-buy-btn owned' : 'shop-buy-btn';
    } else if (owned) {
      btnText = 'DIMILIKI';
      btnClass = 'shop-buy-btn owned';
    } else if (item.currency !== 'real') {
      const balance = item.currency === 'coins' ? data.coins : data.gems;
      if (balance < item.price) {
        btnClass = 'shop-buy-btn insufficient';
      }
    }

    if (item.currency === 'real' && !owned) {
      btnText = 'BELI';
    }

    return `
      <div class="shop-item">
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-price">${getPriceText(item)}</div>
        <button class="${btnClass}" onclick="buyItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
          ${btnText}
        </button>
      </div>
    `;
  }).join('');

  // Update header balances
  document.getElementById('shop-coins').textContent = data.coins;
  document.getElementById('shop-gems').textContent = data.gems;
}

// Switch shop tab
function switchShopTab(category) {
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  Sound.uiClick();
  renderShop();
}

// Toggle transaction history visibility
function toggleHistory() {
  const list = document.getElementById('transaction-history');
  if (!list) return;

  if (list.classList.contains('hidden')) {
    list.classList.remove('hidden');
    renderTransactionHistory();
  } else {
    list.classList.add('hidden');
  }
}

// Render transaction history
function renderTransactionHistory() {
  const data = loadShopData();
  const container = document.getElementById('transaction-history');
  if (!container) return;

  if (data.transactions.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--pixel-gray);padding:8px;">Belum ada transaksi</p>';
    return;
  }

  container.innerHTML = data.transactions.map(t => {
    const date = new Date(t.date);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const statusEmoji = t.status === 'berhasil' ? '✅' : '❌';
    return `<div class="transaction-item">${statusEmoji} ${t.itemName} — ${t.currency === 'real' ? `Rp${t.price.toLocaleString()}` : `${t.price} ${t.currency === 'coins' ? '🪙' : '💎'}`} (${t.status}) <span style="float:right;color:var(--pixel-gray)">${dateStr}</span></div>`;
  }).join('');
}

// Update HUD coin/gem display
function updateHUD() {
  const data = loadShopData();
  const coinEl = document.getElementById('coin-count');
  const gemEl = document.getElementById('gem-count');
  if (coinEl) coinEl.textContent = data.coins;
  if (gemEl) gemEl.textContent = data.gems;
}

// Add coins to player (from game completion)
function addCoins(amount) {
  const data = loadShopData();
  data.coins += amount;
  saveShopData(data);
  updateHUD();
}

// Add gems to player (from achievements)
function addGems(amount) {
  const data = loadShopData();
  data.gems += amount;
  saveShopData(data);
  updateHUD();
}

// Spend hints (returns true if successful)
function spendHint() {
  const data = loadShopData();
  if (data.hintUnlimited) return true;
  if (data.hints > 0) {
    data.hints--;
    saveShopData(data);
    return true;
  }
  return false;
}

// Get current hint count
function getHintCount() {
  const data = loadShopData();
  return data.hintUnlimited ? Infinity : data.hints;
}

// Initialize shop on page load
document.addEventListener('DOMContentLoaded', () => {
  const data = loadShopData();
  saveShopData(data);
  updateHUD();
});
