import { getCommsConfig, saveCommsConfig } from '../storage.js';
import { resolveTargetContainer } from './agency.switcher.js';

export function renderAutomationsView(container) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const config = getCommsConfig();
  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8b1e1e;">Messaging Relays (Telegram & Discord)</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Configure your external handler notifications and webhook bots.</p>
      
      <div class="form-group">
        <label>Telegram Bot Token</label>
        <input type="text" id="comms-tg-token" value="${config.telegramToken || ''}" placeholder="123456:ABC-DEF..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Telegram Chat ID</label>
        <input type="text" id="comms-tg-chat" value="${config.telegramChatId || ''}" placeholder="-100..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Discord Webhook URL</label>
        <input type="text" id="comms-desc-webhook" value="${config.discordWebhook || ''}" placeholder="https://discord.com/api/webhooks/..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <button type="button" id="save-comms-config-btn" class="primary-btn dossier-btn">Save Comms Relays</button>
    </div>
  `;

  const saveBtn = target.querySelector('#save-comms-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const telegramToken = document.getElementById('comms-tg-token').value;
      const telegramChatId = document.getElementById('comms-tg-chat').value;
      const discordWebhook = document.getElementById('comms-desc-webhook').value;
      const current = getCommsConfig();
      current.telegramToken = telegramToken;
      current.telegramChatId = telegramChatId;
      current.discordWebhook = discordWebhook;
      saveCommsConfig(current);
      alert('Comms relay configuration successfully saved!');
    });
  }
}